import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function Focus() {
  const t = useTheme();
  const [mode, setMode] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const durations = { focus: 25 * 60, break: 5 * 60, longBreak: 15 * 60 };
  const [remaining, setRemaining] = useState(durations.focus);
  const [running, setRunning] = useState(false);
  const sessionsRef = useRef(0);
  useEffect(() => {
    let id: any = null;
    if (running && remaining > 0) {
      id = setInterval(() => setRemaining(r => r - 1), 1000);
    }
    if (remaining === 0) {
      setRunning(false);
      if (mode === 'focus') {
        sessionsRef.current += 1;
        const next = sessionsRef.current % 4 === 0 ? 'longBreak' : 'break';
        setMode(next as any); setRemaining(durations[next as 'break' | 'longBreak']);
      } else {
        setMode('focus'); setRemaining(durations.focus);
      }
    }
    return () => { if (id) clearInterval(id); };
  }, [running, remaining]);

  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: t.background, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.text, fontSize: 24, fontWeight: '600', marginBottom: 8 }}>{mode === 'focus' ? 'Foco' : mode === 'break' ? 'Pausa' : 'Pausa Longa'}</Text>
      <Text style={{ color: t.text, fontSize: 48, fontWeight: '700', marginBottom: 16 }}>{fmt(remaining)}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity onPress={() => setRunning(r => !r)} style={{ backgroundColor: t.primary, padding: 14, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{running ? 'Pausar' : 'Iniciar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setRunning(false); setMode('focus'); setRemaining(durations.focus); }} style={{ backgroundColor: t.supportYellow, padding: 14, borderRadius: 14 }}>
          <Text style={{ color: '#1C1C1E', fontWeight: '600' }}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

