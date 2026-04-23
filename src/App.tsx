import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './lib/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MyReports from './pages/MyReports';
import SearchItems from './pages/SearchItems';
import ReportItem from './pages/ReportItem';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminMatches from './pages/AdminMatches';
import AdminUsers from './pages/AdminUsers';
import AdminNotifications from './pages/AdminNotifications';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/search" element={<SearchItems />} />
              <Route path="/report-lost" element={<ReportItem type="lost" />} />
              <Route path="/report-found" element={<ReportItem type="found" />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/matches" element={<AdminMatches />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            </Route>

            {/* Redirects */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center p-4">
                <h1 className="text-9xl font-black text-primary-light/30">404</h1>
                <p className="text-2xl font-bold -mt-12 mb-8">Page Not Found</p>
                <a href="/" className="btn-primary">Return Home</a>
              </div>
            } />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
