import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, Dimensions, Text, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { storageService } from '@/services/storageService';
import { enhancedStorageService } from '@/services/databaseService';
import { aiService } from '@/services/aiService';
import { studentProfileService } from '@/services/studentProfileService';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Define types for better type safety
interface Resource {
  id: string;
  title?: string;
  format?: string;
  studentAge?: number;
  abilityLevel?: string;
  createdAt?: string;
  timestamp?: string;
  [key: string]: any;
}

interface ResourceStats {
  total: number;
}

interface UserSettings {
  defaultFormat?: string;
  defaultAgeGroup?: string;
  visualSupport?: boolean;
}

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  studentAge?: number;
}

export default function TeacherProfileScreen() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState({
    resourcesCreated: 0,
    studentsHelped: 0,
    hourssSaved: 0,
    weeklyProgress: 0,
    monthlyGoal: 20,
    totalSessions: 0,
    avgSessionTime: 0
  });
  
  const [settings, setSettings] = useState({
    defaultFormat: 'worksheet',
    defaultAgeGroup: '6-8 years',
    visualSupport: 'Always Include'
  });

  const [teacherInfo, setTeacherInfo] = useState({
    name: "Teacher",
    role: "Educator", 
    school: "Welcome to TeachSmart",
    experience: "Creating autism-friendly resources",
    specialization: "AET-aligned learning materials",
    joinDate: new Date().toISOString(),
    certifications: [] as string[],
    achievements: [] as string[]
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load comprehensive profile data
  const loadData = useCallback(async () => {
    try {
      // Use enhanced storage service with fallback
      let resourceStats, userSettings, resources, profileStats;
      
      try {
        resourceStats = await enhancedStorageService.getResourceStats();
        userSettings = await enhancedStorageService.getSettings();
        resources = await enhancedStorageService.getAllResources();
      } catch (error) {
        console.log('Enhanced storage not available, using basic storage:', (error as Error).message);
        resourceStats = await storageService.getResourceStats();
        userSettings = await storageService.getSettings();
        resources = await storageService.getAllResources();
      }
      
      // Get student profile statistics
      profileStats = await studentProfileService.getProfileStats();
      
      // Calculate advanced statistics
      const uniqueStudents = new Set();
      let totalTimesSaved = 0;
      let totalSessions = 0;
      const ageGroups = new Set<number>();
      const formats = new Set<string>();
      const recentResources: ActivityItem[] = [];
      
      // Calculate weekly progress
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      let weeklyResources = 0;
      
      resources.forEach((resource: Resource) => {
        if (resource.studentAge) {
          uniqueStudents.add(`${resource.studentAge}-${resource.abilityLevel}`);
          ageGroups.add(resource.studentAge);
        }
        if (resource.format) {
          formats.add(resource.format);
        }
        totalTimesSaved += 0.5; // 30 minutes per resource
        totalSessions += 1;
        
        // Check if created this week
        const resourceDate = new Date(resource.createdAt || resource.timestamp || new Date());
        if (resourceDate > oneWeekAgo) {
          weeklyResources++;
        }
        
        // Add to recent activity
        if (recentResources.length < 5) {
          recentResources.push({
            id: resource.id || `resource_${recentResources.length}`,
            title: resource.title || 'Untitled Resource',
            type: resource.format || 'worksheet',
            createdAt: resource.createdAt || resource.timestamp || new Date().toISOString(),
            studentAge: resource.studentAge
          });
        }
      });

      // Calculate average session time (estimate)
      const avgSessionTime = totalSessions > 0 ? Math.round((totalTimesSaved * 60) / totalSessions) : 0;

      setStats({
        resourcesCreated: resourceStats.total,
        studentsHelped: Math.max(uniqueStudents.size, profileStats.total),
        hourssSaved: Math.round(totalTimesSaved),
        weeklyProgress: weeklyResources,
        monthlyGoal: 20,
        totalSessions: totalSessions,
        avgSessionTime: avgSessionTime
      });

      // Enhanced settings display
      const formatLabels: { [key: string]: string } = {
        worksheet: 'Worksheet',
        cards: 'Activity Cards', 
        slides: 'Presentation',
        checklist: 'Checklist'
      };

      setSettings({
        defaultFormat: formatLabels[userSettings.defaultFormat || 'worksheet'] || 'Worksheet',
        defaultAgeGroup: userSettings.defaultAgeGroup || '6-8 years',
        visualSupport: userSettings.visualSupport ? 'Always Include' : 'Optional'
      });

      // Enhanced teacher info based on usage patterns
      const ageArray = Array.from(ageGroups);
      const mostUsedAgeGroup = ageArray.length > 0 ? `Ages ${Math.min(...ageArray)}-${Math.max(...ageArray)}` : 'All ages';
      const mostUsedFormat = formats.size > 0 ? Array.from(formats)[0] : 'various formats';
      const joinDate = new Date();
      joinDate.setMonth(joinDate.getMonth() - Math.floor(Math.random() * 12)); // Simulate join date
      
      // Generate achievements based on usage
      const achievements: string[] = [];
      if (resourceStats.total >= 10) achievements.push('Resource Creator');
      if (resourceStats.total >= 50) achievements.push('Master Educator');
      if (uniqueStudents.size >= 5) achievements.push('Student Advocate');
      if (weeklyResources >= 5) achievements.push('Weekly Champion');
      
      setTeacherInfo({
        name: user?.fullName || "Teacher",
        role: resourceStats.total > 10 ? "Senior Educator" : resourceStats.total > 0 ? "Active Educator" : "Getting Started",
        school: resourceStats.total > 0 ? `${resourceStats.total} resources created` : "Welcome to TeachSmart",
        experience: resourceStats.total > 0 ? `Working with ${mostUsedAgeGroup}` : "Ready to create resources",
        specialization: resourceStats.total > 0 ? `Specializing in ${mostUsedFormat}` : "AET-aligned learning materials",
        joinDate: joinDate.toISOString(),
        certifications: ['Autism Education Trust (AET)', 'Special Educational Needs'],
        achievements: achievements
      });

      // Set recent activity
      setRecentActivity(recentResources.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getProgressPercentage = () => {
    if (stats.monthlyGoal === 0) return 0;
    return Math.min((stats.resourcesCreated / stats.monthlyGoal) * 100, 100);
  };

  const getWeeklyProgressPercentage = () => {
    const weeklyGoal = 5;
    return Math.min((stats.weeklyProgress / weeklyGoal) * 100, 100);
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const created = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getExperienceLevel = () => {
    if (stats.resourcesCreated >= 100) return 'Expert';
    if (stats.resourcesCreated >= 50) return 'Advanced';
    if (stats.resourcesCreated >= 20) return 'Intermediate';
    if (stats.resourcesCreated >= 5) return 'Developing';
    return 'Beginner';
  };

  const handleEditProfile = useCallback(() => {
    Alert.alert('Edit Profile', 'Profile editing will be available in a future update.');
  }, []);

  const handleSettings = useCallback(() => {
    Alert.alert('Settings', 'Advanced settings will be available in a future update.');
  }, []);

  const handleViewCertifications = useCallback(() => {
    const certText = teacherInfo.certifications.length > 0 
      ? teacherInfo.certifications.join('\n• ') 
      : 'No certifications added yet';
    Alert.alert('Certifications', `• ${certText}`);
  }, [teacherInfo.certifications]);

  const handleViewAchievements = useCallback(() => {
    const achievementText = teacherInfo.achievements.length > 0 
      ? teacherInfo.achievements.join('\n🏆 ') 
      : 'Keep creating resources to unlock achievements!';
    Alert.alert('Achievements', `🏆 ${achievementText}`);
  }, [teacherInfo.achievements]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // The AuthContext will update and root layout will handle navigation
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  }, [logout]);

  const handleTestConnection = useCallback(async () => {
    setIsTestingConnection(true);
    try {
      const result = await aiService.testConnection();
      
      if (result.success) {
        Alert.alert(
          'Azure OpenAI Connected! ☁️',
          `Azure OpenAI is working correctly.\n\nModel: ${result.model}\nResponse: ${result.response || 'Connected successfully'}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        const config = result.config as any || {};
        Alert.alert(
          'Azure OpenAI Failed ❌',
          `${result.error}\n\nConfiguration:\n• Endpoint: ${config.endpoint || 'Not set'}\n• API Version: ${config.apiVersion || 'Not set'}\n• Deployment: ${config.deploymentName || 'Not set'}\n• API Key: ${config.hasApiKey ? 'Set' : 'Missing'}\n\nPlease check your configuration.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Test Failed',
        `An error occurred while testing Azure OpenAI: ${(error as Error).message}`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  const handleTestTrainedChatbot = useCallback(async () => {
    setIsTestingConnection(true);
    try {
      // Import the service dynamically to avoid circular imports
      const { trainedChatbotService } = await import('@/services/trainedChatbotService');
      const result = await trainedChatbotService.testConnection();
      
      if (result.success) {
        Alert.alert(
          'Trained Chatbot Connected! 🤖',
          `Your local trained model is working correctly.\n\nModel: ${result.model}\nProvider: ${result.provider}`,
          [{ text: 'Excellent!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Trained Chatbot Not Available 🤖',
          `${result.error}\n\n${result.suggestion || 'Make sure the Python server is running.'}\n\nTo start the server:\n1. Open Terminal\n2. cd python-server\n3. ./start_server.sh`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Test Failed',
        `An error occurred while testing the trained chatbot: ${(error as Error).message}`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  const handleTestAllServices = useCallback(async () => {
    setIsTestingConnection(true);
    try {
      const results = await aiService.testAllConnections() as any;
      
      let message = 'AI Services Status:\n\n';
      
      // Trained Chatbot
      if (results.trainedChatbot?.success) {
        message += '🤖 Trained Chatbot: ✅ Connected\n';
      } else {
        message += '🤖 Trained Chatbot: ❌ Not Available\n';
      }
      
      // Azure OpenAI
      if (results.azureOpenAI?.success) {
        message += '☁️ Azure OpenAI: ✅ Connected\n';
      } else {
        message += '☁️ Azure OpenAI: ❌ Not Available\n';
      }
      
      // Mock (always available)
      message += '🎭 Mock Service: ✅ Always Available\n\n';
      
      // Priority order
      message += 'Priority Order:\n1. Trained Chatbot (Best)\n2. Azure OpenAI\n3. Mock Responses';
      
      Alert.alert(
        'All AI Services Test Results',
        message,
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Test Failed',
        `An error occurred while testing AI services: ${(error as Error).message}`,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#2C3E50', dark: '#1A1D23' }}
          headerImage={
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.headerInfo}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color="rgba(255,255,255,0.9)" />
                    <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                      <Ionicons name="camera" size={16} color="#2C3E50" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.headerText}>
                    <Text style={styles.headerName}>{teacherInfo.name}</Text>
                    <Text style={styles.headerRole}>{teacherInfo.role}</Text>
                    <Text style={styles.headerExperience}>{getExperienceLevel()} Level</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
                  <Ionicons name="log-out" size={24} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              </View>
              
              {/* Header Stats */}
              <View style={styles.headerStats}>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{stats.resourcesCreated}</Text>
                  <Text style={styles.headerStatLabel}>Resources</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{stats.studentsHelped}</Text>
                  <Text style={styles.headerStatLabel}>Students</Text>
                </View>
                <View style={styles.headerStat}>
                  <Text style={styles.headerStatValue}>{stats.hourssSaved}h</Text>
                  <Text style={styles.headerStatLabel}>Time Saved</Text>
                </View>
              </View>
            </View>
          }>

        {/* Professional Summary */}
        <ThemedView style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="briefcase" size={24} color="#2C3E50" />
            <Text style={styles.summaryTitle}>Professional Summary</Text>
          </View>
          <Text style={styles.summaryText}>{teacherInfo.experience}</Text>
          <Text style={styles.summarySpecialty}>Specialization: {teacherInfo.specialization}</Text>
          
          <View style={styles.summaryActions}>
            <TouchableOpacity style={styles.summaryAction} onPress={handleViewCertifications}>
              <Ionicons name="school" size={16} color="#2C3E50" />
              <Text style={styles.summaryActionText}>Certifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.summaryAction} onPress={handleViewAchievements}>
              <Ionicons name="trophy" size={16} color="#E67E22" />
              <Text style={styles.summaryActionText}>Achievements</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <ThemedView style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('./test')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.activityList}>
              {recentActivity.slice(0, 3).map((activity, index) => (
                <View key={activity.id || index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons 
                      name={activity.type === 'cards' ? 'images' : 'document-text'} 
                      size={16} 
                      color="#2C3E50" 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {activity.title}
                    </Text>
                    <Text style={styles.activityMeta}>
                      {activity.studentAge ? `Age ${activity.studentAge} • ` : ''}{formatTimeAgo(activity.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.activityAction}>
                    <Ionicons name="chevron-forward" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ThemedView>
        )}



        {/* AI Configuration */}
        <ThemedView style={styles.aiConfigCard}>
          <Text style={styles.sectionTitle}>AI Configuration</Text>
          
          {/* Azure OpenAI Test */}
          <TouchableOpacity 
            style={[styles.testConnectionButton, isTestingConnection && styles.testConnectionButtonDisabled]}
            onPress={handleTestConnection}
            disabled={isTestingConnection}>
            <View style={styles.testConnectionContent}>
              <Ionicons name="cloud-outline" size={24} color={isTestingConnection ? "#999" : "#2C3E50"} />
              <View style={styles.testConnectionText}>
                <Text style={[styles.testConnectionTitle, isTestingConnection && styles.testConnectionTitleDisabled]}>
                  Test Azure OpenAI Connection
                </Text>
                <Text style={styles.testConnectionSubtitle}>
                  Verify your cloud AI service is working
                </Text>
              </View>
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="#999" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#2C3E50" />
              )}
            </View>
          </TouchableOpacity>

          {/* Trained Chatbot Test */}
          <TouchableOpacity 
            style={[styles.testConnectionButton, isTestingConnection && styles.testConnectionButtonDisabled, { marginTop: 12 }]}
            onPress={handleTestTrainedChatbot}
            disabled={isTestingConnection}>
            <View style={styles.testConnectionContent}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={isTestingConnection ? "#999" : "#5DADE2"} />
              <View style={styles.testConnectionText}>
                <Text style={[styles.testConnectionTitle, isTestingConnection && styles.testConnectionTitleDisabled]}>
                  Test Trained Chatbot Model
                </Text>
                <Text style={styles.testConnectionSubtitle}>
                  Verify your local trained model is running
                </Text>
              </View>
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="#999" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#5DADE2" />
              )}
            </View>
          </TouchableOpacity>

          {/* Test All Services */}
          <TouchableOpacity 
            style={[styles.testAllButton, isTestingConnection && styles.testConnectionButtonDisabled]}
            onPress={handleTestAllServices}
            disabled={isTestingConnection}>
            <View style={styles.testConnectionContent}>
              <Ionicons name="checkmark-done-outline" size={24} color={isTestingConnection ? "#999" : "#E67E22"} />
              <View style={styles.testConnectionText}>
                <Text style={[styles.testConnectionTitle, isTestingConnection && styles.testConnectionTitleDisabled]}>
                  Test All AI Services
                </Text>
                <Text style={styles.testConnectionSubtitle}>
                  Check all available AI providers
                </Text>
              </View>
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="#999" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#E67E22" />
              )}
            </View>
          </TouchableOpacity>
        </ThemedView>



        {/* Support & Help */}
        <ThemedView style={styles.supportCard}>
          <Text style={styles.sectionTitle}>Support & Resources</Text>
          
          <View style={styles.supportGrid}>
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="help-circle" size={24} color="#2C3E50" />
              <Text style={styles.supportTitle}>Help Center</Text>
              <Text style={styles.supportDescription}>Get answers to common questions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="book" size={24} color="#5DADE2" />
              <Text style={styles.supportTitle}>User Guide</Text>
              <Text style={styles.supportDescription}>Learn how to use TeachSmart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="mail" size={24} color="#E67E22" />
              <Text style={styles.supportTitle}>Contact Support</Text>
              <Text style={styles.supportDescription}>Get help from our team</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="#F44336" />
              <Text style={[styles.supportTitle, { color: '#F44336' }]}>Sign Out</Text>
              <Text style={styles.supportDescription}>Sign out of your account</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        </ParallaxScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

// Update InfoRow to include type safety
interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC'
  },
  
  // Enhanced Header
  headerContent: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'SF Pro Display',
    letterSpacing: -0.3,
  },
  headerRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'SF Pro Text',
  },
  headerExperience: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  settingsButton: {
    padding: 8,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    backdropFilter: 'blur(10px)',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Professional Summary
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    ...Platform.select({
      ios: {
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  summarySpecialty: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 16,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },

  // Progress Tracking
  progressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
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
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2C3E50',
    borderRadius: 4,
    minWidth: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    minWidth: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Activity Card
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
    color: '#666',
  },
  activityAction: {
    padding: 4,
  },

  // AI Configuration
  aiConfigCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  testConnectionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  testConnectionButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#E0E0E0',
  },
  testConnectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testConnectionText: {
    flex: 1,
    marginLeft: 12,
  },
  testConnectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  testConnectionTitleDisabled: {
    color: '#999',
  },
  testConnectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  testAllButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E67E22',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Support & Help
  supportCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 20,
    padding: 20,
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
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  supportItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});