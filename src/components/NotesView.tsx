import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, FileText, Mic, Camera, Tag, Star, Archive, MoreVertical, Users, Wifi, WifiOff } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { EmptyState } from './ui/empty-state';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNotesCollaboration } from '../hooks/useNotesCollaboration';
 

const NotesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Ideias para o Projeto',
      content: 'Lista de funcionalidades para implementar no próximo sprint. Incluir sistema de notificações push e melhorar UX.',
      type: 'text',
      tags: ['trabalho', 'desenvolvimento'],
      favorite: true,
      date: '2025-08-26',
      color: 'var(--app-blue)',
      progress: 75,
    },
    {
      id: '2',
      title: 'Reunião com Cliente',
      content: 'Principais pontos discutidos: orçamento aprovado, prazo de entrega 15/09, revisar wireframes.',
      type: 'text',
      tags: ['reunião', 'cliente'],
      favorite: false,
      date: '2025-08-25',
      color: 'var(--app-green)',
      progress: 100,
    },
    {
      id: '3',
      title: 'Lista de Compras',
      content: '☐ Leite\n☐ Pão\n☐ Ovos\n☐ Frutas\n☐ Arroz integral\n☐ Azeite\n☐ Queijo\n☐ Iogurte natural',
      type: 'text',
      tags: ['pessoal', 'compras'],
      favorite: false,
      date: '2025-08-26',
      color: 'var(--app-yellow)',
      progress: 25,
    },
    {
      id: '4',
      title: 'Áudio - Lembrete',
      content: 'Não esquecer de ligar para o dentista amanhã para remarcar consulta.',
      type: 'audio',
      tags: ['pessoal', 'saúde'],
      favorite: false,
      date: '2025-08-24',
      color: 'var(--app-purple)',
      duration: '0:45',
      progress: 0,
    },
    {
      id: '5',
      title: 'Receita Bolo de Chocolate',
      content: 'Foto da receita da vovó. Ingredientes especiais: chocolate meio amargo e café.',
      type: 'image',
      tags: ['culinária', 'família'],
      favorite: true,
      date: '2025-08-23',
      color: 'var(--app-red)',
      progress: 50,
    },
    {
      id: '6',
      title: 'Livros para Ler',
      content: '☑ Atomic Habits\n☐ Mindset\n☐ The Lean Startup\n☐ Clean Code\n☐ Thinking Fast and Slow',
      type: 'text',
      tags: ['educação', 'livros'],
      favorite: false,
      date: '2025-08-22',
      color: 'var(--app-blue)',
      progress: 20,
    },
  ]);

  // WebSocket hooks
  const { isConnected, connectionError, reconnect } = useWebSocket();
  const {
    typingUsers,
    updateNote: wsUpdateNote,
    startTyping,
    stopTyping
  } = useNotesCollaboration({
    noteId: selectedNoteId || '',
    onNoteUpdate: (update) => {
      setNotes(prev => prev.map(note =>
        note.id === update.noteId
          ? { ...note, content: update.content, title: update.title || note.title }
          : note
      ));
    },
  });

  // Typing indicator component
  const TypingIndicator = ({ users }: { users: string[] }) => {
    if (users.length === 0) return null;

    return (
      <div className="flex items-center space-x-2 text-xs text-[var(--app-text-light)] mt-2">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-[var(--app-text-light)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-[var(--app-text-light)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-[var(--app-text-light)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span>
          {users.length === 1
            ? `${users[0]} is typing...`
            : `${users.length} users are typing...`
          }
        </span>
      </div>
    );
  };

  // Connection status component
  const ConnectionStatus = () => {
    if (isConnected) {
      return (
        <div className="flex items-center space-x-2 text-xs text-green-600">
          <Wifi size={12} />
          <span>Connected</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-xs text-red-600">
        <WifiOff size={12} />
        <span>Disconnected</span>
        {connectionError && (
          <button
            onClick={reconnect}
            className="text-xs underline hover:no-underline"
          >
            Reconnect
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listNotes();
        setNotes(list.map(n => ({
          id: n._id,
          title: n.title,
          content: n.content,
          type: 'text' as const,
          tags: n.tags || [],
          favorite: false,
          date: new Date().toISOString(),
          color: 'var(--app-blue)',
          progress: 0
        })));
      } catch {
        // keep demo data
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('notes');
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const filters = [
    { id: 'all', label: 'Todas', count: notes.length },
    { id: 'favorites', label: 'Favoritas', count: notes.filter(n => n.favorite).length },
    { id: 'text', label: 'Texto', count: notes.filter(n => n.type === 'text').length },
    { id: 'audio', label: 'Áudio', count: notes.filter(n => n.type === 'audio').length },
    { id: 'image', label: 'Imagem', count: notes.filter(n => n.type === 'image').length },
  ];

  const parseChecklist = (content: string) => {
    const lines = content.split('\n');
    const items = lines.filter(l => /^- \[[ xX]\]/.test(l.trim()));
    const done = items.filter(l => /^- \[[xX]\]/.test(l.trim())).length;
    return { total: items.length, done };
  };

  const getProgress = (n: any) => {
    const { total, done } = parseChecklist(n.content || '');
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'favorites') {
        filtered = filtered.filter(note => note.favorite);
      } else {
        filtered = filtered.filter(note => note.type === selectedFilter);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.map(n => ({ ...n, progress: getProgress(n) }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Mic size={16} />;
      case 'image': return <Camera size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--app-text)]">Notas</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-xl bg-[var(--app-light-gray)] text-[var(--app-gray)] hover:bg-[var(--app-dark-gray)] transition-colors">
            <Archive size={20} />
          </button>
        </div>
      </div>

      {/* Quick Add */}
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Nova nota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-[var(--app-light-gray)] border-0 rounded-2xl h-12"
        />
        <button
          onClick={async () => {
            const title = searchQuery.trim();
            if (!title) return;
            try {
              const created = await api.createNote({ title, content: '' });
              setNotes(prev => [{ id: created._id, title: created.title, content: created.content, type: 'text', tags: [], favorite: false, date: new Date().toISOString(), color: 'var(--app-blue)', progress: 0 }, ...prev]);
              setSearchQuery('');
            } catch {
              setNotes(prev => [{ id: Date.now().toString(), title, content: '', type: 'text', tags: [], favorite: false, date: new Date().toISOString(), color: 'var(--app-blue)', progress: 0 }, ...prev]);
              setSearchQuery('');
            }
          }}
          className="px-4 h-12 rounded-2xl bg-[var(--app-blue)] text-white"
        >
          Adicionar
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--app-gray)]" />
        <Input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--app-light-gray)] border-0 rounded-2xl h-12"
        />
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedFilter === filter.id
                ? 'bg-[var(--app-blue)] text-white shadow-lg'
                : 'bg-[var(--app-light-gray)] text-[var(--app-text)] hover:bg-[var(--app-dark-gray)]'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button className="flex flex-col items-center space-y-2 p-4 bg-[var(--app-blue)]15 rounded-2xl hover:bg-[var(--app-blue)]20 transition-colors">
          <FileText size={24} style={{ color: 'var(--app-blue)' }} />
          <span className="text-sm font-medium text-[var(--app-text)]">Texto</span>
        </button>
        <button className="flex flex-col items-center space-y-2 p-4 bg-[var(--app-green)]15 rounded-2xl hover:bg-[var(--app-green)]20 transition-colors">
          <Mic size={24} style={{ color: 'var(--app-green)' }} />
          <span className="text-sm font-medium text-[var(--app-text)]">Áudio</span>
        </button>
        <button className="flex flex-col items-center space-y-2 p-4 bg-[var(--app-yellow)]15 rounded-2xl hover:bg-[var(--app-yellow)]20 transition-colors">
          <Camera size={24} style={{ color: 'var(--app-yellow)' }} />
          <span className="text-sm font-medium text-[var(--app-text)]">Foto</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 gap-4">
        {getFilteredNotes().length === 0 ? (
          <EmptyState title="Sem notas" description="Crie uma nota para começar" />
        ) : getFilteredNotes().map((note) => (
          <Card
            key={note.id}
            className={`p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              selectedNoteId === note.id ? 'ring-2 ring-[var(--app-blue)]' : ''
            }`}
            onClick={() => {
              setSelectedNoteId(note.id);
              startTyping();
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${note.color}15` }}
                >
                  <div style={{ color: note.color }}>
                    {getTypeIcon(note.type)}
                  </div>
                </div>
                <h3 className="font-medium text-[var(--app-text)] line-clamp-1">{note.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                {note.favorite && (
                  <Star size={16} className="text-[var(--app-yellow)] fill-current" />
                )}
                <div className="flex items-center space-x-2">
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-[var(--app-light-gray)]"
                    onClick={async () => {
                      const title = prompt('Editar título', note.title);
                      if (!title) return;
                      try { await api.updateNote(String(note.id), { title }); } catch {}
                      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, title } : n));
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded-lg bg-[var(--app-red)] text-white"
                    onClick={async () => {
                      try { await api.deleteNote(String(note.id)); } catch {}
                      setNotes(prev => prev.filter(n => n.id !== note.id));
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--app-text-light)] mb-3 line-clamp-3">
              {truncateContent(note.content)}
            </p>

            {typeof (note as any).progress === 'number' && (note as any).progress > 0 && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-32 h-2 bg-[var(--app-light-gray)] rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: note.color, width: `${(note as any).progress}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--app-text-light)]">{(note as any).progress}%</span>
                <button
                  className="text-xs px-2 py-1 rounded-lg bg-[var(--app-light-gray)]"
                  onClick={() => {
                    const lines = note.content.split('\n');
                    const idx = lines.findIndex(l => /^- \[[ ]\]/.test(l.trim()));
                    if (idx >= 0) {
                      lines[idx] = lines[idx].replace('- [ ]', '- [x]');
                      const updatedContent = lines.join('\n');
                      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: updatedContent } : n));
                    }
                  }}
                >
                  +1
                </button>
              </div>
            )}

            {note.type === 'audio' && note.duration && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-32 h-2 bg-[var(--app-light-gray)] rounded-full">
                  <div 
                    className="h-2 rounded-full"
                    style={{ backgroundColor: note.color, width: '60%' }}
                  />
                </div>
                <span className="text-xs text-[var(--app-text-light)]">{note.duration}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1 rounded-full bg-[var(--app-light-gray)] text-[var(--app-text-light)]"
                  >
                    <Tag size={10} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 rounded-full bg-[var(--app-light-gray)] text-[var(--app-text-light)]"
                  >
                    +{note.tags.length - 2}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-[var(--app-text-light)]">
                {new Date(note.date).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Typing Indicator */}
            {selectedNoteId === note.id && <TypingIndicator users={typingUsers} />}

            {/* Connection Status */}
            {selectedNoteId === note.id && <ConnectionStatus />}
          </Card>
        ))}
      </div>

      {getFilteredNotes().length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-[var(--app-gray)]" />
          <h3 className="font-medium text-[var(--app-text)] mb-2">Nenhuma nota encontrada</h3>
          <p className="text-sm text-[var(--app-text-light)] mb-4">
            {searchQuery ? 'Tente ajustar sua busca' : 'Comece criando sua primeira nota'}
          </p>
          <button className="flex items-center space-x-2 mx-auto px-4 py-2 bg-[var(--app-blue)] text-white rounded-xl hover:bg-blue-600 transition-colors">
            <Plus size={16} />
            <span>Nova Nota</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesView;