import React, { useState, useEffect } from 'react';
import { Package, DollarSign, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';

function Dashboard({ refreshTrigger, setActiveTab }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch current database inventory state to compute metrics dashboard variables
  useEffect(() => {
    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard statistics:', err);
        setLoading(false);
      });
  }, [refreshTrigger]);

  // Derived application analytics
  const totalItems = products.length;
  const totalValue = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockItems = products.filter(item => item.quantity < 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
        Loading live dashboard analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title Row */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">System Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time enterprise warehouse operational summary metrics.</p>
      </div>

      {/* Analytics Summary Panels Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1: Total SKUs */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-xl">
          <div className="space-y-2">
            <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Total Unique Products</span>
            <h3 className="text-4xl font-extrabold text-white tracking-tight">{totalItems}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Package className="h-8 w-8" />
          </div>
        </div>

        {/* Metric Card 2: Combined Financial Valuation */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between shadow-xl">
          <div className="space-y-2">
            <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Total Inventory Value</span>
            <h3 className="text-4xl font-extrabold text-emerald-400 tracking-tight">
              ₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <IndianRupee className="h-8 w-8" />
          </div>
        </div>

        {/* Metric Card 3: Crucial Low Stock Indicators */}
        <div className={`bg-slate-900 border p-6 rounded-xl flex items-center justify-between shadow-xl transition-all ${
          lowStockItems.length > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
        }`}>
          <div className="space-y-2">
            <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Low Stock Alerts</span>
            <h3 className={`text-4xl font-extrabold tracking-tight ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-white'}`}>
              {lowStockItems.length}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
            <AlertTriangle className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Critical Items Requiring Attention Sub-Grid Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Critical Stock Attention List</h2>
            <p className="text-sm text-slate-400 mt-0.5">Items running dangerously low that need to be reordered soon. </p>
          </div>
          <button 
            onClick={() => setActiveTab('inventory')}
            className="flex items-center space-x-1.5 text-xs font-semibold tracking-wide text-indigo-400 hover:text-indigo-300 transition-colors uppercase"
          >
            <span>Manage All Items</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm font-medium">
            ✔ Perfect Status: All inventory records display healthy threshold quantities.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/40">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock Units</th>
                  <th className="py-3 px-4 text-right">Status Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/40 transition-colors group">
                    <td className="py-4 px-4 font-semibold text-white group-hover:text-indigo-300 transition-colors">{item.name}</td>
                    <td className="py-4 px-4 text-slate-400">{item.category}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.quantity === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.quantity} units remaining
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xs font-medium text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/10 uppercase tracking-wider">
                        {item.quantity === 0 ? 'Critical Restock' : 'Low Buffer'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;