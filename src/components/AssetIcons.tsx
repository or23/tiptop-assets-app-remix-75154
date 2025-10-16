
import { useGoogleMap } from '@/contexts/GoogleMapContext';
import './asset-icons/IconGlowEffect.css';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useState } from 'react';

// Import individual icon components
import HouseIcon from './asset-icons/HouseIcon';
import SolarPanelIcon from './asset-icons/SolarPanelIcon';
import GardenIcon from './asset-icons/GardenIcon';
import WifiIcon from './asset-icons/WifiIcon';
import ParkingIcon from './asset-icons/ParkingIcon';
import StorageIcon from './asset-icons/StorageIcon';
import SwimmingPoolIcon from './asset-icons/SwimmingPoolIcon';
import CarIcon from './asset-icons/CarIcon';
import EVChargerIcon from './asset-icons/EVChargerIcon';
import SportsCourtIcon from './asset-icons/SportsCourtIcon';

const AssetIcons = () => {
  const { isAnalyzing, analysisComplete, address } = useGoogleMap();
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  
  // Icons for carousel display
  const carouselIcons = [
    { name: "Solar Panel", Component: SolarPanelIcon },
    { name: "Garden", Component: GardenIcon },
    { name: "WiFi", Component: WifiIcon },
    { name: "Parking", Component: ParkingIcon },
    { name: "Storage", Component: StorageIcon },
    { name: "Swimming Pool", Component: SwimmingPoolIcon },
    { name: "Sports Courts", Component: SportsCourtIcon },
    { name: "Car", Component: CarIcon },
    { name: "EV Charger", Component: EVChargerIcon }
  ];

  // Don't show icons when analysis is in progress or complete
  if (isAnalyzing || analysisComplete) return null;

  // Check if address has been entered but analysis hasn't started yet
  const hasAddress = !!address;

  // Show different layouts based on whether address has been entered
  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Horizontal Carousel for Asset Icons */}
      <div className="w-full max-w-3xl mb-8 overflow-visible">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-8"
        >
          <CarouselContent>
            {carouselIcons.map((Icon) => (
              <CarouselItem key={Icon.name} className="basis-1/4 md:basis-1/5 lg:basis-1/6">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-1"
                    onMouseEnter={() => setHoveredIcon(Icon.name)}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <div className="standardized-icon transition-transform hover:scale-110">
                      <Icon.Component />
                    </div>
                  </motion.div>
                  <div className="mt-2 h-5 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: hoveredIcon === Icon.name ? 1 : 0, y: hoveredIcon === Icon.name ? 0 : 4 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-foreground/80"
                    >
                      {Icon.name}
                    </motion.div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 -left-2" />
          <CarouselNext className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 -right-2" />
        </Carousel>
      </div>
      
      {/* House Icon Below */}
      {!hasAddress && (
        <div className="w-full flex justify-center mt-6">
          <HouseIcon />
        </div>
      )}
    </div>
  );
};

export default AssetIcons;
