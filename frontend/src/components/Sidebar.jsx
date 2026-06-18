import React from 'react';
import { LayoutDashboard, Boxes, PlusCircle, History } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  // Navigation items structure matching our application views
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stock Management', icon: Boxes },
    { id: 'add', label: 'Add New Product', icon: PlusCircle },
    { id: 'history', label: 'Activity Log', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* System Branding Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <Boxes className="h-8 w-8 text-indigo-400" />
        <span className="text-xl font-bold tracking-wider text-white">SmartStock</span>
      </div>

      {/* Navigation Options Panel */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Meta Details */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-500 font-medium">v1.0.0 — AI Assisted</p>
      </div>
    </aside>
  );
}

export default Sidebar;