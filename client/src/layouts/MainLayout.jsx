import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  ClipboardList, 
  Calendar, 
  AlertTriangle,
  Settings,
  LogOut,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from '../components/ui/LoadingSpinner';

const MainLayout = () => {
  const location = useLocation();
  const { user, isLoading, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Production', path: '/production', icon: <Activity size={20} /> },
    { name: 'Work Orders', path: '/work-orders', icon: <ClipboardList size={20} /> },
    { name: 'Scheduling', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Downtime', path: '/downtime', icon: <AlertTriangle size={20} /> },
  ];

  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary tracking-tight">MES Nexus</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Manufacturing System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link 
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors ${
              location.pathname.startsWith('/settings')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shadow-sm relative z-20">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {navItems.find(item => item.path === location.pathname)?.name || 
             (location.pathname.startsWith('/settings') ? 'System Settings' : 
              location.pathname.startsWith('/profile') ? 'User Profile' : 'Plant Overview')}
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">System Online</span>
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors focus:outline-none"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.role || 'Viewer'}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                  {user?.name ? user.name.charAt(0) : 'G'}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 md:hidden">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <Link 
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <UserCircle size={16} /> Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-900/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
