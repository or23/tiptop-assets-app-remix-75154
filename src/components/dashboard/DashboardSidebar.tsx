
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
        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-gray-900 text-white rounded-md shadow-lg"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar - Fixed with proper scrolling */}
        <div className={`fixed left-0 top-0 h-screen w-80 bg-gray-900 text-white z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } safe-top safe-bottom`}>
          <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
            {/* Close button at top for easy access */}
            <div className="flex justify-end p-4 border-b border-gray-800">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <DashboardSidebarHeader 
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={onPropertySelect}
              isCollapsed={false}
            />
            
            {/* Scrollable navigation section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <DashboardSidebarNavigation isCollapsed={false} />
            </div>
            
            {/* Bottom navigation - always visible */}
            <div className="flex-shrink-0 mt-auto">
              <DashboardSidebarBottomNav isCollapsed={false} />
            </div>
          </div>
        </div>
      </>
    );
  }

  const isCollapsed = !isHovered;

  return (
    <div 
      className={`bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <DashboardSidebarHeader 
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertySelect={onPropertySelect}
        isCollapsed={isCollapsed}
      />
      <DashboardSidebarNavigation isCollapsed={isCollapsed} />
      <DashboardSidebarBottomNav isCollapsed={isCollapsed} />
    </div>
  );
};

export default DashboardSidebar;
