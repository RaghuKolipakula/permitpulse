import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function SetbackCalculator() {
  const [formData, setFormData] = useState({
    parcelArea: '',
    primaryStructureArea: '',
    drivewayArea: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to worker
    setTimeout(() => {
      const pArea = parseFloat(formData.parcelArea) || 0;
      const sArea = parseFloat(formData.primaryStructureArea) || 0;
      const dArea = parseFloat(formData.drivewayArea) || 0;
      
      const maxImp = pArea * 0.5;
      const currentImp = sArea + dArea;
      const avail = maxImp - currentImp;
      
      setResult({
        setbacks: { front: 25, rear: 15, side: 7 },
        imperviousCover: {
          max: maxImp,
          current: currentImp,
          available: avail > 0 ? avail : 0,
          status: avail >= 0 ? 'Compliant' : 'Exceeds Limits'
        }
      });
      
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gradient">Setback & Coverage Calculator</h1>
        <p className="text-muted">Pre-configured to Frisco city zoning bylaws (Simulated).</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Total Parcel Area (sq ft)</label>
              <input 
                type="number" 
                className="input-control" 
                placeholder="e.g. 10000"
                value={formData.parcelArea}
                onChange={e => setFormData({...formData, parcelArea: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label>Primary Structure Area (sq ft)</label>
              <input 
                type="number" 
                className="input-control" 
                placeholder="e.g. 3500"
                value={formData.primaryStructureArea}
                onChange={e => setFormData({...formData, primaryStructureArea: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label>Driveway / Existing Hardscape (sq ft)</label>
              <input 
                type="number" 
                className="input-control" 
                placeholder="e.g. 800"
                value={formData.drivewayArea}
                onChange={e => setFormData({...formData, drivewayArea: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={loading}>
              <Calculator size={18} />
              {loading ? 'Calculating...' : 'Calculate Limits'}
            </button>
          </form>
        </div>

        {result && (
          <div className="glass-panel animate-fade-in">
            <h3 className="mb-8">Calculation Results</h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Required Setbacks (Standard Residential)</h4>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span>Front Setback</span> <strong>{result.setbacks.front} ft</strong>
                </li>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span>Rear Setback</span> <strong>{result.setbacks.rear} ft</strong>
                </li>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span>Side Setback</span> <strong>{result.setbacks.side} ft</strong>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Impervious Coverage
                <span className={`badge ${result.imperviousCover.status === 'Compliant' ? 'badge-success' : 'badge-error'}`}>
                  {result.imperviousCover.status}
                </span>
              </h4>
              <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span>Max Allowable (50%)</span> <strong>{result.imperviousCover.max} sq ft</strong>
                </li>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span>Current Coverage</span> <strong>{result.imperviousCover.current} sq ft</strong>
                </li>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Available for Outdoor Living</span> 
                  <strong style={{ color: 'var(--color-primary)' }}>{result.imperviousCover.available} sq ft</strong>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
