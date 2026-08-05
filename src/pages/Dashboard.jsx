import React from 'react';
import { FileWarning, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const permits = [
    { id: 'PMT-2024-089', address: '123 Starwood Dr', status: 'Pending Review', hoa: 'Starwood', days: 12 },
    { id: 'PMT-2024-090', address: '456 Newman Blvd', status: 'Approved', hoa: 'Newman Village', days: 2 },
    { id: 'PMT-2024-092', address: '789 Creek Rd', status: 'Needs Revision', hoa: 'Phillips Creek', days: 14 },
  ];

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
            <h3>14</h3>
          </div>
          <div style={{color: 'var(--color-primary)'}}><Clock size={32} /></div>
        </div>
        <div className="glass-panel items-center flex justify-between">
          <div>
            <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '4px'}}>Approved This Month</p>
            <h3>8</h3>
          </div>
          <div style={{color: '#16a34a'}}><CheckCircle size={32} /></div>
        </div>
        <div className="glass-panel items-center flex justify-between">
          <div>
            <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '4px'}}>Needs Revision</p>
            <h3>2</h3>
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
            {permits.map(permit => (
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
