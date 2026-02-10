/**
 * Enhanced Export Service for Educational Resources
 * Handles exporting generated resources to various formats with real PDF/DOCX generation
 */

import { Alert, Share } from 'react-native';

// Graceful imports with fallbacks
let FileSystem, Sharing, Print;
try {
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
  Print = require('expo-print');
} catch (error) {
  console.warn('Export packages not available, using fallback mode');
}

class ExportService {
  constructor() {
    this.exportHistory = [];
  }

  /**
   * Export resource to specified format
   */
  async exportResource(content, format, metadata = {}) {
    try {
      switch (format.toLowerCase()) {
        case 'pdf':
          return await this.exportToPDF(content, metadata);
        case 'docx':
          return await this.exportToDOCX(content, metadata);
        case 'share':
          return await this.shareResource(content, metadata);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export resource. Please try again.');
      return { success: false, error: error.message };
    }
  }

  /**
   * Export to PDF format using expo-print
   */
  async exportToPDF(content, metadata) {
    try {
      if (!Print) {
        // Fallback to sharing text if Print is not available
        return await this.shareResource(content, metadata);
      }

      const htmlContent = this.convertToEnhancedHTML(content, metadata);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      const exportRecord = {
        id: Date.now(),
        title: this.extractTitle(content),
        format: 'PDF',
        uri: uri,
        date: new Date().toISOString(),
        content: content
      };
      
      this.exportHistory.push(exportRecord);

      // Share the PDF
      if (Sharing && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save or Share PDF'
        });
        
        Alert.alert(
          'PDF Export Complete',
          'Your resource has been exported as PDF and is ready to share!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'PDF Created',
          'Your PDF has been created successfully!',
          [{ text: 'OK' }]
        );
      }
      
      return { success: true, exportRecord, uri };
    } catch (error) {
      console.error('PDF export error:', error);
      // Fallback to text sharing
      Alert.alert(
        'PDF Export',
        'PDF export is not available. Would you like to share as text instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share Text', onPress: () => this.shareResource(content, metadata) }
        ]
      );
      throw error;
    }
  }

  /**
   * Export to DOCX format (HTML-based for mobile compatibility)
   */
  async exportToDOCX(content, metadata) {
    try {
      if (!FileSystem || !Sharing) {
        // Fallback to sharing text if FileSystem is not available
        return await this.shareResource(content, metadata);
      }

      // Create HTML content formatted for Word
      const htmlContent = this.convertToWordHTML(content, metadata);
      
      // Save as HTML file that can be opened in Word
      const fileName = `${this.sanitizeFileName(this.extractTitle(content))}.html`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const exportRecord = {
        id: Date.now(),
        title: this.extractTitle(content),
        format: 'DOCX',
        uri: fileUri,
        date: new Date().toISOString(),
        content: content
      };
      
      this.exportHistory.push(exportRecord);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Save or Share Document'
        });
        
        Alert.alert(
          'Document Export Complete',
          'Your resource has been exported as a Word-compatible document!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Document Created',
          'Your document has been created successfully!',
          [{ text: 'OK' }]
        );
      }
      
      return { success: true, exportRecord, uri: fileUri };
    } catch (error) {
      console.error('DOCX export error:', error);
      // Fallback to text sharing
      Alert.alert(
        'Document Export',
        'Document export is not available. Would you like to share as text instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share Text', onPress: () => this.shareResource(content, metadata) }
        ]
      );
      throw error;
    }
  }

  /**
   * Share resource using native sharing
   */
  async shareResource(content, metadata) {
    try {
      const title = this.extractTitle(content);
      const shareContent = this.formatForSharing(content);
      
      const result = await Share.share({
        message: shareContent,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        return { success: true };
      } else {
        return { success: false, cancelled: true };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert content to enhanced HTML with professional styling
   */
  convertToEnhancedHTML(content, metadata = {}) {
    const title = this.extractTitle(content);
    const studentName = metadata.studentName || '';
    const studentAge = metadata.studentAge || '';
    const generatedDate = new Date().toLocaleDateString();
    
    // Convert markdown-like content to HTML
    let htmlContent = content
      .replace(/^# (.*$)/gm, '<h1 class="main-title">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="section-title">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="subsection-title">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="numbered">$2</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap consecutive <li> elements in <ul>
    htmlContent = htmlContent.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>');
    htmlContent = htmlContent.replace(/(<li class="numbered">.*?<\/li>(?:\s*<li class="numbered">.*?<\/li>)*)/gs, '<ol>$1</ol>');
    
    // Wrap content in paragraphs
    htmlContent = '<p>' + htmlContent + '</p>';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #3498DB;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3498DB;
            margin-bottom: 10px;
        }
        
        .main-title {
            color: #2C3E50;
            font-size: 28px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        
        .section-title {
            color: #34495E;
            font-size: 22px;
            font-weight: 600;
            margin: 25px 0 15px 0;
            padding-left: 10px;
            border-left: 4px solid #3498DB;
        }
        
        .subsection-title {
            color: #34495E;
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0 10px 0;
        }
        
        .metadata {
            background: #F8F9FA;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3498DB;
        }
        
        .metadata-item {
            margin: 5px 0;
            font-weight: 500;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.5;
        }
        
        .numbered {
            font-weight: 500;
        }
        
        strong {
            color: #2C3E50;
            font-weight: 600;
        }
        
        .activity-box {
            background: #F0F8FF;
            border: 2px solid #3498DB;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .materials-list {
            background: #FFF9E6;
            border-left: 4px solid #F39C12;
            padding: 15px;
            margin: 15px 0;
        }
        
        .steps-list {
            background: #F0FFF0;
            border-left: 4px solid #27AE60;
            padding: 15px;
            margin: 15px 0;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ECF0F1;
            text-align: center;
            color: #7F8C8D;
            font-size: 14px;
        }
        
        .ai-insights {
            background: #F5F3FF;
            border: 2px solid #8B5CF6;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .confidence-bar {
            background: #E5E7EB;
            height: 8px;
            border-radius: 4px;
            margin: 10px 0;
            overflow: hidden;
        }
        
        .confidence-fill {
            background: #10B981;
            height: 100%;
            border-radius: 4px;
        }
        
        @media print {
            body { margin: 0; padding: 20px; }
            .header { page-break-after: avoid; }
            .section-title { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎓 TeachSmart AI</div>
        <div style="color: #7F8C8D; font-size: 16px;">AI-Powered Educational Resources for Autism-Friendly Learning</div>
    </div>
    
    <div class="metadata">
        <div class="metadata-item"><strong>📅 Generated:</strong> ${generatedDate}</div>
        ${studentName ? `<div class="metadata-item"><strong>👤 Student:</strong> ${studentName}</div>` : ''}
        ${studentAge ? `<div class="metadata-item"><strong>🎂 Age:</strong> ${studentAge} years old</div>` : ''}
        <div class="metadata-item"><strong>🤖 Created by:</strong> TeachSmart Trained AI Model</div>
    </div>
    
    ${htmlContent}
    
    <div class="footer">
        <p><strong>TeachSmart AI</strong> - Empowering educators with AI-generated, autism-friendly teaching resources</p>
        <p>Generated on ${generatedDate} | For educational use</p>
    </div>
</body>
</html>`;
  }

  /**
   * Convert content to Word-compatible HTML
   */
  convertToWordHTML(content, metadata = {}) {
    // Similar to enhanced HTML but optimized for Word compatibility
    return this.convertToEnhancedHTML(content, metadata)
      .replace(/<style>[\s\S]*?<\/style>/g, '') // Remove complex CSS for Word
      .replace(/class="[^"]*"/g, ''); // Remove class attributes
  }

  /**
   * Extract title from content
   */
  extractTitle(content) {
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.startsWith('# '));
    return titleLine ? titleLine.substring(2).trim() : 'Educational Resource';
  }

  /**
   * Format content for sharing
   */
  formatForSharing(content) {
    const title = this.extractTitle(content);
    const cleanContent = content
      .replace(/^# /gm, '')
      .replace(/^## /gm, '')
      .replace(/^### /gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .trim();
    
    return `${title}\n\n📚 Generated with TeachSmart AI - Autism-friendly educational resources\n\n${cleanContent}\n\n🤖 Created by AI-powered teaching assistant`;
  }

  /**
   * Sanitize filename for file system
   */
  sanitizeFileName(filename) {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);
  }

  /**
   * Get export history
   */
  getExportHistory() {
    return this.exportHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Clear export history
   */
  clearHistory() {
    this.exportHistory = [];
  }
}

// Export singleton instance
export const exportService = new ExportService();
export default exportService;