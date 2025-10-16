import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Filter, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AdditionalOpportunity } from "@/types/analysis";
import { glowColorMap } from "./AssetCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAssetIcon } from '@/icons/registry';
import ContinueButton from './ContinueButton';

interface EnhancedAdditionalAssetsCarouselProps {
  opportunities: AdditionalOpportunity[];
  selectedAssets: string[];
  onAssetToggle: (assetTitle: string) => void;
  opportunitiesByTier: {
    high: AdditionalOpportunity[];
    medium: AdditionalOpportunity[];
    low: AdditionalOpportunity[];
  };
  opportunitiesByCategory: {
    spaceRentals: AdditionalOpportunity[];
    petServices: AdditionalOpportunity[];
    logistics: AdditionalOpportunity[];
    community: AdditionalOpportunity[];
    tech: AdditionalOpportunity[];
    homeServices?: AdditionalOpportunity[];
  };
}

const EnhancedAdditionalAssetsCarousel = ({ 
  opportunities, 
  selectedAssets, 
  onAssetToggle,
  opportunitiesByTier,
  opportunitiesByCategory
}: EnhancedAdditionalAssetsCarouselProps) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Get filtered opportunities based on current filter
  const getFilteredOpportunities = () => {
    let filtered: AdditionalOpportunity[] = [];
    
    switch (filterType) {
      case "high-revenue":
        filtered = opportunitiesByTier.high;
        break;
      case "medium-revenue":
        filtered = opportunitiesByTier.medium;
        break;
      case "low-revenue":
        filtered = opportunitiesByTier.low;
        break;
      case "space-rentals":
        filtered = opportunitiesByCategory.spaceRentals;
        break;
      case "pet-services":
        filtered = opportunitiesByCategory.petServices;
        break;
      case "logistics":
        filtered = opportunitiesByCategory.logistics;
        break;
      case "community":
        filtered = opportunitiesByCategory.community;
        break;
      case "tech":
        filtered = opportunitiesByCategory.tech;
        break;
      case "home-services":
        filtered = opportunitiesByCategory.homeServices || [];
        break;
      default:
        filtered = opportunities;
    }

    // Sort the filtered results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          return b.monthlyRevenue - a.monthlyRevenue;
        case "roi":
          const aRoi = a.roi || (a.setupCost ? a.monthlyRevenue / (a.setupCost / 30) : 0);
          const bRoi = b.roi || (b.setupCost ? b.monthlyRevenue / (b.setupCost / 30) : 0);
          return bRoi - aRoi;
        case "setup-cost":
          return (a.setupCost || 0) - (b.setupCost || 0);
        default:
          return a.title.localeCompare(b.title);
      }
    });
  };

  const filteredOpportunities = getFilteredOpportunities();

  const getRevenueTierIcon = (revenue: number) => {
    if (revenue >= 150) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (revenue >= 50) return <Minus className="h-3 w-3 text-yellow-500" />;
    return <TrendingDown className="h-3 w-3 text-blue-500" />;
  };

  const getRevenueTierColor = (revenue: number) => {
    if (revenue >= 150) return "text-green-400";
    if (revenue >= 50) return "text-yellow-400";
    return "text-blue-400";
  };

  // Create groups for both mobile and desktop (mobile: 2 per group, desktop: 4 per group)
  const createCardGroups = (opportunities: AdditionalOpportunity[]) => {
    const groupSize = isMobile ? 2 : 4;
    const groups = [];
    for (let i = 0; i < opportunities.length; i += groupSize) {
      groups.push(opportunities.slice(i, i + groupSize));
    }
    return groups;
  };

  const cardGroups = createCardGroups(filteredOpportunities);

  const CompactCard = ({ opportunity, index }: { opportunity: AdditionalOpportunity; index: number }) => {
    const iconType = opportunity.icon as keyof typeof glowColorMap;
    const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
    const isSelected = selectedAssets.includes(opportunity.title);
    
    if (isMobile) {
      // Mobile layout matching AssetCard
      return (
        <div 
          className="w-[280px] h-[460px] rounded-xl relative cursor-pointer transition-all duration-300 overflow-hidden group bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"
          onClick={() => onAssetToggle(opportunity.title)}
          style={{
            boxShadow: isSelected ? `0 4px 20px ${glowColor.replace('0.5', '0.3')}` : `0 2px 10px rgba(0,0,0,0.3)`
          }}
        >
          {/* Glow effect when selected */}
          {isSelected && (
            <div
              className="absolute inset-0 blur-xl opacity-30 z-0"
              style={{ background: glowColor }}
            />
          )}
          
          <div className="relative z-10 h-full p-4 flex flex-col">
            {/* Select button at top right */}
            <div className="flex justify-end mb-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected 
                  ? 'bg-white/30 text-white border border-white/40' 
                  : 'bg-white/20 text-white/80 hover:bg-white/30 hover:text-white border border-white/20'
              }`}>
                {isSelected ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>✓</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>Select</span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="mb-2">
              <h3 className="text-lg font-bold text-white line-clamp-2">{opportunity.title}</h3>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{opportunity.description || "Monetize your property with this opportunity"}</p>
            </div>

            {/* Big centered icon */}
            <div className="flex justify-center items-center flex-grow mb-4">
              {getAssetIcon(opportunity.icon, { className: 'w-32 h-32 object-contain' })}
            </div>

            {/* Revenue */}
            <div className="text-center mb-3">
              <p className="text-2xl font-bold text-white">${opportunity.monthlyRevenue}/month</p>
            </div>

            {/* Provider info if available */}
            {opportunity.provider && (
              <div className="flex justify-center mb-2">
                <div className="inline-block bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">
                  {opportunity.provider}
                </div>
              </div>
            )}

            {/* Setup cost and ROI info if available */}
            {opportunity.setupCost && opportunity.setupCost > 0 && (
              <div className="flex flex-col gap-1 text-xs text-white/80 text-center">
                <span>Setup: <span className="text-white font-medium">${opportunity.setupCost}</span></span>
                {opportunity.roi && <span>ROI: <span className="text-white font-medium">{opportunity.roi} mo</span></span>}
              </div>
            )}
          </div>
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
      );
    }
    
    // Desktop layout (unchanged)
    return (
      <div 
        className="h-[140px] rounded-xl relative cursor-pointer transition-all duration-300 overflow-hidden group"
        onClick={() => onAssetToggle(opportunity.title)}
        style={{
          boxShadow: isSelected ? `0 4px 20px ${glowColor.replace('0.5', '0.3')}` : `0 2px 10px rgba(0,0,0,0.3)`
        }}
      >
        {/* Background Image with Icon */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            {getAssetIcon(opportunity.icon, { className: 'w-16 h-16 sm:w-20 sm:h-20 object-contain' })}
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
        
        {/* Selection indicator */}
        <div className="absolute top-2 right-2 z-10">
          <div className={`transition-all duration-300 ${
            isSelected ? 'bg-green-500 scale-110' : 'bg-white/20 border border-white/30'
          } rounded-full p-1 shadow-lg`}>
            {isSelected ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <Plus className="h-3 w-3 text-white" />
            )}
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 p-3 flex flex-col z-10">
          {/* Top: Small icon and revenue tier */}
          <div className="flex items-center justify-between mb-2">
            {getAssetIcon(opportunity.icon, { className: 'w-8 h-8 object-contain' })}
            {getRevenueTierIcon(opportunity.monthlyRevenue)}
          </div>
          
          {/* Title - moved higher and allows multiple lines */}
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="text-base font-bold text-white drop-shadow-lg mb-auto max-w-full">
              {opportunity.title}
            </h3>
          </div>
          
          {/* Bottom: Revenue and Provider Badge */}
          <div className="mt-auto space-y-1">
            <div className="flex items-end justify-between">
              <p className={`text-lg font-bold ${getRevenueTierColor(opportunity.monthlyRevenue)} drop-shadow-lg`}>
                ${opportunity.monthlyRevenue}/mo
              </p>
            </div>
            {/* Provider Badge - single line, consistent spacing */}
            <div className={`flex justify-end ${opportunity.provider ? 'h-6' : 'h-6'}`}>
              {opportunity.provider && (
                <div className="bg-white/20 backdrop-blur text-white text-xs rounded-full px-2 py-1 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-20">
                  {opportunity.provider}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-8 sm:mt-10 md:mt-12 px-3 sm:px-4 md:px-6"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full group">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg text-center md:text-left">
              Additional Asset Opportunities
            </h2>
            <ChevronDown 
              className={`h-6 w-6 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
      
      {/* Filter and Sort Controls - Desktop */}
      <div className="hidden sm:flex flex-row flex-wrap gap-4 mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
              <SelectItem value="setup-cost">Setup Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="ml-auto text-white text-sm">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </div>
      </div>

      {/* Mobile Stats Only */}
      <div className="sm:hidden mb-4 text-center">
        <div className="text-white text-sm">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </div>
      </div>

      {/* Category Carousel */}
      <div className="mb-4 sm:mb-6">
        <Carousel 
          className="w-full"
          opts={{
            align: "start",
            dragFree: true
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {[
              { key: "all", label: "All Opportunities" },
              { key: "space-rentals", label: "Space Rentals" },
              { key: "home-services", label: "Home Services" },
              { key: "pet-services", label: "Pet & Care Services" },
              { key: "logistics", label: "Logistics & Storage" },
              { key: "community", label: "Community Services" },
              { key: "tech", label: "Tech Infrastructure" },
              { key: "high-revenue", label: "High Revenue ($200+)" },
              { key: "medium-revenue", label: "Medium Revenue ($75–$199)" },
              { key: "low-revenue", label: "Lower Revenue ($25–$74)" }
            ].map((category) => (
              <CarouselItem key={category.key} className="pl-2 md:pl-4 basis-auto">
                <Button
                  variant={filterType === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(category.key)}
                  className={`whitespace-nowrap transition-all duration-200 ${
                    filterType === category.key
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {category.label}
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      <Carousel 
        className="w-full"
        opts={{
          align: "start",
          loop: true
        }}
      >
        {isMobile ? (
          <CarouselContent className="py-2 -ml-2">
            {filteredOpportunities.map((opportunity, index) => (
              <CarouselItem key={opportunity.title} className="pl-2 basis-auto">
                <CompactCard opportunity={opportunity} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
        ) : (
          <CarouselContent className="py-2">
            {cardGroups.map((group, groupIndex) => (
              <CarouselItem key={groupIndex} className={`basis-1/2 md:basis-1/3 lg:basis-1/2`}>
                <div className={`grid grid-rows-2 gap-2`}>
                  {group.map((opportunity, index) => (
                    <CompactCard key={opportunity.title} opportunity={opportunity} index={index} />
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
        <CarouselPrevious className="left-1 bg-white/20 hover:bg-white/30 text-white" />
        <CarouselNext className="right-1 bg-white/20 hover:bg-white/30 text-white" />
      </Carousel>
      
      {/* Mobile Sort Controls - Below Cards */}
      <div className="sm:hidden mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
              <SelectItem value="setup-cost">Setup Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg space-y-4 bg-white/5 border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <p className="text-white/60 text-xs">Selected Assets</p>
            <p className="text-white font-bold text-sm sm:text-base md:text-lg">{selectedAssets.length}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Potential Revenue</p>
            <p className="text-tiptop-purple font-bold text-sm sm:text-base md:text-lg">
              ${filteredOpportunities
                .filter(opp => selectedAssets.includes(opp.title))
                .reduce((sum, opp) => sum + opp.monthlyRevenue, 0)}/mo
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Total Setup Cost</p>
            <p className="text-orange-400 font-bold text-sm sm:text-base md:text-lg">
              ${filteredOpportunities
                .filter(opp => selectedAssets.includes(opp.title))
                .reduce((sum, opp) => sum + (opp.setupCost || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Available Options</p>
            <p className="text-white font-bold text-sm sm:text-base md:text-lg">{filteredOpportunities.length}</p>
          </div>
        </div>
        
        {/* Continue Button */}
        <div className="pt-2">
          <ContinueButton
            selectedCount={selectedAssets.length}
            onContinue={() => {}} // ContinueButton handles navigation internally
            selectedAssetsData={filteredOpportunities
              .filter(opp => selectedAssets.includes(opp.title))
              .map(opp => ({
                title: opp.title,
                icon: opp.icon,
                monthlyRevenue: opp.monthlyRevenue,
                setupCost: opp.setupCost || 0,
                provider: opp.provider,
                roi: opp.roi
              }))}
          />
        </div>
      </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default EnhancedAdditionalAssetsCarousel;
