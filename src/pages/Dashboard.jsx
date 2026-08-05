import React, { useState, useEffect } from 'react';
import { FileWarning, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('https://permitpulse.kolipakula.workers.dev/api/permits');
        let data = await res.json();

        // Auto-seed if the database is empty (for demo purposes)
        if (data && data.length === 0) {
          console.log("Database empty, calling seed API...");
          await fetch('https://permitpulse.kolipakula.workers.dev/api/seed');
          const refetch = await fetch('https://permitpulse.kolipakula.workers.dev/api/permits');
          data = await refetch.json();
        }

        setPermits(data || []);
      } catch (e) {
        console.error("Failed to load permits", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCount = permits.length;
  const approvedCount = permits.filter(p => p.status === 'Approved').length;
  const revisionCount = permits.filter(p => p.status === 'Needs Revision').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gradient">Welcome back, Frisco Outdoors</h1>
        <p className="text-muted">Here is the status of your active permit applications.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glass-panel items-center flex justify-between">
          <div>
            <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '4px'}}>Active Permits</p>
            <h3>{loading ? <Loader2 className="animate-spin" /> : activeCount}</h3>
          </div>
          <div style={{color: 'var(--color-primary)'}}><Clock size={32} /></div>
        </div>
        <div className="glass-panel items-center flex justify-between">
          <div>
            <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '4px'}}>Approved This Month</p>
            <h3>{loading ? <Loader2 className="animate-spin" /> : approvedCount}</h3>
          </div>
          <div style={{color: '#16a34a'}}><CheckCircle size={32} /></div>
        </div>
        <div className="glass-panel items-center flex justify-between">
          <div>
            <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '4px'}}>Needs Revision</p>
            <h3>{loading ? <Loader2 className="animate-spin" /> : revisionCount}</h3>
          </div>
          <div style={{color: '#ea580c'}}><FileWarning size={32} /></div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 className="mb-8" style={{ borderBottom: '1px solid rgba(100, 116, 139, 0.1)', paddingBottom: '1rem' }}>
          Recent Permit Submittals
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 8px' }}>ID</th>
              <th style={{ padding: '12px 8px' }}>Project Address</th>
              <th style={{ padding: '12px 8px' }}>HOA</th>
              <th style={{ padding: '12px 8px' }}>Days in Queue</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : permits.map(permit => (
              <tr key={permit.id} style={{ borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>
                <td style={{ padding: '16px 8px', fontWeight: '500' }}>{permit.id}</td>
                <td style={{ padding: '16px 8px' }}>{permit.address}</td>
                <td style={{ padding: '16px 8px' }}>{permit.hoa}</td>
                <td style={{ padding: '16px 8px' }}>{permit.days} days</td>
                <td style={{ padding: '16px 8px' }}>
                  <span className={`badge ${
                    permit.status === 'Approved' ? 'badge-success' : 
                    permit.status === 'Pending Review' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {permit.status}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && permits.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center' }}>No active permits found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
