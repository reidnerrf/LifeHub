export type Locale = 'pt' | 'en';

const strings: Record<Locale, Record<string, string>> = {
  pt: {
    dashboard: 'Início',
    tasks: 'Tarefas',
    notes: 'Notas',
    focus: 'Foco',
    habits: 'Hábitos',
    finances: 'Finanças',
    connectGoogle: 'Conectar Google',
    connected: 'Conectado',
  },
  en: {
    dashboard: 'Home',
    tasks: 'Tasks',
    notes: 'Notes',
    focus: 'Focus',
    habits: 'Habits',
    finances: 'Finances',
    connectGoogle: 'Connect Google',
    connected: 'Connected',
  }
};

let currentLocale: Locale = (localStorage.getItem('locale') as Locale) || 'pt';

export function t(key: string): string {
  return strings[currentLocale][key] || key;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
}

export function getLocale(): Locale {
  return currentLocale;
}

