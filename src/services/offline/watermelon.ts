// WatermelonDB stubs and schema placeholder
// In a real setup, install @nozbe/watermelondb and define models/schemas

export interface OfflineNoteRow {
  id: string;
  title: string;
  content: string;
  notebook: string;
  updatedAt: number;
  pendingSync: boolean;
}

export class OfflineDB {
  private notes: Map<string, OfflineNoteRow> = new Map();

  async putNote(row: OfflineNoteRow) {
    this.notes.set(row.id, row);
  }

  async getNote(id: string): Promise<OfflineNoteRow | undefined> {
    return this.notes.get(id);
  }

  async listNotes(): Promise<OfflineNoteRow[]> {
    return Array.from(this.notes.values());
  }
}

export const offlineDB = new OfflineDB();

