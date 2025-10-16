
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
      <div className="border-t border-white/10 bg-[hsl(222.2,84%,4.9%)]/95 backdrop-blur-sm">
        <div className={`p-4 flex items-center gap-2 ${isCollapsed ? 'flex-col' : 'justify-center flex-wrap'}`}>
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/dashboard/settings"
                className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 mobile-touch-target hover:scale-105 text-gray-300 hover:text-white"
              >
                <Settings size={20} />
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
                className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 mobile-touch-target hover:scale-105 text-gray-300 hover:text-white"
              >
                <User size={20} />
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
                  className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 mobile-touch-target hover:scale-105 text-gray-300 hover:text-white"
                >
                  <Shield size={20} />
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
                className="p-3 h-auto text-destructive hover:bg-destructive/10 transition-all duration-200 mobile-touch-target hover:scale-105"
              >
                <LogOut size={20} />
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
