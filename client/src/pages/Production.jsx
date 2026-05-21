import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Activity, PlusCircle, Filter } from 'lucide-react';

const Production = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Production Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor real-time production output and quality.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">
            <PlusCircle size={16} /> Log Production
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Production Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-tl-lg">Timestamp</th>
                  <th scope="col" className="px-6 py-3">Machine</th>
                  <th scope="col" className="px-6 py-3">Work Order</th>
                  <th scope="col" className="px-6 py-3">Good Count</th>
                  <th scope="col" className="px-6 py-3">Defect Count</th>
                  <th scope="col" className="px-6 py-3 rounded-tr-lg">Quality Rate</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      Today, 10:{item}5 AM
                    </td>
                    <td className="px-6 py-4">CNC-00{item}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      WO-2024-{100+item}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{500 + (item * 10)}</td>
                    <td className="px-6 py-4 text-red-500">{item * 2}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                        <span className="text-xs">98%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;
