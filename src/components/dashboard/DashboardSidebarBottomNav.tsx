
import { Link } from 'react-router-dom';
import { Settings, User, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

interface DashboardSidebarBottomNavProps {
  isCollapsed?: boolean;
}

const DashboardSidebarBottomNav = ({ isCollapsed = false }: DashboardSidebarBottomNavProps) => {
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TooltipProvider>
      <div className="border-t border-gray-800 bg-gray-900">
        <div className={`p-4 flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-center gap-2'}`}>
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard/settings"
                className="p-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mobile-touch-target"
              >
                <Settings size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Account */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard/account"
                className="p-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mobile-touch-target"
              >
                <User size={18} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>
              <p>Account</p>
            </TooltipContent>
          </Tooltip>

          {/* Admin Dashboard - Only show for admin users */}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/dashboard/admin"
                  className="p-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mobile-touch-target"
                >
                  <Shield size={18} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"}>
                <p>Admin Dashboard</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Logout Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="p-2.5 h-auto text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors mobile-touch-target"
              >
                <LogOut size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? "right" : "top"}>
              <p>Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardSidebarBottomNav;
