import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/services/storageService';
import { enhancedStorageService } from '@/services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

export default function ResourceLibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = ['All', 'Worksheets', 'Activity Cards', 'Slides', 'Checklists'];

  // Load resources from storage
  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use enhanced storage service with fallback
      let allResources;
      try {
        allResources = await enhancedStorageService.getAllResources();
      } catch (error) {
        console.log('Enhanced storage not available, using basic storage:', error.message);
        allResources = await storageService.getAllResources();
      }
      
      setResources(allResources);
    } catch (error) {
      console.error('Error loading resources:', error);
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

  // Filter resources based on search and filter
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.aetTarget?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         resource.format?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
                         (selectedFilter === 'Activity Cards' && resource.format === 'cards') ||
                         (selectedFilter === 'Worksheets' && resource.format === 'worksheet') ||
                         (selectedFilter === 'Slides' && resource.format === 'slides') ||
                         (selectedFilter === 'Checklists' && resource.format === 'checklist');
    return matchesSearch && matchesFilter;
  });

  const getResourceIcon = (format) => {
    switch (format) {
      case 'worksheet': return 'document-text-outline';
      case 'cards': return 'images-outline';
      case 'slides': return 'easel-outline';
      case 'checklist': return 'checkmark-circle-outline';
      default: return 'document-outline';
    }
  };

  const getResourceColor = (format) => {
    switch (format) {
      case 'worksheet': return '#4CAF50';
      case 'cards': return '#2196F3';
      case 'slides': return '#FF9800';
      case 'checklist': return '#9C27B0';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Resource Library</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Manage and organize your created resources
        </ThemedText>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </ThemedView>
      </ThemedView>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter)}>
            <ThemedText style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources Grid */}
      <ThemedView style={styles.resourcesContainer}>
        <ThemedView style={styles.resourcesHeader}>
          <ThemedText style={styles.resourcesTitle}>
            {filteredResources.length} Resources
          </ThemedText>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel-outline" size={16} color="#666" />
            <ThemedText style={styles.sortText}>Sort</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>Loading resources...</ThemedText>
          </ThemedView>
        ) : filteredResources.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <ThemedText style={styles.emptyTitle}>No Resources Found</ThemedText>
            <ThemedText style={styles.emptyText}>
              {resources.length === 0 
                ? "Create your first resource to get started!" 
                : "Try adjusting your search or filter criteria."}
            </ThemedText>
          </ThemedView>
        ) : (
          filteredResources.map((resource) => (
            <TouchableOpacity key={resource.id} style={styles.resourceCard}>
              <ThemedView style={styles.resourceHeader}>
                <ThemedView style={[styles.resourceIcon, { backgroundColor: getResourceColor(resource.format) + '20' }]}>
                  <Ionicons name={getResourceIcon(resource.format)} size={24} color={getResourceColor(resource.format)} />
                </ThemedView>
                <ThemedView style={styles.resourceInfo}>
                  <ThemedText style={styles.resourceTitle}>{resource.title || 'Untitled Resource'}</ThemedText>
                  <ThemedText style={styles.resourceTarget}>{resource.aetTarget || 'No target specified'}</ThemedText>
                  <ThemedView style={styles.resourceMeta}>
                    <ThemedText style={styles.resourceType}>{resource.format || 'Unknown'}</ThemedText>
                    {resource.studentAge && (
                      <ThemedText style={styles.resourceAge}>Age {resource.studentAge}</ThemedText>
                    )}
                    <ThemedText style={styles.resourceCreated}>{formatDate(resource.createdAt)}</ThemedText>
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </ThemedView>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download-outline" size={20} color="#4CAF50" />
          <ThemedText style={styles.actionText}>Export All</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#2196F3" />
          <ThemedText style={styles.actionText}>Share</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="folder-outline" size={20} color="#FF9800" />
          <ThemedText style={styles.actionText}>Organize</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  resourcesContainer: {
    padding: 16,
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sortText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceTarget: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resourceType: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resourceAge: {
    fontSize: 12,
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resourceCreated: {
    fontSize: 12,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
});