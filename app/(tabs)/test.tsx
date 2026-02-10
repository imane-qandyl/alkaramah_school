import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { storageService } from '@/services/storageService';
import { enhancedStorageService } from '@/services/databaseService';
import { enhancedResourceService } from '@/services/enhancedResourceService';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import ResourceEditor from '@/components/ResourceEditor';
import CreateResourceModal from '@/components/CreateResourceModal';

interface Resource {
  id: string;
  title?: string;
  content?: string;
  format?: string;
  aetTarget?: string;
  studentAge?: string;
  studentName?: string;
  studentId?: string;
  createdAt?: string;
  timestamp?: string;
  lastModified?: string;
  source?: string;
  topic?: string;
  hasModelInsights?: boolean;
  provider?: string;
  metadata?: any;
}

export default function ResourceLibraryScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const filterOptions = ['All', 'AI Generated', 'Manual Created', 'Templates', 'Worksheets', 'Activity Cards', 'Slides', 'Checklists'];
  const sortOptions = [
    { key: 'newest', label: 'Newest First' },
    { key: 'oldest', label: 'Oldest First' },
    { key: 'title', label: 'Title A-Z' },
    { key: 'format', label: 'By Format' }
  ];

  // Load resources from storage
  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use enhanced resource service that combines all sources
      const allResources = await enhancedResourceService.getAllResources();
      console.log(`📚 Loaded ${allResources.length} resources from all sources`);
      
      setResources(allResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      // Fallback to basic storage
      try {
        const basicResources = await storageService.getAllResources();
        setResources(basicResources);
      } catch (fallbackError) {
        console.error('Fallback loading also failed:', fallbackError);
        setResources([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload resources when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadResources();
    }, [loadResources])
  );

  // Filter and sort resources
  const filteredAndSortedResources = resources
    .filter(resource => {
      const matchesSearch = resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.aetTarget?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.topic?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = false;
      if (selectedFilter === 'All') {
        matchesFilter = true;
      } else if (selectedFilter === 'AI Generated') {
        matchesFilter = resource.source === 'ai_generated' || resource.format === 'ai_response';
      } else if (selectedFilter === 'Manual Created') {
        matchesFilter = resource.source === 'manual_created' || 
                       (resource.metadata?.createdManually === true) ||
                       (!resource.source && !resource.format?.includes('ai') && !resource.metadata?.isTemplate);
      } else if (selectedFilter === 'Templates') {
        matchesFilter = resource.source === 'template' || resource.format === 'template';
      } else {
        matchesFilter = resource.format?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
                       (selectedFilter === 'Activity Cards' && resource.format === 'cards') ||
                       (selectedFilter === 'Worksheets' && resource.format === 'worksheet') ||
                       (selectedFilter === 'Slides' && resource.format === 'slides') ||
                       (selectedFilter === 'Checklists' && resource.format === 'checklist');
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt || a.timestamp || '').getTime() - new Date(b.createdAt || b.timestamp || '').getTime();
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'format':
          return (a.format || '').localeCompare(b.format || '');
        case 'newest':
        default:
          return new Date(b.createdAt || b.timestamp || '').getTime() - new Date(a.createdAt || a.timestamp || '').getTime();
      }
    });

  const getResourceIcon = (format?: string) => {
    switch (format) {
      case 'worksheet': return 'document-text-outline';
      case 'cards': return 'images-outline';
      case 'slides': return 'easel-outline';
      case 'checklist': return 'checkmark-circle-outline';
      default: return 'document-outline';
    }
  };

  const getResourceColor = (format?: string) => {
    switch (format) {
      case 'worksheet': return '#2C3E50';
      case 'cards': return '#5DADE2';
      case 'slides': return '#E67E22';
      case 'checklist': return '#7FB8A3';
      default: return '#8B9DC3';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const handleResourcePress = (resource: Resource) => {
    // Track resource access
    markResourceAccessed(resource.id);
    setSelectedResource(resource);
    setShowEditor(true);
  };

  const markResourceAccessed = async (resourceId: string) => {
    try {
      // Update access count and last accessed time
      const resource = await storageService.getResourceById(resourceId);
      if (resource) {
        await storageService.updateResource(resourceId, {
          lastAccessed: new Date().toISOString(),
          accessCount: (resource.accessCount || 0) + 1
        });
      }
    } catch (error) {
      console.log('Could not track resource access:', error);
    }
  };

  const handleResourceSave = async (editedContent: string) => {
    try {
      if (!selectedResource) return;
      
      const result = await storageService.updateResource(selectedResource.id, {
        content: editedContent,
        lastModified: new Date().toISOString()
      });
      
      if (result.success) {
        await loadResources();
        Alert.alert('Success', 'Resource updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save resource');
    }
  };

  const handleResourceExport = async (format: string) => {
    Alert.alert('Export', `Resource exported as ${format}`);
  };

  const handleCreateResource = async (resourceData: any) => {
    try {
      console.log('Creating resource:', resourceData);
      
      // Use enhanced resource service for better handling
      const result = await enhancedResourceService.createManualResource(resourceData);
      
      if (result.success) {
        await loadResources();
        Alert.alert(
          'Success! 🎉', 
          `Resource "${resourceData.title}" has been created and added to your library.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create resource');
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      Alert.alert('Error', 'Failed to create resource. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    Alert.alert(
      'Delete Resource',
      'Are you sure you want to delete this resource? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteResource(resourceId);
              await loadResources();
              Alert.alert('Success', 'Resource deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete resource');
            }
          }
        }
      ]
    );
  };

  const handleShareResource = async (resource: Resource) => {
    try {
      await Share.share({
        message: `Check out this resource: ${resource.title}\n\n${resource.content?.substring(0, 200)}...`,
        title: resource.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share resource');
    }
  };

  const getResourceStats = () => {
    const stats = {
      total: resources.length,
      worksheets: resources.filter(r => r.format === 'worksheet').length,
      cards: resources.filter(r => r.format === 'cards').length,
      slides: resources.filter(r => r.format === 'slides').length,
      checklists: resources.filter(r => r.format === 'checklist').length,
    };
    return stats;
  };

  if (showEditor && selectedResource) {
    return (
      <ResourceEditor
        content={selectedResource.content || ''}
        onSave={handleResourceSave}
        onExport={handleResourceExport}
        onClose={() => {
          setShowEditor(false);
          setSelectedResource(null);
        }}
      />
    );
  }

  const stats = getResourceStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Resource Library</ThemedText>
      </ThemedView>

      {/* Statistics Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <ThemedView style={[styles.statCard, { backgroundColor: '#2C3E50' }]}>
          <Ionicons name="library-outline" size={24} color="white" />
          <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
          <ThemedText style={styles.statLabel}>Total </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: '#5DADE2' }]}>
          <Ionicons name="document-text-outline" size={24} color="white" />
          <ThemedText style={styles.statNumber}>{stats.worksheets}</ThemedText>
          <ThemedText style={styles.statLabel}>Worksheets</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: '#E67E22' }]}>
          <Ionicons name="images-outline" size={24} color="white" />
          <ThemedText style={styles.statNumber}>{stats.cards}</ThemedText>
          <ThemedText style={styles.statLabel}>Activity Cards</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.statCard, { backgroundColor: '#7FB8A3' }]}>
          <Ionicons name="easel-outline" size={24} color="white" />
          <ThemedText style={styles.statNumber}>{stats.slides}</ThemedText>
          <ThemedText style={styles.statLabel}>Slides</ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Search and Controls */}
      <ThemedView style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.controlsRow}>
          {/* Sort Dropdown */}
          <TouchableOpacity style={styles.sortButton} onPress={() => {
            Alert.alert(
              'Sort Resources',
              'Choose sorting option',
              sortOptions.map(option => ({
                text: option.label,
                onPress: () => setSortBy(option.key)
              }))
            );
          }}>
            <Ionicons name="funnel-outline" size={18} color="#2C3E50" />
            <ThemedText style={styles.sortText}>Sort</ThemedText>
          </TouchableOpacity>

          {/* Create Resource Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-outline" size={20} color="#fff" />
            <ThemedText style={styles.primaryButtonText}>Create Resource</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <ThemedText style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText
            ]}>
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <Ionicons name="library-outline" size={48} color="#ccc" />
          <ThemedText style={styles.loadingText}>Loading your resources...</ThemedText>
        </ThemedView>
      ) : filteredAndSortedResources.length === 0 ? (
        /* Empty State */
        <ThemedView style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyTitle}>
            {searchQuery || selectedFilter !== 'All' ? 'No matching resources' : 'No resources yet'}
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            {searchQuery || selectedFilter !== 'All' 
              ? 'Try adjusting your search or filter'
              : 'Create your first resource using the AI Chat tab'
            }
          </ThemedText>
          {(!searchQuery && selectedFilter === 'All') && (
            <>
              <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <ThemedText style={styles.createButtonText}>Create Resource</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.createButton, { backgroundColor: '#5DADE2', marginTop: 12 }]} onPress={async () => {
                try {
                  const { addSampleResources } = await import('@/scripts/addSampleData');
                  const result = await addSampleResources();
                  if (result.success) {
                    await loadResources();
                    Alert.alert('Success', `Added ${result.count || 5} sample resources to your library!`);
                  } else {
                    Alert.alert('Info', result.message || 'Sample resources already exist');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to add sample resources');
                }
              }}>
                <Ionicons name="library-outline" size={20} color="white" />
                <ThemedText style={styles.createButtonText}>Add Sample Resources</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ThemedView>
      ) : (
        /* Resources Grid */
        <View style={styles.resourcesGrid}>
          {filteredAndSortedResources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={() => handleResourcePress(resource)}
            >
              <View style={styles.resourceHeader}>
                <View style={[styles.resourceIcon, { backgroundColor: getResourceColor(resource.format) }]}>
                  <Ionicons name={getResourceIcon(resource.format)} size={24} color="white" />
                </View>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => {
                    Alert.alert(
                      resource.title || 'Resource Options',
                      'Choose an action',
                      [
                        { text: 'Edit', onPress: () => handleResourcePress(resource) },
                        { text: 'Share', onPress: () => handleShareResource(resource) },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteResource(resource.id) },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Ionicons name="ellipsis-vertical" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ThemedText style={styles.resourceTitle} numberOfLines={2}>
                {resource.title || 'Untitled Resource'}
              </ThemedText>
              
              {resource.aetTarget && (
                <ThemedText style={styles.resourceTarget} numberOfLines={1}>
                  {resource.aetTarget}
                </ThemedText>
              )}
              
              <View style={styles.resourceMeta}>
                <View style={[styles.badge, { backgroundColor: getResourceColor(resource.format) }]}>
                  <ThemedText style={styles.badgeText}>
                    {resource.format ? (resource.format.charAt(0).toUpperCase() + resource.format.slice(1)) : 'Resource'}
                  </ThemedText>
                </View>
                
                {resource.studentAge && (
                  <View style={styles.ageBadge}>
                    <ThemedText style={styles.ageBadgeText}>
                      Age {resource.studentAge}
                    </ThemedText>
                  </View>
                )}
              </View>
              
              <ThemedText style={styles.resourceDate}>
                {formatDate(resource.createdAt || resource.timestamp)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      {filteredAndSortedResources.length > 0 && (
        <ThemedView style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {
            Alert.alert('Export All', 'Export all resources feature coming soon!');
          }}>
            <Ionicons name="download-outline" size={20} color="#2C3E50" />
            <ThemedText style={styles.actionText}>Export All</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {
            Alert.alert('Share Library', 'Share library feature coming soon!');
          }}>
            <Ionicons name="share-outline" size={20} color="#2C3E50" />
            <ThemedText style={styles.actionText}>Share Library</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {
            Alert.alert('Organize', 'Organization features coming soon!');
          }}>
            <Ionicons name="folder-outline" size={20} color="#2C3E50" />
            <ThemedText style={styles.actionText}>Organize</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Create Resource Modal */}
      <CreateResourceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateResource}
      />

      {/* Floating Action Button */}
      {filteredAndSortedResources.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingActionButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 4,
    fontFamily: 'SF Pro Display',
    letterSpacing: -0.4,
  },
  createResourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createResourceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    fontFamily: 'SF Pro Text',
  },
  statsContainer: {
    paddingVertical: 16,
    paddingLeft: 20,
    backgroundColor: '#fff',
  },
  statCard: {
    width: 120,
    height: 100,
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#34495E',
    fontFamily: 'SF Pro Text',
  },
  clearButton: {
    padding: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2C3E50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F4F6F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  sortText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F4F6F8',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  activeFilterTab: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  filterText: {
    fontSize: 14,
    color: '#8B9DC3',
    fontWeight: '500',
    fontFamily: 'SF Pro Text',
  },
  activeFilterText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B9DC3',
    marginTop: 16,
    fontFamily: 'SF Pro Text',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'SF Pro Display',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'SF Pro Text',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resourcesGrid: {
    padding: 16,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F4F6F8',
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moreButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 4,
    lineHeight: 24,
    fontFamily: 'SF Pro Display',
  },
  resourceTarget: {
    fontSize: 14,
    color: '#8B9DC3',
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: 'SF Pro Text',
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  ageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F4F6F8',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  ageBadgeText: {
    fontSize: 12,
    color: '#5DADE2',
    fontWeight: '500',
    fontFamily: 'SF Pro Text',
  },
  resourceDate: {
    fontSize: 12,
    color: '#8B9DC3',
    fontFamily: 'SF Pro Text',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    marginTop: 6,
    color: '#8B9DC3',
    fontWeight: '500',
    fontFamily: 'SF Pro Text',
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});