
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

// Import the specific icons
import SolarPanelIcon from "@/components/asset-icons/SolarPanelIcon";
import GardenIcon from "@/components/asset-icons/GardenIcon";
import StorageIcon from "@/components/asset-icons/StorageIcon";
import SwimmingPoolIcon from "@/components/asset-icons/SwimmingPoolIcon";
import CarIcon from "@/components/asset-icons/CarIcon";
import WifiIcon from "@/components/asset-icons/WifiIcon";
import EVChargerIcon from "@/components/asset-icons/EVChargerIcon";
import ParkingIcon from "@/components/asset-icons/ParkingIcon";

type AssetCardProps = {
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  iconComponent: React.ReactNode;
};

const assetCards: AssetCardProps[] = [
  {
    title: "Rooftop",
    description: "Rent it for solar panels or 5G antennas",
    color: "from-yellow-400",
    hoverColor: "hover:shadow-yellow-400/70",
    gradientFrom: "from-yellow-400/10",
    gradientTo: "to-amber-500/5",
    glowColor: "rgba(250, 204, 21, 0.6)",
    iconComponent: <SolarPanelIcon />
  }, 
  {
    title: "Garden Space",
    description: "Urban farming, community events",
    color: "from-green-400",
    hoverColor: "hover:shadow-green-400/70",
    gradientFrom: "from-green-400/10",
    gradientTo: "to-emerald-500/5",
    glowColor: "rgba(74, 222, 128, 0.6)",
    iconComponent: <GardenIcon />
  }, 
  {
    title: "Storage Space",
    description: "Store equipment, seasonal items",
    color: "from-amber-400",
    hoverColor: "hover:shadow-amber-400/70",
    gradientFrom: "from-amber-400/10",
    gradientTo: "to-orange-500/5",
    glowColor: "rgba(245, 158, 11, 0.6)",
    iconComponent: <StorageIcon />
  }, 
  {
    title: "Swimming Pool",
    description: "Hourly rental, events, parties",
    color: "from-blue-400",
    hoverColor: "hover:shadow-blue-400/70",
    gradientFrom: "from-blue-400/10",
    gradientTo: "to-sky-500/5",
    glowColor: "rgba(14, 165, 233, 0.6)",
    iconComponent: <SwimmingPoolIcon />
  }, 
  {
    title: "Car Space",
    description: "Vehicle rentals, car sharing",
    color: "from-indigo-400",
    hoverColor: "hover:shadow-indigo-400/70",
    gradientFrom: "from-indigo-400/10",
    gradientTo: "to-blue-500/5",
    glowColor: "rgba(99, 102, 241, 0.6)",
    iconComponent: <CarIcon />
  }, 
  {
    title: "Internet",
    description: "Share unused bandwidth",
    color: "from-purple-400",
    hoverColor: "hover:shadow-purple-400/70",
    gradientFrom: "from-purple-400/10",
    gradientTo: "to-fuchsia-500/5",
    glowColor: "rgba(168, 85, 247, 0.6)",
    iconComponent: <WifiIcon />
  }, 
  {
    title: "EV Charger",
    description: "Rent out your charging station",
    color: "from-violet-400",
    hoverColor: "hover:shadow-violet-400/70",
    gradientFrom: "from-violet-400/10",
    gradientTo: "to-purple-500/5",
    glowColor: "rgba(167, 139, 250, 0.6)",
    iconComponent: <EVChargerIcon />
  }, 
  {
    title: "Parking Space",
    description: "Hourly, daily parking spots",
    color: "from-fuchsia-400",
    hoverColor: "hover:shadow-fuchsia-400/70",
    gradientFrom: "from-fuchsia-400/10",
    gradientTo: "to-pink-500/5",
    glowColor: "rgba(217, 70, 239, 0.6)",
    iconComponent: <ParkingIcon />
  }
];

const AssetCard = ({
  title,
  description,
  color,
  hoverColor,
  gradientFrom,
  gradientTo,
  glowColor,
  iconComponent
}: AssetCardProps) => {
  return (
    <motion.div 
      whileHover={{
        scale: 1.05,
        y: -5
      }} 
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${hoverColor}
                backdrop-blur-md bg-black/20 border border-white/20 h-full
                bg-gradient-to-br ${gradientFrom} ${gradientTo} overflow-hidden relative`} 
      style={{
        boxShadow: `0 5px 20px ${glowColor}, 0 0 8px ${glowColor}`
      }}
    >
      {/* Colored overlay gradient */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${color} to-transparent opacity-10 z-0`}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon container with glow */}
        <div className="w-12 h-12 mb-3 standardized-icon">
          {iconComponent}
        </div>
        
        {/* Text content */}
        <h3 className="font-medium text-lg mb-1 text-white drop-shadow-md">{title}</h3>
        <p className="text-sm text-white/90">{description}</p>
      </div>
    </motion.div>
  );
};

const FooterCarousel = () => {
  const isMobile = useIsMobile();
  
  return <div className="w-full py-8 px-4">
    {/* Add extra mobile spacing - increasing the top margin on mobile */}
    <div className={`max-w-5xl mx-auto ${isMobile ? 'mt-16' : ''}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-effect py-6 px-4 md:px-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-tiptop-purple/10 to-transparent opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 text-center relative z-10 drop-shadow-lg">
          Rent Your Assets, Make Passive Income
        </h2>
        
        <Carousel 
          opts={{
            align: "start",
            loop: true
          }} 
          className="w-full relative z-10"
        >
          <CarouselContent className="py-2">
            {assetCards.map((card, index) => (
              <CarouselItem key={index} className={isMobile ? "basis-full sm:basis-1/2" : "basis-1/3 md:basis-1/4"}>
                <AssetCard {...card} />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="flex justify-center mt-6">
            <CarouselPrevious className="static relative transform-none mr-2 bg-white/10 hover:bg-white/20 border-white/20" />
            <CarouselNext className="static relative transform-none bg-white/10 hover:bg-white/20 border-white/20" />
          </div>
        </Carousel>
        
        <motion.p 
          className="text-white mt-8 text-center text-lg relative z-10 drop-shadow-md"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Check which assets you can start monetizing now! Enter your property address.
        </motion.p>
      </motion.div>
    </div>
  </div>;
};

export default FooterCarousel;
