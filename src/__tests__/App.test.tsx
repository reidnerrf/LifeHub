import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the lazy-loaded components
vi.mock('../components/SplashScreen', () => ({
  default: () => <div>SplashScreen</div>
}));

vi.mock('../components/OnboardingFlow', () => ({
  default: () => <div>OnboardingFlow</div>
}));

vi.mock('../components/LoginScreen', () => ({
  default: () => <div>LoginScreen</div>
}));

vi.mock('../components/BottomNavigation', () => ({
  default: () => <div>BottomNavigation</div>
}));

vi.mock('../components/FloatingActionButton', () => ({
  default: () => <div>FloatingActionButton</div>
}));

vi.mock('../components/Dashboard', () => ({
  default: () => <div>Dashboard</div>
}));

vi.mock('../components/TasksView', () => ({
  default: () => <div>TasksView</div>
}));

vi.mock('../components/CalendarView', () => ({
  default: () => <div>CalendarView</div>
}));

vi.mock('../components/HabitsView', () => ({
  default: () => <div>HabitsView</div>
}));

vi.mock('../components/FocusView', () => ({
  default: () => <div>FocusView</div>
}));

vi.mock('../components/FinancesView', () => ({
  default: () => <div>FinancesView</div>
}));

vi.mock('../components/NotesView', () => ({
  default: () => <div>NotesView</div>
}));

vi.mock('../components/AssistantView', () => ({
  default: () => <div>AssistantView</div>
}));

vi.mock('../components/ProfileView', () => ({
  default: () => <div>ProfileView</div>
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('SplashScreen')).toBeInTheDocument();
  });

  // Additional tests can be added here as the app state logic is more complex
  // and requires mocking localStorage and other browser APIs
});
