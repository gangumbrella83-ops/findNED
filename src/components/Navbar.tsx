import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, LogOut, LayoutDashboard, Search, FileText, Users, Link as LinkIcon } from 'lucide-react';
import { getAuthUser, logout } from '../lib/auth';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = getAuthUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Reports', path: '/admin/reports', icon: FileText },
    { label: 'Matches', path: '/admin/matches', icon: LinkIcon },
    { label: 'Users', path: '/admin/users', icon: Users },
  ];

  const studentLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Reports', path: '/my-reports', icon: FileText },
    { label: 'Search', path: '/search', icon: Search },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm shadow-primary/20 group-hover:rotate-6 transition-transform">f</div>
          <span className="font-display font-black text-xl text-slate-900 tracking-tight">findNED</span>
        </Link>
        {user && (
          <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-100">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  location.pathname === link.path 
                    ? "text-primary bg-primary-extralight" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!user ? (
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register" className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">Register</Link>
          </div>
        ) : (
          <>
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin/notifications')}
                className="p-2 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl relative transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="flex flex-col items-end">
                <p className="text-[11px] font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{user.rollNumber || user.role}</p>
              </div>
              <button 
                onClick={logout}
                className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && user && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl md:hidden p-4 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-lg flex items-center gap-3",
                location.pathname === link.path ? "bg-slate-50 text-primary font-bold" : "text-slate-600"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          <div className="border-t border-slate-50 my-2 pt-4 flex items-center justify-between px-4">
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">{user.name}</span>
              <span className="text-sm text-slate-500 font-bold uppercase tracking-wider text-[10px]">{user.rollNumber || user.role}</span>
            </div>
            <button 
              onClick={logout}
              className="px-4 py-2 text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
