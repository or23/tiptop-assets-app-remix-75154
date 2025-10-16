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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1 max-w-screen-xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 flex-1 max-w-[100px] mobile-touch-target",
              isActive(path) 
                ? "text-primary bg-primary/15 scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon 
              size={22} 
              className={cn(
                "transition-all",
                isActive(path) && "scale-110"
              )} 
            />
            <span className="text-[9px] sm:text-[10px] font-semibold truncate w-full text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
