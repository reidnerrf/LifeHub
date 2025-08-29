import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useNotes, Note } from '../store/notes';
import IntelligentSearch from '../components/IntelligentSearch';
import AISummary from '../components/AISummary';

const { width } = Dimensions.get('window');

export default function Notes() {
  const t = useTheme();
  const {
    notes,
    notebooks,
    selectedNotebook,
    selectedTags,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    unpinNote,
    archiveNote,
    unarchiveNote,
    addTag,
    removeTag,
    getAllTags,
    getNotesByNotebook,
    getNotesByTag,
    getPinnedNotes,
    getRecentNotes,
    setSelectedNotebook,
    setSelectedTags,
  } = useNotes();

  const [showSearch, setShowSearch] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'text' | 'voice' | 'image'>('text');
  const [newNoteNotebook, setNewNoteNotebook] = useState('Geral');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return 'document-text';
      case 'voice': return 'mic';
      case 'image': return 'image';
      default: return 'document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return t.primary;
      case 'voice': return t.success;
      case 'image': return t.warning;
      default: return t.textLight;
    }
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;

    addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      type: newNoteType,
      notebook: newNoteNotebook,
      tags: [],
      attachments: [],
      isPinned: false,
      isArchived: false,
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteType('text');
    setNewNoteNotebook('Geral');
    setShowCreateModal(false);
  };

  const handleEditNote = (note: Note) => {
    Alert.prompt(
      'Editar Nota',
      'Digite o novo título:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: (title) => {
            if (title && title.trim()) {
              updateNote(note.id, { title: title.trim() });
            }
          }
        }
      ],
      'plain-text',
      note.title
    );
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Excluir Nota',
      `Tem certeza que deseja excluir "${note.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteNote(note.id)
        }
      ]
    );
  };

  const handleTogglePin = (note: Note) => {
    if (note.isPinned) {
      unpinNote(note.id);
    } else {
      pinNote(note.id);
    }
  };

  const handleToggleArchive = (note: Note) => {
    if (note.isArchived) {
      unarchiveNote(note.id);
    } else {
      archiveNote(note.id);
    }
  };

  const handleAddTag = (note: Note) => {
    Alert.prompt(
      'Adicionar Tag',
      'Digite a tag:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: (tag) => {
            if (tag && tag.trim()) {
              addTag(note.id, tag.trim());
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleSelectNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNote(note);
      setShowAISummary(true);
    }
  };

  // Filtrar notas baseado na seleção
  let filteredNotes = notes.filter(note => !note.isArchived);

  if (selectedNotebook) {
    const notebook = notebooks.find(nb => nb.id === selectedNotebook);
    if (notebook) {
      filteredNotes = filteredNotes.filter(note => note.notebook === notebook.name);
    }
  }

  if (selectedTags.length > 0) {
    filteredNotes = filteredNotes.filter(note => 
      selectedTags.some(tag => note.tags.includes(tag))
    );
  }

  // Ordenar: fixadas primeiro, depois por data
  filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const pinnedNotes = getPinnedNotes();
  const recentNotes = getRecentNotes(5);
  const allTags = getAllTags();

  const renderNote = ({ item }: { item: Note }) => {
    const typeIcon = getTypeIcon(item.type);
    const typeColor = getTypeColor(item.type);
    
    return (
      <View style={[styles.noteCard, { backgroundColor: t.card }]}>
        <View style={styles.noteHeader}>
          <View style={styles.noteInfo}>
            <View style={[styles.noteIcon, { backgroundColor: typeColor + '20' }]}>
              <Ionicons name={typeIcon} size={16} color={typeColor} />
            </View>
            <View style={styles.noteDetails}>
              <Text style={[styles.noteTitle, { color: t.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.noteMeta, { color: t.textLight }]}>
                {item.notebook} • {formatDate(item.updatedAt)}
              </Text>
            </View>
          </View>
          
          <View style={styles.noteActions}>
            {item.isPinned && (
              <Ionicons name="pin" size={16} color={t.primary} />
            )}
            <TouchableOpacity onPress={() => handleTogglePin(item)}>
              <Ionicons 
                name={item.isPinned ? "pin" : "pin-outline"} 
                size={16} 
                color={t.textLight} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {item.content && (
          <Text style={[styles.noteContent, { color: t.textLight }]} numberOfLines={3}>
            {item.content}
          </Text>
        )}

        {item.aiSummary && (
          <View style={styles.aiSummary}>
            <Ionicons name="sparkles" size={12} color={t.primary} />
            <Text style={[styles.aiSummaryText, { color: t.textLight }]} numberOfLines={1}>
              {item.aiSummary}
            </Text>
          </View>
        )}

        {item.tags.length > 0 && (
          <View style={styles.noteTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tagBadge, { backgroundColor: t.background }]}>
                <Text style={[styles.tagText, { color: t.textLight }]}>
                  #{tag}
                </Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={[styles.moreTags, { color: t.textLight }]}>
                +{item.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        {item.attachments.length > 0 && (
          <View style={styles.attachments}>
            <Ionicons name="attach" size={12} color={t.textLight} />
            <Text style={[styles.attachmentsText, { color: t.textLight }]}>
              {item.attachments.length} anexo{item.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.noteFooter}>
          <View style={styles.noteActions}>
            <TouchableOpacity
              onPress={() => setSelectedNote(item)}
              style={[styles.actionButton, { backgroundColor: t.primary + '20' }]}
            >
              <Ionicons name="sparkles" size={14} color={t.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleAddTag(item)}
              style={[styles.actionButton, { backgroundColor: t.success + '20' }]}
            >
              <Ionicons name="pricetag" size={14} color={t.success} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleEditNote(item)}
              style={[styles.actionButton, { backgroundColor: t.warning + '20' }]}
            >
              <Ionicons name="create" size={14} color={t.warning} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleToggleArchive(item)}
              style={[styles.actionButton, { backgroundColor: t.textLight + '20' }]}
            >
              <Ionicons name="archive" size={14} color={t.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleDeleteNote(item)}
              style={[styles.actionButton, { backgroundColor: t.error + '20' }]}
            >
              <Ionicons name="trash" size={14} color={t.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Text style={[styles.title, { color: t.text }]}>Notas</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowSearch(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="search" size={20} color={t.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowCreateModal(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="add" size={20} color={t.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filtros */}
        <View style={[styles.filtersCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Filtros</Text>
          
          {/* Cadernos */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: t.textLight }]}>Cadernos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setSelectedNotebook(null)}
                style={[
                  styles.filterChip,
                  { backgroundColor: t.background },
                  !selectedNotebook && { backgroundColor: t.primary + '20' }
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: t.text },
                  !selectedNotebook && { color: t.primary, fontWeight: '600' }
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              
              {notebooks.map((notebook) => (
                <TouchableOpacity
                  key={notebook.id}
                  onPress={() => setSelectedNotebook(notebook.id)}
                  style={[
                    styles.filterChip,
                    { backgroundColor: t.background },
                    selectedNotebook === notebook.id && { backgroundColor: notebook.color + '20' }
                  ]}
                >
                  <Text style={styles.filterChipIcon}>{notebook.icon}</Text>
                  <Text style={[
                    styles.filterChipText,
                    { color: t.text },
                    selectedNotebook === notebook.id && { color: notebook.color, fontWeight: '600' }
                  ]}>
                    {notebook.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          {allTags.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: t.textLight }]}>Tags</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allTags.slice(0, 10).map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    style={[
                      styles.filterChip,
                      { backgroundColor: t.background },
                      selectedTags.includes(tag) && { backgroundColor: t.primary + '20' }
                    ]}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: t.text },
                      selectedTags.includes(tag) && { color: t.primary, fontWeight: '600' }
                    ]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Notas Fixadas */}
        {pinnedNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              📌 Fixadas ({pinnedNotes.length})
            </Text>
            <FlatList
              data={pinnedNotes}
              renderItem={renderNote}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Notas Recentes */}
        {recentNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              📝 Recentes ({filteredNotes.length})
            </Text>
            {filteredNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text" size={64} color={t.textLight} />
                <Text style={[styles.emptyTitle, { color: t.text }]}>
                  Nenhuma Nota Encontrada
                </Text>
                <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                  {selectedNotebook || selectedTags.length > 0 
                    ? 'Tente ajustar os filtros ou criar uma nova nota'
                    : 'Crie sua primeira nota para começar'
                  }
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCreateModal(true)}
                  style={[styles.createButton, { backgroundColor: t.primary }]}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={[styles.createButtonText, { color: '#fff' }]}>
                    Criar Primeira Nota
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredNotes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de Criação */}
      {showCreateModal && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.createModal, { backgroundColor: t.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.text }]}>Nova Nota</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={t.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              {(['text', 'voice', 'image'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewNoteType(type)}
                  style={[
                    styles.typeButton,
                    { backgroundColor: t.background },
                    newNoteType === type && { backgroundColor: getTypeColor(type) + '20' }
                  ]}
                >
                  <Ionicons 
                    name={getTypeIcon(type)} 
                    size={20} 
                    color={newNoteType === type ? getTypeColor(type) : t.textLight} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    { color: t.text },
                    newNoteType === type && { color: getTypeColor(type), fontWeight: '600' }
                  ]}>
                    {type === 'text' ? 'Texto' : type === 'voice' ? 'Voz' : 'Imagem'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.titleInput, { backgroundColor: t.background, color: t.text }]}
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              placeholder="Título da nota"
              placeholderTextColor={t.textLight}
            />

            <TextInput
              style={[styles.contentInput, { backgroundColor: t.background, color: t.text }]}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              placeholder="Conteúdo da nota..."
              placeholderTextColor={t.textLight}
              multiline
              numberOfLines={4}
            />

            <View style={styles.notebookSelector}>
              <Text style={[styles.selectorLabel, { color: t.textLight }]}>Caderno:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {notebooks.map((notebook) => (
                  <TouchableOpacity
                    key={notebook.id}
                    onPress={() => setNewNoteNotebook(notebook.name)}
                    style={[
                      styles.notebookChip,
                      { backgroundColor: t.background },
                      newNoteNotebook === notebook.name && { backgroundColor: notebook.color + '20' }
                    ]}
                  >
                    <Text style={styles.notebookChipIcon}>{notebook.icon}</Text>
                    <Text style={[
                      styles.notebookChipText,
                      { color: t.text },
                      newNoteNotebook === notebook.name && { color: notebook.color, fontWeight: '600' }
                    ]}>
                      {notebook.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={[styles.modalButton, { backgroundColor: t.background }]}
              >
                <Text style={[styles.modalButtonText, { color: t.text }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleCreateNote}
                style={[styles.modalButton, { backgroundColor: t.primary }]}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modais */}
      <IntelligentSearch
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectNote={handleSelectNote}
      />

      <AISummary
        visible={showAISummary}
        onClose={() => setShowAISummary(false)}
        note={selectedNote || undefined}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filtersCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 12,
  },
  section: {
    marginBottom: 16,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noteDetails: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteMeta: {
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  aiSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    gap: 6,
  },
  aiSummaryText: {
    fontSize: 12,
    flex: 1,
  },
  noteTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
  },
  moreTags: {
    fontSize: 10,
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  attachmentsText: {
    fontSize: 12,
  },
  noteFooter: {
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  createModal: {
    width: width - 32,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 14,
  },
  titleInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  contentInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  notebookSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  notebookChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  notebookChipIcon: {
    fontSize: 14,
  },
  notebookChipText: {
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

