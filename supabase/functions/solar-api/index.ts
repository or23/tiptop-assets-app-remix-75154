
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { formatSolarData, generateEstimatedSolarData, convertSquareMetersToSquareFeet } from './utils.ts';
import { handleSolarApiRequest } from './solarApiService.ts';
import { geocodeAddress } from './geocodeService.ts';
import { SolarApiRequest } from './types.ts';

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Cache management
const CACHE_DURATION_HOURS = 24;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let coordinates: { lat: number; lng: number } | undefined;
  let address: string | undefined;

  try {
    const requestData: SolarApiRequest = await req.json();
    coordinates = requestData.coordinates;
    address = requestData.address;
    
    if (!address && !coordinates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Either address or coordinates must be provided'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Verify API key configuration
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google Maps API key is not configured',
          fallbackUsed: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // First get coordinates if only address was provided
    let locationCoordinates = coordinates;
    let countryCode = null;
    
    if (!locationCoordinates && address) {
      try {
        const geocodeResult = await geocodeAddress(address, GOOGLE_MAPS_API_KEY);
        if (geocodeResult.error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: geocodeResult.error,
              details: geocodeResult.details || 'Failed to geocode address'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }
        
        locationCoordinates = geocodeResult.coordinates;
        countryCode = geocodeResult.countryCode;
        
        if (geocodeResult.unsupported) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Solar API not available in ${countryCode}`,
              details: 'Google Solar API currently has limited coverage in this region.',
              countryCode: countryCode
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
      }
    }

    // If we don't have coordinates at this point, can't continue
    if (!locationCoordinates) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not determine coordinates',
          details: 'Both geocoding and provided coordinates failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Check cache first using proximity-based lookup for better cache hits
    console.log('🔍 Checking cache for coordinates:', locationCoordinates);
    try {
      // Use proximity-based cache lookup with a small tolerance (about 10 meters)
      const tolerance = 0.0001; // ~10 meters
      const { data: cachedData } = await supabase
        .from('solar_api_cache')
        .select('*')
        .gte('cached_at', new Date(Date.now() - CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString())
        .order('cached_at', { ascending: false })
        .limit(10) // Get multiple to find closest match
        .then(({ data, error }) => {
          if (error || !data) return { data: null, error };
          
          // Find closest coordinate match within tolerance
          const closest = data.find(cache => {
            if (!cache.coordinates || typeof cache.coordinates !== 'object') return false;
            const coords = cache.coordinates as any;
            const latDiff = Math.abs(coords.lat - locationCoordinates.lat);
            const lngDiff = Math.abs(coords.lng - locationCoordinates.lng);
            return latDiff <= tolerance && lngDiff <= tolerance;
          });
          
          return { data: closest || null, error: null };
        });

      if (cachedData) {
        console.log('✅ Returning cached solar data for coordinates:', cachedData.coordinates);
        return new Response(
          JSON.stringify({
            success: true,
            solarData: cachedData.solar_data,
            coordinates: locationCoordinates,
            cached: true,
            cacheHit: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (cacheError) {
      console.error('❌ Cache lookup failed, proceeding with API call:', cacheError);
    }

    // Call Google Solar API with coordinates
    console.log('Calling Google Solar API with coordinates:', locationCoordinates);
    
    try {
      const solarResult = await handleSolarApiRequest(locationCoordinates, GOOGLE_MAPS_API_KEY, SUPABASE_URL);
      
      if (solarResult.error) {
        // Check if it's a quota error and provide better messaging
        if (solarResult.error.includes('quota') || solarResult.error.includes('RESOURCE_EXHAUSTED')) {
          console.log('API quota exceeded, generating estimated data');
          const estimatedRoofSize = 1500; // sq ft average home
          const estimatedSolarData = generateEstimatedSolarData(locationCoordinates, estimatedRoofSize, countryCode || '');
          
          return new Response(
            JSON.stringify({
              success: true,
              solarData: estimatedSolarData,
              coordinates: locationCoordinates,
              estimatedData: true,
              quotaExceeded: true,
              message: 'API quota exceeded - using estimated data based on location and average roof size'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }

        // For unsupported regions, generate estimated data
        if (countryCode && countryCode !== 'US') {
          console.log(`Generating estimated solar data for ${countryCode}`);
          const estimatedRoofSize = 1500; // sq ft average home
          const estimatedSolarData = generateEstimatedSolarData(locationCoordinates, estimatedRoofSize, countryCode);
          
          return new Response(
            JSON.stringify({
              success: true,
              solarData: estimatedSolarData,
              coordinates: locationCoordinates,
              estimatedData: true,
              countryCode: countryCode,
              apiError: {
                message: solarResult.error,
                details: solarResult.details || ''
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            success: false,
            error: solarResult.error,
            details: solarResult.details || '',
            apiError: solarResult.apiError || null
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }

      // Store the API response in the cache for future reference with proper JSONB coordinates
      if (locationCoordinates && solarResult.solarData) {
        try {
          const propertyAddress = address || `${locationCoordinates.lat},${locationCoordinates.lng}`;
          console.log('💾 Caching solar data for:', propertyAddress, 'at coordinates:', locationCoordinates);
          
          await supabase
            .from('solar_api_cache')
            .upsert({
              // Store coordinates as proper JSONB object instead of POINT string
              coordinates: locationCoordinates,
              solar_data: solarResult.solarData,
              property_address: propertyAddress,
              cached_at: new Date().toISOString()
            })
            .select();
          console.log('✅ Solar data cached successfully with JSONB coordinates');
        } catch (dbError) {
          console.error('❌ Database storage error (non-critical):', dbError);
          // Continue execution even if database storage fails
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          solarData: solarResult.solarData,
          coordinates: locationCoordinates,
          apiSuccess: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (apiError) {
      console.error('Error calling Google Solar API:', apiError);
      
      // Generate estimated data for failed API calls
      const estimatedRoofSize = 1500; // sq ft average home
      const estimatedSolarData = generateEstimatedSolarData(locationCoordinates, estimatedRoofSize, countryCode || '');
      
      return new Response(
        JSON.stringify({
          success: true,
          solarData: estimatedSolarData,
          coordinates: locationCoordinates,
          estimatedData: true,
          fallbackUsed: true,
          error: 'Failed to connect to Google Solar API - using estimates',
          message: apiError instanceof Error ? apiError.message : 'Unknown API error'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    } catch (error) {
      console.error('❌ Critical error in solar-api function:', error);
      
      // Enhanced error handling with fallback data - use original coordinates from request
      const fallbackSolarData = coordinates ?
        generateEstimatedSolarData(coordinates, 1500, '') : null;
      
      if (fallbackSolarData) {
        console.log('🔄 Returning fallback solar data due to error');
        return new Response(
          JSON.stringify({
            success: true,
            solarData: fallbackSolarData,
            coordinates: coordinates,
            fallbackUsed: true,
            error: error instanceof Error ? error.message : 'An error occurred, using estimated data'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        fallbackAvailable: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
