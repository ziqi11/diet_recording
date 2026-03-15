export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DailyGoal {
  carbs: number;
  protein: number;
  fat: number;
}

export interface Food {
  id: string;
  name: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

export interface LogEntry {
  id: string;
  foodId: string;
  mealType: MealType;
  date: string; // ISO string YYYY-MM-DD
}

export const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: '早餐' },
  { id: 'lunch', label: '午餐' },
  { id: 'dinner', label: '晚餐' },
  { id: 'snack', label: '加餐' },
];
