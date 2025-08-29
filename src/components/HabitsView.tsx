
import React, { useEffect, useMemo, useState } from 'react';

import { CheckCircle, Circle, Flame, Target, TrendingUp, Heart, Zap, Moon } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { api } from '../services/api';

import { storage, KEYS } from '../services/storage';


const HabitsView: React.FC = () => {
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinData, setCheckinData] = useState({ mood: 3, energy: 3, sleepHours: 7 });

  const [habits, setHabits] = useState(() => storage.get<any[]>(KEYS.habits) || [

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

  useEffect(() => { storage.set(KEYS.habits, habits); }, [habits]);

  const createHabit = () => {
    const name = prompt('Nome do hábito');
    if (!name) return;
    setHabits(prev => [{ id: Date.now(), name, icon: '✅', target: 1, current: 0, streak: 0, completedToday: false, color: 'var(--app-blue)', category: 'Geral' }, ...prev]);
  };

  const editHabit = (habitId: number) => {
    const h = habits.find(h => h.id === habitId);
    if (!h) return;
    const name = prompt('Editar nome', h.name) || h.name;
    setHabits(prev => prev.map(x => x.id === habitId ? { ...x, name } : x));
  };

  const deleteHabit = (habitId: number) => {
    if (!confirm('Excluir hábito?')) return;
    setHabits(prev => prev.filter(x => x.id !== habitId));
  };

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

  const submitCheckin = async () => {
    try {
      // Send checkin data to backend for orchestrator
      await api.createCheckin({
        habitId: 'daily',
        date: new Date().toISOString(),
        mood: checkinData.mood,
        energy: checkinData.energy,
        sleepHours: checkinData.sleepHours
      });
      setShowCheckin(false);
    } catch (e) {
      console.error('Error submitting checkin:', e);
    }
  };

  const completedHabits = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = Math.round((completedHabits / totalHabits) * 100);

  const report = useMemo(() => {
    const days = 7;
    const data = Array.from({ length: days }).map((_, i) => ({
      day: i,
      habitsScore: Math.round(50 + Math.random() * 50),
      productivity: Math.round(40 + Math.random() * 60)
    }));
    const corr = (() => {
      const xs = data.map(d => d.habitsScore);
      const ys = data.map(d => d.productivity);
      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const mx = mean(xs), my = mean(ys);
      const num = xs.map((x, i) => (x - mx) * (ys[i] - my)).reduce((a, b) => a + b, 0);
      const den = Math.sqrt(xs.map(x => (x - mx) ** 2).reduce((a, b) => a + b, 0) * ys.map(y => (y - my) ** 2).reduce((a, b) => a + b, 0)) || 1;
      return +(num / den).toFixed(2);
    })();
    return { data, corr };
  }, [habits]);

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
          <button onClick={createHabit} className="ml-2 px-3 py-1 rounded-lg bg-[var(--app-blue)] text-white text-sm">Novo</button>
        </div>
      </div>

      {/* Daily Check-in */}
      <Card className="p-6 bg-white rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Check-in Diário</h3>
          <button
            onClick={() => setShowCheckin(!showCheckin)}
            className="px-3 py-1 bg-[var(--app-blue)] text-white rounded-lg text-sm"
          >
            {showCheckin ? 'Cancelar' : 'Abrir'}
          </button>
        </div>
        {showCheckin && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                <Heart size={16} />
                <span>Humor (1-5)</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={checkinData.mood}
                onChange={(e) => setCheckinData(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>😞</span>
                <span>😐</span>
                <span>😊</span>
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                <Zap size={16} />
                <span>Energia (1-5)</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={checkinData.energy}
                onChange={(e) => setCheckinData(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                <Moon size={16} />
                <span>Horas de sono</span>
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={checkinData.sleepHours}
                onChange={(e) => setCheckinData(prev => ({ ...prev, sleepHours: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              onClick={submitCheckin}
              className="w-full py-2 bg-[var(--app-green)] text-white rounded-lg"
            >
              Enviar Check-in
            </button>
          </div>
        )}
      </Card>

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

      {/* Relatório simples hábitos x produtividade */}
      <Card className="p-6 bg-white rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-2">Hábitos x Produtividade</h3>
        <p className="text-sm text-[var(--app-gray)] mb-3">Correlação (mock): {report.corr}</p>
        <div className="grid grid-cols-7 gap-2 text-center">
          {report.data.map((d, i) => (
            <div key={i} className="text-xs">
              <div className="h-12 bg-[var(--app-blue)]15 rounded" style={{ height: 48 }}>
                <div className="h-2 bg-[var(--app-green)] rounded" style={{ width: `${d.habitsScore}%` }} />
                <div className="h-2 bg-[var(--app-purple)] rounded mt-1" style={{ width: `${d.productivity}%` }} />
              </div>
              <div className="text-[10px] text-[var(--app-gray)] mt-1">D{i+1}</div>
            </div>
          ))}
        </div>
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
              
              <div className="flex items-center space-x-2">
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
                <button onClick={() => editHabit(habit.id)} className="px-3 py-1 rounded-lg text-sm bg-[var(--app-light-gray)]">Editar</button>
                <button onClick={() => deleteHabit(habit.id)} className="px-3 py-1 rounded-lg text-sm bg-[var(--app-red)] text-white">Excluir</button>
              </div>
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