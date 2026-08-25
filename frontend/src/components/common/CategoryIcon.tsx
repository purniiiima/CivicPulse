import React from 'react';
import { IssueCategory } from '../../types';
import {
  Lightbulb,
  CircleDotDashed,
  Trash2,
  Droplets,
  Construction,
  Waves,
  Building2,
  Trees,
  Zap,
  AlertCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  category: IssueCategory;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className, ...props }) => {
  switch (category) {
    case 'streetlights':
      return <Lightbulb className={className || 'w-5 h-5'} {...props} />;
    case 'potholes':
      return <CircleDotDashed className={className || 'w-5 h-5'} {...props} />;
    case 'garbage':
      return <Trash2 className={className || 'w-5 h-5'} {...props} />;
    case 'water_leakage':
      return <Droplets className={className || 'w-5 h-5'} {...props} />;
    case 'damaged_roads':
      return <Construction className={className || 'w-5 h-5'} {...props} />;
    case 'drainage':
      return <Waves className={className || 'w-5 h-5'} {...props} />;
    case 'infrastructure':
      return <Building2 className={className || 'w-5 h-5'} {...props} />;
    case 'parks':
      return <Trees className={className || 'w-5 h-5'} {...props} />;
    case 'electricity':
      return <Zap className={className || 'w-5 h-5'} {...props} />;
    case 'other':
    default:
      return <AlertCircle className={className || 'w-5 h-5'} {...props} />;
  }
};
