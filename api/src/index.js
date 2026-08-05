export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Setup CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/permits' && request.method === 'GET') {
      try {
        if (!env.DB) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 500, headers: corsHeaders });
        const { results } = await env.DB.prepare("SELECT * FROM permits ORDER BY created_at DESC").all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/properties' && request.method === 'GET') {
      try {
        if (!env.DB) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 500, headers: corsHeaders });
        // Return properties for the dashboard
        const { results } = await env.DB.prepare("SELECT * FROM properties LIMIT 100").all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/seed' && request.method === 'GET') {
      return new Response(JSON.stringify({ success: true, message: "Seed endpoint deprecated. We use real data now." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (url.pathname === '/api/calculate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { address, primaryStructureArea, drivewayArea } = body;
        
        let parcelAreaSqFt = 0;
        let matchedAddress = "Not Found";

        if (address && address.trim() !== '') {
          const searchAddr = address.toUpperCase().trim();
          
          // First try our own DB
          if (env.DB) {
            const { results } = await env.DB.prepare("SELECT * FROM properties WHERE UPPER(address) LIKE ? LIMIT 1").bind(`%${searchAddr}%`).all();
            if (results && results.length > 0) {
               matchedAddress = results[0].address;
               if (results[0].lot_size_acres) {
                   parcelAreaSqFt = results[0].lot_size_acres * 43560;
               }
            }
          }

          if (parcelAreaSqFt === 0) {
            return new Response(JSON.stringify({ error: "Address not found in Lexington Country HOA." }), { status: 404, headers: corsHeaders });
          }
        } else {
          return new Response(JSON.stringify({ error: "Missing address" }), { status: 400, headers: corsHeaders });
        }
        
        // Max Impervious Cover
        const maxImperviousArea = Math.round(parcelAreaSqFt * 0.5);
        const currentImperviousArea = parseFloat(primaryStructureArea || 0) + parseFloat(drivewayArea || 0);
        const availableImperviousArea = Math.round(maxImperviousArea - currentImperviousArea);
        
        const setbacks = { front: 25, rear: 15, side: 7 };

        return new Response(JSON.stringify({
          success: true,
          matchedAddress,
          parcelAreaSqFt: Math.round(parcelAreaSqFt),
          setbacks,
          imperviousCover: {
            max: maxImperviousArea,
            current: currentImperviousArea,
            available: availableImperviousArea > 0 ? availableImperviousArea : 0,
            status: availableImperviousArea >= 0 ? "Compliant" : "Exceeds Limits"
          }
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/lookup' && request.method === 'GET') {
      try {
        const address = url.searchParams.get('address');
        if (!address || address.trim() === '') {
          return new Response(JSON.stringify({ error: 'Missing address parameter' }), { status: 400, headers: corsHeaders });
        }

        const searchAddr = address.toUpperCase().trim();
        let result = { found: false };

        // 1. Check local DB properties table
        if (env.DB) {
          const { results } = await env.DB.prepare("SELECT * FROM properties WHERE UPPER(address) LIKE ? LIMIT 1").bind(`%${searchAddr}%`).all();
          if (results && results.length > 0) {
             const row = results[0];
             let parcelAreaSqFt = row.lot_size_acres ? row.lot_size_acres * 43560 : 0;
             result = {
               found: true,
               matchedAddress: row.address,
               parcelAreaSqFt: Math.round(parcelAreaSqFt),
               primaryStructureArea: row.square_feet ? Math.round(row.square_feet) : 0
             };
             return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }

        // If we reach here, it wasn't found in the local DB
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ message: "PermitPulse API running" }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  },
};
