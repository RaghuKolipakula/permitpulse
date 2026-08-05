import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function SubmittalGenerator() {
  const [formData, setFormData] = useState({
    clientName: '',
    projectAddress: '',
    hoaName: 'Starwood',
    projectType: 'Pool & Spa'
  });

  const handleGenerate = () => {
    // Generate PDF using jsPDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary color
    doc.text('PermitPulse Frisco', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('HOA Submittal Packet', 20, 30);
    
    // Details
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    
    doc.setTextColor(15, 23, 42);
    doc.text(`HOA: ${formData.hoaName}`, 20, 55);
    doc.text(`Client Name: ${formData.clientName}`, 20, 65);
    doc.text(`Project Address: ${formData.projectAddress}`, 20, 75);
    doc.text(`Project Type: ${formData.projectType}`, 20, 85);
    
    // Content box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 100, 170, 80, 'FD');
    
    doc.setFontSize(14);
    doc.text('Required Attachments Checklist', 25, 110);
    doc.setFontSize(11);
    doc.text('[X] Signed HOA Application Form', 25, 125);
    doc.text('[X] Property Survey with Proposed Setbacks', 25, 135);
    doc.text('[X] Impervious Cover Calculation Sheet', 25, 145);
    doc.text('[X] Material Samples / Color Chips', 25, 155);
    doc.text('[X] Contractor License & Insurance Certificate', 25, 165);

    doc.save(`HOA_Submittal_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gradient">HOA Submittal Generator</h1>
        <p className="text-muted">Generate perfectly formatted PDF packets for top Frisco master-planned HOAs.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel">
          <div className="input-group">
            <label>Master-Planned HOA</label>
            <select 
              className="input-control" 
              value={formData.hoaName}
              onChange={e => setFormData({...formData, hoaName: e.target.value})}
            >
              <option value="Starwood">Starwood</option>
              <option value="Phillips Creek Ranch">Phillips Creek Ranch</option>
              <option value="Newman Village">Newman Village</option>
              <option value="Edgestone at Legacy">Edgestone at Legacy</option>
            </select>
          </div>
          <div className="input-group">
            <label>Client Name</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="e.g. John Smith"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Project Address</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="e.g. 123 Starwood Dr"
              value={formData.projectAddress}
              onChange={e => setFormData({...formData, projectAddress: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Project Type</label>
            <select 
              className="input-control" 
              value={formData.projectType}
              onChange={e => setFormData({...formData, projectType: e.target.value})}
            >
              <option value="Pool & Spa">Pool & Spa</option>
              <option value="Outdoor Kitchen & Patio">Outdoor Kitchen & Patio</option>
              <option value="Pergola / Covered Patio">Pergola / Covered Patio</option>
              <option value="Landscaping & Hardscaping">Landscaping & Hardscaping</option>
            </select>
          </div>
          
          <button onClick={handleGenerate} className="btn btn-primary mt-4" style={{ width: '100%' }}>
            <Download size={18} />
            Generate PDF Packet
          </button>
        </div>

        <div className="glass-panel items-center flex flex-col justify-center text-center" style={{ minHeight: '300px' }}>
          <FileText size={64} style={{ color: 'var(--color-primary)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3>Ready to Generate</h3>
          <p className="text-muted mt-4">
            The submittal packet will be generated in accordance with the specific architectural guidelines for <strong>{formData.hoaName}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
