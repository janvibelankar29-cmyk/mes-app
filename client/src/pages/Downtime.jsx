import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, Wrench, Clock, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const downtimeData = [
  { name: 'Mechanical Failure', value: 400 },
  { name: 'Electrical Issue', value: 300 },
  { name: 'Operator Error', value: 300 },
  { name: 'Material Shortage', value: 200 },
  { name: 'Scheduled Maintenance', value: 278 },
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

const Downtime = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Downtime Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track machine failures and maintenance events.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-500/30">
          <AlertTriangle size={16} /> Report Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { machine: 'CNC-01', reason: 'Spindle Overheating', severity: 'High', time: '2h 15m ago', planned: false },
                { machine: 'Molding-03', reason: 'Scheduled Maintenance', severity: 'Low', time: '4h ago', planned: true },
              ].map((inc, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-lg shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${inc.planned ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                      {inc.planned ? <Wrench size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{inc.machine}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{inc.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                        <span className={`px-2 py-1 rounded-full ${inc.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {inc.severity} Priority
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} /> {inc.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      Resolve Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Downtime Reasons</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={downtimeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {downtimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Downtime;
