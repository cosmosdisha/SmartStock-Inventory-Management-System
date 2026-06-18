import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

function HistoryLog({ refreshTrigger }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/logs')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching system logs:', err);
        setLoading(false);
      });
  };

  // Automatically fetch logs when the tab mounts or updates occur elsewhere
  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Activity Log</h1>
          <p className="text-slate-400 mt-1">A history log of every single stock update and new product added to the system.</p>
        </div>
        
        {/* Manual Refresh Trigger Button */}
        <button
          onClick={fetchLogs}
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center space-x-2 text-sm font-medium"
          title="Refresh Logs Data Stream"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sync Logs</span>
        </button>
      </div>

      {/* Main Timeline Card Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        {loading && logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-medium">
            Fetching active transaction trail logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm font-medium">
            No system modifications have been registered yet.
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 space-y-6 py-2">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8 group">
                {/* Visual Circle Milestone Indicator on the Line */}
                <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-slate-900 bg-slate-800 group-hover:bg-indigo-500 group-hover:border-indigo-500/20 transition-all duration-200" />
                
                {/* Individual Log Entry Payload wrapper */}
                <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl group-hover:border-slate-800 transition-colors">
                  <p className="text-sm text-slate-200 font-medium leading-relaxed">
                    {log.MESSAGE}
                  </p>
                  
                  {/* Timestamp Label */}
                  <div className="flex items-center space-x-1.5 mt-2.5 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono">
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryLog;