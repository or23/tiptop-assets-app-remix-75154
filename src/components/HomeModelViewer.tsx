
import { useState, useEffect } from 'react';
import { Check, Info, ExternalLink } from 'lucide-react';
import { useModelGeneration } from '@/contexts/ModelGeneration';
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const HomeModelViewer = () => {
  const { status, progress } = useModelGeneration();
  const { analysisResults, isGeneratingAnalysis } = useGoogleMap();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  const isGenerating = isGeneratingAnalysis || status === 'generating';
  const isComplete = !isGenerating && analysisResults;
  
  // Don't show this component when we have asset results or are on specific pages
  const shouldHide = location.pathname !== '/' || 
                    location.search.includes('step=asset-form') ||
                    location.search.includes('step=results');
  
  // Determine if we should show the component
  useEffect(() => {
    if (!shouldHide && (isGenerating || isComplete)) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isGenerating, isComplete, shouldHide]);
  
  if (!isVisible || shouldHide) return null;
  
  const toggleFullAnalysis = () => {
    setShowFullAnalysis(!showFullAnalysis);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto mt-8 mb-12 bg-black/5 backdrop-blur-xs rounded-lg overflow-hidden border border-white/5 relative"
    >
      <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            {isGenerating ? 
              "Analyzing Your Property..." : 
              <><Check className="text-green-500 h-6 w-6 mr-2" />Property Analysis Complete</>
            }
          </h2>
          <p className="text-sm text-gray-400">
            {isGenerating 
              ? "Please wait while our AI analyzes your property" 
              : "View your property's monetization insights below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={toggleFullAnalysis}
              className="text-gray-400 hover:text-white"
            >
              {showFullAnalysis ? "Show Less" : "Show More"}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)} 
            className="text-gray-400 hover:text-white"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Show loading state or analysis results */}
      {isGenerating ? (
        <div className="p-4 md:p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-spin h-8 w-8 border-4 border-tiptop-purple border-t-transparent rounded-full"></div>
          </div>
          <p className="text-white">Analyzing property images and data...</p>
        </div>
      ) : analysisResults ? (
        <div className="p-4 md:p-6">
          {/* Property Type and Summary */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-2">Property Analysis</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-tiptop-purple/80">{analysisResults.propertyType}</Badge>
              {analysisResults.amenities && analysisResults.amenities.slice(0, 3).map((amenity, i) => (
                <Badge key={i} variant="outline" className="text-gray-300">{amenity}</Badge>
              ))}
            </div>
            
            {analysisResults.imageAnalysisSummary && (
              <p className="text-gray-300 mt-2 text-sm bg-white/5 p-2 rounded">
                <span className="font-semibold text-tiptop-purple">Image Analysis:</span> {analysisResults.imageAnalysisSummary}
              </p>
            )}
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {analysisResults.rooftop && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Roof Area</p>
                <p className="text-lg font-semibold text-white">{analysisResults.rooftop.area} sq ft</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-tiptop-purple">${analysisResults.rooftop.revenue}/mo</p>
                  {analysisResults.rooftop.solarPotential && (
                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                      Solar Ready
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {analysisResults.garden && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Garden Area</p>
                <p className="text-lg font-semibold text-white">{analysisResults.garden.area} sq ft</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-tiptop-purple">${analysisResults.garden.revenue}/mo</p>
                  <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    {analysisResults.garden.opportunity}
                  </Badge>
                </div>
              </div>
            )}
            {analysisResults.parking && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Parking</p>
                <p className="text-lg font-semibold text-white">{analysisResults.parking.spaces} spaces</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-tiptop-purple">${analysisResults.parking.revenue}/mo</p>
                  {analysisResults.parking.evChargerPotential && (
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                      EV Ready
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {analysisResults.pool && analysisResults.pool.present && (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Pool</p>
                <p className="text-lg font-semibold text-white">{analysisResults.pool.area} sq ft</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-tiptop-purple">${analysisResults.pool.revenue}/mo</p>
                  <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {analysisResults.pool.type}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          
          {/* Expanded Analysis Section (conditionally rendered) */}
          {showFullAnalysis && (
            <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
              {/* Service Provider Recommendations */}
              <div className="space-y-3">
                <h3 className="text-md font-medium text-white">Service Provider Recommendations</h3>
                
                {/* Roof/Solar Providers */}
                {analysisResults.rooftop?.providers && analysisResults.rooftop.providers.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-tiptop-purple mb-2">Solar Panel Providers</h4>
                    <div className="space-y-2">
                      {analysisResults.rooftop.providers.slice(0, 2).map((provider, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-1 last:border-0">
                          <span className="text-white">{provider.name}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-400 mr-2">
                              ${provider.setupCost} • ROI: {provider.roi} mo
                            </span>
                            {provider.url && (
                              <a 
                                href={provider.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-tiptop-purple hover:underline"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Parking Providers */}
                {analysisResults.parking?.providers && analysisResults.parking.providers.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-tiptop-purple mb-2">Parking Rental Platforms</h4>
                    <div className="space-y-2">
                      {analysisResults.parking.providers.slice(0, 2).map((provider, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-1 last:border-0">
                          <span className="text-white">{provider.name}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-400 mr-2">
                              {provider.fee ? `${provider.fee}% fee` : `$${provider.setupCost || 0} setup`}
                            </span>
                            {provider.url && (
                              <a 
                                href={provider.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-tiptop-purple hover:underline"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pool Providers (if applicable) */}
                {analysisResults.pool?.present && analysisResults.pool?.providers && analysisResults.pool.providers.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-tiptop-purple mb-2">Pool Rental Platforms</h4>
                    <div className="space-y-2">
                      {analysisResults.pool.providers.slice(0, 2).map((provider, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-1 last:border-0">
                          <span className="text-white">{provider.name}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-400 mr-2">
                              {provider.fee ? `${provider.fee}% fee` : ''}
                            </span>
                            {provider.url && (
                              <a 
                                href={provider.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-tiptop-purple hover:underline"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Permits & Restrictions */}
              {(analysisResults.permits?.length > 0 || analysisResults.restrictions) && (
                <div className="mt-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-sm">Important Considerations</h3>
                  
                  {analysisResults.permits?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-yellow-200">Required Permits:</p>
                      <ul className="list-disc list-inside text-xs text-gray-300">
                        {analysisResults.permits.slice(0, 3).map((permit, i) => (
                          <li key={i}>{permit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysisResults.restrictions && (
                    <div>
                      <p className="text-xs font-medium text-yellow-200">Restrictions:</p>
                      <p className="text-xs text-gray-300">{analysisResults.restrictions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Top Opportunities Section */}
          {analysisResults.topOpportunities && analysisResults.topOpportunities.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-white mb-2">Top Opportunities</h3>
              <div className="space-y-2">
                {analysisResults.topOpportunities.slice(0, 3).map((opp, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                    <div className="flex items-center">
                      <span className="text-tiptop-purple font-medium">{opp.title}</span>
                      {opp.provider && (
                        <span className="text-xs text-gray-400 ml-2">via {opp.provider}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {opp.setupCost > 0 && (
                        <span className="text-xs text-gray-400 mr-2">${opp.setupCost} setup</span>
                      )}
                      <span className="text-sm text-green-400">${opp.monthlyRevenue}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};

export default HomeModelViewer;
