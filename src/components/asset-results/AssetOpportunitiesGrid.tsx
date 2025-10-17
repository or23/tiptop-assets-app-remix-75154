
import { motion } from "framer-motion";
import AssetCard from './AssetCard';
import iconMap from './IconMap';
import { glowColorMap } from './AssetCard';
import { getAssetIcon } from '@/icons/registry';
import { AssetOpportunity } from '@/contexts/GoogleMapContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface AssetOpportunitiesGridProps {
  opportunities: AssetOpportunity[];
  selectedAssets: string[];
  onAssetToggle: (assetTitle: string) => void;
}

const AssetOpportunitiesGrid = ({ 
  opportunities, 
  selectedAssets, 
  onAssetToggle 
}: AssetOpportunitiesGridProps) => {
  const isMobile = useIsMobile();
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 asset-opportunities-grid">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8 drop-shadow-lg text-center sm:text-left"
      >
        Available Asset Opportunities
      </motion.h2>

      {isMobile ? (
        <div className="-mx-2">
          <Carousel className="w-full" opts={{ align: 'start', dragFree: true }}>
            <CarouselContent className="-ml-2">
              {opportunities.map((opportunity, index) => {
                const iconType = opportunity.icon as keyof typeof iconMap;
                const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
                const isSelected = selectedAssets.includes(opportunity.title);
                const mobileIcon = getAssetIcon(opportunity.icon, { className: 'w-32 h-32 object-contain' });
                
                return (
                  <CarouselItem key={opportunity.title} className="pl-2 basis-auto">
                    <div className="w-[320px]">
                      <AssetCard
                        title={opportunity.title}
                        icon={opportunity.icon}
                        monthlyRevenue={opportunity.monthlyRevenue}
                        description={opportunity.description}
                        iconComponent={mobileIcon}
                        isSelected={isSelected}
                        onClick={() => onAssetToggle(opportunity.title)}
                        glowColor={glowColor}
                        cardClassName="min-h-[520px] h-[520px]"
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-1 bg-white/20 hover:bg-white/30 text-white" />
            <CarouselNext className="right-1 bg-white/20 hover:bg-white/30 text-white" />
          </Carousel>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 sm:gap-6">
          {opportunities.map((opportunity, index) => {
            const iconType = opportunity.icon as keyof typeof iconMap;
            const glowColor = glowColorMap[iconType] || "rgba(155, 135, 245, 0.5)";
            const isSelected = selectedAssets.includes(opportunity.title);
            const desktopIcon = getAssetIcon(opportunity.icon, { className: 'w-8 h-8 object-contain' });
            
            return (
              <motion.div
                key={opportunity.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="w-full"
              >
                <AssetCard
                  title={opportunity.title}
                  icon={opportunity.icon}
                  monthlyRevenue={opportunity.monthlyRevenue}
                  description={opportunity.description}
                  iconComponent={desktopIcon}
                  isSelected={isSelected}
                  onClick={() => onAssetToggle(opportunity.title)}
                  glowColor={glowColor}
                />
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AssetOpportunitiesGrid;
