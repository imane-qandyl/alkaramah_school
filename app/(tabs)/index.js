import { StyleSheet, TouchableOpacity, RefreshControl, Platform, View, Text, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { enhancedStorageService } from '@/services/databaseService';
import { studentProfileService } from '@/services/studentProfileService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    resourcesCreated: 0,
    studentsManaged: 0,
    timesSaved: 0,
    weeklyProgress: 0
  });
  const [activeProfile, setActiveProfile] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [greeting, setGreeting] = useState('');

  // Generate time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Load dashboard data
  const loadData = useCallback(async () => {
    try {
      setGreeting(getGreeting());
      
      // Get resource statistics
      let resourceStats, resources;
      try {
        resourceStats = await enhancedStorageService.getResourceStats();
        resources = await enhancedStorageService.getAllResources();
      } catch (error) {
        resourceStats = await storageService.getResourceStats();
        resources = await storageService.getAllResources();
      }
      
      // Get student profile statistics
      const profileStats = await studentProfileService.getProfileStats();
      const currentProfile = await studentProfileService.getActiveProfile();
      
      // Calculate weekly progress (resources created this week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyResources = resources.filter(resource => 
        new Date(resource.createdAt || resource.timestamp) > oneWeekAgo
      ).length;
      
      // Calculate time saved (estimate 30 minutes per resource)
      const timesSaved = Math.round(resourceStats.total * 0.5);

      setStats({
        resourcesCreated: resourceStats.total,
        studentsManaged: profileStats.total,
        timesSaved: timesSaved,
        weeklyProgress: weeklyResources
      });

      // Get recent activity (last 5 resources)
      const recentResources = resources
        .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
        .slice(0, 3)
        .map(resource => ({
          id: resource.id,
          title: resource.title || 'Untitled Resource',
          type: resource.format || 'worksheet',
          createdAt: resource.createdAt || resource.timestamp,
          studentAge: resource.studentAge
        }));
      
      setRecentActivity(recentResources);
      setActiveProfile(currentProfile);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const getProgressPercentage = () => {
    if (stats.resourcesCreated === 0) return 0;
    return Math.min((stats.weeklyProgress / 5) * 100, 100); // Target: 5 resources per week
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const created = new Date(timestamp);
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FAFBFC' }]}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#5DADE2', dark: '#5DADE2' }}
        forceColorScheme="light"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        headerImage={
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <View style={styles.headerTitleRow}>
                  <Image 
                    source={require('../../assets/images/logo.png')} 
                    style={styles.headerLogoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.headerTitle}>TeachSmart</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  AI-Powered Educational Resources
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Ionicons name="person-circle" size={40} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>
            
            {/* Quick Stats in Header */}
            <View style={styles.headerStats}>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatValue}>{stats.resourcesCreated}</Text>
                <Text style={styles.headerStatLabel}>Resources</Text>
              </View>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatValue}>{stats.studentsManaged}</Text>
                <Text style={styles.headerStatLabel}>Students</Text>
              </View>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatValue}>{stats.timesSaved}h</Text>
                <Text style={styles.headerStatLabel}>Time Saved</Text>
              </View>
            </View>
          </View>
        }>

        {/* Active Student Profile */}
        {activeProfile && (
          <ThemedView style={styles.activeProfileCard} lightColor="#FFFFFF" darkColor="#252A32">
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <View style={styles.profileBadge}>
                  <Ionicons name="star" size={16} color="#2C3E50" />
                  <Text style={styles.profileBadgeText}>Active Student</Text>
                </View>
                <Text style={styles.profileName}>{activeProfile.studentName}</Text>
                <Text style={styles.profileDetails}>
                  Age {activeProfile.age} • {activeProfile.supportLevels?.overall?.charAt(0).toUpperCase() + activeProfile.supportLevels?.overall?.slice(1)} Support
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.profileActionButton}
                onPress={() => router.push(`/student-detail/${activeProfile.id}`)}
              >
                <Ionicons name="chevron-forward" size={20} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={styles.profileQuickAction}
                onPress={() => router.push('/(tabs)/students')}
              >
                <Ionicons name="chatbubble" size={16} color="#2C3E50" />
                <Text style={styles.profileQuickActionText}>Switch student</Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}

        {/* Weekly Progress */}
        <ThemedView style={styles.progressCard} lightColor="#FFFFFF" darkColor="#252A32">
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>This Week's Progress</Text>
            <Text style={styles.progressValue}>{stats.weeklyProgress}/5</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${getProgressPercentage()}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(getProgressPercentage())}%</Text>
          </View>
          <Text style={styles.progressSubtext}>
            {stats.weeklyProgress >= 5 
              ? '🎉 Great job! You\'ve reached your weekly goal!' 
              : `${5 - stats.weeklyProgress} more resources to reach your weekly goal`
            }
          </Text>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.quickActionsCard} lightColor="#FFFFFF" darkColor="#252A32">
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.primaryAction]}
              onPress={() => router.push('/(tabs)/ai-chat')}
              activeOpacity={0.8}
            >
              <View style={styles.primaryActionContent}>
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.primaryActionTitle}>Create Resource</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/students')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#5DADE2' }]}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Students</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/test')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#E67E22' }]}>
                <Ionicons name="library" size={20} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Library</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <ThemedView style={styles.recentActivityCard} lightColor="#FFFFFF" darkColor="#252A32">
            <View style={styles.recentActivityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/test')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.activityList}>
              {recentActivity.map((activity, index) => (
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

      </ParallaxScrollView>
    </SafeAreaView>
  );
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
  headerText: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLogo: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    // Temporary background to make sure it's visible
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    padding: 2,
  },
  headerLogoImage: {
    width: 36,
    height: 36,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    padding: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  profileButton: {
    padding: 4,
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
  
  // Enhanced Active Profile
  activeProfileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F4F6F8',
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
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: '#666',
  },
  profileActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profileQuickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  profileQuickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
    marginLeft: 6,
    fontFamily: 'SF Pro Text',
  },

  // Weekly Progress
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Enhanced Quick Actions
  quickActionsCard: {
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
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
    marginBottom: 8,
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
    flex: 1,
  },
  primaryActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Recent Activity
  recentActivityCard: {
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
  recentActivityHeader: {
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
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
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

  // Platform Insights
  insightsCard: {
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
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },

  // Enhanced Getting Started
  gettingStartedCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#2C3E50',
    ...Platform.select({
      ios: {
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gettingStartedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gettingStartedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  gettingStartedText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 24,
  },
  gettingStartedActions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
});