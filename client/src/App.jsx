import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout (To be created)
import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import WorkOrders from './pages/WorkOrders';
import Calendar from './pages/Calendar';
import Downtime from './pages/Downtime';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import { AuthProvider } from './context/AuthContext';

const NotFound = () => <div className="p-4"><h1 className="text-2xl font-bold text-red-500">404 - Page Not Found</h1></div>;

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="production" element={<Production />} />
            <Route path="work-orders" element={<WorkOrders />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="downtime" element={<Downtime />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
