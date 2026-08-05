import React, { useState, useEffect } from 'react';
import { Calculator, MapPin, CheckCircle, Loader2 } from 'lucide-react';

export default function SetbackCalculator() {
  const [formData, setFormData] = useState({
    address: '',
    primaryStructureArea: '',
    drivewayArea: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const address = formData.address;
    if (address.length < 5) return;

    const timeoutId = setTimeout(async () => {
      try {
        setLookupLoading(true);
        const res = await fetch(`https://permitpulse.kolipakula.workers.dev/api/lookup?address=${encodeURIComponent(address)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found && data.primaryStructureArea) {
            setFormData(prev => ({
              ...prev,
              // Only overwrite if it's currently empty, to avoid annoying the user if they typed something manually
              primaryStructureArea: prev.primaryStructureArea || data.primaryStructureArea
            }));
          }
        }
      } catch (e) {
        console.error("Lookup failed:", e);
      } finally {
        setLookupLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // In local dev, we might not have a worker running, so we'll mock the fetch if it fails
    // But since the worker is built, ideally we'd fetch from it. 
    // Here we'll simulate the worker logic locally directly if the fetch fails.
    try {
      // Call the deployed Cloudflare Worker API
      const response = await fetch('https://permitpulse.kolipakula.workers.dev/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: formData.address,
          primaryStructureArea: formData.primaryStructureArea,
          drivewayArea: formData.drivewayArea
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from API');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        matchedAddress: data.matchedAddress !== "Not Found" ? data.matchedAddress : "Using default lot size",
        parcelAreaSqFt: data.parcelAreaSqFt,
        setbacks: data.setbacks,
        imperviousCover: data.imperviousCover
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gradient">Setback & Coverage Calculator</h1>
        <p className="text-muted">Connected to Frisco GIS Database for live parcel boundaries.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Property Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={18} style={{ margin: '0 12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  style={{ border: 'none', background: 'transparent', width: '100%', padding: '12px 16px 12px 0' }}
                  className="input-control" 
                  placeholder="e.g. 123 Starwood Dr"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  required
                />
                {lookupLoading && <Loader2 size={16} className="animate-spin" style={{ margin: '0 12px', color: 'var(--color-primary)' }} />}
              </div>
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
              {loading ? 'Fetching GIS Data...' : 'Calculate Limits'}
            </button>
          </form>
        </div>

        {result && (
          <div className="glass-panel animate-fade-in">
            <h3 className="mb-4">Calculation Results</h3>
            
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle size={20} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-primary)' }}>GIS Parcel Matched</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{result.matchedAddress}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lot Size: {result.parcelAreaSqFt.toLocaleString()} sq ft</p>
              </div>
            </div>
            
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
                  <span>Max Allowable (50%)</span> <strong>{result.imperviousCover.max.toLocaleString()} sq ft</strong>
                </li>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span>Current Coverage</span> <strong>{result.imperviousCover.current.toLocaleString()} sq ft</strong>
                </li>
                <li className="flex justify-between" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Available for Outdoor Living</span> 
                  <strong style={{ color: 'var(--color-primary)' }}>{result.imperviousCover.available.toLocaleString()} sq ft</strong>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
