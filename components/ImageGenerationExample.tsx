import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { imageGenerationService } from '../services/imageGenerationService';
import ImageGenerationModal from './ImageGenerationModal';

export default function ImageGenerationExample() {
  const [showModal, setShowModal] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    image: string;
    metadata: any;
  }>>([]);

  const handleImageGenerated = (imageData: string, metadata: any) => {
    setGeneratedImages(prev => [...prev, { image: imageData, metadata }]);
  };

  const testImageGeneration = async () => {
    try {
      const result = await imageGenerationService.generateEducationalImage({
        action: 'child washing hands at sink',
        size: '768x768',
        styleNote: 'simple cartoon style'
      });

      if (result.success) {
        Alert.alert('Success', 'Test image generated successfully!');
        if (result.image) {
          handleImageGenerated(result.image, result.metadata);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to generate test image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test image generation');
    }
  };

  const clearImages = () => {
    setGeneratedImages([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Generation</Text>
        <Text style={styles.subtitle}>
          Generate autism-friendly educational images for visual schedules and learning materials
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.buttonText}>Generate Custom Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={testImageGeneration}
        >
          <Text style={styles.secondaryButtonText}>Test with Sample</Text>
        </TouchableOpacity>

        {generatedImages.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearImages}
          >
            <Text style={styles.clearButtonText}>Clear Images</Text>
          </TouchableOpacity>
        )}
      </View>

      {generatedImages.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Generated Images</Text>
          {generatedImages.map((item, index) => (
            <View key={index} style={styles.imageItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.generatedImage}
                resizeMode="contain"
              />
              {item.metadata && (
                <View style={styles.imageMetadata}>
                  <Text style={styles.metadataText}>
                    Action: {item.metadata.action}
                  </Text>
                  <Text style={styles.metadataText}>
                    Size: {item.metadata.size}
                  </Text>
                  <Text style={styles.metadataText}>
                    Generated: {new Date(item.metadata.generatedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About Image Generation</Text>
        <Text style={styles.infoText}>
          This feature uses the Z AI SDK to generate autism-friendly educational images.
          Images are designed with:
        </Text>
        <Text style={styles.bulletPoint}>• Clear, simple compositions</Text>
        <Text style={styles.bulletPoint}>• Soft, calming colors</Text>
        <Text style={styles.bulletPoint}>• Minimal distracting elements</Text>
        <Text style={styles.bulletPoint}>• Educational focus for visual schedules</Text>
        <Text style={styles.bulletPoint}>• No text or labels for flexibility</Text>
      </View>

      <ImageGenerationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onImageGenerated={handleImageGenerated}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 22,
  },
  buttonSection: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  imagesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  imageItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  generatedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageMetadata: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  metadataText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    marginLeft: 8,
  },
});