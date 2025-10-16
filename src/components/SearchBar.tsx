
import { useState, useEffect, useRef } from 'react';

import { useAddressSearch } from '@/hooks/use-address-search';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { Button } from '@/components/ui/button';
import { useModelGeneration } from '@/contexts/ModelGeneration';

import GeoLocationButton from './search/GeoLocationButton';
import PlaceAutocompleteElement from './search/PlaceAutocompleteElement';

type SearchBarProps = {
  isCollapsed: boolean;
};

const SearchBar = ({ isCollapsed }: SearchBarProps) => {
  const { 
    address,
    setAddress,
    setIsAnalyzing,
    setAnalysisComplete,
    setAnalysisResults,
    mapInstance,
    setAddressCoordinates,
    isGeneratingAnalysis,
    mapLoaded
  } = useGoogleMap();
  
  const {
    hasSelectedAddress,
    setHasSelectedAddress,
    analysisError,
    setAnalysisError,
    startAnalysis,
    applySelectedAddress,
  } = useAddressSearch();
  
  const { resetGeneration, capturePropertyImages } = useModelGeneration();


  // Handle geolocation success - only position and enable button
  const handleLocationFound = (formattedAddress: string, coordinates: google.maps.LatLngLiteral) => {
    console.log('SearchBar: Location found:', formattedAddress, coordinates);
    setAddress(formattedAddress);
    setHasSelectedAddress(true);
    setAddressCoordinates(coordinates);
    
    // Only capture images for positioning, don't start analysis
    capturePropertyImages(formattedAddress, coordinates);
  };

  return (
    <div className={`relative w-full ${isCollapsed ? 'max-w-md' : 'max-w-xl'} transition-all duration-500 ease-in-out z-[9999]`}>
      <div className="glass-effect flex items-center h-14 px-4 rounded-full relative glow-effect overflow-visible">
        <PlaceAutocompleteElement
          className="flex-1 min-w-0 relative z-20"
          placeholder="Search your address"
          value={address}
          onSelect={({ address: selectedAddress, coordinates }) => {
            // Only apply selection (centers map and sets zoom) - don't start analysis
            applySelectedAddress(selectedAddress, coordinates);
            // Capture images for positioning only
            capturePropertyImages(selectedAddress, coordinates);
          }}
        />
        
        
        
        <GeoLocationButton 
          onLocationFound={handleLocationFound}
          disabled={isGeneratingAnalysis || !mapLoaded}
        />
        
      </div>
    </div>
  );
};

export default SearchBar;
