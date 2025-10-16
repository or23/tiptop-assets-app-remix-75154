
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import AnalyzeButton from '@/components/AnalyzeButton';
import GoogleMap from '@/components/GoogleMap';
import AssetIcons from '@/components/AssetIcons';
import AssetResultList from '@/components/asset-results/AssetResultList';
import ModelGenerationSheet from '@/components/ModelGenerationSheet';
import HomeModelViewer from '@/components/home-model-viewer';
import DataSyncNotification from '@/components/DataSyncNotification';
import JourneyTracker from '@/components/JourneyTracker';
import { OpenAIConnectionTest } from '@/components/OpenAIConnectionTest';
import { WelcomeTutorial } from '@/components/WelcomeTutorial';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FooterCarousel from '@/components/FooterCarousel';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  shouldShowWelcomeTutorial, 
  markWelcomeTutorialSeen,
  shouldShowAssetSelectionTutorial,
  markAssetSelectionTutorialSeen,
  isFirstTimeUser
} from '@/services/firstTimeUserService';
import { trackVisitorPageView, updateVisitorSessionTime, saveLeadContact, getVisitorSessionId } from '@/services/visitorTrackingService';
import { trackLeadCaptured } from '@/services/userJourneyService';
import { trackPageView, trackViewContent, trackLead } from '@/services/facebookPixelService';
import AssetSelectionTutorialBanner from '@/components/AssetSelectionTutorialBanner';
import LeadCaptureBanner from '@/components/LeadCaptureBanner';

