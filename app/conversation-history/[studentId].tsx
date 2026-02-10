import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { conversationHistoryService } from '@/services/conversationHistoryService';
import { studentProfileService } from '@/services/studentProfileService';

export default function ConversationHistoryScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [conversations, setConversations] = useState([]);
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      if (typeof studentId === 'string') {
        // Load student profile
        const studentProfile = await studentProfileService.getProfileById(studentId);
        setStudent(studentProfile);

        // Load conversation history
        const history = await conversationHistoryService.getRecentConversations(studentId, 20);
        setConversations(history);

        // Load statistics
        const studentStats = await conversationHistoryService.getStudentStats(studentId);
        setStats(studentStats);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      Alert.alert('Error', 'Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  const handleExportHistory = async () => {
    try {
      if (typeof studentId === 'string' && student) {
        const exportData = await conversationHistoryService.exportStudentHistory(
          studentId, 
          student.studentName || 'Student'
        );
        
        if (exportData) {
          await Share.share({
            message: exportData,
            title: `${student.studentName} - AI Conversation History`
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export conversation history');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      `Are you sure you want to clear all conversation history for ${student?.studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              if (typeof studentId === 'string') {
                await conversationHistoryService.clearStudentHistory(studentId);
                setConversations([]);
                setStats(null);
                Alert.alert('Success', 'Conversation history cleared');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTopicIcon = (topic) => {
    switch (topic) {
      case 'Focus & Attention': return 'eye';
      case 'Meltdown Management': return 'warning';
      case 'Social Skills': return 'people';
      case 'Communication': return 'chatbubbles';
      case 'Behavior Management': return 'checkmark-circle';
      case 'Sensory Support': return 'hand-left';
      case 'Transitions': return 'arrow-forward';
      case 'Lesson Planning': return 'book';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading conversation history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>AI Chat History</ThemedText>
        <TouchableOpacity onPress={handleExportHistory} style={styles.exportButton}>
          <Ionicons name="share-outline" size={20} color="#2C3E50" />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Student Info */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.studentName}>
            {student?.studentName || 'Student'}
          </ThemedText>
          <Text style={styles.studentInfo}>
            Age: {student?.age || 'Unknown'} • 
            {conversations.length} conversations
          </Text>
        </ThemedView>

        {/* Statistics */}
        {stats && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Conversation Statistics</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalConversations}</Text>
                <Text style={styles.statLabel}>Total Chats</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.conversationsWithInsights}</Text>
                <Text style={styles.statLabel}>With AI Insights</Text>
              </View>
            </View>
            
            {stats.topTopics.length > 0 && (
              <View style={styles.topicsContainer}>
                <Text style={styles.topicsTitle}>Most Discussed Topics:</Text>
                {stats.topTopics.map((topic, index) => (
                  <View key={index} style={styles.topicItem}>
                    <Ionicons 
                      name={getTopicIcon(topic.topic)} 
                      size={16} 
                      color="#2C3E50" 
                    />
                    <Text style={styles.topicText}>
                      {topic.topic} ({topic.count})
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ThemedView>
        )}

        {/* Conversations */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Conversations</ThemedText>
            {conversations.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
                <Ionicons name="trash-outline" size={16} color="#E74C3C" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#8B9DC3" />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>
                Start chatting with the AI to see history here
              </Text>
            </View>
          ) : (
            conversations.map((conversation, index) => (
              <View key={conversation.id || index} style={styles.conversationItem}>
                <View style={styles.conversationHeader}>
                  <View style={styles.topicBadge}>
                    <Ionicons 
                      name={getTopicIcon(conversation.metadata.topic)} 
                      size={12} 
                      color="#2C3E50" 
                    />
                    <Text style={styles.topicBadgeText}>
                      {conversation.metadata.topic}
                    </Text>
                  </View>
                  <Text style={styles.conversationDate}>
                    {formatDate(conversation.timestamp)}
                  </Text>
                </View>
                
                <View style={styles.messageContainer}>
                  <Text style={styles.userMessage}>
                    Q: {conversation.userMessage}
                  </Text>
                  <Text style={styles.aiResponse} numberOfLines={3}>
                    A: {conversation.aiResponse.substring(0, 150)}...
                  </Text>
                </View>

                {conversation.metadata.hasModelInsights && (
                  <View style={styles.insightsBadge}>
                    <Ionicons name="analytics" size={12} color="#27AE60" />
                    <Text style={styles.insightsBadgeText}>AI Insights</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ThemedView>
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
  exportButton: {
    padding: 8,
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
  studentInfo: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  topicsContainer: {
    marginTop: 16,
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  conversationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicBadgeText: {
    fontSize: 12,
    color: '#2C3E50',
    marginLeft: 4,
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
  },
  messageContainer: {
    marginBottom: 8,
  },
  userMessage: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  aiResponse: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  insightsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightsBadgeText: {
    fontSize: 12,
    color: '#27AE60',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#8B9DC3',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B9DC3',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});