import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useUserPropertyAnalysis } from '@/hooks/useUserPropertyAnalysis';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';
import { useUserAssetSelections } from '@/hooks/useUserAssetSelections';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import EnhancedChatInterface from '@/components/onboarding/EnhancedChatInterface';
import ChatInputBox from '@/components/onboarding/ChatInputBox';
import SuggestionBubbles from '@/components/onboarding/SuggestionBubbles';
import SelectedAssetBubbles from '@/components/onboarding/SelectedAssetBubbles';
import ChatbotLoadingState from '@/components/onboarding/ChatbotLoadingState';
import ChatbotErrorState from '@/components/onboarding/ChatbotErrorState';
import ChatbotHeader from '@/components/onboarding/ChatbotHeader';
import ChatbotSidebar from '@/components/onboarding/ChatbotSidebar';
import QuickActionsBar from '@/components/onboarding/QuickActionsBar';

const EnhancedOnboardingChatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Get analysis ID and target asset from URL parameters
  const analysisId = searchParams.get('analysisId');
  const targetAsset = searchParams.get('asset');
  
  console.log('🔗 [CHATBOT] Initializing with URL parameters:', { 
    analysisId, 
    targetAsset,
    url: window.location.href
  });
  
  // Enhanced property analysis integration with fallback to journey data
  const { propertyData, loading: propertyLoading, hasPropertyData } = useUserPropertyAnalysis(analysisId || undefined);
  
  // Use dashboard journey data as primary source (same as dashboard)
  const { journeyData, loading: journeyLoading } = useDashboardJourneyData();
  
  // Get asset selections (same as dashboard)
  const { assetSelections, loading: assetsLoading } = useUserAssetSelections();
  
  // Use journey tracking to get dashboard data as fallback
  const { getDashboardData } = useJourneyTracking();
  
  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);
  const [conversationStage, setConversationStage] = useState('greeting');
  const [conversationStartTime] = useState(Date.now());
  const [messageCount, setMessageCount] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [initializationComplete, setInitializationComplete] = useState(false);
  
  // Store the sendMessage function from the chat interface
  const [sendMessageFunction, setSendMessageFunction] = useState<((message: string) => Promise<void>) | null>(null);

  // Create a unified data object that prioritizes journey data (same as dashboard)
  const unifiedPropertyData = useMemo(() => {
    if (journeyData) {
      console.log('🎯 [CHATBOT] Using journey data as primary source:', {
        address: journeyData.propertyAddress,
        analysisId: journeyData.analysisId,
        revenue: journeyData.totalMonthlyRevenue,
        opportunities: journeyData.totalOpportunities
      });
      
      return {
        analysisId: journeyData.analysisId || analysisId || '',
        address: journeyData.propertyAddress,
        coordinates: journeyData.analysisResults?.coordinates || journeyData.analysisResults?.propertyCoordinates,
        totalMonthlyRevenue: journeyData.totalMonthlyRevenue,
        totalOpportunities: journeyData.totalOpportunities,
        availableAssets: propertyData?.availableAssets || [],
        analysisResults: journeyData.analysisResults,
        selectedAssets: assetSelections || []
      };
    } else if (propertyData) {
      console.log('🎯 [CHATBOT] Using property analysis data as fallback:', {
        address: propertyData.address,
        analysisId: propertyData.analysisId,
        revenue: propertyData.totalMonthlyRevenue
      });
      
      return {
        ...propertyData,
        selectedAssets: assetSelections || []
      };
    }
    return null;
  }, [journeyData, propertyData, assetSelections, analysisId]);

  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    conversationDuration: 0,
    detectedAssets: [],
    confidenceScore: 0.9,
    completionProgress: 0,
    keyInsights: []
  });

  // New state to track interaction activity
  const [isInteractionActive, setIsInteractionActive] = useState(false);

  // Function to trigger interaction state
  const triggerInteraction = useCallback(() => {
    console.log('🔄 [ONBOARDING] Interaction triggered - repositioning bubbles');
    setIsInteractionActive(true);
  }, []);

  // Check for interaction trigger from dashboard on mount
  useEffect(() => {
    const shouldTrigger = sessionStorage.getItem('triggerBubbleInteraction');
    if (shouldTrigger === 'true') {
      console.log('🔄 [ONBOARDING] Triggering bubble interaction from dashboard');
      triggerInteraction();
      sessionStorage.removeItem('triggerBubbleInteraction');
    }
  }, [triggerInteraction]);

  console.log('🔍 [ONBOARDING] Current state:', {
    hasUnifiedData: !!unifiedPropertyData,
    hasSendFunction: !!sendMessageFunction,
    chatLoading,
    chatError,
    showSuggestions,
    initializationComplete
  });

  // Initialize conversation with target asset if provided - FIXED TO PREVENT INFINITE LOOP
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationComplete) {
      console.log('🚫 [ONBOARDING] Initialization already complete, skipping');
      return;
    }

    console.log('🎯 [ONBOARDING] Target asset initialization effect:', {
      hasUnifiedData: !!unifiedPropertyData,
      targetAsset,
      propertyLoading,
      journeyLoading,
      hasSendFunction: !!sendMessageFunction,
      authLoading
    });

    if (unifiedPropertyData && targetAsset && !propertyLoading && !journeyLoading && !authLoading && sendMessageFunction) {
      console.log('🎯 [ONBOARDING] Initializing with target asset:', {
        targetAsset,
        analysisId: unifiedPropertyData.analysisId,
        address: unifiedPropertyData.address,
        availableAssets: unifiedPropertyData.availableAssets.map(a => a.type),
        selectedAssetsCount: unifiedPropertyData.selectedAssets.length
      });
      
      const assetInfo = unifiedPropertyData.availableAssets.find(a => a.type === targetAsset);
      const selectedAsset = unifiedPropertyData.selectedAssets.find(a => 
        a.asset_type.toLowerCase() === targetAsset.toLowerCase()
      );
      
      if (assetInfo || selectedAsset) {
        const assetName = assetInfo?.name || selectedAsset?.asset_type || targetAsset;
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        // Mark initialization as complete BEFORE starting auto-message to prevent loops
        setInitializationComplete(true);
        
        // Auto-start the conversation with the target asset and immediately show partner cards
        setTimeout(() => {
          sendMessageFunction(`I want to manage my ${assetName.toLowerCase()} setup. Please show me the available partner platforms and configuration options.`);
        }, 1000);
        
        const revenue = selectedAsset?.monthly_revenue || assetInfo?.monthlyRevenue || 0;
        toast({
          title: "Asset Setup Started",
          description: `Let's configure your ${assetName} at ${unifiedPropertyData.address} for $${revenue}/month potential earnings.`,
        });
      } else {
        console.warn('⚠️ [ONBOARDING] Target asset not found in analysis:', {
          targetAsset,
          availableAssets: unifiedPropertyData.availableAssets.map(a => a.type),
          selectedAssets: unifiedPropertyData.selectedAssets.map(a => a.asset_type)
        });
        
        // Try to use the asset type directly for initialization
        setDetectedAssets([targetAsset]);
        setConversationStage('asset_configuration');
        
        // Mark initialization as complete BEFORE starting auto-message to prevent loops
        setInitializationComplete(true);
        
        setTimeout(() => {
          sendMessageFunction(`I want to set up my ${targetAsset} for monetization. Please show me the available partner platforms and configuration options.`);
        }, 1000);
        
        toast({
          title: "Asset Setup Started",
          description: `Let's explore options for your ${targetAsset}.`,
        });
      }
    }
  }, [unifiedPropertyData, targetAsset, propertyLoading, journeyLoading, authLoading, toast, sendMessageFunction, initializationComplete, triggerInteraction]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        totalMessages: messageCount,
        conversationDuration: Math.floor((Date.now() - conversationStartTime) / 1000),
        detectedAssets,
        completionProgress: Math.min(detectedAssets.length * 25, 100),
        keyInsights: generateKeyInsights(detectedAssets, conversationStage)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [messageCount, detectedAssets, conversationStage, conversationStartTime, unifiedPropertyData]);

  const generateKeyInsights = (assets: string[], stage: string) => {
    const insights: string[] = [];
    
    if (unifiedPropertyData) {
      insights.push(`Property analyzed: ${unifiedPropertyData.address}`);
      insights.push(`Total potential: $${unifiedPropertyData.totalMonthlyRevenue}/month`);
      if (unifiedPropertyData.analysisId) {
        insights.push(`Analysis ID: ${unifiedPropertyData.analysisId}`);
      }
      if (unifiedPropertyData.selectedAssets.length > 0) {
        insights.push(`${unifiedPropertyData.selectedAssets.length} assets already selected`);
      }
    }
    
    if (assets.length > 1) {
      insights.push('Multiple assets under discussion');
    }
    
    if (stage === 'asset_configuration') {
      insights.push('Ready for asset setup');
    }
    
    return insights;
  };

  const handleAssetDetected = (assets: string[]) => {
    console.log('🎯 [ONBOARDING] Assets detected:', assets);
    setDetectedAssets(assets);
  };

  const handleConversationStageChange = (stage: string) => {
    console.log('📊 [ONBOARDING] Stage change:', stage);
    setConversationStage(stage);
    setMessageCount(prev => prev + 1);
  };

  // Handle message sending from input box - MODIFIED to trigger interaction
  const handleSendMessage = useCallback(async (message: string) => {
    console.log('🔄 [ONBOARDING] handleSendMessage called with:', message);
    console.log('🔄 [ONBOARDING] sendMessageFunction available:', !!sendMessageFunction);
    
    if (!sendMessageFunction) {
      console.error('❌ [ONBOARDING] sendMessageFunction not available yet');
      setChatError('Chat is not ready yet. Please wait a moment and try again.');
      return;
    }
    
    setChatLoading(true);
    setChatError(null);
    
    // Trigger interaction state when message is sent
    triggerInteraction();
    
    try {
      await sendMessageFunction(message);
      console.log('✅ [ONBOARDING] Message sent successfully');
    } catch (err) {
      console.error('❌ [ONBOARDING] Error sending message:', err);
      setChatError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setChatLoading(false);
    }
  }, [sendMessageFunction, triggerInteraction]);

  const handleSuggestedAction = useCallback(async (action: string) => {
    console.log('💡 [ONBOARDING] Suggestion clicked:', action);
    // Trigger interaction state when suggestion is clicked
    triggerInteraction();
    await handleSendMessage(action);
  }, [handleSendMessage, triggerInteraction]);

  // Handle asset bubble clicks - MODIFIED to trigger interaction
  const handleAssetBubbleClick = useCallback(async (assetType: string, assetName: string) => {
    console.log('🎯 [ONBOARDING] Asset bubble clicked:', { assetType, assetName });
    
    const configurationMessage = `I want to configure my ${assetName.toLowerCase()} for monetization. Please show me the available partner platforms and setup options for this asset.`;
    
    // Trigger interaction state when asset bubble is clicked
    triggerInteraction();
    await handleSendMessage(configurationMessage);
  }, [handleSendMessage, triggerInteraction]);

  // Callback to receive the sendMessage function from EnhancedChatInterface
  const handleSendMessageReady = useCallback((sendMessage: (message: string) => Promise<void>) => {
    console.log('✅ [ONBOARDING] Received sendMessage function from chat interface');
    setSendMessageFunction(() => sendMessage);
  }, []);

  // Loading state - wait for auth and data
  const isLoading = authLoading || (propertyLoading && journeyLoading && !unifiedPropertyData);

  if (isLoading) {
    return (
      <ChatbotLoadingState 
        isAuthLoading={authLoading}
        analysisId={unifiedPropertyData?.analysisId || analysisId}
        propertyAddress={unifiedPropertyData?.address}
      />
    );
  }

  // Show error state if no data after loading
  if (!unifiedPropertyData && !propertyLoading && !journeyLoading) {
    return <ChatbotErrorState analysisId={analysisId} />;
  }

  return (
    <div className="page-container bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Header - Fixed and Glassy */}
      <div className="fixed top-0 left-0 right-0 z-[110] backdrop-blur-md bg-background/80 border-b border-border/20">
        <ChatbotHeader
          targetAsset={targetAsset}
          hasPropertyData={!!unifiedPropertyData}
          conversationStage={conversationStage}
          showAnalytics={showAnalytics}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          propertyAddress={unifiedPropertyData?.address}
          isReady={!propertyLoading && !journeyLoading && !authLoading}
        />
      </div>

      {/* Floating Quick Actions Sidebar */}
      <QuickActionsBar />

      {/* Main Content - Full Height with proper flex layout */}
      <div className="h-screen flex flex-col">
        <div className="flex-1 pt-20 pb-32">
          <div className="h-full max-w-4xl mx-auto px-4">
            <EnhancedChatInterface
              onAssetDetected={handleAssetDetected}
              onConversationStageChange={handleConversationStageChange}
              propertyData={unifiedPropertyData}
              onSendMessageReady={handleSendMessageReady}
              onInteractionTriggered={triggerInteraction} // Pass trigger function to chat interface
            />
          </div>
        </div>
      </div>

      {/* Selected Asset Bubbles - Fixed above chat input - MODIFIED with interaction state */}
      <SelectedAssetBubbles 
        propertyData={unifiedPropertyData} 
        onAssetClick={handleAssetBubbleClick}
        isInteractionActive={isInteractionActive}
      />

      {/* Fixed Chat Input - Bottom */}
      <ChatInputBox 
        onSendMessage={handleSendMessage}
        isLoading={chatLoading}
        error={chatError}
      />

      {/* Fixed Suggestion Bubbles - Hidden */}
      {showSuggestions && (
        <SuggestionBubbles 
          propertyData={unifiedPropertyData}
          showSuggestions={showSuggestions}
          onSuggestedAction={handleSuggestedAction}
          isLoading={chatLoading}
        />
      )}
    </div>
  );
};

export default EnhancedOnboardingChatbot;
