import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calculator, FileText, Settings, Activity } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SetbackCalculator from './pages/SetbackCalculator';
import SubmittalGenerator from './pages/SubmittalGenerator';
import './App.css'; // Add some extra layout styles if needed

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <h2 className="text-gradient logo">PermitPulse</h2>
          <span className="badge badge-success">Frisco</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/calculator" className={`nav-item ${location.pathname === '/calculator' ? 'active' : ''}`}>
            <Calculator size={20} />
            <span>Setback Calculator</span>
          </Link>
          <Link to="/submittal" className={`nav-item ${location.pathname === '/submittal' ? 'active' : ''}`}>
            <FileText size={20} />
            <span>HOA Submittals</span>
          </Link>
          <Link to="/tracker" className={`nav-item ${location.pathname === '/tracker' ? 'active' : ''}`}>
            <Activity size={20} />
            <span>eTRAKiT Status</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-outline" style={{ width: '100%' }}>
            <Settings size={16} /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content animate-fade-in">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calculator" element={<SetbackCalculator />} />
          <Route path="/submittal" element={<SubmittalGenerator />} />
          <Route path="/tracker" element={<div className="glass-panel"><h2>eTRAKiT Status (Coming Soon)</h2><p>Real-time updates from Frisco municipality.</p></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
