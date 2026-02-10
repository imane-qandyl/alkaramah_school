import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { studentProfileService } from '@/services/studentProfileService';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentName: '',
    age: '',
    communicationLevel: 'medium',
    socialLevel: 'medium',
    sensoryLevel: 'medium',
    behaviorLevel: 'medium',
    overallSupport: 'medium',
    attentionSpan: 'moderate',
    processingSpeed: 'moderate',
    learningModalities: ['visual'],
    groupPreference: 'small-group',
    verbalSkills: 'medium',
    nonverbalSkills: 'medium',
    communicationModes: ['verbal', 'visual'],
    strengths: [] as string[],
    challenges: [] as string[],
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const supportLevels = [
    { id: 'low', label: 'Low Support', description: 'Independent with minimal assistance', color: '#27AE60' },
    { id: 'medium', label: 'Medium Support', description: 'Needs regular support and guidance', color: '#E67E22' },
    { id: 'high', label: 'High Support', description: 'Requires substantial daily support', color: '#E74C3C' }
  ];

  const attentionOptions = [
    { id: 'short', label: 'Short (3-10 min)', description: 'Brief focused periods' },
    { id: 'moderate', label: 'Moderate (10-20 min)', description: 'Standard attention span' },
    { id: 'extended', label: 'Extended (20+ min)', description: 'Sustained focus ability' }
  ];

  const processingOptions = [
    { id: 'slow', label: 'Slow Processing', description: 'Needs extra time to process information' },
    { id: 'moderate', label: 'Moderate Processing', description: 'Standard processing speed' },
    { id: 'fast', label: 'Fast Processing', description: 'Quick to understand and respond' }
  ];

  const learningModalityOptions = [
    { id: 'visual', label: 'Visual', icon: 'eye-outline' },
    { id: 'auditory', label: 'Auditory', icon: 'volume-high-outline' },
    { id: 'kinesthetic', label: 'Kinesthetic', icon: 'hand-left-outline' },
    { id: 'tactile', label: 'Tactile', icon: 'finger-print-outline' }
  ];

  const groupPreferences = [
    { id: 'individual', label: 'Individual Work', description: 'Works best alone' },
    { id: 'small-group', label: 'Small Group', description: 'Comfortable with 2-4 peers' },
    { id: 'large-group', label: 'Large Group', description: 'Can participate in whole class' },
    { id: 'flexible', label: 'Flexible', description: 'Adapts to different group sizes' }
  ];

  const communicationModeOptions = [
    { id: 'verbal', label: 'Verbal', icon: 'chatbubble-outline' },
    { id: 'visual', label: 'Visual', icon: 'image-outline' },
    { id: 'gestural', label: 'Gestural', icon: 'hand-right-outline' },
    { id: 'written', label: 'Written', icon: 'document-text-outline' }
  ];

  const commonStrengths = [
    'routine-following', 'visual-processing', 'memory-skills', 'focused-interests',
    'academic-skills', 'problem-solving', 'independence', 'creativity',
    'attention-to-detail', 'logical-thinking', 'pattern-recognition'
  ];

  const commonChallenges = [
    'social-interaction', 'verbal-communication', 'sensory-processing', 'flexibility',
    'executive-function', 'emotional-regulation', 'attention-difficulties', 'motor-skills',
    'abstract-thinking', 'time-management', 'organization'
  ];

  const handleSave = async () => {
    // Validation
    if (!formData.studentName.trim()) {
      Alert.alert('Error', 'Please enter a student name');
      return;
    }

    if (!formData.age || isNaN(parseInt(formData.age))) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        studentName: formData.studentName.trim(),
        age: parseInt(formData.age),
        communicationLevel: formData.communicationLevel,
        socialLevel: formData.socialLevel,
        sensoryLevel: formData.sensoryLevel,
        behaviorLevel: formData.behaviorLevel,
        overallSupport: formData.overallSupport,
        attentionSpan: formData.attentionSpan,
        processingSpeed: formData.processingSpeed,
        learningModalities: formData.learningModalities,
        groupPreference: formData.groupPreference,
        verbalSkills: formData.verbalSkills,
        nonverbalSkills: formData.nonverbalSkills,
        communicationModes: formData.communicationModes,
        strengths: formData.strengths,
        challenges: formData.challenges,
        notes: formData.notes
      };

      const result = await studentProfileService.createProfile(profileData, 'manual');
      console.log('Profile creation result:', result);

      if (result.success) {
        console.log('Profile created successfully:', result.profile);
        Alert.alert(
          'Success!',
          `Profile created for ${formData.studentName}. Set as active profile?`,
          [
            { text: 'Not Now', style: 'cancel', onPress: () => router.back() },
            {
              text: 'Set Active',
              onPress: async () => {
                await studentProfileService.setActiveProfile(result.profile.id);
                console.log('Set as active profile:', result.profile.id);
                router.back();
              }
            }
          ]
        );
      } else {
        console.error('Profile creation failed:', result.error);
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'An error occurred while creating the profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLearningModality = (modalityId: string) => {
    const currentModalities = formData.learningModalities;
    if (currentModalities.includes(modalityId)) {
      if (currentModalities.length > 1) {
        setFormData({
          ...formData,
          learningModalities: currentModalities.filter(m => m !== modalityId)
        });
      }
    } else {
      setFormData({
        ...formData,
        learningModalities: [...currentModalities, modalityId]
      });
    }
  };

  const toggleCommunicationMode = (modeId: string) => {
    const currentModes = formData.communicationModes;
    if (currentModes.includes(modeId)) {
      if (currentModes.length > 1) {
        setFormData({
          ...formData,
          communicationModes: currentModes.filter(m => m !== modeId)
        });
      }
    } else {
      setFormData({
        ...formData,
        communicationModes: [...currentModes, modeId]
      });
    }
  };

  const toggleStrength = (strength: string) => {
    const currentStrengths = formData.strengths;
    if (currentStrengths.includes(strength)) {
      setFormData({
        ...formData,
        strengths: currentStrengths.filter(s => s !== strength)
      });
    } else {
      setFormData({
        ...formData,
        strengths: [...currentStrengths, strength]
      });
    }
  };

  const toggleChallenge = (challenge: string) => {
    const currentChallenges = formData.challenges;
    if (currentChallenges.includes(challenge)) {
      setFormData({
        ...formData,
        challenges: currentChallenges.filter(c => c !== challenge)
      });
    } else {
      setFormData({
        ...formData,
        challenges: [...currentChallenges, challenge]
      });
    }
  };

  const renderSupportLevelSelector = (title: string, field: string) => (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.supportLevelGrid}>
        {supportLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.supportLevelCard,
              (formData as any)[field] === level.id && styles.supportLevelCardSelected,
              { borderColor: level.color }
            ]}
            onPress={() => setFormData({ ...formData, [field]: level.id })}
          >
            <View style={[styles.supportLevelIndicator, { backgroundColor: level.color }]} />
            <Text style={[
              styles.supportLevelLabel,
              (formData as any)[field] === level.id && styles.supportLevelLabelSelected
            ]}>
              {level.label}
            </Text>
            <Text style={styles.supportLevelDescription}>{level.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create Student Profile</ThemedText>
        <View style={{ width: 24 }} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Student Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter student's name"
              value={formData.studentName}
              onChangeText={(text) => setFormData({ ...formData, studentName: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter age (e.g., 8)"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
            />
          </View>
        </ThemedView>

        {/* Support Levels */}
        {renderSupportLevelSelector('Overall Support Level', 'overallSupport')}
        {renderSupportLevelSelector('Communication Support', 'communicationLevel')}
        {renderSupportLevelSelector('Social Support', 'socialLevel')}
        {renderSupportLevelSelector('Sensory Support', 'sensoryLevel')}

        {/* Learning Profile */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Learning Profile</ThemedText>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Attention Span</Text>
            <View style={styles.optionsGrid}>
              {attentionOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    formData.attentionSpan === option.id && styles.optionCardSelected
                  ]}
                  onPress={() => setFormData({ ...formData, attentionSpan: option.id })}
                >
                  <Text style={[
                    styles.optionTitle,
                    formData.attentionSpan === option.id && styles.optionTitleSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Processing Speed</Text>
            <View style={styles.optionsGrid}>
              {processingOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    formData.processingSpeed === option.id && styles.optionCardSelected
                  ]}
                  onPress={() => setFormData({ ...formData, processingSpeed: option.id })}
                >
                  <Text style={[
                    styles.optionTitle,
                    formData.processingSpeed === option.id && styles.optionTitleSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Learning Modalities (select all that apply)</Text>
            <View style={styles.modalityGrid}>
              {learningModalityOptions.map((modality) => (
                <TouchableOpacity
                  key={modality.id}
                  style={[
                    styles.modalityCard,
                    formData.learningModalities.includes(modality.id) && styles.modalityCardSelected
                  ]}
                  onPress={() => toggleLearningModality(modality.id)}
                >
                  <Ionicons 
                    name={modality.icon as any} 
                    size={24} 
                    color={formData.learningModalities.includes(modality.id) ? '#fff' : '#2C3E50'} 
                  />
                  <Text style={[
                    styles.modalityLabel,
                    formData.learningModalities.includes(modality.id) && styles.modalityLabelSelected
                  ]}>
                    {modality.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ThemedView>

        {/* Social Preferences */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Social Preferences</ThemedText>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Group Preference</Text>
            <View style={styles.optionsGrid}>
              {groupPreferences.map((pref) => (
                <TouchableOpacity
                  key={pref.id}
                  style={[
                    styles.optionCard,
                    formData.groupPreference === pref.id && styles.optionCardSelected
                  ]}
                  onPress={() => setFormData({ ...formData, groupPreference: pref.id })}
                >
                  <Text style={[
                    styles.optionTitle,
                    formData.groupPreference === pref.id && styles.optionTitleSelected
                  ]}>
                    {pref.label}
                  </Text>
                  <Text style={styles.optionDescription}>{pref.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ThemedView>

        {/* Communication */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Communication</ThemedText>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Communication Modes (select all that apply)</Text>
            <View style={styles.modalityGrid}>
              {communicationModeOptions.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modalityCard,
                    formData.communicationModes.includes(mode.id) && styles.modalityCardSelected
                  ]}
                  onPress={() => toggleCommunicationMode(mode.id)}
                >
                  <Ionicons 
                    name={mode.icon as any} 
                    size={24} 
                    color={formData.communicationModes.includes(mode.id) ? '#fff' : '#2C3E50'} 
                  />
                  <Text style={[
                    styles.modalityLabel,
                    formData.communicationModes.includes(mode.id) && styles.modalityLabelSelected
                  ]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ThemedView>

        {/* Strengths and Challenges */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Strengths</ThemedText>
          <Text style={styles.sectionDescription}>Select areas where the student excels</Text>
          <View style={styles.tagsContainer}>
            {commonStrengths.map((strength) => (
              <TouchableOpacity
                key={strength}
                style={[
                  styles.tag,
                  formData.strengths.includes(strength) && styles.tagSelected
                ]}
                onPress={() => toggleStrength(strength)}
              >
                <Text style={[
                  styles.tagText,
                  formData.strengths.includes(strength) && styles.tagTextSelected
                ]}>
                  {strength.replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Challenges</ThemedText>
          <Text style={styles.sectionDescription}>Select areas that need support</Text>
          <View style={styles.tagsContainer}>
            {commonChallenges.map((challenge) => (
              <TouchableOpacity
                key={challenge}
                style={[
                  styles.tag,
                  formData.challenges.includes(challenge) && styles.tagSelected
                ]}
                onPress={() => toggleChallenge(challenge)}
              >
                <Text style={[
                  styles.tagText,
                  formData.challenges.includes(challenge) && styles.tagTextSelected
                ]}>
                  {challenge.replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Additional Notes */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Notes</ThemedText>
          <TextInput
            style={styles.textAreaInput}
            placeholder="Add any additional information about the student's needs, preferences, or strategies that work well..."
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={4}
          />
        </ThemedView>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Creating Profile...' : 'Create Profile'}
            </Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textAreaInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  supportLevelGrid: {
    gap: 12,
  },
  supportLevelCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportLevelCardSelected: {
    backgroundColor: '#E8F5E9',
  },
  supportLevelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  supportLevelLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  supportLevelLabelSelected: {
    color: '#2E7D32',
  },
  supportLevelDescription: {
    fontSize: 12,
    color: '#666',
    flex: 2,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    borderColor: '#2C3E50',
    backgroundColor: '#F4F6F8',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#2E7D32',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modalityCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modalityCardSelected: {
    borderColor: '#2C3E50',
    backgroundColor: '#2C3E50',
  },
  modalityLabel: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  modalityLabelSelected: {
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagSelected: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  tagTextSelected: {
    color: '#fff',
  },
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#2C3E50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});