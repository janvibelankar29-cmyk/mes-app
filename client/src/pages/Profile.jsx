import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, Mail, Shield, Building, Clock, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">User Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account information and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-t-4 border-t-primary">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border border-primary/20 mb-4 shadow-sm">
              {user?.name ? user.name.charAt(0) : 'G'}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'Guest User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user?.role || 'Viewer'}</p>
            
            <div className="w-full flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800 text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-green-500 font-medium flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span> Active
              </span>
            </div>
            <div className="w-full flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800 text-sm">
              <span className="text-gray-500">Member Since</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Jan 2024</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" defaultValue={user?.name || ''} className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" defaultValue={`${user?.name?.toLowerCase().replace(' ', '.')}@mes.com`} className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" defaultValue="Production" disabled className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Current Shift</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" defaultValue={user?.shift || 'Morning'} disabled className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
