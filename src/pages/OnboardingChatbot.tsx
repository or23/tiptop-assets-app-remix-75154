import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare, Settings2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAssetSelection } from '@/hooks/useAssetSelection';
import { toast } from '@/hooks/use-toast';
import { 
  generatePartnerRecommendations, 
  initializePartnerIntegration, 
  type PartnerRecommendation 
} from '@/services/partnerRecommendationService';
import PartnerRecommendationCard from '@/components/onboarding/PartnerRecommendationCard';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import { trackAndOpenReferral } from '@/services/clickTrackingService';
import AssetSelectionCards from '@/components/onboarding/AssetSelectionCards';

const OnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    onboardingData,
    messages,
    loading,
    error,
    startOnboarding,
    addMessage,
    updateProgress,
    clearError,
    isAuthenticated
  } = useOnboarding();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [partnerRecommendations, setPartnerRecommendations] = useState<PartnerRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAssetSelection, setShowAssetSelection] = useState(false);
  const [integratingPartners, setIntegratingPartners] = useState<Set<string>>(new Set());
  const [completedIntegrations, setCompletedIntegrations] = useState<Set<string>>(new Set());
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const { saveSelection } = useAssetSelection();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showRecommendations, showAssetSelection]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access the asset onboarding chatbot.',
        variant: 'destructive',
      });
    }
  }, [authLoading, isAuthenticated]);

  const analyzeUserMessage = (message: string): string[] => {
    const assetKeywords = {
      'rooftop': ['roof', 'rooftop', 'solar', 'panels'],
      'parking': ['parking', 'driveway', 'garage', 'car space'],
      'pool': ['pool', 'swimming', 'swim'],
      'internet': ['internet', 'bandwidth', 'wifi', 'connection'],
      'storage': ['storage', 'basement', 'attic', 'space'],
      'garden': ['garden', 'yard', 'lawn', 'outdoor space'],
      'unique_spaces': ['unique', 'special', 'event', 'photoshoot']
    };

    const detected: string[] = [];
    const lowerMessage = message.toLowerCase();

    Object.entries(assetKeywords).forEach(([asset, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detected.push(asset);
      }
    });

    return detected;
  };

  const handleStartOnboarding = async (option: 'manual' | 'concierge') => {
    const data = await startOnboarding(option);
    if (data) {
      // Add welcome message
      const welcomeMessage = option === 'manual' 
        ? "Hi! I'm here to help you identify and set up monetization opportunities for your property assets. Let's start by telling me about your property. What type of property do you own and what features does it have?"
        : "Welcome to our concierge service! I'll personally guide you through setting up your property assets for maximum revenue. Let's begin with understanding your property better. Can you describe your property and its features to me?";
      
      await addMessage('assistant', welcomeMessage);
    }
  };

  const handleAssetSelection = async (assetId: string) => {
    setSelectedAsset(assetId);
    
    // Save asset selection to database
    const assetName = assetId.replace('_', ' ');
    const estimatedRevenue = getEstimatedRevenue(assetId);
    
    try {
      await saveSelection(
        assetName,
        { source: 'onboarding_chatbot', asset_id: assetId },
        estimatedRevenue,
        0 // setup cost - can be updated later
      );
    } catch (error) {
      console.error('Failed to save asset selection:', error);
    }
    
    // Add message about starting the asset setup process
    await addMessage('assistant', 
      `Perfect! Let's set up your ${assetName} for monetization. I'll guide you through the specific requirements and connect you with the best service providers.`
    );

    // Generate targeted recommendations for this specific asset
    if (onboardingData) {
      try {
        const recommendations = await generatePartnerRecommendations(onboardingData.id, [assetId]);
        setPartnerRecommendations(recommendations);
        setShowRecommendations(true);
        
        if (recommendations.length > 0) {
          await addMessage('assistant', 
            `I found ${recommendations.length} partner${recommendations.length > 1 ? 's' : ''} that specialize in ${assetId.replace('_', ' ')} monetization. Check out the recommendations below to get started!`
          );
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
      }
    }
    
    // Hide asset selection cards
    setShowAssetSelection(false);
  };

  // Helper function to get estimated revenue based on asset type
  const getEstimatedRevenue = (assetId: string): number => {
    const revenueMap: Record<string, number> = {
      'rooftop': 350,
      'internet': 35,
      'parking': 200,
      'pool': 100,
      'storage': 125,
      'garden': 65,
      'unique_spaces': 300
    };
    return revenueMap[assetId] || 100;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !onboardingData || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    await addMessage('user', userMessage);
    
    // Analyze user message for assets
    const foundAssets = analyzeUserMessage(userMessage);
    const allDetectedAssets = [...new Set([...detectedAssets, ...foundAssets])];
    setDetectedAssets(allDetectedAssets);
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Generate contextual response
    setTimeout(async () => {
      let response = '';
      
      if (foundAssets.length > 0) {
        response = `Great! I can see you have ${foundAssets.join(', ')} assets. `;
        
        if (allDetectedAssets.length >= 2) {
          response += "You have multiple monetizable assets! Let me show you what we can set up for you.";
          setShowAssetSelection(true);
        } else {
          response += "Tell me about any other assets you have - like parking spaces, internet connection, storage areas, or unique spaces that could be monetized.";
        }
      } else {
        const responses = [
          "That's helpful information! Can you tell me more about your property? Do you have a rooftop, parking space, pool, or high-speed internet?",
          "I'm gathering details about your property assets. What other features does your property have that we could potentially monetize?",
          "Excellent! Let me ask about specific assets - do you have any parking spaces, storage areas, or unique outdoor spaces?",
          "Thanks for that detail. To give you the best recommendations, can you describe your property's key features like rooftop space, parking, or internet setup?"
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      await addMessage('assistant', response);
      setIsTyping(false);
      
      // Update progress if we have enough assets
      if (allDetectedAssets.length >= 2) {
        await updateProgress({
          current_step: 3,
          progress_data: { detected_assets: allDetectedAssets }
        });
      }
    }, 1500);
  };

  const handlePartnerIntegration = async (partnerName: string, referralLink: string) => {
    if (!user || !onboardingData) return;
    
    setIntegratingPartners(prev => new Set([...prev, partnerName]));
    
    try {
      // Initialize integration tracking
      const integration = await initializePartnerIntegration(
        user.id,
        onboardingData.id,
        partnerName,
        referralLink
      );
      
      if (integration) {
        await trackAndOpenReferral({
          provider: partnerName,
          url: referralLink,
          source: 'onboarding_chatbot'
        });
        
        // Add assistant message about the integration
        await addMessage('assistant', 
          `Great! I've opened the ${partnerName} registration page for you. Follow the steps to create your account and start earning. I'll track your progress and help you optimize your setup!`
        );
        
        // Mark as completed (in real app, this would be triggered by actual completion)
        setTimeout(() => {
          setCompletedIntegrations(prev => new Set([...prev, partnerName]));
          setIntegratingPartners(prev => {
            const newSet = new Set(prev);
            newSet.delete(partnerName);
            return newSet;
          });
          
          toast({
            title: "Integration Started",
            description: `Successfully opened ${partnerName} registration. Complete the signup to start earning!`,
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error integrating partner:', error);
      toast({
        title: "Integration Error",
        description: `Failed to start integration with ${partnerName}. Please try again.`,
        variant: "destructive",
      });
    }
    
    setIntegratingPartners(prev => {
      const newSet = new Set(prev);
      newSet.delete(partnerName);
      return newSet;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-tiptop-purple" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border shadow-sm">
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-tiptop-purple" />
            <CardTitle className="text-xl text-gray-900">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to access the asset onboarding chatbot.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-tiptop-purple hover:bg-purple-600"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-red-200 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={clearError}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50 flex flex-col">
      {/* Header with Dashboard Navigation */}
      <OnboardingHeader onboardingData={onboardingData} detectedAssets={detectedAssets} />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {!onboardingData ? (
          // Onboarding Selection
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-2xl border shadow-sm bg-white">
              <CardHeader className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-tiptop-purple" />
                <CardTitle className="text-2xl mb-2 text-gray-900">Welcome to Asset Onboarding</CardTitle>
                <p className="text-gray-600">
                  Choose how you'd like to set up your property assets for monetization
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => handleStartOnboarding('manual')}
                  disabled={loading}
                  className="w-full h-16 text-left flex items-center gap-4 bg-tiptop-purple hover:bg-purple-600 text-white"
                >
                  <Settings2 className="h-8 w-8" />
                  <div>
                    <div className="font-semibold">Self-Service Setup</div>
                    <div className="text-sm opacity-90">Guide yourself through the process</div>
                  </div>
                </Button>
                <Button
                  onClick={() => handleStartOnboarding('concierge')}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-16 text-left flex items-center gap-4 border-tiptop-purple text-tiptop-purple hover:bg-tiptop-purple hover:text-white"
                >
                  <Bot className="h-8 w-8" />
                  <div>
                    <div className="font-semibold">Concierge Service</div>
                    <div className="text-sm opacity-80">Get personalized assistance</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Chat Interface
          <>
            <Card className="flex-1 border shadow-sm bg-white mb-4">
              <ScrollArea className="h-[500px] p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-tiptop-purple' : 'bg-gray-200'
                          }`}>
                            {message.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-gray-600" />}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-tiptop-purple text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Asset Selection Cards */}
                  {showAssetSelection && (
                    <AssetSelectionCards 
                      detectedAssets={detectedAssets}
                      onAssetSelect={handleAssetSelection}
                    />
                  )}
                  
                  {/* Partner Recommendations - FIXED HORIZONTAL LAYOUT */}
                  {showRecommendations && partnerRecommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-full min-w-0">
                        <div 
                          className="flex flex-row gap-4 overflow-x-auto overflow-y-visible pb-4 scrollbar-hide"
                          style={{ 
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            minWidth: 'max-content'
                          }}
                        >
                          {partnerRecommendations.map((recommendation) => (
                            <div key={recommendation.id} className="flex-shrink-0">
                              <PartnerRecommendationCard
                                recommendation={recommendation}
                                onIntegrate={handlePartnerIntegration}
                                isIntegrating={integratingPartners.has(recommendation.partner_name)}
                                isCompleted={completedIntegrations.has(recommendation.partner_name)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </Card>

            {/* Message Input */}
            <Card className="border shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your property assets..."
                    disabled={isTyping}
                    className="flex-1 border-gray-300 focus:border-tiptop-purple focus:ring-tiptop-purple"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="icon"
                    className="bg-tiptop-purple hover:bg-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingChatbot;
