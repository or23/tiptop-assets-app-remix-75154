
import { ReactNode, useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserProperty } from '@/hooks/useUserProperties';

interface DashboardLayoutProps {
  children: ReactNode;
  properties?: UserProperty[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
}

const DashboardLayout = ({ children, properties, selectedPropertyId, onPropertySelect }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Show loading state if authentication is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tiptop-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar 
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={onPropertySelect}
        />
        <main className="w-full overflow-auto">
          <div className="pt-16 px-4 pb-24">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <DashboardSidebar 
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={onPropertySelect}
        />
      </div>
      <main className={`flex-1 overflow-auto transition-all duration-300 ${
        isSidebarHovered ? 'ml-64' : 'ml-16'
      }`}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
