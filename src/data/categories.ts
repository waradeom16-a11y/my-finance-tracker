import { Category, Transaction } from '../types';

export const CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed', color: '#EF4444', type: 'expense' },
  { id: 'transport', label: 'Transportation', icon: 'Car', color: '#F59E0B', type: 'expense' },
  { id: 'housing', label: 'Housing & Utilities', icon: 'Home', color: '#F97316', type: 'expense' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#8B5CF6', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#EC4899', type: 'expense' },
  { id: 'health', label: 'Health & Medical', icon: 'HeartPulse', color: '#06B6D4', type: 'expense' },
  { id: 'education', label: 'Education & Study', icon: 'GraduationCap', color: '#10B981', type: 'expense' },
  { id: 'travel', label: 'Travel & Trips', icon: 'Plane', color: '#3B82F6', type: 'expense' },
  { id: 'other_expense', label: 'Other Expense', icon: 'Tag', color: '#64748B', type: 'expense' },

  // Income Categories
  { id: 'salary', label: 'Salary & Payroll', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'freelance', label: 'Freelance & Gigs', icon: 'Laptop', color: '#059669', type: 'income' },
  { id: 'investment', label: 'Investments & ROI', icon: 'TrendingUp', color: '#3B82F6', type: 'income' },
  { id: 'bonus', label: 'Bonus & Grants', icon: 'Gift', color: '#8B5CF6', type: 'income' },
  { id: 'other_income', label: 'Other Income', icon: 'PiggyBank', color: '#06B6D4', type: 'income' },
];

export function getCategoryMeta(categoryName: string, type: 'expense' | 'income' = 'expense'): Category {
  const match = CATEGORIES.find(
    (c) => c.label.toLowerCase() === categoryName.toLowerCase() || c.id.toLowerCase() === categoryName.toLowerCase()
  );
  if (match) return match;
  return type === 'expense'
    ? { id: 'other', label: categoryName || 'Other Expense', icon: 'Tag', color: '#64748B', type: 'expense' }
    : { id: 'other', label: categoryName || 'Other Income', icon: 'PiggyBank', color: '#10B981', type: 'income' };
}

export function formatTimeFromDate(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Starts with zero fabricated data for genuine real-time database recording
export const INITIAL_TRANSACTIONS: Transaction[] = [];
