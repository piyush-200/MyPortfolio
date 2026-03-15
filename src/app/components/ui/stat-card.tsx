import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Trophy,
  Code,
  TrendingUp,
  Star,
  Wrench,
  FileCode,
  Target,
  Zap
} from 'lucide-react';

const iconMap = {
  'graduation-cap': GraduationCap,
  'award': Award,
  'book-open': BookOpen,
  'trophy': Trophy,
  'code': Code,
  'trending-up': TrendingUp,
  'star': Star,
  'wrench': Wrench,
  'file-code': FileCode,
  'target': Target,
  'zap': Zap,
};

const gradientMap = {
  'blue-cyan': 'from-blue-500 to-cyan-400',
  'yellow-orange': 'from-yellow-500 to-orange-500',
  'red-orange': 'from-red-500 to-orange-500',
  'purple-pink': 'from-purple-500 to-pink-500',
  'green-teal': 'from-green-500 to-teal-500',
  'indigo-blue': 'from-indigo-500 to-blue-500',
};

export default function StatCard({ stat, index }) {
  const IconComponent = iconMap[stat.icon] || Code;
  const gradientClass = gradientMap[stat.gradient] || 'from-blue-500 to-cyan-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-cyan-500/10"
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-4 mx-auto`}>
        <IconComponent className="w-8 h-8 text-white" />
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-black text-white mb-2">
          {stat.value}
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
}
