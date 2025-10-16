import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import GoogleMap from '@/components/GoogleMap';
import AddressAutocollect from '@/components/AddressAutocollect';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NewAddress = () => {
  const navigate = useNavigate();
  const { setAddress, setAddressCoordinates, analysisComplete, isAnalyzing } = useGoogleMap();
  const [showAutocollect, setShowAutocollect] = useState(true);
  const { toast } = useToast();

  // Redirect to home page when analysis completes
  useEffect(() => {
    if (analysisComplete && !isAnalyzing) {
      toast({
        title: "Analysis Complete!",
        description: "Redirecting you to view your results...",
      });
      
      // Small delay to show the toast before navigating
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    }
  }, [analysisComplete, isAnalyzing, navigate, toast]);

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
    <div className="page-container bg-gradient-to-b from-gray-900 via-black to-gray-900"
>
      {/* Address Autocollect Modal */}
      {showAutocollect && (
        <AddressAutocollect
          onConfirm={handleConfirmAddress}
          onDismiss={handleDismiss}
          onEnterManually={handleEnterManually}
          redirectToHome={true}
        />
      )}

      {/* Background Map */}
      <GoogleMap />

      {/* Header */}
      <header className="sticky top-0 z-40 p-4 flex items-center gap-3 bg-card/95 backdrop-blur-xl border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mobile-touch-target"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">Add New Address</h1>
      </header>

      {/* Content */}
      <main className="relative z-10 p-4 pt-8 space-y-6 pb-32">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold">
            Analyze a New Property
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter an address to discover monetization opportunities
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <SearchBar isCollapsed={false} />
          <AnalyzeButton />
        </div>

        <div className="max-w-md mx-auto mt-8">
          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
            <p className="text-muted-foreground text-sm">
              For the most accurate analysis, make sure to enter the complete street address including city and state. After analysis completes, you'll be automatically redirected to view your results.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewAddress;
