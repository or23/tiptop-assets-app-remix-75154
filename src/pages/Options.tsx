
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Upload, User, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';

const Options = () => {
  const [selectedOption, setSelectedOption] = useState<'manual' | 'concierge' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { loading: authLoading, user } = useAuth();
  const { trackOption } = useJourneyTracking();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('🎯 Options page state:', {
    selectedOption,
    authLoading,
    isInitialized,
    hasUser: !!user
  });

  // Initialize the page after a short delay to prevent black screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Authentication guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🔐 [OPTIONS] User not authenticated, redirecting to auth');
      navigate('/auth?returnTo=/options');
    }
  }, [user, authLoading, navigate]);

  // Redirect authenticated users to onboarding with their last selection or dashboard
  useEffect(() => {
    if (user && !authLoading) {
      console.log('🔄 User is authenticated, checking for onboarding redirect');
      
      // If we have a selected option, redirect to onboarding
      if (selectedOption) {
        console.log('🎯 Redirecting to onboarding with option:', selectedOption);
        window.location.href = `/onboarding?option=${selectedOption}`;
      } else {
        console.log('🔄 No selected option, staying on options page');
      }
    }
  }, [user, authLoading, selectedOption]);

  const handleOptionSelect = async (option: 'manual' | 'concierge') => {
    console.log('✅ Option selected:', option);
    setSelectedOption(option);
    
    // Track the option selection
    await trackOption(option);
  };

  const handleContinue = async () => {
    console.log('🚀 Continue clicked with option:', selectedOption);
    
    if (!selectedOption) {
      toast({
        title: "Selection Required",
        description: "Please select an upload option to continue",
        variant: "destructive"
      });
      return;
    }
    
    // User is already authenticated at this point (due to auth guard above)
    // Just redirect to onboarding with the selected option
    toast({
      title: "Option Selected",
      description: `${selectedOption === 'manual' ? 'Manual Upload' : 'Tiptop Concierge'} selected. Redirecting to onboarding...`,
    });
    
    console.log('🎯 Redirecting to onboarding with option:', selectedOption);
    window.location.href = `/onboarding?option=${selectedOption}`;
  };

  // Show loading state while initializing or processing auth
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1A1F2C] to-[#2d3748]">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>{authLoading ? 'Processing authentication...' : 'Loading options...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container relative overflow-hidden bg-gradient-to-b from-[#1A1F2C] to-[#2d3748] flex flex-col items-center">
      {/* Background glass effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-tiptop-purple/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 bg-indigo-500/10 rounded-full blur-[80px]"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl px-4 md:px-6 py-12 flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-16">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-tiptop-purple hover:scale-105 transition-transform flex items-center">
            tiptop
          </Link>
        </header>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center drop-shadow-lg">
            Choose How to Upload Your Assets
          </h1>
          <p className="text-lg text-gray-300 mb-12 text-center max-w-lg mx-auto">
            Select the option that works best for you to get your assets listed on partner platforms
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            {/* Manual Upload Option */}
            <motion.div 
              whileHover={{ translateY: -5 }}
              className={`flex-1 glass-effect rounded-xl p-6 cursor-pointer relative overflow-hidden transition-all duration-300 border-2 
                ${selectedOption === 'manual' ? 
                  'border-tiptop-purple shadow-lg shadow-tiptop-purple/20' : 
                  'border-white/10 hover:border-white/30'}`}
              onClick={() => handleOptionSelect('manual')}
              style={{
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
              }}
            >
              {/* Glossy effect */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl pointer-events-none"></div>
              
              {selectedOption === 'manual' && (
                <div className="absolute top-3 right-3 text-tiptop-purple">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-tiptop-purple/20 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-tiptop-purple" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Manual Upload</h3>
                <p className="text-gray-300 mb-4">Upload your assets yourself with our partner platforms</p>
                <div className="text-tiptop-purple font-bold text-xl">Free</div>
                <ul className="mt-4 text-left w-full space-y-2">
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="text-tiptop-purple">✓</span> Step-by-step guidance
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="text-tiptop-purple">✓</span> Access to all partner platforms
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="text-tiptop-purple">✓</span> DIY flexibility and control
                  </li>
                </ul>
              </div>
            </motion.div>
            
            {/* Concierge Option */}
            <motion.div 
              whileHover={{ translateY: -5 }}
              className={`flex-1 glass-effect rounded-xl p-6 cursor-pointer relative overflow-hidden transition-all duration-300 border-2 
                ${selectedOption === 'concierge' ? 
                  'border-tiptop-purple shadow-lg shadow-tiptop-purple/20' : 
                  'border-white/10 hover:border-white/30'}`}
              onClick={() => handleOptionSelect('concierge')}
              style={{
                background: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
              }}
            >
              {/* Glossy effect */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl pointer-events-none"></div>
              
              {selectedOption === 'concierge' && (
                <div className="absolute top-3 right-3 text-tiptop-purple">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-tiptop-purple/20 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-tiptop-purple" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Tiptop Concierge</h3>
                <p className="text-gray-300 mb-4">We'll handle everything for you</p>
                <div className="text-tiptop-purple font-bold text-xl">$20.00 USD</div>
                <ul className="mt-4 text-left w-full space-y-2">
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="text-tiptop-purple">✓</span> Full-service asset listing
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="text-tiptop-purple">✓</span> Professional optimization
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="text-tiptop-purple">✓</span> Priority support
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
          
          {/* Continue Button */}
          <div className="mt-12 flex justify-center">
            <Button 
              onClick={handleContinue} 
              disabled={!selectedOption}
              className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl disabled:opacity-50"
              style={{ 
                boxShadow: '0 0 20px rgba(155, 135, 245, 0.5)',
              }}
            >
              <span>Continue to Onboarding</span>
              <LogIn size={24} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Options;
