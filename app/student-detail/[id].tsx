import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { studentProfileService } from '@/services/studentProfileService';

interface StudentProfile {
  id: string;
  studentName?: string;
  age?: number;
  source?: string;
  supportLevels?: {
    [key: string]: string;
  };
  learningProfile?: {
    attentionSpan?: string;
    processingSpeed?: string;
    learningModalities?: string[];
  };
  communicationProfile?: {
    verbalSkills?: string;
    preferredModes?: string[];
  };
  socialProfile?: {
    groupPreference?: string;
    peerInteraction?: string;
  };
  educationalRecommendations?: {
    instructionalStrategies?: string[];
    environmentalModifications?: string[];
  };
}

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      if (typeof id === 'string') {
        const studentProfile = await studentProfileService.getProfileById(id);
        setProfile(studentProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async () => {
    try {
      if (typeof id === 'string') {
        await studentProfileService.setActiveProfile(id);
        Alert.alert('Success', 'Profile set as active for resource generation!');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set active profile');
    }
  };

  const getSupportLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Profile not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Student Profile</ThemedText>
        <TouchableOpacity onPress={handleSetActive} style={styles.setActiveButton}>
          <Ionicons name="star-outline" size={20} color="#4CAF50" />
          <Text style={styles.setActiveText}>Set Active</Text>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.studentName}>
            {profile.studentName || 'Student Profile'}
          </ThemedText>
          <View style={styles.basicInfo}>
            <Text style={styles.infoItem}>Age: {profile.age || 'Unknown'}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.infoItem}>
              {profile.source === 'dataset' ? '📊 From Dataset' : '✏️ Manual Entry'}
            </Text>
          </View>
        </ThemedView>

        {/* Support Levels */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Support Levels</ThemedText>
          <View style={styles.supportGrid}>
            {profile.supportLevels && Object.entries(profile.supportLevels).map(([domain, level]) => (
              <View key={domain} style={styles.supportItem}>
                <Text style={styles.supportDomain}>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </Text>
                <View style={[styles.supportBadge, { backgroundColor: getSupportLevelColor(level) }]}>
                  <Text style={styles.supportLevel}>{level}</Text>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Learning Profile */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Learning Profile</ThemedText>
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attention Span:</Text>
              <Text style={styles.detailValue}>
                {profile.learningProfile?.attentionSpan || 'Moderate'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processing Speed:</Text>
              <Text style={styles.detailValue}>
                {profile.learningProfile?.processingSpeed || 'Moderate'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Learning Modalities:</Text>
              <View style={styles.modalitiesContainer}>
                {(profile.learningProfile?.learningModalities || []).map((modality: string, index: number) => (
                  <View key={index} style={styles.modalityTag}>
                    <Text style={styles.modalityText}>{modality}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Communication Profile */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Communication</ThemedText>
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Verbal Skills:</Text>
              <Text style={styles.detailValue}>
                {profile.communicationProfile?.verbalSkills || 'Medium'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preferred Modes:</Text>
              <Text style={styles.detailValue}>
                {(profile.communicationProfile?.preferredModes || []).join(', ') || 'Mixed'}
              </Text>
            </View>
          </View>
        </ThemedView>

        {/* Social Profile */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Social Interaction</ThemedText>
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Group Preference:</Text>
              <Text style={styles.detailValue}>
                {profile.socialProfile?.groupPreference || 'Flexible'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Peer Interaction:</Text>
              <Text style={styles.detailValue}>
                {profile.socialProfile?.peerInteraction || 'Medium'}
              </Text>
            </View>
          </View>
        </ThemedView>

        {/* Educational Recommendations */}
        {profile.educationalRecommendations && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Teaching Recommendations</ThemedText>
            
            {profile.educationalRecommendations?.instructionalStrategies && profile.educationalRecommendations.instructionalStrategies.length > 0 && (
              <View style={styles.recommendationGroup}>
                <Text style={styles.recommendationTitle}>Instructional Strategies:</Text>
                {profile.educationalRecommendations.instructionalStrategies.map((strategy: string, index: number) => (
                  <Text key={index} style={styles.recommendationItem}>• {strategy}</Text>
                ))}
              </View>
            )}

            {profile.educationalRecommendations?.environmentalModifications && profile.educationalRecommendations.environmentalModifications.length > 0 && (
              <View style={styles.recommendationGroup}>
                <Text style={styles.recommendationTitle}>Environmental Modifications:</Text>
                {profile.educationalRecommendations.environmentalModifications.map((mod: string, index: number) => (
                  <Text key={index} style={styles.recommendationItem}>• {mod}</Text>
                ))}
              </View>
            )}
          </ThemedView>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.generateButton} onPress={() => router.push('/bar/chat')}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.generateButtonText}>Generate Resource</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  setActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  setActiveText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    fontSize: 16,
    color: '#666',
  },
  separator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  supportGrid: {
    gap: 12,
  },
  supportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  supportDomain: {
    fontSize: 16,
    color: '#333',
  },
  supportBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  supportLevel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  profileDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  modalitiesContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalityText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  recommendationGroup: {
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 40,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 16,
  },
});