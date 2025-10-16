
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserProperty } from '@/hooks/useUserProperties';
import DashboardSidebarHeader from './DashboardSidebarHeader';
import DashboardSidebarNavigation from './DashboardSidebarNavigation';
import DashboardSidebarBottomNav from './DashboardSidebarBottomNav';

interface DashboardSidebarProps {
  properties?: UserProperty[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
}

const DashboardSidebar = ({ properties, selectedPropertyId, onPropertySelect }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button - Fixed position */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 bg-card border-2 border-border rounded-xl shadow-xl mobile-touch-target hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar - Full screen with scroll */}
        <div className={`fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-card border-r border-border z-[60] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}>
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-24 pb-[env(safe-area-inset-bottom)]">
            <div className="flex flex-col min-h-full">
              {/* Header Section */}
              <div className="flex-shrink-0 p-4 border-b border-border bg-card sticky top-0 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-2xl font-bold text-primary">tiptop</h1>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors mobile-touch-target"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Property Dashboard</p>
              </div>

              {/* Property Header - if exists */}
              <div className="flex-shrink-0">
                <DashboardSidebarHeader 
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onPropertySelect={onPropertySelect}
                  isCollapsed={false}
                />
              </div>
              
              {/* Main Navigation - Scrollable */}
              <div className="flex-1 min-h-0">
                <DashboardSidebarNavigation isCollapsed={false} />
              </div>
              
              {/* Bottom Navigation - Sticky at bottom when scrolling */}
              <div className="flex-shrink-0 sticky bottom-0 bg-card border-t border-border mt-auto">
                <DashboardSidebarBottomNav isCollapsed={false} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isCollapsed = !isHovered;

  return (
    <div 
      className={`bg-card border-r border-border min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out pb-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 overflow-y-auto">
        <DashboardSidebarHeader 
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={onPropertySelect}
          isCollapsed={isCollapsed}
        />
        <DashboardSidebarNavigation isCollapsed={isCollapsed} />
      </div>
      <div className="mt-auto border-t border-border">
        <DashboardSidebarBottomNav isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default DashboardSidebar;
