import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAdditionalOpportunities } from '@/hooks/useAdditionalOpportunities';
import { SelectedAsset } from '@/types/analysis';
import AssetOpportunitiesGrid from './AssetOpportunitiesGrid';
import AdditionalAssetsCarousel from './AdditionalAssetsCarousel';
import AssetFormSection from './AssetFormSection';
import ContinueButton from './ContinueButton';
import PropertySummaryCard from './PropertySummaryCard';
import RestrictionsCard from './RestrictionsCard';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAssetSelection } from '@/hooks/useAssetSelection';
import { useJourneyTracking } from '@/hooks/useJourneyTracking';
import { getRecentAnalysisId, validateAssetSelectionData } from '@/services/dataRecoveryService';

interface AssetResultListProps {
  analysisResults: any;
  onFormSectionToggle?: (isShowing: boolean) => void;
}

const AssetResultList: React.FC<AssetResultListProps> = ({ 
  analysisResults, 
  onFormSectionToggle 
}) => {
  const navigate = useNavigate();
  const { additionalOpportunities, opportunitiesByTier, opportunitiesByCategory } = useAdditionalOpportunities();
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetsData, setSelectedAssetsData] = useState<SelectedAsset[]>([]);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const { analysisComplete, address, addressCoordinates, currentAnalysisId, currentAddressId } = useGoogleMap();
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveSelection } = useAssetSelection();
  const { trackOption } = useJourneyTracking();

  console.log('🏠 AssetResultList render:', {
    analysisComplete,
    hasResults: !!analysisResults,
    selectedAssetsCount: selectedAssets.length,
    showAssetForm,
    additionalOpportunitiesCount: additionalOpportunities.length,
    propertyType: analysisResults?.propertyType,
    topOpportunities: analysisResults?.topOpportunities?.length || 0,
    totalMonthlyRevenue: analysisResults?.totalMonthlyRevenue,
    currentAnalysisId,
    userId: user?.id
  });

  // Notify parent component when form section visibility changes
  useEffect(() => {
    if (onFormSectionToggle) {
      onFormSectionToggle(showAssetForm);
    }
  }, [showAssetForm, onFormSectionToggle]);

  // Filter opportunities based on property type - IMPROVED LOGIC
  const displayOpportunities = useMemo(() => {
    if (!analysisResults?.topOpportunities) return [];
    
    const isApartment = analysisResults.propertyType === 'apartment' || 
                       analysisResults.propertyType?.toLowerCase().includes('apartment');
    
    console.log('🏢 Property type check:', {
      propertyType: analysisResults.propertyType,
      isApartment,
      rawOpportunities: analysisResults.topOpportunities,
      totalMonthlyRevenue: analysisResults.totalMonthlyRevenue,
      bandwidthRevenue: analysisResults.bandwidth?.revenue,
      storageRevenue: analysisResults.storage?.revenue
    });

    // For apartments, ensure we include ALL available opportunities
    if (isApartment) {
      let apartmentOpportunities = [];

      // First, try to use existing opportunities from the analysis
      const existingOpportunities = analysisResults.topOpportunities.filter(opp => {
        const title = opp.title.toLowerCase();
        return title.includes('internet') || 
               title.includes('bandwidth') || 
               title.includes('storage') ||
               title.includes('unit') ||
               title.includes('rental') ||
               opp.monthlyRevenue > 0;
      });

      console.log('🏢 Found existing apartment opportunities:', existingOpportunities);
      apartmentOpportunities = [...existingOpportunities];

      // Always ensure Internet opportunity is included if there's bandwidth revenue
      const hasInternet = apartmentOpportunities.some(opp => 
        opp.title.toLowerCase().includes('internet') || opp.title.toLowerCase().includes('bandwidth')
      );
      
      if (!hasInternet && analysisResults.bandwidth?.revenue > 0) {
        console.log('🏢 Adding missing Internet opportunity:', analysisResults.bandwidth.revenue);
        apartmentOpportunities.push({
          title: 'Internet Bandwidth Sharing',
          icon: 'wifi',
          monthlyRevenue: analysisResults.bandwidth.revenue,
          description: `Share ${analysisResults.bandwidth.available || 100} GB unused bandwidth for passive income`,
          setupCost: 0,
          roi: 0
        });
      }

      // Always ensure Storage opportunity is included if there's storage revenue
      const hasStorage = apartmentOpportunities.some(opp => 
        opp.title.toLowerCase().includes('storage') || opp.title.toLowerCase().includes('unit')
      );
      
      if (!hasStorage && analysisResults.storage?.revenue > 0) {
        console.log('🏢 Adding missing Storage opportunity:', analysisResults.storage.revenue);
        apartmentOpportunities.push({
          title: 'Personal Storage Rental',
          icon: 'storage', 
          monthlyRevenue: analysisResults.storage.revenue,
          description: 'Rent out personal storage space within your unit',
          setupCost: 0,
          roi: 0
        });
      }

      console.log('🏢 Final apartment opportunities:', apartmentOpportunities);
      return apartmentOpportunities;
    }

    // For non-apartments, return all opportunities
    return analysisResults.topOpportunities;
  }, [analysisResults]);

  // Memoize the asset toggle handler to prevent unnecessary re-renders
  const handleAssetToggle = useCallback(async (assetTitle: string) => {
    console.log('🔄 Asset toggle called for:', assetTitle);
    console.log('📊 Current selectedAssets:', selectedAssets);
    console.log('🔍 Current user:', user);
    console.log('🔍 Current analysis ID:', currentAnalysisId);
    
    setSelectedAssets(prev => {
      const isSelected = prev.includes(assetTitle);
      console.log('❓ Is asset selected?', isSelected);
      
      if (isSelected) {
        // Remove asset
        console.log('➖ Removing asset:', assetTitle);
        setSelectedAssetsData(prevData => {
          const newData = prevData.filter(asset => asset.title !== assetTitle);
          console.log('📋 New selectedAssetsData after removal:', newData);
          return newData;
        });
        
        // Remove from database if user is authenticated
        if (user) {
          // Note: We don't have a removeSelection function yet, but for now we just update local state
          console.log('🗑️ Would remove from database:', assetTitle);
        }
        
        const newSelectedAssets = prev.filter(title => title !== assetTitle);
        console.log('📊 New selectedAssets after removal:', newSelectedAssets);
        return newSelectedAssets;
      } else {
        // Add asset - check both main opportunities and additional opportunities
        console.log('➕ Adding asset:', assetTitle);
        
        // First check in display opportunities
        let assetData = displayOpportunities.find(opp => opp.title === assetTitle);
        
        // If not found, check in additional opportunities
        if (!assetData) {
          assetData = additionalOpportunities.find(opp => opp.title === assetTitle);
        }
        
        console.log('🔍 Found asset data:', assetData);
        
        if (assetData) {
          setSelectedAssetsData(prevData => {
            const newAsset = {
              title: assetData.title,
              icon: assetData.icon,
              monthlyRevenue: assetData.monthlyRevenue,
              provider: assetData.provider,
              setupCost: assetData.setupCost || 0,
              roi: assetData.roi,
              formData: {}
            };
            const newData = [...prevData, newAsset];
            console.log('📋 New selectedAssetsData after addition:', newData);
            return newData;
          });
          
          // Save to database (works for both authenticated and anonymous users)
          // Try to get analysis ID from multiple sources
          let analysisIdToUse = currentAnalysisId;
          if (!analysisIdToUse) {
            analysisIdToUse = localStorage.getItem('currentAnalysisId');
          }
          
          console.log('💾 Attempting to save asset with analysis ID:', analysisIdToUse);
          saveSelection(
            assetData.title,
            { 
              source: 'asset_opportunities_grid',
              icon: assetData.icon,
              provider: assetData.provider,
              description: assetData.description 
            },
            assetData.monthlyRevenue,
            assetData.setupCost || 0,
            assetData.roi,
            analysisIdToUse // Pass the analysis ID (can be null for anonymous users)
          ).then((result) => {
            if (result) {
              console.log('✅ Asset saved to database:', result);
              const message = user 
                ? `${assetData.title} added to your selections ($${assetData.monthlyRevenue}/month)`
                : `${assetData.title} saved. Sign in later to access your selections ($${assetData.monthlyRevenue}/month)`;
              
              toast({
                title: "Asset Selected",
                description: message,
              });
            }
          }).catch((error) => {
            console.error('❌ Failed to save asset to database:', error);
            toast({
              title: "Save Failed",
              description: "Asset selected locally but failed to save to database",
              variant: "destructive"
            });
          });
        } else {
          console.error('❌ Asset data not found for:', assetTitle);
        }
        
        const newSelectedAssets = [...prev, assetTitle];
        console.log('📊 New selectedAssets after addition:', newSelectedAssets);
        return newSelectedAssets;
      }
    });
  }, [additionalOpportunities, selectedAssets, displayOpportunities, user, saveSelection, toast]);

  const handleContinue = useCallback(() => {
    console.log('🚀 Continue clicked');
    console.log('📊 Selected assets count:', selectedAssets.length);
    console.log('📋 Selected assets data:', selectedAssetsData);
    console.log('🔍 Current analysis ID:', currentAnalysisId);
    
    if (selectedAssets.length > 0) {
      // Prepare navigation data with all necessary information
      const navigationData = {
        analysisResults,
        address,
        analysisId: currentAnalysisId,
        selectedAssetsData,
        timestamp: Date.now()
      };
      
      console.log('📤 Navigating to model-viewer with data:', navigationData);
      
      // Store in sessionStorage as backup
      sessionStorage.setItem('model-viewer-data', JSON.stringify(navigationData));
      
      // Navigate with state
      navigate('/model-viewer', { 
        state: navigationData
      });
    } else {
      console.warn('⚠️ No assets selected when continue was clicked');
    }
  }, [selectedAssets.length, selectedAssetsData, navigate, currentAnalysisId, analysisResults, address]);

  const handleAssetFieldChange = useCallback((assetTitle: string, fieldName: string, value: string | number) => {
    setSelectedAssetsData((prev) =>
      prev.map((asset) => {
        if (asset.title !== assetTitle) return asset;
        return {
          ...asset,
          formData: {
            ...(asset.formData || {}),
            [fieldName]: value,
          },
        };
      })
    );
  }, []);

  const handleFormComplete = useCallback(async (formDataFromChild: Record<string, Record<string, string | number>>) => {
    console.log('🚀🚀🚀 ATTEMPTING TO SAVE ASSET SELECTION WITH ROBUST RECOVERY 🚀🚀🚀');
    console.log('✅ Form completed');
    
    // Validate user authentication first
    if (!user) {
      console.log('❌ No user authenticated, navigating to options');
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your asset selections",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = '/options';
      }, 500);
      setShowAssetForm(false);
      return;
    }

    if (selectedAssetsData.length === 0) {
      console.log('❌ No assets selected');
      toast({
        title: "No Assets Selected",
        description: "Please select at least one asset to continue",
        variant: "destructive"
      });
      setShowAssetForm(false);
      return;
    }

    // Merge the final form data from the child form into our selected assets before saving.
    const assetsToSave = selectedAssetsData.map((asset) => ({
      ...asset,
      formData: {
        ...(asset.formData || {}),
        ...(formDataFromChild?.[asset.title] || {}),
      },
    }));
    setSelectedAssetsData(assetsToSave);

    // ROBUST ANALYSIS ID RECOVERY - Multiple fallback strategies
    let finalAnalysisId = currentAnalysisId;
    
    console.log('🔍 Starting analysis ID resolution...');
    console.log('📊 Context analysis ID:', currentAnalysisId);
    console.log('💾 LocalStorage analysis ID:', localStorage.getItem('currentAnalysisId'));
    
    // Strategy 1: Use context analysis ID
    if (!finalAnalysisId) {
      finalAnalysisId = localStorage.getItem('currentAnalysisId');
      console.log('🔄 Using localStorage analysis ID:', finalAnalysisId);
    }
    
    // Strategy 2: Find user's most recent analysis
    if (!finalAnalysisId) {
      console.log('🔍 No analysis ID found, searching for user\'s recent analysis...');
      try {
        finalAnalysisId = await getRecentAnalysisId(user.id);
        console.log('✅ Found recent analysis ID:', finalAnalysisId);
        
        if (finalAnalysisId) {
          // Update context and localStorage with recovered ID
          localStorage.setItem('currentAnalysisId', finalAnalysisId);
        }
      } catch (error) {
        console.error('❌ Error finding recent analysis:', error);
      }
    }

    // Strategy 3: Validate the analysis ID belongs to the current user
    if (finalAnalysisId) {
      try {
        console.log('🔍 Validating analysis ownership...');
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: analysisCheck, error: checkError } = await supabase
          .from('user_property_analyses')
          .select('id, user_id')
          .eq('id', finalAnalysisId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkError || !analysisCheck) {
          console.error('❌ Analysis ID validation failed:', { finalAnalysisId, userId: user.id, error: checkError });
          
          // Final fallback: create or find a valid analysis
          const recentAnalysisId = await getRecentAnalysisId(user.id);
          if (recentAnalysisId) {
            finalAnalysisId = recentAnalysisId;
            localStorage.setItem('currentAnalysisId', finalAnalysisId);
            console.log('🔄 Using fallback analysis ID:', finalAnalysisId);
          } else {
            throw new Error('No valid analysis found for the current user');
          }
        } else {
          console.log('✅ Analysis ID validated successfully:', analysisCheck);
        }
      } catch (validationError) {
        console.error('❌ Analysis validation error:', validationError);
        toast({
          title: "Analysis Validation Failed",
          description: "Unable to validate your property analysis. Please try analyzing your property again.",
          variant: "destructive"
        });
        setShowAssetForm(false);
        return;
      }
    }

    if (!finalAnalysisId) {
      console.log('❌ No valid analysis ID found after all strategies');
      toast({
        title: "Analysis Missing",
        description: "No property analysis found. Please analyze your property first.",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      setShowAssetForm(false);
      return;
    }

    console.log('✅ Final analysis ID resolved:', finalAnalysisId);
    console.log('🎯 Saving assets for user:', user.id);
    
    // Save asset selections with robust error handling
    try {
      const { saveAssetSelection } = await import('@/services/userAssetService');
      
      console.log('💾 Saving asset selections to database...');
      
      // Validate data integrity before saving
      const validationResult = await validateAssetSelectionData(user.id);
      console.log('📊 Asset selection validation:', validationResult);
      
      // Save each selected asset with comprehensive logging
      const savePromises = assetsToSave.map(async (asset, index) => {
        console.log(`💰 Saving asset ${index + 1}/${assetsToSave.length}:`, {
          userId: user.id,
          analysisId: finalAnalysisId,
          assetTitle: asset.title,
          formData: asset.formData,
          monthlyRevenue: asset.monthlyRevenue,
          setupCost: asset.setupCost,
          roi: asset.roi
        });
        
        try {
          const result = await saveAssetSelection(
            user.id,
            finalAnalysisId,
            asset.title,
            asset.formData || {},
            asset.monthlyRevenue,
            asset.setupCost || 0,
            asset.roi
          );
          console.log(`✅ Asset ${index + 1} saved with ID:`, result);
          return result;
        } catch (err) {
          console.error(`❌ Failed to save asset ${index + 1}:`, err);
          throw err;
        }
      });
      
      const results = await Promise.all(savePromises);
      console.log('💰 All save results:', results);
      
      // Check if all saves were successful
      const successfulSaves = results.filter(r => r !== null).length;
      
      if (successfulSaves === assetsToSave.length) {
        console.log('✅ Successfully saved all asset selections');
        
        // Track asset selection completion
        await trackOption('manual');
        
        toast({
          title: "Assets Saved Successfully",
          description: `${assetsToSave.length} asset selection${assetsToSave.length > 1 ? 's' : ''} saved to your dashboard`,
        });
        
        // Navigate to dashboard to see saved assets
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
        
      } else {
        console.warn('⚠️ Some saves failed');
        toast({
          title: "Partial Save",
          description: `${successfulSaves} of ${assetsToSave.length} assets saved successfully`,
          variant: "destructive"
        });
        
        // Still navigate to dashboard to show what was saved
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Failed to save asset selections:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save asset selections: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
    
    setShowAssetForm(false);
  }, [user, selectedAssetsData, currentAnalysisId, toast, trackOption]);

  // Memoize calculations to prevent unnecessary re-computation
  const { totalSelectedRevenue, totalSetupCost, analysisRevenue, totalMonthlyIncome } = useMemo(() => {
    const totalSelectedRevenue = selectedAssetsData.reduce((sum, asset) => sum + asset.monthlyRevenue, 0);
    const totalSetupCost = selectedAssetsData.reduce((sum, asset) => sum + (asset.setupCost || 0), 0);

    // Use the totalMonthlyRevenue from analysis results if available, otherwise calculate
    const analysisRevenue = analysisResults?.totalMonthlyRevenue || (analysisResults ? (
      (analysisResults.rooftop?.revenue || 0) +
      (analysisResults.parking?.revenue || 0) +
      (analysisResults.garden?.revenue || 0) +
      (analysisResults.pool?.revenue || 0) +
      (analysisResults.storage?.revenue || 0) +
      (analysisResults.bandwidth?.revenue || 0)
    ) : 0);

    const totalMonthlyIncome = analysisRevenue + totalSelectedRevenue;

    return { totalSelectedRevenue, totalSetupCost, analysisRevenue, totalMonthlyIncome };
  }, [selectedAssetsData, analysisResults]);

  if (showAssetForm) {
    console.log('📝 Rendering AssetFormSection with:', {
      selectedAssetsCount: selectedAssetsData.length,
      selectedAssets: selectedAssetsData,
      opportunities: [...displayOpportunities, ...additionalOpportunities]
    });
    
    // Combine both main opportunities and additional opportunities for the form
    const allOpportunities = [
      ...displayOpportunities,
      ...additionalOpportunities
    ];
    
    return (
      <AssetFormSection 
        selectedAssets={selectedAssetsData}
        opportunities={allOpportunities}
        onComplete={handleFormComplete}
        onFieldChange={handleAssetFieldChange}
      />
    );
  }

  // Don't render anything if analysis is not complete
  if (!analysisComplete || !analysisResults) {
    console.log('⏳ Analysis not complete or no results');
    return null;
  }

  const isApartment = analysisResults.propertyType === 'apartment' || 
                     analysisResults.propertyType?.toLowerCase().includes('apartment');

  return (
    <div className="space-y-8">
      {/* Property Summary */}
      <PropertySummaryCard 
        analysisResults={analysisResults}
        totalMonthlyIncome={totalMonthlyIncome}
        totalSetupCost={totalSetupCost}
        selectedAssetsCount={selectedAssets.length}
        isCollapsed={false}
      />
      
      {/* Apartment-specific notice */}
      {isApartment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <h3 className="text-blue-300 font-semibold mb-2">🏢 Apartment/Condo Property</h3>
          <p className="text-white/80 text-sm">
            As an apartment or condo resident, your monetization options are limited to unit-level opportunities. 
            You typically don't have individual access to rooftops, building parking, or shared amenities for rental purposes.
          </p>
        </motion.div>
      )}
      
      {/* Floating Selected Assets Widget */}
      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] md:w-96"
        >
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Selected Assets</h3>
              <div className="bg-tiptop-purple/20 text-tiptop-purple text-xs px-2 py-1 rounded-full border border-tiptop-purple/30">
                {selectedAssets.length}
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <p className="text-white/60 text-xs">Assets</p>
                <p className="text-white font-bold text-sm">{selectedAssets.length}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Revenue</p>
                <p className="text-tiptop-purple font-bold text-sm">${totalSelectedRevenue}/mo</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Setup</p>
                <p className="text-orange-400 font-bold text-sm">${totalSetupCost}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs">Options</p>
                <p className="text-green-400 font-bold text-sm">{additionalOpportunities.length}</p>
              </div>
            </div>
            
            {/* Continue Button */}
            <ContinueButton 
              selectedCount={selectedAssets.length}
              onContinue={handleContinue}
              selectedAssetsData={selectedAssetsData}
            />
          </div>
        </motion.div>
      )}
      
      {/* Main Asset Opportunities */}
      <AssetOpportunitiesGrid 
        opportunities={displayOpportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
      />
      
      {/* Additional Assets Carousel with Enhanced Features */}
      <AdditionalAssetsCarousel 
        opportunities={additionalOpportunities}
        selectedAssets={selectedAssets}
        onAssetToggle={handleAssetToggle}
        opportunitiesByTier={opportunitiesByTier}
        opportunitiesByCategory={opportunitiesByCategory}
      />
      
      {/* Restrictions and Permits */}
      {analysisResults.restrictions && (
        <RestrictionsCard restrictions={analysisResults.restrictions} />
      )}
    </div>
  );
};

export default AssetResultList;
