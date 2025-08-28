import React, { useState } from 'react';
import { CheckCircle, Circle, Flame, Target, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

const HabitsView: React.FC = () => {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: 'Beber 8 copos de água',
      icon: '💧',
      target: 8,
      current: 6,
      streak: 12,
      completedToday: false,
      color: 'var(--app-blue)',
      category: 'Saúde',
    },
    {
      id: 2,
      name: 'Exercitar-se por 30 min',
      icon: '🏋️',
      target: 1,
      current: 1,
      streak: 5,
      completedToday: true,
      color: 'var(--app-green)',
      category: 'Fitness',
    },
    {
      id: 3,
      name: 'Meditar por 10 min',
      icon: '🧘',
      target: 1,
      current: 0,
      streak: 8,
      completedToday: false,
      color: 'var(--app-yellow)',
      category: 'Bem-estar',
    },
    {
      id: 4,
      name: 'Ler por 30 min',
      icon: '📚',
      target: 1,
      current: 0,
      streak: 3,
      completedToday: false,
      color: 'var(--app-blue)',
      category: 'Educação',
    },
  ]);

  const toggleHabit = (habitId: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCurrent = habit.completedToday ? 
          Math.max(0, habit.current - 1) : 
          Math.min(habit.target, habit.current + 1);
        
        return {
          ...habit,
          current: newCurrent,
          completedToday: newCurrent >= habit.target,
        };
      }
      return habit;
    }));
  };

  const completedHabits = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = Math.round((completedHabits / totalHabits) * 100);

  const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  const currentDay = new Date().getDay();

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Hábitos</h1>
        <div className="flex items-center space-x-2">
          <Flame className="text-orange-500" size={20} />
          <span className="font-semibold text-gray-900">8 dias</span>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-white rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900">Progresso de Hoje</h3>
            <p className="text-sm text-[var(--app-gray)]">
              {completedHabits} de {totalHabits} hábitos concluídos
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--app-green)]">{completionPercentage}%</div>
            <div className="flex items-center space-x-1 text-sm text-[var(--app-gray)]">
              <TrendingUp size={14} />
              <span>+5% vs ontem</span>
            </div>
          </div>
        </div>
        
        <Progress value={completionPercentage} className="h-3" />
      </Card>

      {/* Weekly Overview */}
      <Card className="p-6 bg-white rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Esta Semana</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const isToday = index === currentDay;
            const isCompleted = index < currentDay; // Mock completed days
            
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-[var(--app-gray)] mb-2">{day}</div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isToday 
                      ? 'bg-[var(--app-blue)] text-white' 
                      : isCompleted
                      ? 'bg-[var(--app-green)] text-white'
                      : 'bg-gray-100 text-[var(--app-gray)]'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Habits List */}
      <div className="space-y-4">
        {habits.map((habit) => (
          <Card key={habit.id} className="p-4 bg-white rounded-2xl border-0 shadow-sm">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${habit.color}15` }}
              >
                {habit.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{habit.name}</h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-[var(--app-gray)]">{habit.category}</span>
                  <div className="flex items-center space-x-1">
                    <Flame size={12} className="text-orange-500" />
                    <span className="text-xs text-[var(--app-gray)]">{habit.streak} dias</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[var(--app-gray)]">
                      {habit.current}/{habit.target} {habit.target > 1 ? 'concluído' : 'feito'}
                    </span>
                    <span className="text-xs text-[var(--app-gray)]">
                      {Math.round((habit.current / habit.target) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(habit.current / habit.target) * 100} 
                    className="h-2"
                    style={{ 
                      '--progress-foreground': habit.color 
                    } as React.CSSProperties}
                  />
                </div>
              </div>
              
              <button
                onClick={() => toggleHabit(habit.id)}
                className="flex-shrink-0"
              >
                {habit.completedToday ? (
                  <CheckCircle size={24} style={{ color: habit.color }} />
                ) : (
                  <Circle size={24} className="text-gray-300" />
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white rounded-2xl border-0 shadow-sm text-center">
          <Target size={24} className="mx-auto mb-2 text-[var(--app-blue)]" />
          <div className="text-2xl font-bold text-gray-900">4</div>
          <div className="text-sm text-[var(--app-gray)]">Hábitos ativos</div>
        </Card>
        
        <Card className="p-4 bg-white rounded-2xl border-0 shadow-sm text-center">
          <Flame size={24} className="mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-[var(--app-gray)]">Maior sequência</div>
        </Card>
      </div>
    </div>
  );
};

export default HabitsView;