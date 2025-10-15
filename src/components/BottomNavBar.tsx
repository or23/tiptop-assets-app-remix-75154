import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Shield, LayoutDashboard, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';

const BottomNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home',
      show: true 
    },
    { 
      path: '/new-address', 
      icon: MapPin, 
      label: 'New Address',
      show: true 
    },
    { 
      path: user ? '/dashboard' : '/auth', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      show: true 
    },
    { 
      path: '/dashboard/manage', 
      icon: Wallet, 
      label: 'My Assets',
      show: !!user 
    },
    { 
      path: '/dashboard/admin', 
      icon: Shield, 
      label: 'Admin',
      show: isAdmin 
    },
  ].filter(item => item.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-screen-xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1 max-w-[100px]",
              isActive(path) 
                ? "text-primary bg-primary/10" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon 
              size={20} 
              className={cn(
                "transition-all",
                isActive(path) && "scale-110"
              )} 
            />
            <span className="text-[10px] font-medium truncate w-full text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
