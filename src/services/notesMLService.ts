import { Note } from '../store/notes';

export interface CategorizationResult {
  categories: string[];
  confidence: number;
}

export interface ContentInsight {
  key: string;
  value: string;
}

class NotesMLService {
  async categorize(note: Note): Promise<CategorizationResult> {
    const text = `${note.title} ${note.content}`.toLowerCase();
    const categories = new Set<string>();
    if (/projeto|tarefa|reuni/.test(text)) categories.add('work');
    if (/receita|cozinha|bolo|comida/.test(text)) categories.add('cooking');
    if (/sa[úu]de|m[ée]dico|exerc/.test(text)) categories.add('health');
    if (categories.size === 0) categories.add('general');
    return { categories: Array.from(categories), confidence: 0.7 };
  }

  async analyzeContent(note: Note): Promise<ContentInsight[]> {
    const wordCount = note.content.split(/\s+/).filter(Boolean).length;
    const hasChecklist = /\n\s*- \[.\]/.test(note.content);
    return [
      { key: 'wordCount', value: String(wordCount) },
      { key: 'hasChecklist', value: hasChecklist ? 'yes' : 'no' },
    ];
  }
}

export const notesMLService = new NotesMLService();

