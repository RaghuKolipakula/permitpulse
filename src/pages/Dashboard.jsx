import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, Loader2, Home } from 'lucide-react';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      // Add artificial delay for loading state demo
      const res = await fetch('https://permitpulse.kolipakula.workers.dev/api/properties');
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(prop => 
    prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real Estate Properties</h1>
          <p className="text-gray-500">Live property data for 75035 (Lexington Country)</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p>Loading real estate data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <p>Error: {error}</p>
            <button 
              onClick={fetchProperties}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Home className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">No properties found</p>
            <p>The database is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">Property ID</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">Address</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">Specs</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">Size</th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-500">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {prop.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{prop.address}</p>
                          <p className="text-sm text-gray-500">{prop.community} ({prop.year_built})</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{prop.bedrooms} Bed / {prop.bathrooms} Bath</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{prop.square_feet} SqFt</p>
                      <p className="text-sm text-gray-500">{prop.lot_size_acres} Acres</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${Number(prop.estimated_value).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
