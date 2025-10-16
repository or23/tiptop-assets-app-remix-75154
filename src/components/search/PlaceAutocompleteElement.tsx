import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps, geocodeAddress } from '@/utils/googleMapsLoader';

export type PlaceSelection = {
  address: string;
  coordinates: google.maps.LatLngLiteral;
  placeId?: string;
};

interface Props {
  onSelect: (selection: PlaceSelection) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

const PlaceAutocompleteElement: React.FC<Props> = ({ onSelect, placeholder = 'Search your address', className, value }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Update input value when controlled value changes
  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMaps();
        
        if (!inputRef.current || !google.maps.places.Autocomplete) {
          console.error('Required elements not available');
          return;
        }

        // Create traditional Autocomplete
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry', 'place_id']
        });

        autocompleteRef.current = autocomplete;

        // Handle place selection
        const handlePlaceChanged = () => {
          const place = autocomplete.getPlace();
          console.log('Place selected:', place);

          if (!place.geometry || !place.geometry.location) {
            console.log('No geometry, trying geocoding fallback');
            // Fallback to geocoding
            const inputValue = inputRef.current?.value;
            if (inputValue) {
              geocodeAddress(inputValue)
                .then(coords => {
                  onSelect({
                    address: inputValue,
                    coordinates: coords,
                    placeId: place.place_id
                  });
                })
                .catch(console.error);
            }
            return;
          }

          const location = place.geometry.location;
          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };

          onSelect({
            address: place.formatted_address || inputRef.current?.value || '',
            coordinates,
            placeId: place.place_id
          });
        };

        autocomplete.addListener('place_changed', handlePlaceChanged);

        // Style the dropdown container
        const style = document.createElement('style');
        style.textContent = `
          .pac-container {
            background-color: hsl(var(--background));
            border: 1px solid hsl(var(--border));
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000 !important;
            font-family: inherit;
          }
          .pac-item {
            color: hsl(var(--foreground));
            padding: 8px 12px;
            border-bottom: 1px solid hsl(var(--border));
          }
          .pac-item:hover {
            background-color: hsl(var(--accent));
          }
          .pac-item-selected {
            background-color: hsl(var(--accent));
          }
          .pac-item-query {
            color: hsl(var(--foreground));
            font-weight: 500;
          }
          .pac-matched {
            color: hsl(var(--primary));
            font-weight: 600;
          }
          .pac-icon {
            background-image: none;
          }
        `;
        document.head.appendChild(style);

      } catch (error) {
        console.error('Autocomplete initialization failed:', error);
      }
    };

    init();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className={`w-full h-10 px-3 py-2 text-base md:text-sm border-none bg-transparent text-white placeholder-white/70 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30 ${className || ''}`}
    />
  );
};

export default PlaceAutocompleteElement;
