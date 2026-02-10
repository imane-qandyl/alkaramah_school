import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface GeneratedContent {
  type: string;
  data: any;
}

export default function ActivitiesPage() {
  // Force light theme colors for activities page to match mobile appearance
  const backgroundColor = useThemeColor({ light: '#FAFBFC', dark: '#FAFBFC' }, 'background');
  const textColor = useThemeColor({ light: '#34495E', dark: '#34495E' }, 'text');
  const primaryColor = useThemeColor({ light: '#2C3E50', dark: '#2C3E50' }, 'primary');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#FFFFFF' }, 'surface');
  const borderColor = useThemeColor({ light: '#E1E8ED', dark: '#E1E8ED' }, 'border');
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('counting');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Count and Add state
  const [countAddNum1, setCountAddNum1] = useState(3);
  const [countAddNum2, setCountAddNum2] = useState(2);
  const [countAddEmoji, setCountAddEmoji] = useState('🍎');
  const [countAddOperation, setCountAddOperation] = useState('+');
  
  // Match Number state
  const [matchNumber, setMatchNumber] = useState(4);
  const [matchEmoji, setMatchEmoji] = useState('🟦');
  
  // Step by Step state
  const [stepNum1, setStepNum1] = useState(2);
  const [stepNum2, setStepNum2] = useState(3);
  const [stepEmoji, setStepEmoji] = useState('🍪');
  
  // Choice state
  const [choiceNum1, setChoiceNum1] = useState(2);
  const [choiceNum2, setChoiceNum2] = useState(1);
  const [choiceEmoji, setChoiceEmoji] = useState('🍪');
  
  // Sequence state
  const [sequenceType, setSequenceType] = useState('morning');

  const emojiOptions = [
    { value: '🍎', label: 'Apple' },
    { value: '🍪', label: 'Cookie' },
    { value: '⭐', label: 'Star' },
    { value: '🟦', label: 'Blue Square' },
    { value: '❤️', label: 'Heart' },
    { value: '🌸', label: 'Flower' },
    { value: '🎈', label: 'Balloon' },
    { value: '🦋', label: 'Butterfly' }
  ];

  const sequenceOptions: Record<string, Array<{emoji: string, text: string}>> = {
    morning: [
      { emoji: '🌅', text: 'Wake up' },
      { emoji: '🪥', text: 'Brush teeth' },
      { emoji: '👕', text: 'Get dressed' },
      { emoji: '🏫', text: 'Go to school' }
    ],
    bedtime: [
      { emoji: '🛁', text: 'Take bath' },
      { emoji: '👕', text: 'Put pajamas' },
      { emoji: '📖', text: 'Read book' },
      { emoji: '😴', text: 'Sleep' }
    ],
    lunch: [
      { emoji: '🧼', text: 'Wash hands' },
      { emoji: '🍽️', text: 'Get food' },
      { emoji: '😋', text: 'Eat lunch' },
      { emoji: '🧹', text: 'Clean up' }
    ]
  };

  const calculateResult = () => {
    if (countAddOperation === '+') {
      return countAddNum1 + countAddNum2;
    } else {
      return Math.max(0, countAddNum1 - countAddNum2);
    }
  };

  const choiceResult = choiceNum1 + choiceNum2;
  const generateWrongAnswers = (correct: number) => {
    const wrong1 = Math.max(1, correct - 1);
    const wrong2 = correct + 1;
    return [wrong1, wrong2];
  };

  // Randomize functions
  const randomizeCountAdd = () => {
    setCountAddNum1(Math.floor(Math.random() * 5) + 1);
    setCountAddNum2(Math.floor(Math.random() * 5) + 1);
    setCountAddEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value);
    setCountAddOperation(Math.random() > 0.5 ? '+' : '-');
    Alert.alert('Randomized!', 'New counting problem generated');
  };

  const randomizeMatch = () => {
    setMatchNumber(Math.floor(Math.random() * 5) + 1);
    setMatchEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value);
    Alert.alert('Randomized!', 'New matching problem generated');
  };

  const randomizeSteps = () => {
    setStepNum1(Math.floor(Math.random() * 5) + 1);
    setStepNum2(Math.floor(Math.random() * 5) + 1);
    setStepEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value);
    Alert.alert('Randomized!', 'New step-by-step problem generated');
  };

  const randomizeChoice = () => {
    setChoiceNum1(Math.floor(Math.random() * 5) + 1);
    setChoiceNum2(Math.floor(Math.random() * 5) + 1);
    setChoiceEmoji(emojiOptions[Math.floor(Math.random() * emojiOptions.length)].value);
    Alert.alert('Randomized!', 'New choice problem generated');
  };

  const handleExport = (templateType: string) => {
    Alert.alert('Export Started', `Preparing ${templateType} template for download...`);
  };

  const renderTemplateSelector = () => (
    <View style={styles.templateSelector}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.templateScrollContent}
      >
        {[
          { key: 'counting', emoji: '🔢', label: 'Count & Add' },
          { key: 'matching', emoji: '🎯', label: 'Match Numbers' },
          { key: 'steps', emoji: '📝', label: 'Step-by-Step' },
          { key: 'choice', emoji: '✅', label: 'Choose Answer' },
          { key: 'sequence', emoji: '📅', label: 'Daily Sequence' }
        ].map((template) => (
          <TouchableOpacity
            key={template.key}
            style={[
              styles.templateTab,
              { 
                backgroundColor: selectedTemplate === template.key ? primaryColor : surfaceColor,
                borderColor: selectedTemplate === template.key ? primaryColor : borderColor,
              }
            ]}
            onPress={() => setSelectedTemplate(template.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.templateEmoji}>{template.emoji}</Text>
            <Text style={[
              styles.templateLabel,
              { color: selectedTemplate === template.key ? '#FFFFFF' : textColor }
            ]}>
              {template.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCountingTemplate = () => (
    <View style={styles.templateContent}>
      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Count and Add</Text>
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <Text style={styles.badgeText}>Maths Template</Text>
          </View>
        </View>
        
        <View style={[styles.aetFocus, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.aetTitle}>AET Focus:</Text>
          <Text style={styles.aetText}>• Understanding number concepts</Text>
          <Text style={styles.aetText}>• Using visual supports for problem solving</Text>
        </View>

        <View style={styles.controlPanel}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Customize Template</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>First Number</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={countAddNum1.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setCountAddNum1(Math.min(5, Math.max(1, num)));
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Second Number</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={countAddNum2.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setCountAddNum2(Math.min(5, Math.max(1, num)));
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.randomizeButton, { borderColor: primaryColor }]}
            onPress={randomizeCountAdd}
          >
            <Ionicons name="refresh-outline" size={20} color={primaryColor} />
            <Text style={[styles.randomizeText, { color: primaryColor }]}>Randomize</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.preview, { backgroundColor: '#FAFAFA' }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: textColor }]}>Generated Problem</Text>
            <TouchableOpacity
              style={[styles.exportButton, { borderColor: primaryColor }]}
              onPress={() => handleExport('Count and Add')}
            >
              <Ionicons name="download-outline" size={16} color={primaryColor} />
              <Text style={[styles.exportText, { color: primaryColor }]}>Export</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.problemContainer}>
            {/* First row */}
            <View style={styles.problemRow}>
              <View style={[styles.emojiGroup, { backgroundColor: '#F3E5F5' }]}>
                {Array.from({ length: countAddNum1 }).map((_, i) => (
                  <Text key={i} style={styles.problemEmoji}>{countAddEmoji}</Text>
                ))}
              </View>
              <Text style={[styles.numberLabel, { color: primaryColor }]}>({countAddNum1})</Text>
            </View>

            {/* Operation */}
            <View style={styles.operationRow}>
              <Ionicons 
                name={countAddOperation === '+' ? 'add-outline' : 'remove-outline'} 
                size={32} 
                color="#666" 
              />
            </View>

            {/* Second row */}
            <View style={styles.problemRow}>
              <View style={[styles.emojiGroup, { backgroundColor: '#F3E5F5' }]}>
                {Array.from({ length: countAddNum2 }).map((_, i) => (
                  <Text key={i} style={styles.problemEmoji}>{countAddEmoji}</Text>
                ))}
              </View>
              <Text style={[styles.numberLabel, { color: primaryColor }]}>({countAddNum2})</Text>
            </View>

            {/* Equals */}
            <View style={styles.operationRow}>
              <Text style={styles.equalsSign}>=</Text>
            </View>

            {/* Result */}
            <View style={styles.problemRow}>
              <View style={[styles.emojiGroup, { backgroundColor: '#E8F5E8', borderColor: '#4CAF50' }]}>
                {Array.from({ length: calculateResult() }).map((_, i) => (
                  <Text key={i} style={styles.problemEmoji}>{countAddEmoji}</Text>
                ))}
              </View>
              <Text style={[styles.numberLabel, { color: '#4CAF50' }]}>({calculateResult()})</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMatchingTemplate = () => (
    <View style={styles.templateContent}>
      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Match the Number</Text>
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <Text style={styles.badgeText}>Maths Template</Text>
          </View>
        </View>
        
        <View style={[styles.aetFocus, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.aetTitle}>Structure:</Text>
          <Text style={styles.aetText}>• Left side: number (1–5)</Text>
          <Text style={styles.aetText}>• Right side: images to count</Text>
          <Text style={styles.aetText}>• Student task: match number to image group</Text>
        </View>

        <View style={styles.controlPanel}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Customize Template</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Number</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={matchNumber.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setMatchNumber(Math.min(5, Math.max(1, num)));
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Object Type</Text>
              <TouchableOpacity
                style={[styles.emojiSelector, { borderColor }]}
                onPress={() => {
                  const currentIndex = emojiOptions.findIndex(opt => opt.value === matchEmoji);
                  const nextIndex = (currentIndex + 1) % emojiOptions.length;
                  setMatchEmoji(emojiOptions[nextIndex].value);
                }}
              >
                <Text style={styles.selectedEmoji}>{matchEmoji}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.randomizeButton, { borderColor: primaryColor }]}
            onPress={randomizeMatch}
          >
            <Ionicons name="refresh-outline" size={20} color={primaryColor} />
            <Text style={[styles.randomizeText, { color: primaryColor }]}>Randomize</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.preview, { backgroundColor: '#FAFAFA' }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: textColor }]}>Generated Matching</Text>
            <TouchableOpacity
              style={[styles.exportButton, { borderColor: primaryColor }]}
              onPress={() => handleExport('Match Number')}
            >
              <Ionicons name="download-outline" size={16} color={primaryColor} />
              <Text style={[styles.exportText, { color: primaryColor }]}>Export</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.matchingContainer}>
            {/* Left: Number */}
            <View style={[styles.numberBox, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
              <Text style={[styles.bigNumber, { color: '#1976D2' }]}>{matchNumber}</Text>
            </View>

            {/* Center: Arrow */}
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward-outline" size={40} color="#666" />
            </View>

            {/* Right: Images */}
            <View style={[styles.imageGrid, { backgroundColor: '#F3E5F5', borderColor: '#9C27B0' }]}>
              {Array.from({ length: matchNumber }).map((_, i) => (
                <Text key={i} style={styles.matchEmoji}>{matchEmoji}</Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStepsTemplate = () => (
    <View style={styles.templateContent}>
      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Solve in Steps</Text>
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <Text style={styles.badgeText}>Maths Template</Text>
          </View>
        </View>
        
        <View style={[styles.aetFocus, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.aetTitle}>Purpose:</Text>
          <Text style={styles.aetText}>Reduce cognitive load by breaking problems into manageable steps</Text>
        </View>

        <View style={styles.controlPanel}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Customize Template</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>First Group</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={stepNum1.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setStepNum1(Math.min(5, Math.max(1, num)));
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Second Group</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={stepNum2.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setStepNum2(Math.min(5, Math.max(1, num)));
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Object Type</Text>
            <TouchableOpacity
              style={[styles.emojiSelector, { borderColor }]}
              onPress={() => {
                const currentIndex = emojiOptions.findIndex(opt => opt.value === stepEmoji);
                const nextIndex = (currentIndex + 1) % emojiOptions.length;
                setStepEmoji(emojiOptions[nextIndex].value);
              }}
            >
              <Text style={styles.selectedEmoji}>{stepEmoji}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.randomizeButton, { borderColor: primaryColor }]}
            onPress={randomizeSteps}
          >
            <Ionicons name="refresh-outline" size={20} color={primaryColor} />
            <Text style={[styles.randomizeText, { color: primaryColor }]}>Randomize</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.preview, { backgroundColor: '#FAFAFA' }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: textColor }]}>Generated Steps</Text>
            <TouchableOpacity
              style={[styles.exportButton, { borderColor: primaryColor }]}
              onPress={() => handleExport('Step-by-Step')}
            >
              <Ionicons name="download-outline" size={16} color={primaryColor} />
              <Text style={[styles.exportText, { color: primaryColor }]}>Export</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.stepsContainer}>
              {/* Step 1 */}
              <View style={[styles.stepCard, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
                <Text style={[styles.stepNumber, { color: '#1976D2' }]}>Step 1</Text>
                <View style={styles.stepContent}>
                  {Array.from({ length: stepNum1 }).map((_, i) => (
                    <Text key={i} style={styles.stepEmoji}>{stepEmoji}</Text>
                  ))}
                </View>
                <Ionicons name="arrow-down-outline" size={20} color="#1976D2" />
                <Text style={[styles.stepLabel, { color: '#1976D2' }]}>Count</Text>
                <Text style={[styles.stepResult, { color: '#1976D2' }]}>{stepNum1}</Text>
              </View>

              {/* Step 2 */}
              <View style={[styles.stepCard, { backgroundColor: '#F3E5F5', borderColor: '#9C27B0' }]}>
                <Text style={[styles.stepNumber, { color: '#7B1FA2' }]}>Step 2</Text>
                <View style={styles.stepContent}>
                  {Array.from({ length: stepNum2 }).map((_, i) => (
                    <Text key={i} style={styles.stepEmoji}>{stepEmoji}</Text>
                  ))}
                </View>
                <Ionicons name="arrow-down-outline" size={20} color="#7B1FA2" />
                <Text style={[styles.stepLabel, { color: '#7B1FA2' }]}>Count</Text>
                <Text style={[styles.stepResult, { color: '#7B1FA2' }]}>{stepNum2}</Text>
              </View>

              {/* Step 3 */}
              <View style={[styles.stepCard, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
                <Text style={[styles.stepNumber, { color: '#F57C00' }]}>Step 3</Text>
                <View style={styles.stepContent}>
                  <Ionicons name="add-outline" size={32} color="#F57C00" />
                </View>
                <Text style={[styles.stepLabel, { color: '#F57C00' }]}>Add</Text>
                <Text style={[styles.stepResult, { color: '#F57C00' }]}>{stepNum1} + {stepNum2}</Text>
              </View>

              {/* Step 4 */}
              <View style={[styles.stepCard, { backgroundColor: '#E8F5E8', borderColor: '#4CAF50' }]}>
                <Text style={[styles.stepNumber, { color: '#388E3C' }]}>Step 4</Text>
                <View style={styles.stepContent}>
                  <Ionicons name="checkmark-outline" size={32} color="#388E3C" />
                </View>
                <Text style={[styles.stepLabel, { color: '#388E3C' }]}>Total</Text>
                <Text style={[styles.stepResult, { color: '#388E3C', fontSize: 24 }]}>{stepNum1 + stepNum2}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderChoiceTemplate = () => {
    const choiceResult = choiceNum1 + choiceNum2;
    const generateWrongAnswers = (correct: number) => {
      const wrong1 = Math.max(1, correct - 1);
      const wrong2 = correct + 1;
      return [wrong1, wrong2];
    };
    const wrongAnswers = generateWrongAnswers(choiceResult);

    return (
      <View style={styles.templateContent}>
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Choose the Answer</Text>
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <Text style={styles.badgeText}>Maths Template</Text>
            </View>
          </View>
          
          <View style={[styles.aetFocus, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.aetTitle}>Why It Works:</Text>
            <Text style={styles.aetText}>✓ Predictable format</Text>
            <Text style={styles.aetText}>✓ Low anxiety decision-making</Text>
            <Text style={styles.aetText}>✓ Clear visual feedback</Text>
          </View>

          <View style={styles.controlPanel}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Customize Template</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>First Number</Text>
                <TextInput
                  style={[styles.input, { borderColor, color: textColor }]}
                  value={choiceNum1.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setChoiceNum1(Math.min(5, Math.max(1, num)));
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Second Number</Text>
                <TextInput
                  style={[styles.input, { borderColor, color: textColor }]}
                  value={choiceNum2.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setChoiceNum2(Math.min(5, Math.max(1, num)));
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Object Type</Text>
              <TouchableOpacity
                style={[styles.emojiSelector, { borderColor }]}
                onPress={() => {
                  const currentIndex = emojiOptions.findIndex(opt => opt.value === choiceEmoji);
                  const nextIndex = (currentIndex + 1) % emojiOptions.length;
                  setChoiceEmoji(emojiOptions[nextIndex].value);
                }}
              >
                <Text style={styles.selectedEmoji}>{choiceEmoji}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.randomizeButton, { borderColor: primaryColor }]}
              onPress={randomizeChoice}
            >
              <Ionicons name="refresh-outline" size={20} color={primaryColor} />
              <Text style={[styles.randomizeText, { color: primaryColor }]}>Randomize</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.preview, { backgroundColor: '#FAFAFA' }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: textColor }]}>Generated Choice</Text>
              <TouchableOpacity
                style={[styles.exportButton, { borderColor: primaryColor }]}
                onPress={() => handleExport('Choose Answer')}
              >
                <Ionicons name="download-outline" size={16} color={primaryColor} />
                <Text style={[styles.exportText, { color: primaryColor }]}>Export</Text>
              </TouchableOpacity>
            </View>

            {/* Problem */}
            <View style={[styles.choiceProblem, { backgroundColor: '#F3E5F5', borderColor: '#9C27B0' }]}>
              <View style={styles.choiceProblemContent}>
                <View style={styles.choiceEmojiGroup}>
                  {Array.from({ length: choiceNum1 }).map((_, i) => (
                    <Text key={i} style={styles.choiceEmoji}>{choiceEmoji}</Text>
                  ))}
                </View>
                <Ionicons name="add-outline" size={32} color="#666" />
                <View style={styles.choiceEmojiGroup}>
                  {Array.from({ length: choiceNum2 }).map((_, i) => (
                    <Text key={i} style={styles.choiceEmoji}>{choiceEmoji}</Text>
                  ))}
                </View>
                <Text style={styles.choiceEquals}>=</Text>
                <Text style={styles.choiceQuestion}>❓</Text>
              </View>
            </View>

            {/* Answer Options */}
            <View style={styles.choiceOptions}>
              {/* Correct Answer */}
              <TouchableOpacity 
                style={[styles.choiceOption, { backgroundColor: '#E8F5E8', borderColor: '#4CAF50' }]}
                activeOpacity={0.7}
              >
                <View style={styles.choiceOptionContent}>
                  <View style={styles.choiceAnswerEmojis}>
                    {Array.from({ length: choiceResult }).map((_, i) => (
                      <Text key={i} style={styles.choiceAnswerEmoji}>{choiceEmoji}</Text>
                    ))}
                  </View>
                  <Text style={[styles.choiceAnswerNumber, { color: '#4CAF50' }]}>({choiceResult})</Text>
                  <Ionicons name="checkmark-outline" size={20} color="#4CAF50" />
                </View>
              </TouchableOpacity>

              {/* Wrong Answer 1 */}
              <TouchableOpacity 
                style={[styles.choiceOption, { backgroundColor: '#F5F5F5', borderColor: '#999' }]}
                activeOpacity={0.7}
              >
                <View style={styles.choiceOptionContent}>
                  <View style={styles.choiceAnswerEmojis}>
                    {Array.from({ length: wrongAnswers[0] }).map((_, i) => (
                      <Text key={i} style={styles.choiceAnswerEmoji}>{choiceEmoji}</Text>
                    ))}
                  </View>
                  <Text style={[styles.choiceAnswerNumber, { color: '#666' }]}>({wrongAnswers[0]})</Text>
                </View>
              </TouchableOpacity>

              {/* Wrong Answer 2 */}
              <TouchableOpacity 
                style={[styles.choiceOption, { backgroundColor: '#F5F5F5', borderColor: '#999' }]}
                activeOpacity={0.7}
              >
                <View style={styles.choiceOptionContent}>
                  <View style={styles.choiceAnswerEmojis}>
                    {Array.from({ length: wrongAnswers[1] }).map((_, i) => (
                      <Text key={i} style={styles.choiceAnswerEmoji}>{choiceEmoji}</Text>
                    ))}
                  </View>
                  <Text style={[styles.choiceAnswerNumber, { color: '#666' }]}>({wrongAnswers[1]})</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSequenceTemplate = () => {
    const currentSequence = sequenceOptions[sequenceType];
    
    return (
      <View style={styles.templateContent}>
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Daily Sequence</Text>
            <View style={[styles.badge, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.badgeText}>Life Skills Template</Text>
            </View>
          </View>
          
          <View style={[styles.aetFocus, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.aetTitle}>AET Focus:</Text>
            <Text style={styles.aetText}>Understanding routines and sequences</Text>
          </View>

          <View style={styles.controlPanel}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Customize Template</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: textColor }]}>Routine Type</Text>
              <View style={styles.sequenceSelector}>
                {Object.keys(sequenceOptions).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.sequenceOption,
                      { 
                        backgroundColor: sequenceType === type ? primaryColor : surfaceColor,
                        borderColor: sequenceType === type ? primaryColor : borderColor,
                      }
                    ]}
                    onPress={() => setSequenceType(type)}
                  >
                    <Text style={[
                      styles.sequenceOptionText,
                      { color: sequenceType === type ? '#FFFFFF' : textColor }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.preview, { backgroundColor: '#FAFAFA' }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: textColor }]}>
                {sequenceType.charAt(0).toUpperCase() + sequenceType.slice(1)} Routine
              </Text>
              <TouchableOpacity
                style={[styles.exportButton, { borderColor: primaryColor }]}
                onPress={() => handleExport('Daily Sequence')}
              >
                <Ionicons name="download-outline" size={16} color={primaryColor} />
                <Text style={[styles.exportText, { color: primaryColor }]}>Export</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sequenceGrid}>
              {currentSequence.map((step, index) => {
                const colors = [
                  { bg: '#E3F2FD', border: '#2196F3', text: '#1976D2', circle: '#2196F3' },
                  { bg: '#E8F5E8', border: '#4CAF50', text: '#388E3C', circle: '#4CAF50' },
                  { bg: '#F3E5F5', border: '#9C27B0', text: '#7B1FA2', circle: '#9C27B0' },
                  { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00', circle: '#FF9800' }
                ];
                const color = colors[index % colors.length];

                return (
                  <View 
                    key={index} 
                    style={[
                      styles.sequenceStep, 
                      { backgroundColor: color.bg, borderColor: color.border }
                    ]}
                  >
                    <View style={[styles.sequenceStepNumber, { backgroundColor: color.circle }]}>
                      <Text style={styles.sequenceStepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.sequenceStepEmoji}>{step.emoji}</Text>
                    <Text style={[styles.sequenceStepText, { color: color.text }]}>
                      {step.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (selectedTemplate) {
      case 'counting':
        return renderCountingTemplate();
      case 'matching':
        return renderMatchingTemplate();
      case 'steps':
        return renderStepsTemplate();
      case 'choice':
        return renderChoiceTemplate();
      case 'sequence':
        return renderSequenceTemplate();
      default:
        return renderCountingTemplate();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <ThemedView style={styles.header} lightColor="#FFFFFF" darkColor="#FFFFFF">
          <ThemedText type="title" style={styles.headerTitle}>Activities</ThemedText>
        </ThemedView>

        {/* Template Selector */}
        {renderTemplateSelector()}

        {/* Template Content */}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    padding: 20,
    paddingTop: 20,
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  coreIdea: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  coreIdeaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coreIdeaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  coreIdeaText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  templateSelector: {
    marginTop: 16,
    marginBottom: 24,
  },
  templateScrollContent: {
    paddingHorizontal: 4,
  },
  templateTab: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    minWidth: 110,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  templateLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  templateContent: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  aetFocus: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  aetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  aetText: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 2,
  },
  controlPanel: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  randomizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  randomizeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  preview: {
    borderRadius: 12,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  exportText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  problemContainer: {
    alignItems: 'center',
  },
  problemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiGroup: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 12,
  },
  problemEmoji: {
    fontSize: 32,
    marginRight: 4,
  },
  numberLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  operationRow: {
    marginBottom: 12,
  },
  equalsSign: {
    fontSize: 32,
    color: '#666',
  },
  comingSoon: {
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 40,
  },
  emojiSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  selectedEmoji: {
    fontSize: 24,
  },
  matchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  numberBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  arrowContainer: {
    paddingHorizontal: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchEmoji: {
    fontSize: 32,
    margin: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  stepCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 6,
    minWidth: 120,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
    marginBottom: 8,
  },
  stepEmoji: {
    fontSize: 20,
    margin: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  stepResult: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  choiceProblem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  choiceProblemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceEmojiGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  choiceEmoji: {
    fontSize: 28,
    margin: 1,
  },
  choiceEquals: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  choiceQuestion: {
    fontSize: 32,
  },
  choiceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  choiceOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  choiceOptionContent: {
    alignItems: 'center',
    gap: 8,
  },
  choiceAnswerEmojis: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  choiceAnswerEmoji: {
    fontSize: 24,
    margin: 1,
  },
  choiceAnswerNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sequenceSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sequenceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sequenceOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sequenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  sequenceStep: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 8,
  },
  sequenceStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sequenceStepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sequenceStepEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  sequenceStepText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});