import { Note } from '../store/notes';

class NoteExportService {
  toMarkdown(note: Note): string {
    const header = `# ${note.title}\n\n`;
    const tags = note.tags.length ? `\n\nTags: ${note.tags.map(t => `#${t}`).join(' ')}` : '';
    return header + note.content + tags;
  }

  toHTML(note: Note): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${this.escape(note.title)}</title></head><body><h1>${this.escape(note.title)}</h1><div>${this.escape(note.content).replace(/\n/g, '<br/>')}</div></body></html>`;
  }

  toPDFPlaceholder(note: Note): Blob {
    const text = `PDF Export Placeholder\n\n${note.title}\n\n${note.content}`;
    return new Blob([text], { type: 'application/pdf' });
  }

  batchMarkdown(notes: Note[]): string {
    return notes.map(n => this.toMarkdown(n)).join('\n\n---\n\n');
  }

  download(filename: string, content: string | Blob, mime?: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportMarkdown(note: Note) { this.download(`${this.slug(note.title)}.md`, this.toMarkdown(note), 'text/markdown'); }
  exportHTML(note: Note) { this.download(`${this.slug(note.title)}.html`, this.toHTML(note), 'text/html'); }
  exportPDF(note: Note) { this.download(`${this.slug(note.title)}.pdf`, this.toPDFPlaceholder(note)); }
  exportBatchMarkdown(notes: Note[]) { this.download(`notes-batch.md`, this.batchMarkdown(notes), 'text/markdown'); }

  private escape(s: string): string { return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'} as any)[c]); }
  private slug(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
}

export const noteExportService = new NoteExportService();

