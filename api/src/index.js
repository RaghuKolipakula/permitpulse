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

    if (url.pathname === '/api/calculate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { parcelArea, primaryStructureArea, drivewayArea } = body;
        
        // Frisco typical rules (Mock)
        // Max Impervious Cover: typically 50% for standard residential
        const maxImperviousArea = parcelArea * 0.5;
        const currentImperviousArea = primaryStructureArea + drivewayArea;
        const availableImperviousArea = maxImperviousArea - currentImperviousArea;
        
        // Standard setbacks
        const setbacks = {
          front: 25,
          rear: 15,
          side: 7
        };

        return new Response(JSON.stringify({
          success: true,
          setbacks,
          imperviousCover: {
            max: maxImperviousArea,
            current: currentImperviousArea,
            available: availableImperviousArea > 0 ? availableImperviousArea : 0,
            status: availableImperviousArea >= 0 ? "Compliant" : "Exceeds Limits"
          }
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ message: "PermitPulse API running" }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  },
};