const Index = () => {
  const { isAnalyzing, analysisComplete, address, analysisResults } = useGoogleMap();
  const { status } = useModelGeneration();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showingFormSection, setShowingFormSection] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAssetTutorial, setShowAssetTutorial] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const isMobile = useIsMobile();
  const hasAddress = !!address;
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();

  // Check if first-time user and show tutorial
  useEffect(() => {
    if (shouldShowWelcomeTutorial()) {
      setShowTutorial(true);
    }
  }, []);

  // Track visitor page view and set up time tracking
  useEffect(() => {
    if (!user) {
      // Only track anonymous visitors
      trackVisitorPageView('/');
      trackPageView(); // Facebook Pixel tracking
      
      // Update time every 30 seconds
      const timeUpdateInterval = setInterval(() => {
        updateVisitorSessionTime();
      }, 30000);
      
      // Update time when user leaves the page
      const handleBeforeUnload = () => {
        updateVisitorSessionTime();
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Cleanup
      return () => {
        clearInterval(timeUpdateInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateVisitorSessionTime(); // Final update on unmount
      };
    }
  }, [user]);

  // Check if lead already captured for this session
  useEffect(() => {
    const sessionId = getVisitorSessionId();
    const captured = localStorage.getItem(`lead_captured_${sessionId}`);
    if (captured) {
      setLeadCaptured(true);
    }
  }, []);

  // Show lead capture banner after analysis completes
  useEffect(() => {
    if (analysisComplete && !user && !leadCaptured) {
      setShowLeadCapture(true);
      // Track that user viewed analysis results
      const opportunityCount = getTotalOpportunityCount();
      trackViewContent('Property Analysis Results', opportunityCount);
    } else {
      setShowLeadCapture(false);
    }
  }, [analysisComplete, user, leadCaptured]);

  const handleLeadSubmit = async (contact: string, contactType: 'email' | 'phone') => {
    try {
      await saveLeadContact(contact, contactType);
      await trackLeadCaptured(contact, contactType);
      
      // Track Facebook Pixel lead event
      trackLead(contactType);
      
      const sessionId = getVisitorSessionId();
      localStorage.setItem(`lead_captured_${sessionId}`, 'true');
      
      setLeadCaptured(true);
      setShowLeadCapture(false);
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw error;
    }
  };

  const handleLeadSkip = () => {
    const sessionId = getVisitorSessionId();
    localStorage.setItem(`lead_captured_${sessionId}`, 'skipped');
    
    setLeadCaptured(true);
    setShowLeadCapture(false);
  };

  // Calculate total opportunities from analysis results
  const getTotalOpportunityCount = () => {
    if (!analysisResults) return 0;
    
    let count = 0;
    
    // Count opportunities with revenue > 0
    if (analysisResults.rooftop?.revenue > 0) count++;
    if (analysisResults.garden?.revenue > 0) count++;
    if (analysisResults.parking?.revenue > 0) count++;
    if (analysisResults.pool?.revenue > 0) count++;
    if (analysisResults.sportsCourts?.revenue > 0) count++;
    if (analysisResults.storage?.revenue > 0) count++;
    if (analysisResults.bandwidth?.revenue > 0) count++;
    if (analysisResults.shortTermRental?.monthlyProjection > 0) count++;
    
    return count;
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    markWelcomeTutorialSeen();
  };

  // Collapse UI elements when analysis is complete
  useEffect(() => {
    setIsCollapsed(analysisComplete);
  }, [analysisComplete]);

  // Show asset selection tutorial for first-time users after analysis completes
  useEffect(() => {
    if (analysisComplete && shouldShowAssetSelectionTutorial()) {
      setShowAssetTutorial(true);
    }
  }, [analysisComplete]);

  const handleDismissAssetTutorial = () => {
    setShowAssetTutorial(false);
    markAssetSelectionTutorialSeen();
  };

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we should show the banner (hide during capturing, show during generating and error)
  const showBanner = status !== 'idle' && (status === 'generating' || status === 'error');

  return (
    <div className="page-container relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(to bottom right, #1e293b, #111827, #000000)' }}>
      {/* Journey Tracker */}
      <JourneyTracker />

      {/* Google Map as background - hidden on mobile until address entered */}
      {(!isMobile || hasAddress) && <GoogleMap />}

      {/* Data Sync Notification Handler */}
      <DataSyncNotification />

      {/* Welcome Tutorial */}
      <AnimatePresence>
        {showTutorial && <WelcomeTutorial onClose={handleCloseTutorial} />}
      </AnimatePresence>

      {/* Lead Capture Banner */}
      {showLeadCapture && analysisResults && (
        <LeadCaptureBanner
          opportunityCount={getTotalOpportunityCount()}
          onSubmit={handleLeadSubmit}
          onSkip={handleLeadSkip}
        />
      )}

      {/* Content overlay - flex-1 to take available space */}
      <div 
        className="relative z-10 flex-1 flex flex-col items-center pb-24"
        style={{ filter: showLeadCapture ? 'blur(8px)' : 'none', pointerEvents: showLeadCapture ? 'none' : 'auto' }}
      >
        {/* Mobile-First Header - Hidden on mobile */}
        <header className="hidden md:flex w-full px-4 py-3 sm:py-4 justify-between items-center bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary hover:scale-105 transition-transform">
            tiptop
          </Link>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground hidden sm:inline">Connected</span>
            </div>
          )}
        </header>

        {/* Main content - Mobile-first responsive */}
        <main className="flex-1 w-full flex flex-col items-center justify-start px-4 sm:px-6 transition-all duration-500">
          <div className={`text-center mb-4 sm:mb-6 mt-4 sm:mt-6 transform transition-all duration-500 ${isCollapsed ? 'scale-0 h-0 mb-0' : 'scale-100'}`}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 drop-shadow-lg">
              {isAnalyzing ? "🏡 Analyzing..." : "🏡 Monetize Your Home"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover hidden revenue opportunities
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-lg">
            <SearchBar isCollapsed={isCollapsed} />
            {!isAnalyzing && !analysisComplete && <AnalyzeButton />}
          </div>

          {/* Asset Icons positioned responsively */}
          <div className={`w-full flex flex-col justify-center items-center ${!analysisComplete && !isAnalyzing ? (isMobile ? 'mt-6 sm:mt-8' : 'mt-12 lg:mt-16') : ''}`}>
            {!analysisComplete && !isAnalyzing && <AssetIcons />}
          </div>

          {/* Model Generation Banner - now inline instead of modal */}
          {showBanner && (
            <div className="w-full max-w-4xl mx-auto mb-4 px-4">
              <ModelGenerationSheet />
            </div>
          )}

          {/* Asset Selection Tutorial Banner */}
          {showAssetTutorial && analysisComplete && (
            <div className={`w-full ${showingFormSection ? 'mt-0' : 'mt-64 sm:mt-72 md:mt-80 lg:mt-96'}`}>
              <AssetSelectionTutorialBanner onDismiss={handleDismissAssetTutorial} />
            </div>
          )}

          {/* Analysis results positioned extremely far down */}
          {analysisComplete && analysisResults && (
            <div className={`w-full ${showingFormSection || showAssetTutorial ? 'mt-0' : 'mt-64 sm:mt-72 md:mt-80 lg:mt-96'}`}>
              <AssetResultList 
                analysisResults={analysisResults} 
                onFormSectionToggle={setShowingFormSection}
              />
            </div>
          )}
        </main>
        
        {/* Footer with carousel - responsive spacing */}
        {!analysisComplete && !isAnalyzing && !hasAddress && (
          <footer className="w-full">
            <div className={`${isMobile ? 'py-12 sm:py-16 pb-20 sm:pb-24' : 'py-16 md:py-20 lg:py-32'}`}></div>
            <FooterCarousel />
          </footer>
        )}

        {/* 3D Model Viewer */}
        {(analysisComplete || isAnalyzing) && <HomeModelViewer />}
      </div>

      {/* Copyright footer - Always at the bottom with fixed positioning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-20 w-full py-2 sm:py-3 md:py-4 text-center px-4 mt-auto"
      >
        <p className="text-white/60 text-xs sm:text-sm backdrop-blur-sm py-1 sm:py-2 px-2 sm:px-4 rounded-full inline-block bg-black/30 border border-white/10">
          © 2025 Tiptop by Kolonia. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
