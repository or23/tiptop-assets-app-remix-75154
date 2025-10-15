import { Loader2, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldTrigger: boolean;
}

export const PullToRefreshIndicator = ({
  isPulling,
  isRefreshing,
  pullDistance,
  shouldTrigger,
}: PullToRefreshIndicatorProps) => {
  const opacity = Math.min(pullDistance / 60, 1);
  const scale = Math.min(pullDistance / 80, 1);

  if (!isPulling && !isRefreshing) return null;

  return (
    <motion.div
      initial={{ y: -60 }}
      animate={{ y: isPulling || isRefreshing ? 0 : -60 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-16 pointer-events-none"
      style={{ opacity }}
    >
      <div 
        className="bg-card border border-border rounded-full p-3 shadow-lg"
        style={{ transform: `scale(${scale})` }}
      >
        {isRefreshing ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : shouldTrigger ? (
          <ArrowDown className="h-5 w-5 text-primary animate-bounce" />
        ) : (
          <ArrowDown 
            className="h-5 w-5 text-muted-foreground"
            style={{ transform: `rotate(${pullDistance * 2}deg)` }}
          />
        )}
      </div>
    </motion.div>
  );
};
