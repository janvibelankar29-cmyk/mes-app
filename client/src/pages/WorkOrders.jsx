import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ClipboardList, PlusCircle, Search, MoreHorizontal, X } from 'lucide-react';

const initialOrders = [
  { id: 'WO-1042', product: 'Aluminum Widget', qty: 5000, status: 'In Progress', machine: 'CNC-01', progress: 65, color: 'bg-blue-500' },
  { id: 'WO-1043', product: 'Steel Bracket', qty: 2500, status: 'Pending', machine: 'CNC-02', progress: 0, color: 'bg-yellow-500' },
  { id: 'WO-1044', product: 'Copper Coil', qty: 10000, status: 'Completed', machine: 'Winding-01', progress: 100, color: 'bg-green-500' },
  { id: 'WO-1045', product: 'Plastic Housing', qty: 1500, status: 'In Progress', machine: 'Molding-03', progress: 32, color: 'bg-blue-500' },
  { id: 'WO-1046', product: 'Titanium Shaft', qty: 300, status: 'Pending', machine: 'Lathe-01', progress: 0, color: 'bg-yellow-500' },
];

const WorkOrders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ product: '', qty: '', machine: 'CNC-01' });

  const filteredOrders = useMemo(() => {
    return orders.filter(wo => {
      const matchesSearch = wo.id.toLowerCase().includes(search.toLowerCase()) || 
                            wo.product.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || wo.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!newOrder.product || !newOrder.qty) return;

    const order = {
      id: `WO-${1047 + orders.length - 5}`,
      product: newOrder.product,
      qty: parseInt(newOrder.qty, 10),
      status: 'Pending',
      machine: newOrder.machine,
      progress: 0,
      color: 'bg-yellow-500'
    };

    setOrders([order, ...orders]);
    setShowModal(false);
    setNewOrder({ product: '', qty: '', machine: 'CNC-01' });
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Work Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track production orders across the plant.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
        >
          <PlusCircle size={16} /> New Work Order
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search work orders..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
            <button 
              key={status} 
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === status ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((wo, i) => (
            <Card key={wo.id} className="hover:border-primary/50 transition-colors cursor-pointer group animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                    {wo.id}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${wo.color}`}></span>
                </div>
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{wo.product}</h3>
                <div className="flex justify-between items-end mt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Machine: <span className="font-medium text-gray-700 dark:text-gray-300">{wo.machine}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target: <span className="font-medium text-gray-700 dark:text-gray-300">{wo.qty} units</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{wo.progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className={`${wo.color} h-1.5 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${wo.progress}%` }}></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            No work orders found matching your criteria.
          </div>
        )}
      </div>

      {/* New Work Order Modal */}
      {showModal && (
        <div className="absolute inset-0 bg-gray-900/40 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Create Work Order</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddOrder} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={newOrder.product}
                  onChange={e => setNewOrder({...newOrder, product: e.target.value})}
                  placeholder="e.g. Steel Bracket" 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Quantity</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={newOrder.qty}
                  onChange={e => setNewOrder({...newOrder, qty: e.target.value})}
                  placeholder="e.g. 5000" 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Machine</label>
                <select 
                  value={newOrder.machine}
                  onChange={e => setNewOrder({...newOrder, machine: e.target.value})}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100"
                >
                  <option value="CNC-01">CNC-01 (Milling)</option>
                  <option value="CNC-02">CNC-02 (Milling)</option>
                  <option value="Winding-01">Winding-01</option>
                  <option value="Molding-03">Molding-03</option>
                  <option value="Lathe-01">Lathe-01</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
