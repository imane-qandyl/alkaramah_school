import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { exportService } from '../services/exportService';

interface ResourceEditorProps {
  content: string;
  onSave: (editedContent: string) => void;
  onExport: (format: string) => void;
  onClose: () => void;
}

export default function ResourceEditor({ content, onSave, onExport, onClose }: ResourceEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
    Alert.alert('Saved', 'Your resource has been saved successfully!');
  };

  const handleExport = async (format: string) => {
    const result = await exportService.exportResource(editedContent, format);
    if (result.success) {
      onExport(format);
    }
  };

  const formatContent = (text: string) => {
    // Simple markdown-like formatting for display
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <ThemedText key={index} style={styles.heading1}>
              {line.substring(2)}
            </ThemedText>
          );
        } else if (line.startsWith('## ')) {
          return (
            <ThemedText key={index} style={styles.heading2}>
              {line.substring(3)}
            </ThemedText>
          );
        } else if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <ThemedText key={index} style={styles.bold}>
              {line.substring(2, line.length - 2)}
            </ThemedText>
          );
        } else if (line.startsWith('- ') || line.startsWith('□ ')) {
          return (
            <ThemedView key={index} style={styles.listItem}>
              <ThemedText style={styles.bullet}>•</ThemedText>
              <ThemedText style={styles.listText}>
                {line.substring(2)}
              </ThemedText>
            </ThemedView>
          );
        } else if (line.trim() === '') {
          return <View key={index} style={styles.spacer} />;
        } else {
          return (
            <ThemedText key={index} style={styles.paragraph}>
              {line}
            </ThemedText>
          );
        }
      });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Resource Editor</ThemedText>
        
        <TouchableOpacity 
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}>
          <Ionicons 
            name={isEditing ? "checkmark" : "create"} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
      </ThemedView>

      {/* Content Area */}
      <ScrollView style={styles.contentArea}>
        {isEditing ? (
          <TextInput
            style={styles.textEditor}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            placeholder="Edit your resource content here..."
            textAlignVertical="top"
          />
        ) : (
          <ThemedView style={styles.preview}>
            {formatContent(editedContent)}
          </ThemedView>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <ThemedView style={styles.actionBar}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        ) : (
          <ThemedView style={styles.exportButtons}>
            <TouchableOpacity 
              style={[styles.exportButton, styles.pdfButton]}
              onPress={() => handleExport('pdf')}>
              <Ionicons name="document-text-outline" size={20} color="#fff" />
              <ThemedText style={styles.exportButtonText}>PDF</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.exportButton, styles.docxButton]}
              onPress={() => handleExport('docx')}>
              <Ionicons name="document-outline" size={20} color="#fff" />
              <ThemedText style={styles.exportButtonText}>DOCX</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.exportButton, styles.shareButton]}
              onPress={() => handleExport('share')}>
              <Ionicons name="share-outline" size={20} color="#fff" />
              <ThemedText style={styles.exportButtonText}>Share</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </View>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 20,
      },
    }),
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  preview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minHeight: 400,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  textEditor: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minHeight: 400,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#333',
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: '#4CAF50',
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingLeft: 16,
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
  listText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  spacer: {
    height: 12,
  },
  actionBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
  },
  pdfButton: {
    backgroundColor: '#F44336',
  },
  docxButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#FF9800',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});