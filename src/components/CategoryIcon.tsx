import React from 'react';
import * as LucideIcons from 'lucide-react';
import { getCategoryMeta } from '../data/categories';

interface CategoryIconProps {
  category: string;
  type?: 'expense' | 'income';
  size?: number;
  className?: string;
  showBg?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  type = 'expense',
  size = 18,
  className = '',
  showBg = true,
}) => {
  const meta = getCategoryMeta(category, type);
  
  // Resolve icon component dynamically from lucide-react
  // @ts-expect-error Lucide icons indexed dynamically
  const IconComponent = LucideIcons[meta.icon] || (type === 'expense' ? LucideIcons.ArrowDownLeft : LucideIcons.ArrowUpRight);

  if (!showBg) {
    return <IconComponent size={size} style={{ color: meta.color }} className={className} />;
  }

  return (
    <div
      className={`flex items-center justify-center rounded-2xl shrink-0 transition-transform ${className}`}
      style={{
        backgroundColor: `${meta.color}20`,
        border: `1px solid ${meta.color}35`,
        width: size * 2,
        height: size * 2,
      }}
    >
      <IconComponent size={size} style={{ color: meta.color }} />
    </div>
  );
};
