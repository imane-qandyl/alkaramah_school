import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { imageGenerationService } from '../services/imageGenerationService';

interface ImageGenerationModalProps {
  visible: boolean;
  onClose: () => void;
  onImageGenerated?: (imageData: string, metadata: any) => void;
  initialAction?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ImageGenerationModal({
  visible,
  onClose,
  onImageGenerated,
  initialAction = '',
}: ImageGenerationModalProps) {
  const [action, setAction] = useState(initialAction);
  const [styleNote, setStyleNote] = useState('');
  const [size, setSize] = useState<'768x768' | '1024x1024'>('768x768');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<any>(null);

  const handleGenerateImage = async () => {
    if (!action.trim()) {
      Alert.alert('Error', 'Please describe the action you want to illustrate');
      return;
    }

    if (!imageGenerationService.isAvailable()) {
      Alert.alert(
        'Service Unavailable',
        'Image generation service is not configured. Please check your environment settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await imageGenerationService.generateEducationalImage({
        action: action.trim(),
        styleNote: styleNote.trim(),
        size,
      });

      if (result.success && result.image) {
        setGeneratedImage(result.image);
        setImageMetadata(result.metadata);
      } else {
        Alert.alert(
          'Generation Failed',
          result.error || 'Failed to generate image',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Image generation error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while generating the image',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage && onImageGenerated) {
      onImageGenerated(generatedImage, imageMetadata);
    }
    handleClose();
  };

  const handleClose = () => {
    setAction(initialAction);
    setStyleNote('');
    setGeneratedImage(null);
    setImageMetadata(null);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsGenerating(true);
    try {
      const result = await imageGenerationService.testConnection();
      if (result.success) {
        Alert.alert(
          'Connection Test Successful',
          'Image generation service is working correctly!',
          [{ text: 'OK' }]
        );
        if (result.testImage) {
          setGeneratedImage(result.testImage);
        }
      } else {
        Alert.alert(
          'Connection Test Failed',
          result.error || 'Unable to connect to image generation service',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Failed to test connection to image generation service',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Generate Educational Image</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Action Description *</Text>
            <TextInput
              style={styles.textInput}
              value={action}
              onChangeText={setAction}
              placeholder="Describe the action (e.g., 'brushing teeth', 'washing hands')"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              Describe what the child should be doing in the image
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Style Notes (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={styleNote}
              onChangeText={setStyleNote}
              placeholder="Additional style preferences (e.g., 'cartoon style', 'realistic')"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Image Size</Text>
            <View style={styles.sizeSelector}>
              <TouchableOpacity
                style={[
                  styles.sizeOption,
                  size === '768x768' && styles.sizeOptionSelected,
                ]}
                onPress={() => setSize('768x768')}
              >
                <Text
                  style={[
                    styles.sizeOptionText,
                    size === '768x768' && styles.sizeOptionTextSelected,
                  ]}
                >
                  768×768
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sizeOption,
                  size === '1024x1024' && styles.sizeOptionSelected,
                ]}
                onPress={() => setSize('1024x1024')}
              >
                <Text
                  style={[
                    styles.sizeOptionText,
                    size === '1024x1024' && styles.sizeOptionTextSelected,
                  ]}
                >
                  1024×1024
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.button, styles.generateButton]}
              onPress={handleGenerateImage}
              disabled={isGenerating || !action.trim()}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate Image</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={handleTestConnection}
              disabled={isGenerating}
            >
              <Text style={styles.testButtonText}>Test Connection</Text>
            </TouchableOpacity>
          </View>

          {generatedImage && (
            <View style={styles.imageSection}>
              <Text style={styles.label}>Generated Image</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: generatedImage }}
                  style={styles.generatedImage}
                  resizeMode="contain"
                />
              </View>
              
              {imageMetadata && (
                <View style={styles.metadata}>
                  <Text style={styles.metadataText}>
                    Action: {imageMetadata.action}
                  </Text>
                  <Text style={styles.metadataText}>
                    Size: {imageMetadata.size}
                  </Text>
                  <Text style={styles.metadataText}>
                    Generated: {new Date(imageMetadata.generatedAt).toLocaleString()}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, styles.useButton]}
                onPress={handleUseImage}
              >
                <Text style={styles.buttonText}>Use This Image</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Autism-Friendly Images</Text>
            <Text style={styles.infoText}>
              • Images are designed for visual schedules and educational materials
            </Text>
            <Text style={styles.infoText}>
              • Uses soft, calming colors suitable for children with autism
            </Text>
            <Text style={styles.infoText}>
              • Clear, uncluttered compositions with minimal distractions
            </Text>
            <Text style={styles.infoText}>
              • No text or labels in the images for maximum flexibility
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
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
    color: '#212529',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 44,
  },
  hint: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  sizeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  sizeOptionSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  sizeOptionText: {
    fontSize: 16,
    color: '#495057',
  },
  sizeOptionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  buttonSection: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  generateButton: {
    backgroundColor: '#007bff',
  },
  testButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  useButton: {
    backgroundColor: '#28a745',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  generatedImage: {
    width: screenWidth - 72,
    height: screenWidth - 72,
    maxWidth: 400,
    maxHeight: 400,
  },
  metadata: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  metadataText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  infoSection: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
});