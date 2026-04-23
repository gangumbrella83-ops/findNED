import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Database, User, Report, Match, Notification } from './src/types';

const PORT = 3000;
const JWT_SECRET = 'neduet-secret-key-123';
const DATA_FILE = path.join(process.cwd(), 'data.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

function readDb(): Database {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDb(db: Database) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve static uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // AUTH MIDDLEWARE
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Invalid or expired token' });
      req.user = user;
      next();
    });
  };

  const adminOnly = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // --- AUTH ROUTES ---

  app.post('/api/auth/register', async (req, res) => {
    const { name, rollNumber, department, password } = req.body;
    const db = readDb();
    
    if (db.users.find(u => u.rollNumber === rollNumber)) {
      return res.status(400).json({ message: 'Roll number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: uuidv4(),
      name,
      rollNumber,
      department,
      role: 'student',
      passwordHash,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);

    const token = jwt.sign({ id: newUser.id, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: newUser.id, name: newUser.name, role: newUser.role, rollNumber: newUser.rollNumber, status: newUser.status } });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    const db = readDb();
    
    const user = db.users.find(u => u.email === identifier || u.rollNumber === identifier);
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: `Your account has been blocked. Reason: ${user.blockReason || 'Contact admin.'}` });
    }

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, rollNumber: user.rollNumber, status: user.status } });
  });

  // --- REPORT ROUTES ---

  app.get('/api/reports', authenticateToken, (req: any, res) => {
    const db = readDb();
    if (req.user.role === 'admin') {
      res.json(db.reports);
    } else {
      const ownReports = db.reports.filter(r => r.userId === req.user.id);
      res.json(ownReports);
    }
  });

  app.get('/api/reports/public', (req, res) => {
    const db = readDb();
    const publicReports = db.reports.filter(r => r.status !== 'Rejected');
    res.json(publicReports);
  });

  app.post('/api/reports', authenticateToken, upload.single('image'), (req: any, res) => {
    const { itemName, category, date, location, description, type } = req.body;
    const db = readDb();

    const newReport: Report = {
      id: uuidv4(),
      userId: req.user.id,
      userName: req.user.name,
      type,
      itemName,
      category,
      description,
      date,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    db.reports.push(newReport);
    
    // Auto-matching logic
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const potentialMatches = db.reports.filter(r => 
      r.type === oppositeType && 
      r.status !== 'Rejected' &&
      (r.category === category || r.itemName.toLowerCase().includes(itemName.toLowerCase()))
    );

    potentialMatches.forEach(match => {
      const lostId = type === 'lost' ? newReport.id : match.id;
      const foundId = type === 'found' ? newReport.id : match.id;
      
      const newMatch: Match = {
        id: uuidv4(),
        lostReportId: lostId,
        foundReportId: foundId,
        status: 'Suggested',
        createdAt: new Date().toISOString(),
      };
      db.matches.push(newMatch);
    });

    writeDb(db);
    res.json(newReport);
  });

  app.put('/api/reports/:id/status', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const db = readDb();
    
    const reportIndex = db.reports.findIndex(r => r.id === id);
    if (reportIndex === -1) return res.status(404).json({ message: 'Report not found' });

    db.reports[reportIndex].status = status;
    if (rejectionReason) db.reports[reportIndex].rejectionReason = rejectionReason;

    writeDb(db);
    res.json(db.reports[reportIndex]);
  });

  app.delete('/api/reports/:id', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.reports = db.reports.filter(r => r.id !== id);
    db.matches = db.matches.filter(m => m.lostReportId !== id && m.foundReportId !== id);
    writeDb(db);
    res.json({ message: 'Report deleted' });
  });

  // --- MATCH ROUTES ---

  app.get('/api/matches', authenticateToken, (req, res) => {
    const db = readDb();
    res.json(db.matches);
  });

  app.post('/api/matches', authenticateToken, adminOnly, (req, res) => {
    const { lostReportId, foundReportId } = req.body;
    const db = readDb();
    
    const newMatch: Match = {
      id: uuidv4(),
      lostReportId,
      foundReportId,
      status: 'Suggested',
      createdAt: new Date().toISOString(),
    };
    db.matches.push(newMatch);
    writeDb(db);
    res.json(newMatch);
  });

  app.put('/api/matches/:id/confirm', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const matchIndex = db.matches.findIndex(m => m.id === id);
    if (matchIndex === -1) return res.status(404).json({ message: 'Match not found' });

    db.matches[matchIndex].status = 'Confirmed';
    
    // Update linked reports status
    const lostReport = db.reports.find(r => r.id === db.matches[matchIndex].lostReportId);
    const foundReport = db.reports.find(r => r.id === db.matches[matchIndex].foundReportId);
    
    if (lostReport) lostReport.status = 'Matched';
    if (foundReport) foundReport.status = 'Matched';

    writeDb(db);
    res.json(db.matches[matchIndex]);
  });

  app.put('/api/matches/:id/reject', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.matches = db.matches.filter(m => m.id !== id);
    writeDb(db);
    res.json({ message: 'Match rejected and removed' });
  });

  // --- USER ROUTES ---

  app.get('/api/users', authenticateToken, adminOnly, (req, res) => {
    const db = readDb();
    res.json(db.users.filter(u => u.role === 'student'));
  });

  app.put('/api/users/:id/block', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    db.users[userIndex].status = 'Blocked';
    db.users[userIndex].blockReason = reason;
    writeDb(db);
    res.json(db.users[userIndex]);
  });

  app.put('/api/users/:id/unblock', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

    db.users[userIndex].status = 'Active';
    db.users[userIndex].blockReason = undefined;
    writeDb(db);
    res.json(db.users[userIndex]);
  });

  // --- NOTIFICATION ROUTES ---

  app.get('/api/notifications', authenticateToken, (req: any, res) => {
    const db = readDb();
    if (req.user.role === 'admin') {
      res.json(db.notifications);
    } else {
      // Students don't have separate notifications in reqs, but maybe later.
      res.json([]);
    }
  });

  app.post('/api/notifications/flag', authenticateToken, (req: any, res) => {
    const { reportId, message } = req.body;
    const db = readDb();
    
    const newNotification: Notification = {
      id: uuidv4(),
      type: 'flag',
      reportId,
      fromUserId: req.user.id,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    db.notifications.push(newNotification);
    writeDb(db);
    res.json(newNotification);
  });

  app.put('/api/notifications/:id/read', authenticateToken, adminOnly, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const notifIndex = db.notifications.findIndex(n => n.id === id);
    if (notifIndex !== -1) {
      db.notifications[notifIndex].read = true;
      writeDb(db);
    }
    res.json({ message: 'Notification marked as read' });
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
