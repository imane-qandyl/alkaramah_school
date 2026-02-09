import { StyleSheet, TouchableOpacity, ScrollView, View, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ResourceEditor from '@/components/ResourceEditor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { aiService } from '@/services/aiService';
import { exportService } from '@/services/exportService';
import { storageService } from '@/services/storageService';
import { enhancedStorageService } from '@/services/databaseService';
import { studentProfileService } from '@/services/studentProfileService';

export default function ResourceCreatorScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeProfile, setActiveProfile] = useState(null);
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [formData, setFormData] = useState({
    studentAge: '',
    abilityLevel: '',
    aetTarget: '',
    learningContext: '',
    visualSupport: true,
    textLevel: 'simple',
    format: 'worksheet'
  });

  // Load student profiles on component mount
  useEffect(() => {
    loadStudentProfiles();
  }, []);

  const loadStudentProfiles = async () => {
    try {
      const [profiles, active] = await Promise.all([
        studentProfileService.getAllProfiles(),
        studentProfileService.getActiveProfile()
      ]);
      
      setAvailableProfiles(profiles);
      setActiveProfile(active);
      
      // Pre-fill form with active profile data
      if (active) {
        setFormData(prev => ({
          ...prev,
          studentAge: active.age?.toString() || '',
          abilityLevel: prev.abilityLevel || 'developing'
        }));
      }
    } catch (error) {
      console.error('Error loading student profiles:', error);
    }
  };

  const abilityLevels = [
    { id: 'emerging', label: 'Emerging', description: 'Just beginning to develop skills' },
    { id: 'developing', label: 'Developing', description: 'Making progress with support' },
    { id: 'secure', label: 'Secure', description: 'Confident and independent' },
    { id: 'extending', label: 'Extending', description: 'Ready for more challenge' }
  ];

  const learningContexts = [
    { id: 'mainstream', label: 'Mainstream Classroom', icon: 'school-outline' },
    { id: 'sen', label: 'SEN Classroom', icon: 'people-outline' },
    { id: 'onetoone', label: 'One-to-One', icon: 'person-outline' },
    { id: 'smallgroup', label: 'Small Group', icon: 'people-circle-outline' }
  ];

  const resourceFormats = [
    { id: 'worksheet', label: 'Worksheet', icon: 'document-text-outline', color: '#2C3E50' },
    { id: 'cards', label: 'Activity Cards', icon: 'images-outline', color: '#5DADE2' },
    { id: 'slides', label: 'Presentation Slides', icon: 'easel-outline', color: '#E67E22' },
    { id: 'checklist', label: 'Checklist', icon: 'checkmark-circle-outline', color: '#7FB8A3' }
  ];

  const commonAETTargets = [
    "Can identify and name basic emotions in self and others",
    "Demonstrates turn-taking in group activities", 
    "Follows simple two-step instructions independently",
    "Uses appropriate greetings with adults",
    "Manages transitions between activities with support",
    "Requests help when needed using words or gestures",
    "Shares materials with peers when prompted",
    "Participates in simple group games",
    "Shows awareness of others' feelings",
    "Uses 'please' and 'thank you' appropriately"
  ];

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate resource using AI
      await generateResource();
    }
  };

  const generateResource = async () => {
    setIsGenerating(true);
    
    try {
      // Enhance form data with active profile context
      let enhancedFormData = formData;
      
      if (activeProfile) {
        enhancedFormData = studentProfileService.generateResourceContext(
          activeProfile, 
          formData
        );
      }
      
      const result = await aiService.generateResource(enhancedFormData);
      
      if (result.success) {
        setGeneratedContent(result.content);
        setShowEditor(true);
      } else {
        alert('Failed to generate resource: ' + result.error);
      }
    } catch (error) {
      alert('An error occurred while generating the resource. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResource = async (editedContent) => {
    try {
      // Extract title from content
      const lines = editedContent.split('\n');
      const titleLine = lines.find(line => line.startsWith('# '));
      const title = titleLine ? titleLine.substring(2).trim() : 'Untitled Resource';

      // Create resource object
      const resourceData = {
        title,
        content: editedContent,
        studentAge: formData.studentAge,
        abilityLevel: formData.abilityLevel,
        aetTarget: formData.aetTarget,
        learningContext: formData.learningContext,
        format: formData.format,
        visualSupport: formData.visualSupport,
        textLevel: formData.textLevel
      };

      // Use enhanced storage service with fallback
      let result;
      try {
        result = await enhancedStorageService.saveResource(resourceData);
      } catch (error) {
        console.log('Enhanced storage not available, using basic storage:', error.message);
        result = await storageService.saveResource(resourceData);
      }
      
      if (result.success) {
        Alert.alert('Success', 'Your resource has been saved to your library!');
      } else {
        Alert.alert('Error', 'Failed to save resource. Please try again.');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      Alert.alert('Error', 'An error occurred while saving the resource.');
    }
  };

  const handleExportResource = async (format) => {
    // Export service handles the actual export
    console.log('Export handled by service for format:', format);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    // Reset form or navigate back
    router.back();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderStepIndicator = () => (
    <ThemedView style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <ThemedView key={step} style={styles.stepContainer}>
          <ThemedView style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            <ThemedText style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive
            ]}>
              {step}
            </ThemedText>
          </ThemedView>
          {step < 3 && <ThemedView style={[
            styles.stepLine,
            currentStep > step && styles.stepLineActive
          ]} />}
        </ThemedView>
      ))}
    </ThemedView>
  );

  const renderStep1 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Student Information</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Tell us about the student to create personalized resources
      </ThemedText>

      {/* Autism Profile Selection */}
      {availableProfiles.length > 0 && (
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>🧩 Student Profile (Autism Support)</ThemedText>
          <ThemedView style={styles.profileSelector}>
            {activeProfile ? (
              <ThemedView style={styles.activeProfileCard}>
                <ThemedView style={styles.profileInfo}>
                  <ThemedText style={styles.profileName}>
                    {activeProfile.studentName || 'Active Student'}
                  </ThemedText>
                  <ThemedText style={styles.profileDetails}>
                    Age {activeProfile.age} • {activeProfile.supportLevels?.overall || 'Medium'} Support
                  </ThemedText>
                  <ThemedView style={styles.profileTags}>
                    {(activeProfile.learningProfile?.learningModalities || []).slice(0, 2).map((modality, index) => (
                      <ThemedView key={index} style={styles.profileTag}>
                        <ThemedText style={styles.profileTagText}>{modality}</ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
                <TouchableOpacity 
                  style={styles.changeProfileButton}
                  onPress={() => router.push('../students')}>
                  <Ionicons name="swap-horizontal" size={16} color="#4CAF50" />
                  <ThemedText style={styles.changeProfileText}>Change</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <TouchableOpacity 
                style={styles.noProfileCard}
                onPress={() => router.push('../students')}>
                <Ionicons name="person-add-outline" size={24} color="#666" />
                <ThemedText style={styles.noProfileTitle}>No Student Profile Selected</ThemedText>
                <ThemedText style={styles.noProfileDescription}>
                  Create or select a student profile for personalized autism-friendly resources
                </ThemedText>
                <ThemedText style={styles.noProfileAction}>Tap to manage profiles →</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
      )}

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Student Age</ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 7"
          value={formData.studentAge}
          onChangeText={(text) => setFormData({...formData, studentAge: text})}
          keyboardType="numeric"
        />
      </ThemedView>

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Ability Level</ThemedText>
        <ThemedView style={styles.optionsGrid}>
          {abilityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                formData.abilityLevel === level.id && styles.optionCardSelected
              ]}
              onPress={() => setFormData({...formData, abilityLevel: level.id})}>
              <ThemedText style={[
                styles.optionTitle,
                formData.abilityLevel === level.id && styles.optionTitleSelected
              ]}>
                {level.label}
              </ThemedText>
              <ThemedText style={[
                styles.optionDescription,
                formData.abilityLevel === level.id && styles.optionDescriptionSelected
              ]}>
                {level.description}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Learning Context</ThemedText>
        <ThemedView style={styles.contextGrid}>
          {learningContexts.map((context) => (
            <TouchableOpacity
              key={context.id}
              style={[
                styles.contextCard,
                formData.learningContext === context.id && styles.contextCardSelected
              ]}
              onPress={() => setFormData({...formData, learningContext: context.id})}>
              <Ionicons 
                name={context.icon} 
                size={24} 
                color={formData.learningContext === context.id ? '#fff' : '#4CAF50'} 
              />
              <ThemedText style={[
                styles.contextLabel,
                formData.learningContext === context.id && styles.contextLabelSelected
              ]}>
                {context.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>AET Target Selection</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Choose or enter the AET target for this resource
      </ThemedText>

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>AET Target</ThemedText>
        <TextInput
          style={styles.textAreaInput}
          placeholder="Enter specific AET target or choose from common targets below..."
          value={formData.aetTarget}
          onChangeText={(text) => setFormData({...formData, aetTarget: text})}
          multiline
          numberOfLines={3}
        />
      </ThemedView>

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Common AET Targets</ThemedText>
        <ThemedView style={styles.targetsList}>
          {commonAETTargets.map((target, index) => (
            <TouchableOpacity
              key={index}
              style={styles.targetItem}
              onPress={() => setFormData({...formData, aetTarget: target})}>
              <ThemedText style={styles.targetText}>{target}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText style={styles.stepTitle}>Resource Preferences</ThemedText>
      <ThemedText style={styles.stepDescription}>
        Customize the format and style of your resource
      </ThemedText>

      <ThemedView style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Resource Format</ThemedText>
        <ThemedView style={styles.formatGrid}>
          {resourceFormats.map((format) => (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.formatCard,
                formData.format === format.id && styles.formatCardSelected
              ]}
              onPress={() => setFormData({...formData, format: format.id})}>
              <Ionicons 
                name={format.icon} 
                size={32} 
                color={formData.format === format.id ? '#fff' : format.color} 
              />
              <ThemedText style={[
                styles.formatLabel,
                formData.format === format.id && styles.formatLabelSelected
              ]}>
                {format.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.toggleGroup}>
        <TouchableOpacity 
          style={styles.toggleItem}
          onPress={() => setFormData({...formData, visualSupport: !formData.visualSupport})}>
          <ThemedView style={styles.toggleLeft}>
            <Ionicons name="eye-outline" size={24} color="#4CAF50" />
            <ThemedView style={styles.toggleText}>
              <ThemedText style={styles.toggleTitle}>Visual Support</ThemedText>
              <ThemedText style={styles.toggleDescription}>Include images and visual aids</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[
            styles.toggle,
            formData.visualSupport && styles.toggleActive
          ]}>
            <ThemedView style={[
              styles.toggleThumb,
              formData.visualSupport && styles.toggleThumbActive
            ]} />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#E8F5E9', dark: '#1B5E20' }}
        headerImage={
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.headerTitle}>Create Resource</ThemedText>
          </View>
        }>
        
        {renderStepIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <ThemedView style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navButton, styles.backNavButton]}
            onPress={handleBack}
            disabled={isGenerating}>
            <ThemedText style={styles.backButtonText}>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, styles.nextNavButton, isGenerating && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={isGenerating}>
            <ThemedText style={styles.nextButtonText}>
              {currentStep === 3 ? 'Generate Resource' : 'Next'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>

      {/* Loading Modal */}
      <Modal
        visible={isGenerating}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>Generating your resource...</ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              {activeProfile 
                ? `Creating autism-friendly materials for ${activeProfile.studentName || 'student'} with ${activeProfile.supportLevels?.overall || 'medium'} support needs`
                : 'Creating autism-friendly materials based on your specifications'
              }
            </ThemedText>
          </View>
        </View>
      </Modal>

      {/* Resource Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="fullScreen">
        <ResourceEditor
          content={generatedContent}
          onSave={handleSaveResource}
          onExport={handleExportResource}
          onClose={handleCloseEditor}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    height: 100,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#4CAF50',
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textAreaInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#4CAF50',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionSelected: {
    color: '#2E7D32',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contextCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  contextCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  contextLabel: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  contextLabelSelected: {
    color: '#fff',
  },
  targetsList: {
    gap: 8,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  targetText: {
    flex: 1,
    fontSize: 14,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formatCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  formatCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  formatLabel: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  formatLabelSelected: {
    color: '#fff',
  },
  toggleGroup: {
    marginTop: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backNavButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nextNavButton: {
    backgroundColor: '#4CAF50',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  navButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    minWidth: 280,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Autism Profile Integration Styles
  profileSelector: {
    marginBottom: 8,
  },
  activeProfileCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
  },
  profileTags: {
    flexDirection: 'row',
    gap: 6,
  },
  profileTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileTagText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  changeProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  changeProfileText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  noProfileCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  noProfileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  noProfileDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  noProfileAction: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 8,
  },
});