import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { studentProfileService } from '@/services/studentProfileService';
import { datasetIntegrationService } from '@/services/datasetIntegrationService';
import { realDatasetService } from '@/services/realDatasetService';

export default function StudentsScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({ total: 0, byAgeGroup: {}, bySupportLevel: {} });

  // Load profiles and stats
  const loadData = useCallback(async () => {
    try {
      // Force reload real autism diagnosis dataset (ensures fresh data from your CSV)
      console.log('🔄 Loading real autism diagnosis dataset...');
      const result = await realDatasetService.forceReloadRealDataset();
      
      if (result.success) {
        console.log(`✅ Loaded real profiles: ${result.profileNames?.join(', ')}`);
      }
      
      const [allProfiles, profileStats, activeProfile] = await Promise.all([
        studentProfileService.getAllProfiles(),
        studentProfileService.getProfileStats(),
        studentProfileService.getActiveProfile()
      ]);
      
      console.log(`📊 Found ${allProfiles.length} profiles in storage`);
      console.log(`👤 Profile names: ${allProfiles.map((p: any) => p.studentName).join(', ')}`);
      
      setProfiles(allProfiles);
      setStats(profileStats);
      setActiveProfileId(activeProfile?.id || null);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#9E9E9E';
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
              <Ionicons name="star" size={20} color="#4CAF50" />
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
              <Ionicons name="star-outline" size={16} color="#4CAF50" />
              <Text style={styles.setActiveButtonText}>Set Active</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/student-detail/${profile.id}`)}
          >
            <Ionicons name="eye-outline" size={16} color="#2196F3" />
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
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Student Profiles</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Autism support profiles for personalized resources
        </ThemedText>
      </ThemedView>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Profiles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.bySupportLevel?.high || 0}</Text>
          <Text style={styles.statLabel}>High Support</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.byAgeGroup?.primary || 0}</Text>
          <Text style={styles.statLabel}>Primary Age</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/create-profile')}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Add Student</Text>
        </TouchableOpacity>
      </View>

      {/* Profiles List */}
      <ScrollView
        style={styles.profilesList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {profiles.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9E9E9E" />
            <ThemedText style={styles.emptyStateTitle}>Loading Real Dataset...</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              Loading autism support profiles from your actual CSV dataset.
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {/* Real Dataset Notice */}
            <ThemedView style={styles.realDataNotice}>
              <View style={styles.noticeHeader}>
                <Ionicons name="analytics" size={20} color="#4CAF50" />
                <Text style={styles.noticeTitle}>Real Autism Diagnosis Dataset Loaded</Text>
              </View>
              <View style={styles.noticeActions}>
                <TouchableOpacity 
                  style={styles.noticeButton}
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
                  }}>
                  <Text style={styles.noticeButtonText}>Reload Real Data</Text>
                </TouchableOpacity>
              </View>
            </ThemedView>
            
            {profiles.map(renderProfileCard)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
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
  profilesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeProfileCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
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
    fontWeight: 'bold',
    color: '#333',
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ageText: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#666',
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
    color: '#4CAF50',
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
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  // Real Data Notice Styles
  realDataNotice: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#4CAF50',
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  noticeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  noticeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});