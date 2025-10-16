
import { motion } from "framer-motion";

interface RestrictionsCardProps {
  restrictions: string | null;
}

const RestrictionsCard = ({ restrictions }: RestrictionsCardProps) => {
  if (!restrictions) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mt-6 p-4 rounded-lg border-2 border-red-500"
    >
      <h3 className="text-lg font-semibold text-white">Restrictions:</h3>
      <p className="text-gray-100">{restrictions}</p>
    </motion.div>
  );
};

export default RestrictionsCard;
