
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const glowColorMap: Record<string, string> = {
  "solar-panel": "rgba(155, 240, 155, 0.5)",
  "parking": "rgba(200, 200, 255, 0.5)",
  "storage": "rgba(255, 200, 155, 0.5)",
  "wifi": "rgba(155, 200, 255, 0.5)",
  "car": "rgba(200, 175, 255, 0.5)",
  "garden": "rgba(155, 255, 155, 0.5)",
  "swimming-pool": "rgba(100, 200, 255, 0.5)",
  "sports-courts": "rgba(34, 197, 94, 0.5)",
  "activity": "rgba(34, 197, 94, 0.5)",
  "ev-charger": "rgba(100, 230, 200, 0.5)",
  "house": "rgba(255, 155, 155, 0.5)",
  "art-studio": "rgba(236, 72, 153, 0.5)",
  "coworking": "rgba(99, 102, 241, 0.5)",
  "bike-repair": "rgba(168, 85, 247, 0.5)",
  "bike-repair-station": "rgba(168, 85, 247, 0.5)",
};

// Define background gradients for each asset type
const backgroundGradientMap: Record<string, string> = {
  "solar-panel": "from-yellow-400 via-orange-400 to-yellow-500",
  "parking": "from-purple-500 via-purple-600 to-purple-700",
  "storage": "from-orange-400 via-amber-500 to-orange-600",
  "wifi": "from-purple-400 via-indigo-500 to-purple-600",
  "car": "from-blue-500 via-indigo-600 to-purple-700",
  "garden": "from-green-400 via-emerald-500 to-green-600",
  "swimming-pool": "from-blue-400 via-cyan-500 to-blue-600",
  "sports-courts": "from-green-500 via-emerald-600 to-green-700",
  "activity": "from-green-500 via-emerald-600 to-green-700",
  "ev-charger": "from-teal-400 via-cyan-500 to-teal-600",
  "house": "from-red-400 via-rose-500 to-red-600",
  "art-studio": "from-pink-400 via-rose-500 to-pink-600",
  "coworking": "from-indigo-400 via-purple-500 to-indigo-600",
  "bike-repair": "from-violet-400 via-purple-500 to-fuchsia-600",
  "bike-repair-station": "from-violet-400 via-purple-500 to-fuchsia-600",
};

interface AssetCardProps {
  title: string;
  icon: string;
  monthlyRevenue: number;
  description: string;
  provider?: string;
  setupCost?: number;
  roi?: number;
  iconComponent: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  glowColor: string;
  cardClassName?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  title,
  icon,
  monthlyRevenue,
  description,
  provider,
  setupCost = 0,
  roi,
  iconComponent,
  isSelected,
  onClick,
  glowColor,
  cardClassName
}) => {
  const iconType = icon as keyof typeof backgroundGradientMap;
  const gradientClasses = backgroundGradientMap[iconType] || "from-gray-500 via-gray-600 to-gray-700";
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="relative w-full cursor-pointer"
      onClick={onClick}
    >
      <Card
        className={`h-full min-h-[280px] sm:min-h-[320px] md:min-h-[300px] lg:min-h-[320px] transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br ${gradientClasses} rounded-2xl shadow-lg hover:shadow-xl relative ${cardClassName ? cardClassName : ''}`}
      >
        {/* Glow effect when selected */}
        {isSelected && (
          <div
            className="absolute inset-0 blur-xl opacity-30 z-0"
            style={{ background: glowColor }}
          />
        )}
        
        <CardContent className="p-4 sm:p-5 md:p-6 relative z-10 h-full flex flex-col">
          {isMobile ? (
            // Mobile layout: Title -> Description -> Icon -> Revenue -> Button at bottom
            <>
              {/* Title */}
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white line-clamp-2">{title}</h3>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{description}</p>
              </div>

              {/* Big centered icon */}
              <div className="flex justify-center items-center flex-grow mb-4">
                {iconComponent}
              </div>

              {/* Revenue */}
              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-white">${monthlyRevenue}/month</p>
              </div>

              {/* Provider info if available */}
              {provider && (
                <div className="flex justify-center mb-2">
                  <div className="inline-block bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">
                    {provider}
                  </div>
                </div>
              )}

              {/* Setup cost and ROI info if available */}
              {setupCost > 0 && (
                <div className="flex flex-col gap-1 text-xs text-white/80 text-center mb-3">
                  <span>Setup: <span className="text-white font-medium">${setupCost}</span></span>
                  {roi && <span>ROI: <span className="text-white font-medium">{roi} mo</span></span>}
                </div>
              )}

              {/* Select button at bottom right */}
              <div className="flex justify-end mt-auto">
                <div className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected 
                    ? 'bg-white text-black shadow-lg' 
                    : 'bg-white text-black hover:shadow-xl'
                }`}>
                  {isSelected ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Select</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Desktop layout: Icon at top, button at bottom right
            <>
              {/* Header with icon */}
              <div className="flex items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                    {iconComponent}
                  </div>
                </div>
              </div>
              
              {/* Title and Revenue - responsive text sizing */}
              <div className="mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2">{title}</h3>
                <p className="text-xl sm:text-2xl font-bold text-white">${monthlyRevenue}/month</p>
              </div>
              
              {/* Description - responsive with line clamping */}
              <p className="text-white/90 text-sm leading-relaxed flex-grow line-clamp-3 sm:line-clamp-4">{description}</p>
              
              {/* Provider info if available */}
              {provider && (
                <div className="mt-3">
                  <div className="inline-block bg-white/20 text-white text-xs rounded-full px-2 sm:px-3 py-1 font-medium">
                    {provider}
                  </div>
                </div>
              )}
              
              {/* Setup cost and ROI info if available - responsive layout */}
              {setupCost > 0 && (
                <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs text-white/80">
                  <span>Setup: <span className="text-white font-medium">${setupCost}</span></span>
                  {roi && <span>ROI: <span className="text-white font-medium">{roi} mo</span></span>}
                </div>
              )}

              {/* Select button at bottom right */}
              <div className="flex justify-end mt-4">
                <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected 
                    ? 'bg-white text-black shadow-lg' 
                    : 'bg-white text-black hover:shadow-xl'
                }`}>
                  {isSelected ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Select</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </Card>
    </motion.div>
  );
};

export default AssetCard;
