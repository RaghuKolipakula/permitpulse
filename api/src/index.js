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

        // Query the real Collin CAD (CCAD) GIS REST API
        if (address && address.trim() !== '') {
          // Normalize input
          const searchAddr = address.toUpperCase().trim();
          const arcGisUrl = new URL('https://services2.arcgis.com/uXyoacYrZTPTKD3R/arcgis/rest/services/CCAD_Parcel_Feature_Set/FeatureServer/4/query');
          arcGisUrl.searchParams.append('where', `situsConcat LIKE '%${searchAddr}%'`);
          arcGisUrl.searchParams.append('outFields', 'situsConcat,landSizeSqft,landSizeAcres');
          arcGisUrl.searchParams.append('f', 'json');
          arcGisUrl.searchParams.append('resultRecordCount', '1');

          const gisResponse = await fetch(arcGisUrl.toString());
          if (gisResponse.ok) {
            const data = await gisResponse.json();
            if (data.features && data.features.length > 0) {
              const feature = data.features[0];
              matchedAddress = feature.attributes.situsConcat || address;
              
              if (feature.attributes.landSizeSqft) {
                parcelAreaSqFt = parseFloat(feature.attributes.landSizeSqft);
              } else if (feature.attributes.landSizeAcres) {
                parcelAreaSqFt = parseFloat(feature.attributes.landSizeAcres) * 43560;
              }
            }
          }
        }

        // If we didn't find anything or empty address, fallback to a standard lot size
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

    if (url.pathname === '/api/lookup' && request.method === 'GET') {
      try {
        const address = url.searchParams.get('address');
        if (!address || address.trim() === '') {
          return new Response(JSON.stringify({ error: 'Missing address parameter' }), { status: 400, headers: corsHeaders });
        }

        const searchAddr = address.toUpperCase().trim();
        const arcGisUrl = new URL('https://services2.arcgis.com/uXyoacYrZTPTKD3R/arcgis/rest/services/CCAD_Parcel_Feature_Set/FeatureServer/4/query');
        arcGisUrl.searchParams.append('where', `situsConcat LIKE '%${searchAddr}%'`);
        arcGisUrl.searchParams.append('outFields', 'situsConcat,landSizeSqft,landSizeAcres,imprvMainArea');
        arcGisUrl.searchParams.append('f', 'json');
        arcGisUrl.searchParams.append('resultRecordCount', '1');

        const gisResponse = await fetch(arcGisUrl.toString());
        let result = { found: false };

        if (gisResponse.ok) {
          const data = await gisResponse.json();
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            let parcelAreaSqFt = 0;
            if (feature.attributes.landSizeSqft) {
              parcelAreaSqFt = parseFloat(feature.attributes.landSizeSqft);
            } else if (feature.attributes.landSizeAcres) {
              parcelAreaSqFt = parseFloat(feature.attributes.landSizeAcres) * 43560;
            }

            result = {
              found: true,
              matchedAddress: feature.attributes.situsConcat || address,
              parcelAreaSqFt: Math.round(parcelAreaSqFt),
              primaryStructureArea: feature.attributes.imprvMainArea ? Math.round(parseFloat(feature.attributes.imprvMainArea)) : 0
            };
          }
        }
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
