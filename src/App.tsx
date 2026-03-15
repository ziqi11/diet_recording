/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Settings, 
  Utensils, 
  Book, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  X,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MealType, 
  DailyGoal, 
  Food, 
  LogEntry, 
  MEAL_TYPES 
} from './types';

const STORAGE_KEYS = {
  GOALS: 'diet_tracker_goals',
  FOODS: 'diet_tracker_foods',
  LOGS: 'diet_tracker_logs',
};

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'settings'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState<DailyGoal>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : { carbs: 200, protein: 150, fat: 60 };
  });
  const [foods, setFoods] = useState<Food[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FOODS);
    return saved ? JSON.parse(saved) : [];
  });
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [isLoggingMeal, setIsLoggingMeal] = useState<MealType | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  // --- Calculations ---
  const todayLogs = useMemo(() => {
    return logs.filter(log => log.date === selectedDate);
  }, [logs, selectedDate]);

  const stats = useMemo(() => {
    return todayLogs.reduce((acc, log) => {
      const food = foods.find(f => f.id === log.foodId);
      if (food) {
        acc.carbs += food.carbs;
        acc.protein += food.protein;
        acc.fat += food.fat;
        acc.calories += food.calories;
      }
      return acc;
    }, { carbs: 0, protein: 0, fat: 0, calories: 0 });
  }, [todayLogs, foods]);

  // --- Handlers ---
  const handleAddFood = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const carbs = Number(formData.get('carbs')) || 0;
    const protein = Number(formData.get('protein')) || 0;
    const fat = Number(formData.get('fat')) || 0;
    
    const newFood: Food = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      carbs,
      protein,
      fat,
      calories: (carbs * 4) + (protein * 4) + (fat * 9),
    };

    setFoods([...foods, newFood]);
    setIsAddingFood(false);
  };

  const handleDeleteFood = (id: string) => {
    setFoods(foods.filter(f => f.id !== id));
    setLogs(logs.filter(l => l.foodId !== id));
  };

  const handleLogMeal = (foodId: string) => {
    if (!isLoggingMeal) return;
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      foodId,
      mealType: isLoggingMeal,
      date: selectedDate,
    };
    setLogs([...logs, newEntry]);
    setIsLoggingMeal(null);
  };

  const handleRemoveLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  // --- Components ---
  const ProgressBar = ({ label, current, goal, color }: { label: string, current: number, goal: number, color: string }) => {
    const percentage = Math.min(Math.round((current / goal) * 100), 100);
    return (
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <span className="text-sm font-medium text-zinc-500">{label}</span>
          <span className="text-sm font-mono text-zinc-600">
            <span className="font-bold text-zinc-900">{current}g</span>
            <span className="text-zinc-400 mx-1">/</span>
            <span className="text-zinc-500">{goal}g</span>
          </span>
        </div>
        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full ${color}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">极简饮食记录</h1>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="hidden"
              id="date-picker"
            />
            <label htmlFor="date-picker" className="text-sm font-mono text-zinc-500 cursor-pointer hover:text-zinc-900 transition-colors flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {selectedDate}
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-bold text-sm">
                {selectedDate === new Date().toISOString().split('T')[0] ? '今天' : selectedDate}
              </div>
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
              <div className="mb-6">
                <div className="text-sm text-zinc-500 mb-1">今日总热量</div>
                <div className="text-4xl font-bold tracking-tighter">
                  {Math.round(stats.calories)} <span className="text-lg font-normal text-zinc-400">kcal</span>
                </div>
              </div>
              
              <ProgressBar label="碳水化合物" current={stats.carbs} goal={goals.carbs} color="bg-orange-400" />
              <ProgressBar label="蛋白质" current={stats.protein} goal={goals.protein} color="bg-emerald-400" />
              <ProgressBar label="脂肪" current={stats.fat} goal={goals.fat} color="bg-amber-400" />
            </div>

            {/* Meal Sections */}
            <div className="space-y-4">
              {MEAL_TYPES.map(meal => (
                <div key={meal.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 flex justify-between items-center border-b border-zinc-50">
                    <h3 className="font-bold flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-zinc-400" />
                      {meal.label}
                    </h3>
                    <button 
                      onClick={() => setIsLoggingMeal(meal.id)}
                      className="p-1.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {todayLogs.filter(l => l.mealType === meal.id).map(log => {
                      const food = foods.find(f => f.id === log.foodId);
                      return (
                        <div key={log.id} className="px-5 py-3 flex justify-between items-center group">
                          <div>
                            <div className="font-medium text-sm">{food?.name || '未知食物'}</div>
                            <div className="text-xs text-zinc-400 font-mono">
                              {food?.calories} kcal | C:{food?.carbs} P:{food?.protein} F:{food?.fat}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveLog(log.id)}
                            className="text-zinc-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {todayLogs.filter(l => l.mealType === meal.id).length === 0 && (
                      <div className="px-5 py-4 text-sm text-zinc-400 italic">暂无记录</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">食物库</h2>
              <button 
                onClick={() => setIsAddingFood(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> 新增食物
              </button>
            </div>

            <div className="grid gap-4">
              {foods.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>食物库空空如也，快去添加吧</p>
                </div>
              ) : (
                foods.map(food => (
                  <div key={food.id} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="font-bold mb-1">{food.name}</h3>
                      <div className="text-sm text-zinc-500 font-mono">
                        {food.calories} kcal | 碳:{food.carbs} 蛋:{food.protein} 脂:{food.fat}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold tracking-tight">目标设置</h2>
            
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">目标碳水化合物 (g)</label>
                <input 
                  type="number" 
                  value={goals.carbs}
                  onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">目标蛋白质 (g)</label>
                <input 
                  type="number" 
                  value={goals.protein}
                  onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 mb-2">目标脂肪 (g)</label>
                <input 
                  type="number" 
                  value={goals.fat}
                  onChange={(e) => setGoals({ ...goals, fat: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div className="pt-4 border-t border-zinc-50">
                <div className="text-sm text-zinc-400">
                  总热量目标: <span className="font-bold text-zinc-900">{(goals.carbs * 4) + (goals.protein * 4) + (goals.fat * 9)} kcal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-zinc-200 px-6 py-3 z-20">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-zinc-900' : 'text-zinc-400'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">首页</span>
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'library' ? 'text-zinc-900' : 'text-zinc-400'}`}
          >
            <Book className="w-6 h-6" />
            <span className="text-[10px] font-medium">食物库</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-zinc-900' : 'text-zinc-400'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">设置</span>
          </button>
        </div>
      </nav>

      {/* Add Food Modal */}
      <AnimatePresence>
        {isAddingFood && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingFood(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">新增食物</h3>
                <button onClick={() => setIsAddingFood(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddFood} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">食物名称</label>
                  <input name="name" required placeholder="例如：清汤面" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-2">碳水 (g)</label>
                    <input name="carbs" type="number" required placeholder="0" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-2">蛋白 (g)</label>
                    <input name="protein" type="number" required placeholder="0" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-2">脂肪 (g)</label>
                    <input name="fat" type="number" placeholder="0" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors mt-4">
                  保存到食物库
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Meal Modal */}
      <AnimatePresence>
        {isLoggingMeal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggingMeal(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-8 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">记录 {MEAL_TYPES.find(m => m.id === isLoggingMeal)?.label}</h3>
                <button onClick={() => setIsLoggingMeal(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {foods.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 mb-4">食物库中还没有食物</p>
                    <button 
                      onClick={() => {
                        setIsLoggingMeal(null);
                        setActiveTab('library');
                        setIsAddingFood(true);
                      }}
                      className="text-zinc-900 font-bold underline"
                    >
                      去添加食物
                    </button>
                  </div>
                ) : (
                  foods.map(food => (
                    <button 
                      key={food.id}
                      onClick={() => handleLogMeal(food.id)}
                      className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-zinc-100 flex justify-between items-center transition-colors text-left"
                    >
                      <div>
                        <div className="font-bold">{food.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">
                          {food.calories} kcal | C:{food.carbs} P:{food.protein} F:{food.fat}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
