import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import GoogleMap from '@/components/GoogleMap';
import AddressAutocollect from '@/components/AddressAutocollect';
import { Button } from '@/components/ui/button';

const NewAddress = () => {
  const navigate = useNavigate();
  const { setAddress, setAddressCoordinates } = useGoogleMap();
  const [showAutocollect, setShowAutocollect] = useState(true);

  const handleConfirmAddress = (address: string, coordinates: google.maps.LatLngLiteral) => {
    setAddress(address);
    setAddressCoordinates(coordinates);
    setShowAutocollect(false);
  };

  const handleDismiss = () => {
    setShowAutocollect(false);
  };

  const handleEnterManually = () => {
    setShowAutocollect(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pb-20">
      {/* Address Autocollect Modal */}
      {showAutocollect && (
        <AddressAutocollect
          onConfirm={handleConfirmAddress}
          onDismiss={handleDismiss}
          onEnterManually={handleEnterManually}
        />
      )}

      {/* Background Map */}
      <GoogleMap />

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center gap-3 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold text-white">Add New Address</h1>
      </header>

      {/* Content */}
      <main className="relative z-10 p-4 pt-8 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">
            Analyze a New Property
          </h2>
          <p className="text-gray-400 text-sm">
            Enter an address to discover monetization opportunities
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <SearchBar isCollapsed={false} />
          <AnalyzeButton />
        </div>

        <div className="max-w-md mx-auto mt-8">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-2">💡 Pro Tip</h3>
            <p className="text-gray-400 text-sm">
              For the most accurate analysis, make sure to enter the complete street address including city and state.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewAddress;
