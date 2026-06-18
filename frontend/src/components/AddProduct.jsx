import React, { useState } from 'react';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    supplier_name: '',
    supplier_phone: '',
    shelf_life_days: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  // Strictly matched to your 5 categories from Screenshot 2026-06-18 at 12.08.02 PM.png
  const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Office Supplies', 'Automotive'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Combine supplier name and phone cleanly into a single string for storage
    const combinedSupplierString = `${formData.supplier_name.trim()} (${formData.supplier_phone.trim()})`;

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
      supplier: combinedSupplierString,
      shelf_life_days: parseInt(formData.shelf_life_days, 10) || 365
    };

    try {
      const response = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Successfully added ${result.name} to inventory!` });
        setFormData({ name: '', category: '', price: '', quantity: '', supplier_name: '', supplier_phone: '', shelf_life_days: '' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to create product.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Could not connect to the backend server.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold text-white tracking-tight">Add New Inventory Asset</h1>
      <p className="text-slate-400 mt-1">Manually enter tracking parameters to commit a new batch to warehouse records.</p>

      {status.message && (
        <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Product Name Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300">Product Name</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="e.g., Industrial Engine Oil" />
        </div>

        {/* Category Selection Mapping */}
        <div>
          <label className="block text-sm font-semibold text-slate-300">Category</label>
          <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white">
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Supplier Info Split Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300">Supplier / Vendor Name</label>
            <input type="text" required value={formData.supplier_name} onChange={(e) => setFormData({...formData, supplier_name: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="e.g., Castrol Lubes Ltd" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300">Supplier Contact Number</label>
            <input type="tel" required value={formData.supplier_phone} onChange={(e) => setFormData({...formData, supplier_phone: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="e.g., +91 98765 43210" />
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300">Price (₹)</label>
            <input type="number" step="0.01" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300">Quantity</label>
            <input type="number" required min="0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300">Shelf Life (Days)</label>
            <input type="number" required min="1" value={formData.shelf_life_days} onChange={(e) => setFormData({...formData, shelf_life_days: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="e.g., 180" />
          </div>
        </div>

        <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-lg transition shadow-lg">
          Commit Asset To Database
        </button>
      </form>
    </div>
  );
}