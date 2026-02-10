import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

interface CreateResourceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (resource: any) => void;
}

export default function CreateResourceModal({ visible, onClose, onSave }: CreateResourceModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('worksheet');
  const [aetTarget, setAetTarget] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [topic, setTopic] = useState('General Support');

  const formatOptions = [
    { key: 'worksheet', label: 'Worksheet', icon: 'document-text-outline' },
    { key: 'cards', label: 'Activity Cards', icon: 'images-outline' },
    { key: 'slides', label: 'Slides', icon: 'easel-outline' },
    { key: 'checklist', label: 'Checklist', icon: 'checkmark-circle-outline' },
    { key: 'guide', label: 'Guide', icon: 'book-outline' },
    { key: 'template', label: 'Template', icon: 'copy-outline' }
  ];

  const topicOptions = [
    'General Support',
    'Focus & Attention',
    'Meltdown Management',
    'Social Skills',
    'Communication',
    'Behavior Management',
    'Sensory Support',
    'Transitions',
    'Lesson Planning',
    'Independence Skills'
  ];

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the resource');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content for the resource');
      return;
    }

    const resource = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      content: content.trim(),
      format,
      aetTarget: aetTarget.trim(),
      studentAge: studentAge.trim(),
      topic,
      source: 'manual_created',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      metadata: {
        createdManually: true,
        createdBy: 'teacher',
        version: '1.0'
      }
    };

    onSave(resource);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setFormat('worksheet');
    setAetTarget('');
    setStudentAge('');
    setTopic('General Support');
    onClose();
  };

  const showTopicPicker = () => {
    Alert.alert(
      'Select Topic',
      'Choose the main topic for this resource',
      topicOptions.map(topicOption => ({
        text: topicOption,
        onPress: () => setTopic(topicOption)
      }))
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Create Resource</ThemedText>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter resource title..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Format Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Format</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatContainer}>
              {formatOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.formatOption,
                    format === option.key && styles.selectedFormatOption
                  ]}
                  onPress={() => setFormat(option.key)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={format === option.key ? '#fff' : '#2C3E50'} 
                  />
                  <Text style={[
                    styles.formatText,
                    format === option.key && styles.selectedFormatText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Topic */}
          <View style={styles.section}>
            <Text style={styles.label}>Topic</Text>
            <TouchableOpacity style={styles.topicSelector} onPress={showTopicPicker}>
              <Text style={styles.topicText}>{topic}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* AET Target */}
          <View style={styles.section}>
            <Text style={styles.label}>Learning Objective / AET Target</Text>
            <TextInput
              style={styles.input}
              value={aetTarget}
              onChangeText={setAetTarget}
              placeholder="What will students learn or achieve?"
              placeholderTextColor="#999"
              multiline
            />
          </View>

          {/* Student Age */}
          <View style={styles.section}>
            <Text style={styles.label}>Target Age</Text>
            <TextInput
              style={styles.input}
              value={studentAge}
              onChangeText={setStudentAge}
              placeholder="e.g., 5-7 years, 8 years, All ages"
              placeholderTextColor="#999"
            />
          </View>

          {/* Content */}
          <View style={styles.section}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              value={content}
              onChangeText={setContent}
              placeholder="Enter the resource content here...

You can include:
• Instructions for teachers
• Activities and exercises
• Success criteria
• Assessment notes
• Visual supports needed
• Differentiation strategies"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Tips for Creating Great Resources:</Text>
            <Text style={styles.tipText}>• Use clear, simple language</Text>
            <Text style={styles.tipText}>• Include step-by-step instructions</Text>
            <Text style={styles.tipText}>• Add success criteria</Text>
            <Text style={styles.tipText}>• Consider different ability levels</Text>
            <Text style={styles.tipText}>• Include visual support suggestions</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  contentInput: {
    minHeight: 150,
    maxHeight: 300,
  },
  formatContainer: {
    marginTop: 8,
  },
  formatOption: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    minWidth: 80,
  },
  selectedFormatOption: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  formatText: {
    fontSize: 12,
    color: '#2C3E50',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedFormatText: {
    color: '#fff',
  },
  topicSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  topicText: {
    fontSize: 16,
    color: '#333',
  },
  tipsContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
});