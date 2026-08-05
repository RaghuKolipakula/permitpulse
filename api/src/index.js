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
        const { address, primaryStructureArea, drivewayArea } = body;
        
        let parcelAreaSqFt = 0;
        let matchedAddress = "Not Found";

        // Query the Frisco GIS REST API
        if (address && address.trim() !== '') {
          // Normalize input to uppercase for better matching
          const searchAddr = address.toUpperCase().trim();
          const arcGisUrl = new URL('https://maps.friscotexas.gov/arcgis/rest/services/Public/FriscoData/MapServer/3/query');
          arcGisUrl.searchParams.append('where', `SITE_ADDR LIKE '%${searchAddr}%'`);
          arcGisUrl.searchParams.append('outFields', '*');
          arcGisUrl.searchParams.append('f', 'json');

          const gisResponse = await fetch(arcGisUrl.toString());
          if (gisResponse.ok) {
            const data = await gisResponse.json();
            if (data.features && data.features.length > 0) {
              const feature = data.features[0];
              matchedAddress = feature.attributes.SITE_ADDR || address;
              // Extract Acreage and convert to sq ft (1 acre = 43560 sq ft)
              // If Acreage field isn't standard, might fallback to Shape.STArea() depending on the system
              let acres = feature.attributes.ACREAGE || feature.attributes.Acres || feature.attributes.ACRES;
              if (acres) {
                parcelAreaSqFt = parseFloat(acres) * 43560;
              } else if (feature.attributes["Shape.STArea()"]) {
                 // Sometime stored directly as sq ft in state plane coords
                parcelAreaSqFt = feature.attributes["Shape.STArea()"]; 
              } else {
                // Fallback if acreage isn't explicitly defined but we got a match
                parcelAreaSqFt = 10000;
              }
            }
          }
        }

        // If we didn't find anything, fallback to a standard lot size to not break the UI
        if (parcelAreaSqFt === 0) parcelAreaSqFt = 10000;
        
        // Frisco typical rules
        // Max Impervious Cover: typically 50% for standard residential
        const maxImperviousArea = Math.round(parcelAreaSqFt * 0.5);
        const currentImperviousArea = parseFloat(primaryStructureArea) + parseFloat(drivewayArea);
        const availableImperviousArea = Math.round(maxImperviousArea - currentImperviousArea);
        
        // Standard setbacks
        const setbacks = {
          front: 25,
          rear: 15,
          side: 7
        };

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
