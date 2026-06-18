import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StockTable from './components/StockTable';
import AddProduct from './components/AddProduct';
import HistoryLog from './components/HistoryLog';

function App() {
  // activeTab state tracks which view to display: 'dashboard', 'inventory', 'add', or 'history'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // A refresh trigger passed to subcomponents to force data refetches when mutations occur
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Conditional rendering switcher determining the main content workspace
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard refreshTrigger={refreshTrigger} setActiveTab={setActiveTab} />;
      case 'inventory':
        return <StockTable refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'add':
        return <AddProduct triggerRefresh={triggerRefresh} setActiveTab={setActiveTab} />;
      case 'history':
        return <HistoryLog refreshTrigger={refreshTrigger} />;
      default:
        return <Dashboard refreshTrigger={refreshTrigger} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Fixed Navigation Sidebar panel */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Scrollable Main Application Content Section */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;