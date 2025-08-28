import { create } from 'zustand';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  notebook: string;
  tags: string[];
  attachments: Attachment[];
  aiSummary?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'file';
  url: string;
  name: string;
  size: number;
  createdAt: Date;
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface SearchResult {
  note: Note;
  relevance: number;
  matchedFields: string[];
  highlights: string[];
}

interface NotesStore {
  // Dados
  notes: Note[];
  notebooks: Notebook[];
  searchHistory: string[];

  // Estado atual
  selectedNotebook: string | null;
  selectedTags: string[];
  searchQuery: string;
  isSearching: boolean;

  // Ações para Notas
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string) => void;
  unpinNote: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;

  // Ações para Anexos
  addAttachment: (noteId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  removeAttachment: (noteId: string, attachmentId: string) => void;

  // Ações para Cadernos
  addNotebook: (notebook: Omit<Notebook, 'id' | 'createdAt'>) => void;
  updateNotebook: (id: string, updates: Partial<Notebook>) => void;
  deleteNotebook: (id: string) => void;
  setDefaultNotebook: (id: string) => void;

  // Ações para Tags
  addTag: (noteId: string, tag: string) => void;
  removeTag: (noteId: string, tag: string) => void;
  getAllTags: () => string[];

  // Busca Inteligente
  searchNotes: (query: string) => SearchResult[];
  searchByContent: (query: string) => Note[];
  searchByTags: (tags: string[]) => Note[];
  searchByNotebook: (notebookId: string) => Note[];
  getSearchSuggestions: (query: string) => string[];

  // Resumo IA
  generateAISummary: (noteId: string) => Promise<string>;
  updateAISummary: (noteId: string, summary: string) => void;

  // Filtros e Seletores
  getNotesByNotebook: (notebookId: string) => Note[];
  getNotesByTag: (tag: string) => Note[];
  getPinnedNotes: () => Note[];
  getArchivedNotes: () => Note[];
  getRecentNotes: (limit?: number) => Note[];

  // Configurações
  setSelectedNotebook: (notebookId: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
}

export const useNotes = create<NotesStore>((set, get) => ({
  // Estado inicial
  notes: [
    {
      id: '1',
      title: 'Ideias para o Projeto',
      content: 'Implementar sistema de notificações push, melhorar UX do onboarding, adicionar modo escuro personalizado.',
      type: 'text',
      notebook: 'Trabalho',
      tags: ['projeto', 'ideias', 'desenvolvimento'],
      attachments: [],
      aiSummary: 'Nota sobre melhorias do projeto incluindo notificações, UX e modo escuro.',
      isPinned: true,
      isArchived: false,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      title: 'Receita de Bolo de Chocolate',
      content: 'Ingredientes: 2 xícaras de farinha, 1 xícara de açúcar, 3 ovos, 1/2 xícara de chocolate em pó...',
      type: 'text',
      notebook: 'Receitas',
      tags: ['receita', 'bolo', 'chocolate', 'doce'],
      attachments: [],
      aiSummary: 'Receita completa de bolo de chocolate com ingredientes e modo de preparo.',
      isPinned: false,
      isArchived: false,
      createdAt: new Date('2024-12-02'),
      updatedAt: new Date('2024-12-02'),
    },
    {
      id: '3',
      title: 'Reunião com Cliente',
      content: 'Discussão sobre novos requisitos do projeto. Cliente solicitou integração com API externa e dashboard personalizado.',
      type: 'voice',
      notebook: 'Trabalho',
      tags: ['reunião', 'cliente', 'requisitos'],
      attachments: [
        {
          id: 'att1',
          type: 'audio',
          url: 'audio/meeting-2024-12-03.mp3',
          name: 'Gravação da Reunião',
          size: 2048576,
          createdAt: new Date('2024-12-03'),
        }
      ],
      aiSummary: 'Reunião com cliente sobre novos requisitos incluindo integração API e dashboard.',
      isPinned: false,
      isArchived: false,
      createdAt: new Date('2024-12-03'),
      updatedAt: new Date('2024-12-03'),
    },
  ],
  notebooks: [
    {
      id: '1',
      name: 'Geral',
      color: '#007AFF',
      icon: '📝',
      description: 'Notas gerais e rápidas',
      isDefault: true,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Trabalho',
      color: '#34C759',
      icon: '💼',
      description: 'Notas relacionadas ao trabalho',
      isDefault: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Receitas',
      color: '#FF9500',
      icon: '🍳',
      description: 'Receitas e dicas culinárias',
      isDefault: false,
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'Ideias',
      color: '#5856D6',
      icon: '💡',
      description: 'Ideias e inspirações',
      isDefault: false,
      createdAt: new Date(),
    },
  ],
  searchHistory: [],
  selectedNotebook: null,
  selectedTags: [],
  searchQuery: '',
  isSearching: false,

  // Ações para Notas
  addNote: (note) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      notes: [newNote, ...state.notes],
    }));
  },

  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      ),
    }));
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
  },

  pinNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isPinned: true, updatedAt: new Date() } : note
      ),
    }));
  },

  unpinNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isPinned: false, updatedAt: new Date() } : note
      ),
    }));
  },

  archiveNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isArchived: true, updatedAt: new Date() } : note
      ),
    }));
  },

  unarchiveNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isArchived: false, updatedAt: new Date() } : note
      ),
    }));
  },

  // Ações para Anexos
  addAttachment: (noteId, attachment) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? { ...note, attachments: [...note.attachments, newAttachment], updatedAt: new Date() }
          : note
      ),
    }));
  },

  removeAttachment: (noteId, attachmentId) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? { 
              ...note, 
              attachments: note.attachments.filter(att => att.id !== attachmentId),
              updatedAt: new Date()
            }
          : note
      ),
    }));
  },

  // Ações para Cadernos
  addNotebook: (notebook) => {
    const newNotebook: Notebook = {
      ...notebook,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      notebooks: [...state.notebooks, newNotebook],
    }));
  },

  updateNotebook: (id, updates) => {
    set((state) => ({
      notebooks: state.notebooks.map((notebook) =>
        notebook.id === id ? { ...notebook, ...updates } : notebook
      ),
    }));
  },

  deleteNotebook: (id) => {
    const { notes } = get();
    // Mover notas para caderno padrão
    const defaultNotebook = get().notebooks.find(nb => nb.isDefault);
    if (defaultNotebook) {
      set((state) => ({
        notes: state.notes.map((note) =>
          note.notebook === id
            ? { ...note, notebook: defaultNotebook.name, updatedAt: new Date() }
            : note
        ),
        notebooks: state.notebooks.filter((notebook) => notebook.id !== id),
      }));
    }
  },

  setDefaultNotebook: (id) => {
    set((state) => ({
      notebooks: state.notebooks.map((notebook) => ({
        ...notebook,
        isDefault: notebook.id === id,
      })),
    }));
  },

  // Ações para Tags
  addTag: (noteId, tag) => {
    const { notes } = get();
    const note = notes.find(n => n.id === noteId);
    if (note && !note.tags.includes(tag)) {
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId
            ? { ...note, tags: [...note.tags, tag], updatedAt: new Date() }
            : note
        ),
      }));
    }
  },

  removeTag: (noteId, tag) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? { ...note, tags: note.tags.filter(t => t !== tag), updatedAt: new Date() }
          : note
      ),
    }));
  },

  getAllTags: () => {
    const { notes } = get();
    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)].sort();
  },

  // Busca Inteligente
  searchNotes: (query) => {
    const { notes } = get();
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    notes.forEach(note => {
      let relevance = 0;
      const matchedFields: string[] = [];
      const highlights: string[] = [];

      // Busca no título (peso maior)
      if (note.title.toLowerCase().includes(searchTerm)) {
        relevance += 10;
        matchedFields.push('title');
        highlights.push(note.title);
      }

      // Busca no conteúdo
      if (note.content.toLowerCase().includes(searchTerm)) {
        relevance += 5;
        matchedFields.push('content');
        const contentWords = note.content.split(' ');
        const matchingWords = contentWords.filter(word => 
          word.toLowerCase().includes(searchTerm)
        );
        highlights.push(...matchingWords.slice(0, 3));
      }

      // Busca nas tags
      const matchingTags = note.tags.filter(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      if (matchingTags.length > 0) {
        relevance += 3;
        matchedFields.push('tags');
        highlights.push(...matchingTags);
      }

      // Busca no resumo IA
      if (note.aiSummary?.toLowerCase().includes(searchTerm)) {
        relevance += 2;
        matchedFields.push('aiSummary');
        highlights.push(note.aiSummary);
      }

      // Bônus para notas fixadas
      if (note.isPinned) relevance += 1;

      if (relevance > 0) {
        results.push({
          note,
          relevance,
          matchedFields,
          highlights: [...new Set(highlights)].slice(0, 5),
        });
      }
    });

    // Ordenar por relevância
    return results.sort((a, b) => b.relevance - a.relevance);
  },

  searchByContent: (query) => {
    const { notes } = get();
    const searchTerm = query.toLowerCase();
    return notes.filter(note => 
      note.content.toLowerCase().includes(searchTerm) ||
      note.title.toLowerCase().includes(searchTerm)
    );
  },

  searchByTags: (tags) => {
    const { notes } = get();
    return notes.filter(note => 
      tags.some(tag => note.tags.includes(tag))
    );
  },

  searchByNotebook: (notebookId) => {
    const { notes, notebooks } = get();
    const notebook = notebooks.find(nb => nb.id === notebookId);
    if (!notebook) return [];
    return notes.filter(note => note.notebook === notebook.name);
  },

  getSearchSuggestions: (query) => {
    const { notes, searchHistory } = get();
    const suggestions: string[] = [];

    // Adicionar histórico de busca
    suggestions.push(...searchHistory.filter(term => 
      term.toLowerCase().includes(query.toLowerCase())
    ));

    // Adicionar títulos de notas
    notes.forEach(note => {
      if (note.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(note.title);
      }
    });

    // Adicionar tags
    const allTags = get().getAllTags();
    suggestions.push(...allTags.filter(tag => 
      tag.toLowerCase().includes(query.toLowerCase())
    ));

    // Remover duplicatas e limitar
    return [...new Set(suggestions)].slice(0, 10);
  },

  // Resumo IA
  generateAISummary: async (noteId) => {
    const { notes } = get();
    const note = notes.find(n => n.id === noteId);
    if (!note) return '';

    // Simulação de geração de resumo IA
    const content = note.content;
    const words = content.split(' ').slice(0, 20);
    const summary = words.join(' ') + (content.length > 100 ? '...' : '');
    
    // Atualizar o resumo na nota
    get().updateAISummary(noteId, summary);
    
    return summary;
  },

  updateAISummary: (noteId, summary) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? { ...note, aiSummary: summary, updatedAt: new Date() }
          : note
      ),
    }));
  },

  // Filtros e Seletores
  getNotesByNotebook: (notebookId) => {
    const { notes, notebooks } = get();
    const notebook = notebooks.find(nb => nb.id === notebookId);
    if (!notebook) return [];
    return notes.filter(note => note.notebook === notebook.name);
  },

  getNotesByTag: (tag) => {
    const { notes } = get();
    return notes.filter(note => note.tags.includes(tag));
  },

  getPinnedNotes: () => {
    const { notes } = get();
    return notes.filter(note => note.isPinned);
  },

  getArchivedNotes: () => {
    const { notes } = get();
    return notes.filter(note => note.isArchived);
  },

  getRecentNotes: (limit = 10) => {
    const { notes } = get();
    return notes
      .filter(note => !note.isArchived)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  },

  // Configurações
  setSelectedNotebook: (notebookId) => {
    set({ selectedNotebook: notebookId });
  },

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (query.trim()) {
      const { searchHistory } = get();
      const newHistory = [query, ...searchHistory.filter(term => term !== query)].slice(0, 10);
      set({ searchHistory: newHistory });
    }
  },

  setIsSearching: (isSearching) => {
    set({ isSearching });
  },
}));