import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Coffee, Brain, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Timer } from './ui/timer';

import { api } from '../services/api';

const FocusView: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sessionDurations = {
    focus: 25 * 60,      // 25 minutos
    break: 5 * 60,       // 5 minutos  
    longBreak: 15 * 60,  // 15 minutos
  };

  const focusSounds = [
    { name: 'Silence', id: 'none' },
    { name: 'Rain', id: 'rain', emoji: '🌧️' },
    { name: 'Forest', id: 'forest', emoji: '🌲' },
    { name: 'Ocean', id: 'ocean', emoji: '🌊' },
    { name: 'Coffee Shop', id: 'cafe', emoji: '☕' },
    { name: 'White Noise', id: 'whitenoise', emoji: '📻' },
  ];

  const [selectedSound, setSelectedSound] = useState('none');
  const [scene, setScene] = useState<'classic'|'rain'|'forest'|'cafe'>('classic');
  const [ritualChecklist, setRitualChecklist] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (sessionType === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      // Decidir se é break curto ou longo
      if ((sessionsCompleted + 1) % 4 === 0) {
        setSessionType('longBreak');
        setTimeLeft(sessionDurations.longBreak);
      } else {
        setSessionType('break');
        setTimeLeft(sessionDurations.break);
      }
    } else {
      setSessionType('focus');
      setTimeLeft(sessionDurations.focus);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionDurations[sessionType]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus': return 'var(--app-blue)';
      case 'break': return 'var(--app-green)';
      case 'longBreak': return 'var(--app-purple)';
      default: return 'var(--app-blue)';
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'focus': return 'Foco';
      case 'break': return 'Pausa';
      case 'longBreak': return 'Pausa Longa';
      default: return 'Foco';
    }
  };

  useEffect(() => {
    // Load ritual suggestions for scene
    (async () => {
      try {
        const r = await api.ritualsSuggestions();
        setRitualChecklist(scene === 'classic' ? ['Preparar ambiente','Silenciar celular','Definir objetivo'] : (r.postLunch || []));
      } catch {
        setRitualChecklist(['Preparar ambiente','Silenciar celular','Definir objetivo']);
      }
    })();
  }, [scene]);

  const totalTime = sessionDurations[sessionType];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const todaySessions = [
    { type: 'focus', completed: true, time: '09:00' },
    { type: 'break', completed: true, time: '09:25' },
    { type: 'focus', completed: true, time: '09:30' },
    { type: 'break', completed: true, time: '09:55' },
    { type: 'focus', completed: false, time: '10:00' },
  ];

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--app-text)]">Foco</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[var(--app-light-gray)] text-[var(--app-gray)] hover:bg-[var(--app-dark-gray)] transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Session Type Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setSessionType('focus');
            setTimeLeft(sessionDurations.focus);
            setIsActive(false);
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${
            sessionType === 'focus'
              ? 'bg-[var(--app-blue)] text-white shadow-lg'
              : 'bg-[var(--app-light-gray)] text-[var(--app-text)]'
          }`}
        >
          <Brain size={16} className="inline mr-2" />
          Foco
        </button>
        <button
          onClick={() => {
            setSessionType('break');
            setTimeLeft(sessionDurations.break);
            setIsActive(false);
          }}
          className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${
            sessionType === 'break'
              ? 'bg-[var(--app-green)] text-white shadow-lg'
              : 'bg-[var(--app-light-gray)] text-[var(--app-text)]'
          }`}
        >
          <Coffee size={16} className="inline mr-2" />
          Pausa
        </button>
      </div>

      {/* Scenes */}
      <div className="flex space-x-2">
        {(['classic','rain','forest','cafe'] as const).map(s => (
          <button key={s} onClick={() => { setScene(s); setSelectedSound(s === 'classic' ? 'none' : s); }} className={`px-3 py-1 rounded-lg text-sm ${scene===s?'bg-[var(--app-purple)] text-white':'bg-[var(--app-light-gray)]'}`}>{s}</button>
        ))}
      </div>

      {/* Timer Card */}
      <Card className="p-8 bg-[var(--app-card)] rounded-3xl border-0 shadow-lg text-center">
        <div className="mb-4 flex justify-center">
          <Timer initialSeconds={timeLeft} running={isActive} />
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-[var(--app-text)] mb-2">{getSessionLabel()}</h3>
          <p className="text-sm text-[var(--app-text-light)]">
            Sessão {sessionsCompleted + 1} • {sessionsCompleted} concluídas hoje
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--app-light-gray)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={getSessionColor()}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--app-text)] mb-1">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-[var(--app-text-light)]">
                {Math.round(progress)}% concluído
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="w-12 h-12 rounded-full p-0 border-2"
          >
            <RotateCcw size={20} />
          </Button>
          
          <Button
            onClick={toggleTimer}
            size="lg"
            className="w-16 h-16 rounded-full p-0 text-white shadow-lg"
            style={{ backgroundColor: getSessionColor() }}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          
          <Button
            onClick={() => {
              setIsActive(false);
              setTimeLeft(sessionDurations[sessionType]);
            }}
            variant="outline"
            size="lg"
            className="w-12 h-12 rounded-full p-0 border-2"
          >
            <Square size={20} />
          </Button>
        </div>
      </Card>

      {/* Focus Sounds */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Sons de Foco</h3>
        <div className="grid grid-cols-3 gap-3">
          {focusSounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => setSelectedSound(sound.id)}
              className={`p-3 rounded-xl text-center transition-all ${
                selectedSound === sound.id
                  ? 'bg-[var(--app-blue)] text-white shadow-lg'
                  : 'bg-[var(--app-light-gray)] text-[var(--app-text)] hover:bg-[var(--app-dark-gray)]'
              }`}
            >
              <div className="text-lg mb-1">{sound.emoji || '🔇'}</div>
              <div className="text-xs">{sound.name}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Today's Sessions */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Sessões de Hoje</h3>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {todaySessions.map((session, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                session.completed
                  ? session.type === 'focus'
                    ? 'bg-[var(--app-blue)] text-white'
                    : 'bg-[var(--app-green)] text-white'
                  : 'bg-[var(--app-light-gray)] text-[var(--app-gray)]'
              }`}
            >
              {session.type === 'focus' ? (
                <Brain size={16} />
              ) : (
                <Coffee size={16} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-[var(--app-text-light)]">
            {todaySessions.filter(s => s.completed && s.type === 'focus').length} sessões de foco concluídas
          </span>
          <span className="text-[var(--app-text-light)]">
            {Math.round(todaySessions.filter(s => s.completed && s.type === 'focus').length * 25 / 60 * 10) / 10}h focadas
          </span>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm text-center">
          <div className="text-2xl font-bold text-[var(--app-blue)] mb-1">8</div>
          <div className="text-sm text-[var(--app-text-light)]">Sessões esta semana</div>
        </Card>
        <Card className="p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm text-center">
          <div className="text-2xl font-bold text-[var(--app-green)] mb-1">3.2h</div>
          <div className="text-sm text-[var(--app-text-light)]">Tempo focado hoje</div>
        </Card>
      </div>

      {/* Ritual Checklist */}
      <Card className="p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h4 className="font-medium text-[var(--app-text)] mb-2">Ritual</h4>
        <ul className="list-disc ml-5 text-sm text-[var(--app-text)]">
          {ritualChecklist.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default FocusView;