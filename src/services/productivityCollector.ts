import { useTasks } from '../store/tasks';
import { useEvents } from '../store/events';
import { useFocus } from '../store/focus';
import { useHabits } from '../store/habits';
import { useProductivity } from '../store/productivity';
import { wearableSyncService } from './wearableSyncService';

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export async function collectAndStoreTodayProductivity(): Promise<void> {
  const today = new Date();

  const tasksStore = useTasks.getState();
  const eventsStore = useEvents.getState();
  const focusStore = useFocus.getState();
  const habitsStore = useHabits.getState();
  const productivityStore = useProductivity.getState();

  const tasksCompleted = tasksStore
    .getFilteredTasks()
    .filter(t => t.completed && isSameDay(new Date(t.updatedAt), today)).length;

  const eventsCount = eventsStore
    .events
    .filter(e => isSameDay(new Date(e.startTime), today)).length;

  const focusMinutes = focusStore
    .sessions
    .filter(s => isSameDay(new Date(s.startTime), today))
    .reduce((sum, s) => sum + Math.floor((s.actualDuration || s.duration) / 60), 0);

  const habitsScore = Math.max(0, Math.min(100, Math.round(habitsStore.getCompletionRate('day'))));

  // Heuristic productivity score (0-100)
  const scoreFromTasks = Math.min(100, tasksCompleted * 10); // 10 points per task up to 10 tasks
  const scoreFromFocus = Math.min(100, Math.round((focusMinutes / 120) * 100)); // 120 min -> 100
  let score = Math.round(scoreFromTasks * 0.5 + scoreFromFocus * 0.3 + habitsScore * 0.2);

  // Optional wearable influence (sleep and steps)
  try {
    const wearable = await wearableSyncService.syncFitbit();
    const todayISO = today.toISOString().slice(0, 10);
    const w = wearable.find(p => p.date === todayISO);
    if (w) {
      const sleepBoost = Math.max(0, Math.round((w.sleepHours - 6) * 4));
      const stepsBoost = Math.min(10, Math.floor(w.steps / 2000));
      score = Math.min(100, score + sleepBoost + stepsBoost);
    }
  } catch {}

  productivityStore.addDataPoint({
    date: undefined,
    tasksCompleted,
    focusMinutes,
    habitsScore,
    eventsCount,
    productivityScore: score,
  });
}

