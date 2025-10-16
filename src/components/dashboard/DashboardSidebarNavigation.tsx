
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BarChart3, 
  Sun, 
  Zap, 
  Wifi, 
  Car,
  Plus,
  User,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useDashboardJourneyData } from '@/hooks/useDashboardJourneyData';
import { useState, useEffect } from 'react';

interface DashboardSidebarNavigationProps {
  isCollapsed?: boolean;
}

const DashboardSidebarNavigation = ({ isCollapsed = false }: DashboardSidebarNavigationProps) => {
  const location = useLocation();
  const { journeyData } = useDashboardJourneyData();
  const [isAssetsOpen, setIsAssetsOpen] = useState(true);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('dashboard-assets-section-open');
    if (savedState !== null) {
      setIsAssetsOpen(JSON.parse(savedState));
    }
  }, []);

  // Save state to localStorage when it changes
  const handleAssetsToggle = () => {
    const newState = !isAssetsOpen;
    setIsAssetsOpen(newState);
    localStorage.setItem('dashboard-assets-section-open', JSON.stringify(newState));
  };

  // Check if property has solar potential
  const hasSolarPotential = journeyData?.analysisResults?.rooftop?.solarPotential;

  // Main navigation items - always visible
  const mainNavigationItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: Home,
      description: 'Dashboard overview'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Revenue analytics'
    }
  ];

  // Asset navigation items - collapsible
  const assetNavigationItems = [
    {
      name: 'Manage Assets',
      href: '/dashboard/manage',
      icon: Settings,
      description: 'Manage your monetized assets',
      badge: 'New'
    },
    // Conditionally include solar dashboard
    ...(hasSolarPotential ? [{
      name: 'Solar System',
      href: '/dashboard/rooftop',
      icon: Sun,
      description: 'Solar panel monitoring',
      badge: journeyData?.analysisResults?.rooftop?.usingRealSolarData ? 'Real Data' : 'Estimated'
    }] : []),
    {
      name: 'EV Charging',
      href: '/dashboard/ev-charging',
      icon: Zap,
      description: 'EV charging stations',
      badge: 'Simulated'
    },
    {
      name: 'Internet Sharing',
      href: '/dashboard/internet',
      icon: Wifi,
      description: 'Bandwidth monetization',
      badge: 'Simulated'
    },
    {
      name: 'Parking',
      href: '/dashboard/parking',
      icon: Car,
      description: 'Parking space rental',
      badge: 'Simulated'
    }
  ];

  const toolsItems = [
    {
      name: 'Add Asset',
      href: '/dashboard/add-asset',
      icon: Plus,
      description: 'Add new revenue streams'
    },
    {
      name: 'AI Assistant',
      href: '/dashboard/onboarding',
      icon: User,
      description: 'Get personalized help'
    },
    {
      name: 'Affiliate Program',
      href: '/dashboard/affiliate',
      icon: DollarSign,
      description: 'Earn referral rewards'
    }
  ];

  return (
    <TooltipProvider>
      <nav className={`p-4 space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Main Navigation Section - Always Visible */}
        <div className="mb-6">
          <h3 className={cn(
            "text-xs font-semibold uppercase tracking-wider mb-3",
            isCollapsed ? "sr-only" : "text-gray-400"
          )}>
            Main
          </h3>
          {mainNavigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center justify-center p-3 rounded-xl text-sm transition-all duration-200 group mb-2 mobile-touch-target',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                      )}
                    >
                      <item.icon size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group mb-2 mobile-touch-target',
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-white hover:bg-white/10'
                )}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Collapsible Assets Section */}
        {!isCollapsed && (
          <Collapsible open={isAssetsOpen} onOpenChange={handleAssetsToggle} className="mb-6">
            <div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto font-bold text-gray-400 uppercase tracking-wider text-xs hover:text-white mb-3"
                >
                  Assets
                  {isAssetsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2">
                {assetNavigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group mobile-touch-target',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'text-white hover:bg-white/10'
                      )}
                    >
                      <item.icon size={20} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.name}</div>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5 font-semibold shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
          
          {/* Collapsed Assets - Show as icons with tooltips */}
          {isCollapsed && (
            <div className="mb-4">
              {assetNavigationItems.slice(0, 4).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center justify-center p-2 rounded-lg text-sm transition-colors group mb-1',
                          isActive 
                            ? 'bg-tiptop-purple text-white' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <item.icon size={18} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}

        {/* Tools Section */}
        <div className="mb-4">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tools</h3>
          )}
          {toolsItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center justify-center p-3 rounded-xl text-sm transition-all duration-200 group mb-2 mobile-touch-target',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                      )}
                    >
                      <item.icon size={20} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group mb-2 mobile-touch-target',
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-white hover:bg-white/10'
                )}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-400 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default DashboardSidebarNavigation;
