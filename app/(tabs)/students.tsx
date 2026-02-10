import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { studentProfileService } from '@/services/studentProfileService';
import { realDatasetService } from '@/services/realDatasetService';

export default function StudentsScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({ total: 0, byAgeGroup: {}, bySupportLevel: {} });
  const [searchQuery, setSearchQuery] = useState('');

  // Load profiles and stats
  const loadData = useCallback(async () => {
    try {
      console.log('🔄 Loading student profiles...');
      
      // Get all profiles first (including manual ones)
      const [allProfiles, profileStats, activeProfile] = await Promise.all([
        studentProfileService.getAllProfiles(),
        studentProfileService.getProfileStats(),
        studentProfileService.getActiveProfile()
      ]);
      
      console.log(`📊 Found ${allProfiles.length} profiles in storage`);
      console.log(`👤 Profile names: ${allProfiles.map((p: any) => p.studentName).join(', ')}`);
      
      // Try to load real dataset profiles (but don't overwrite manual ones)
      try {
        const result = await realDatasetService.forceReloadRealDataset();
        if (result.success) {
          console.log(`✅ Also loaded real dataset profiles: ${result.profileNames?.join(', ')}`);
          // Reload profiles after dataset load
          const updatedProfiles = await studentProfileService.getAllProfiles();
          setProfiles(updatedProfiles);
          setFilteredProfiles(updatedProfiles);
        } else {
          // Use the profiles we already have
          setProfiles(allProfiles);
          setFilteredProfiles(allProfiles);
        }
      } catch (datasetError: any) {
        console.log('Dataset loading failed, using existing profiles:', datasetError.message);
        setProfiles(allProfiles);
        setFilteredProfiles(allProfiles);
      }
      
      setStats(profileStats);
      setActiveProfileId(activeProfile?.id || null);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen comes into focus (e.g., returning from create profile)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(profile => 
        profile.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.age?.toString().includes(searchQuery) ||
        profile.supportLevels?.overall?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.communicationProfile?.verbalSkills?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.learningProfile?.attentionSpan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.socialProfile?.groupPreference?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSetActiveProfile = async (profileId: string) => {
    try {
      await studentProfileService.setActiveProfile(profileId);
      setActiveProfileId(profileId);
      Alert.alert('Success', 'Active student profile updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to set active profile');
    }
  };

  const handleDeleteProfile = (profileId: string, studentName: string) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${studentName}'s profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentProfileService.deleteProfile(profileId);
              await loadData();
              Alert.alert('Success', 'Profile deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete profile');
            }
          }
        }
      ]
    );
  };

  const getSupportLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#27AE60';
      case 'medium': return '#E67E22';
      case 'high': return '#E74C3C';
      default: return '#8B9DC3';
    }
  };

  const getSupportLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return 'checkmark-circle';
      case 'medium': return 'help-circle';
      case 'high': return 'alert-circle';
      default: return 'help-circle-outline';
    }
  };

  const renderProfileCard = (profile: any) => {
    const isActive = profile.id === activeProfileId;
    const supportLevel = profile.supportLevels?.overall || 'medium';
    
    return (
      <ThemedView key={profile.id} style={[styles.profileCard, isActive && styles.activeProfileCard]}>
        {/* Header with name and active indicator */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.studentName}>
              {profile.studentName || 'Student'}
            </ThemedText>
            <View style={styles.profileMeta}>
              <Text style={styles.ageText}>Age {profile.age || 'Unknown'}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.sourceText}>
                {profile.source === 'dataset' ? '📊 Dataset' : '✏️ Manual'}
              </Text>
            </View>
          </View>
          
          {isActive && (
            <View style={styles.activeIndicator}>
              <Ionicons name="star" size={20} color="#2C3E50" />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>

        {/* Support Level Indicator */}
        <View style={styles.supportLevelContainer}>
          <Ionicons 
            name={getSupportLevelIcon(supportLevel)} 
            size={20} 
            color={getSupportLevelColor(supportLevel)} 
          />
          <Text style={[styles.supportLevelText, { color: getSupportLevelColor(supportLevel) }]}>
            {supportLevel.charAt(0).toUpperCase() + supportLevel.slice(1)} Support
          </Text>
        </View>

        {/* Key Characteristics */}
        <View style={styles.characteristicsContainer}>
          <View style={styles.characteristic}>
            <Text style={styles.characteristicLabel}>Communication:</Text>
            <Text style={styles.characteristicValue}>
              {profile.communicationProfile?.verbalSkills || 'Medium'}
            </Text>
          </View>
          <View style={styles.characteristic}>
            <Text style={styles.characteristicLabel}>Attention:</Text>
            <Text style={styles.characteristicValue}>
              {profile.learningProfile?.attentionSpan || 'Moderate'}
            </Text>
          </View>
          <View style={styles.characteristic}>
            <Text style={styles.characteristicLabel}>Social:</Text>
            <Text style={styles.characteristicValue}>
              {profile.socialProfile?.groupPreference || 'Flexible'}
            </Text>
          </View>
        </View>

        {/* Learning Preferences Tags */}
        <View style={styles.tagsContainer}>
          {(profile.learningProfile?.learningModalities || []).map((modality: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{modality}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!isActive && (
            <TouchableOpacity
              style={styles.setActiveButton}
              onPress={() => handleSetActiveProfile(profile.id)}
            >
              <Ionicons name="star-outline" size={16} color="#2C3E50" />
              <Text style={styles.setActiveButtonText}>Set Active</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/student-detail/${profile.id}`)}
          >
            <Ionicons name="eye-outline" size={16} color="#5DADE2" />
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProfile(profile.id, profile.studentName)}
          >
            <Ionicons name="trash-outline" size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profiles List - Now contains everything */}
      <ScrollView
        style={styles.profilesList}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Student Profiles</ThemedText>
        </ThemedView>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsContentContainer}>
            <ThemedView style={[styles.statCard, { backgroundColor: '#2C3E50' }]}>
              <Ionicons name="people-outline" size={24} color="white" />
              <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Profiles</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { backgroundColor: '#E67E22' }]}>
              <Ionicons name="alert-circle-outline" size={24} color="white" />
              <ThemedText style={styles.statNumber}>{stats.bySupportLevel?.high || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>High Support</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { backgroundColor: '#5DADE2' }]}>
              <Ionicons name="school-outline" size={24} color="white" />
              <ThemedText style={styles.statNumber}>{stats.byAgeGroup?.primary || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>Primary Age</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { backgroundColor: '#7FB8A3' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="white" />
              <ThemedText style={styles.statNumber}>{stats.bySupportLevel?.low || 0}</ThemedText>
              <ThemedText style={styles.statLabel}>Low Support</ThemedText>
            </ThemedView>
          </View>
        </View>

        {/* Search and Controls */}
        <ThemedView style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students by name, age, support level..."
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
            {/* Reload Real Data Button */}
            <TouchableOpacity 
              style={styles.reloadButton}
              onPress={async () => {
                try {
                  console.log('🔄 Manual reload requested...');
                  const result = await realDatasetService.forceReloadRealDataset();
                  if (result.success) {
                    Alert.alert('Success', `Reloaded ${result.profilesLoaded} real profiles: ${result.profileNames?.slice(0, 3).join(', ')}...`);
                    await loadData();
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to reload real dataset');
                }
              }}
            >
              <Ionicons name="refresh-outline" size={18} color="#2C3E50" />
              <ThemedText style={styles.reloadText}>Reload Data</ThemedText>
            </TouchableOpacity>

            {/* Add Student Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/create-profile')}
            >
              <Ionicons name="person-add-outline" size={20} color="#fff" />
              <ThemedText style={styles.primaryButtonText}>Add Student</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
        {filteredProfiles.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9E9E9E" />
            <ThemedText style={styles.emptyStateTitle}>
              {searchQuery ? 'No matching students found' : 'Loading Real Dataset...'}
            </ThemedText>
            <ThemedText style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try adjusting your search terms or clear the search to see all students.'
                : 'Loading autism support profiles from your actual CSV dataset.'
              }
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {filteredProfiles.map(renderProfileCard)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profilesList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
  headerSubtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    fontFamily: 'SF Pro Text',
  },
  statsContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 0,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  statsContentContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 0,
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
  primaryButton: {
    backgroundColor: '#2C3E50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F4F6F8',
    ...Platform.select({
      ios: {
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeProfileCard: {
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34495E',
    fontFamily: 'SF Pro Display',
    letterSpacing: -0.2,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ageText: {
    fontSize: 14,
    color: '#8B9DC3',
    fontFamily: 'SF Pro Text',
  },
  separator: {
    fontSize: 14,
    color: '#8B9DC3',
    marginHorizontal: 8,
    fontFamily: 'SF Pro Text',
  },
  sourceText: {
    fontSize: 14,
    color: '#8B9DC3',
    fontFamily: 'SF Pro Text',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
    marginLeft: 4,
  },
  supportLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportLevelText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  characteristicsContainer: {
    marginBottom: 16,
  },
  characteristic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  characteristicLabel: {
    fontSize: 14,
    color: '#666',
  },
  characteristicValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  setActiveButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
    marginHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Search Styles
  searchContainer: {
    padding: 16,
    paddingHorizontal: 20,
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
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F4F6F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  reloadText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
});