import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Bell, Moon, Sun, Monitor, Globe, ShieldCheck } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your application preferences and plant parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {['Appearance', 'Notifications', 'Language & Region', 'Security'].map((tab, i) => (
            <button key={tab} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the MES Nexus looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme Preference</label>
                <div className="grid grid-cols-3 gap-4">
                  <button className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-xl transition-all">
                    <Monitor size={24} className="text-primary" />
                    <span className="text-sm font-semibold text-primary">System</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 rounded-xl transition-all text-gray-500">
                    <Sun size={24} />
                    <span className="text-sm font-semibold">Light</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 rounded-xl transition-all text-gray-500">
                    <Moon size={24} />
                    <span className="text-sm font-semibold">Dark</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Compact Mode</h4>
                  <p className="text-xs text-gray-500">Reduce spacing to show more data on screen.</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
