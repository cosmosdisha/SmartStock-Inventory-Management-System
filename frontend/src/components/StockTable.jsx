import React, { useState, useEffect } from 'react';
import { Download, Mail, Plus, Minus, AlertCircle } from 'lucide-react';

export default function StockTable() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [bulkInputs, setBulkInputs] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/products');
      const data = await response.json();
      if (response.ok) setProducts(data);
    } catch (err) {
      console.error("Error connecting to inventory data pipeline:", err);
    }
  };

  const handleStockAdjustment = async (id, adjustment) => {
    try {
      const response = await fetch(`http://localhost:5001/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment })
      });
      if (response.ok) {
        fetchProducts();
        setBulkInputs(prev => ({ ...prev, [id]: '' }));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Operation rejected.");
      }
    } catch (err) {
      alert("Network communication error.");
    }
  };

  const exportToCSV = () => {
    if (products.length === 0) return alert("No active data entries to export.");
    const headers = ["ID", "Product Name", "Category", "Price (INR)", "Current Quantity", "Supplier Contact", "Date Added", "Shelf Life (Days)"];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.name}"`,
      p.category,
      p.price,
      p.quantity,
      `"${p.supplier}"`,
      p.date_added,
      p.shelf_life_days
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmartStock_Valuation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getShelfLifeStatus = (dateAdded, shelfLifeDays) => {
    if (!dateAdded) return { text: "No Date Logged", style: "bg-slate-950 text-slate-500 border-slate-800" };
    const createdDate = new Date(dateAdded);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - createdDate.getTime();
    const daysElapsed = Math.floor(timeDiff / (1000 * 3600 * 24));
    const daysRemaining = shelfLifeDays - daysElapsed;

    if (daysRemaining <= 0) return { text: "EXPIRED / PERISHED", style: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    if (daysRemaining <= 10) return { text: `${daysRemaining} Days Left (Urgent)`, style: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { text: `${daysRemaining} Days Healthy`, style: "bg-slate-950 text-slate-400 border-slate-800" };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                          product.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    const matchesLowStock = !filterLowStock || product.quantity < 5;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stock Control Room</h1>
          <p className="text-slate-400 mt-1">Search products, execute bulk-restocks, track batch lifespan, and export records.</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition shadow-lg">
          <Download className="h-4 w-4" /> Export Financial CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 p-4 border border-slate-800 rounded-xl">
        <input type="text" placeholder="Search by asset name..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm" />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm">
          <option value="">All Category Filters</option>
          <option value="Electronics">Electronics</option>
          <option value="Apparel">Apparel</option>
          <option value="Home & Kitchen">Home & Kitchen</option>
          <option value="Office Supplies">Office Supplies</option>
          <option value="Automotive">Automotive</option>
        </select>
        <button onClick={() => setFilterLowStock(!filterLowStock)} className={`p-2.5 border rounded-lg text-sm font-semibold transition ${filterLowStock ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
          {filterLowStock ? "Showing Low Stock Alerts Only" : "Filter Low Stock Alerts (< 5)"}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-xs font-bold tracking-wider border-b border-slate-800">
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Unit Price</th>
                <th className="py-4 px-6">Quantity State</th>
                <th className="py-4 px-6">Batch Shelf Life</th>
                <th className="py-4 px-6 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">No matching inventory records found.</td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const lifeStatus = getShelfLifeStatus(product.date_added, product.shelf_life_days);
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{product.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <span>Vendor: {product.supplier || 'General Vendor'}</span>
                          <a href={`mailto:${product.supplier || 'vendor@example.com'}?subject=Reorder%20Request%20-%20${product.name}`} className="text-indigo-400 hover:text-indigo-300 p-0.5 rounded transition">
                            <Mail className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-300">
                        <span className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-xs font-medium">{product.category}</span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-300">₹{product.price.toFixed(2)}</td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-0.5 rounded text-xs ${product.quantity === 0 ? 'bg-rose-500/10 text-rose-400' : product.quantity < 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {product.quantity} units
                          </span>
                          {product.quantity === 0 && <span className="text-rose-500 text-xs flex items-center gap-0.5"><AlertCircle className="h-3 w-3" /> Depleted</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <span className={`px-2 py-1 border rounded font-medium ${lifeStatus.style}`}>
                          {lifeStatus.text}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          
                          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden w-24">
                            <input 
                              type="number" 
                              placeholder="+/-" 
                              value={bulkInputs[product.id] || ''} 
                              onChange={(e) => setBulkInputs({ ...bulkInputs, [product.id]: e.target.value })} 
                              className="w-full bg-transparent text-center text-xs text-white p-1 focus:outline-none" 
                            />
                            <button onClick={() => {
                              const val = parseInt(bulkInputs[product.id], 10);
                              if (!isNaN(val) && val !== 0) handleStockAdjustment(product.id, val);
                            }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 text-xs font-bold transition">Go</button>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
                            <button disabled={product.quantity <= 0} onClick={() => handleStockAdjustment(product.id, -1)} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleStockAdjustment(product.id, 1)} className="p-1 text-slate-400 hover:text-white transition">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}