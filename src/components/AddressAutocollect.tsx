import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

interface AddressAutocollectProps {
  onConfirm: (address: string, coordinates: google.maps.LatLngLiteral) => void;
  onDismiss: () => void;
  onEnterManually: () => void;
  redirectToHome?: boolean;
}

const AddressAutocollect = ({ onConfirm, onDismiss, onEnterManually, redirectToHome = false }: AddressAutocollectProps) => {
  const navigate = useNavigate();
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    detectAddress();
  }, []);

  const detectAddress = async () => {
    setLoading(true);
    setError(false);

    try {
      // Ensure Google Maps is loaded first
      await loadGoogleMaps();
      
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setCoordinates(coords);

      // Ensure Google Maps is loaded
      if (!window.google?.maps) {
        throw new Error('Google Maps not loaded');
      }

      // Reverse geocode to get address using callback-based API
      const geocoder = new google.maps.Geocoder();
      
      const address = await new Promise<string>((resolve, reject) => {
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Geocoding failed with status: ${status}`));
          }
        });
      });

      setDetectedAddress(address);
    } catch (err) {
      console.error('Error detecting address:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (detectedAddress && coordinates) {
      onConfirm(detectedAddress, coordinates);
      
      // If redirectToHome is true, navigate to home page after setting the address
      if (redirectToHome) {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    }
  };

  const handleEnterManuallyClick = () => {
    onEnterManually();
    // Navigate to home page for manual entry
    navigate('/', { replace: true });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="w-full sm:max-w-md mb-20 mb-[calc(64px+env(safe-area-inset-bottom))]"
        >
          <Card className="border-0 sm:border rounded-t-3xl sm:rounded-2xl bg-gradient-to-b from-gray-900 to-black border-white/10">
            <CardContent className="p-6 pb-24 space-y-6 pb-[env(safe-area-inset-bottom)]">
              {/* Close button */}
              <button
                onClick={onDismiss}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Detect Your Location
                </h2>
                <p className="text-gray-400 text-sm">
                  Let us detect your address automatically to get started faster
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 text-sm">Detecting your location...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center space-y-3">
                  <div className="text-red-400 text-sm">
                    Couldn't detect your location automatically
                  </div>
                  <Button
                    onClick={detectAddress}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Success State */}
              {detectedAddress && !loading && !error && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 mb-1">Detected address:</p>
                        <p className="text-white font-medium break-words">
                          {detectedAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleConfirm}
                      className="w-full bg-primary hover:bg-primary/90 mobile-touch-target"
                      size="lg"
                    >
                      Use This Address
                    </Button>
                    <Button
                      onClick={handleEnterManuallyClick}
                      variant="outline"
                      className="w-full mobile-touch-target"
                      size="lg"
                    >
                      Enter Different Address
                    </Button>
                  </div>
                </div>
              )}

              {/* Always show manual entry option */}
              {(loading || error) && (
                <Button
                  onClick={handleEnterManuallyClick}
                  variant="ghost"
                  className="w-full text-gray-400"
                >
                  Enter Address Manually Instead
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddressAutocollect;
