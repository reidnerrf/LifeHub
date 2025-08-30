import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useNotes, SearchResult } from '../store/notes';

const { width } = Dimensions.get('window');

interface IntelligentSearchProps {
  visible: boolean;
  onClose: () => void;
  onSelectNote?: (noteId: string) => void;
}

export default function IntelligentSearch({ visible, onClose, onSelectNote }: IntelligentSearchProps) {
  const t = useTheme();
  const {
    searchNotes,
    getSearchSuggestions,
    searchHistory,
    setSearchQuery,
    searchQuery,
    setIsSearching
  } = useNotes();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const newSuggestions = getSearchSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
      
      // Realizar busca com debounce
      const timeoutId = setTimeout(() => {
        setIsSearching(true);
        const results = searchNotes(query);
        setSearchResults(results);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setSearchQuery(searchTerm);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleSelectNote = (noteId: string) => {
    onSelectNote?.(noteId);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const { note, relevance, matchedFields, highlights } = item;
    
    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: t.card }]}
        onPress={() => handleSelectNote(note.id)}
      >
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <View style={styles.resultIcon}>
              <Ionicons 
                name={getTypeIcon(note.type)} 
                size={16} 
                color={getTypeColor(note.type)} 
              />
            </View>
            <View style={styles.resultDetails}>
              <Text style={[styles.resultTitle, { color: t.text }]}>
                {note.title}
              </Text>
              <Text style={[styles.resultNotebook, { color: t.textLight }]}>
                {note.notebook}
              </Text>
            </View>
          </View>
          
          <View style={styles.resultActions}>
            {note.isPinned && (
              <Ionicons name="pin" size={16} color={t.primary} />
            )}
            <View style={[styles.relevanceBadge, { backgroundColor: t.primary + '20' }]}>
              <Text style={[styles.relevanceText, { color: t.primary }]}>
                {relevance}
              </Text>
            </View>
          </View>
        </View>

        {note.content && (
          <Text style={[styles.resultContent, { color: t.textLight }]} numberOfLines={2}>
            {note.content}
          </Text>
        )}

        {note.aiSummary && (
          <View style={styles.aiSummary}>
            <Ionicons name="sparkles" size={12} color={t.primary} />
            <Text style={[styles.aiSummaryText, { color: t.textLight }]} numberOfLines={1}>
              {note.aiSummary}
            </Text>
          </View>
        )}

        {note.tags.length > 0 && (
          <View style={styles.resultTags}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tagBadge, { backgroundColor: t.background }]}>
                <Text style={[styles.tagText, { color: t.textLight }]}>
                  #{tag}
                </Text>
              </View>
            ))}
            {note.tags.length > 3 && (
              <Text style={[styles.moreTags, { color: t.textLight }]}>
                +{note.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        {note.attachments.length > 0 && (
          <View style={styles.attachments}>
            <Ionicons name="attach" size={12} color={t.textLight} />
            <Text style={[styles.attachmentsText, { color: t.textLight }]}>
              {note.attachments.length} anexo{note.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {highlights.length > 0 && (
          <View style={styles.highlights}>
            <Text style={[styles.highlightsLabel, { color: t.textLight }]}>
              Encontrado em: {matchedFields.join(', ')}
            </Text>
            <Text style={[styles.highlightsText, { color: t.primary }]}>
              "{highlights.slice(0, 2).join(', ')}"
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: t.card }]}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Ionicons name="search" size={16} color={t.textLight} />
      <Text style={[styles.suggestionText, { color: t.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: t.card }]}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Ionicons name="time" size={16} color={t.textLight} />
      <Text style={[styles.historyText, { color: t.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={t.textLight} />
            <TextInput
              style={[styles.searchInput, { color: t.text }]}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar em notas..."
              placeholderTextColor={t.textLight}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={t.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Sugestões
              </Text>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Histórico de Busca */}
          {!query && searchHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Buscas Recentes
              </Text>
              <FlatList
                data={searchHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Resultados da Busca */}
          {query && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Resultados ({searchResults.length})
                </Text>
                {searchResults.length > 0 && (
                  <Text style={[styles.resultsSubtitle, { color: t.textLight }]}>
                    Ordenados por relevância
                  </Text>
                )}
              </View>

              {searchResults.length === 0 && query.length > 0 ? (
                <View style={styles.noResults}>
                  <Ionicons name="search" size={48} color={t.textLight} />
                  <Text style={[styles.noResultsTitle, { color: t.text }]}>
                    Nenhum resultado encontrado
                  </Text>
                  <Text style={[styles.noResultsText, { color: t.textLight }]}>
                    Tente usar palavras-chave diferentes ou verificar a ortografia
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.note.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {/* Dicas de Busca */}
          {!query && (
            <View style={[styles.tipsSection, { backgroundColor: t.card }]}>
              <Text style={[styles.tipsTitle, { color: t.text }]}>
                💡 Dicas de Busca
              </Text>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={t.success} />
                <Text style={[styles.tipText, { color: t.textLight }]}>
                  Use aspas para buscar frases exatas
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={t.success} />
                <Text style={[styles.tipText, { color: t.textLight }]}>
                  Busque por tags usando #
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={t.success} />
                <Text style={[styles.tipText, { color: t.textLight }]}>
                  Use palavras-chave para encontrar conteúdo específico
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={t.success} />
                <Text style={[styles.tipText, { color: t.textLight }]}>
                  As notas fixadas aparecem primeiro nos resultados
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  suggestionsSection: {
    marginBottom: 20,
  },
  historySection: {
    marginBottom: 20,
  },
  resultsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  suggestionText: {
    fontSize: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultDetails: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultNotebook: {
    fontSize: 12,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relevanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  relevanceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resultContent: {
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
  resultTags: {
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
  highlights: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 8,
    borderRadius: 6,
  },
  highlightsLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  highlightsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
});