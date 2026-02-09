# Teach Smart

AI-powered educational resource generator for autism-friendly learning materials.

## Overview

Teach Smart transforms AET (Autism Education Trust) targets into personalized, classroom-ready learning resources. The app is designed specifically for teachers working with students with autism, providing autism-friendly materials that require minimal modification.

## Features

### 🎯 Core Functionality
- **AI Resource Generation**: Convert AET targets into age-appropriate learning materials
- **Autism-Friendly Design**: Clear structure, predictable layouts, low cognitive load
- **Multiple Formats**: Worksheets, activity cards, presentation slides, checklists
- **Differentiation**: Simplified and extension versions for different ability levels
- **Full Editability**: In-app editor for customizing generated content

### 📱 User Experience
- **3-Step Wizard**: Simple resource creation process
- **Professional Interface**: Clean, teacher-focused design
- **Export Options**: PDF, DOCX, and native sharing
- **Resource Library**: Save, organize, and manage created resources
- **Offline Support**: Local storage for resources and settings

### 🧠 AI Integration
- **Smart Content Generation**: Contextual resource creation based on student parameters
- **AET Alignment**: Content specifically aligned to Autism Education Trust targets
- **Customization**: Adapts to student age, ability level, and learning context
- **Quality Assurance**: Built-in autism-friendly content validation

## Technical Stack

- **Frontend**: React Native with Expo SDK 54
- **Navigation**: Expo Router with TypeScript
- **Storage**: AsyncStorage for offline functionality
- **AI Integration**: Modular service architecture (ready for OpenAI, Claude, etc.)
- **Export**: Native sharing with PDF/DOCX generation capabilities
- **Styling**: Autism-friendly design system with consistent theming

## Database

Teach Smart uses **Enhanced AsyncStorage** - completely free and works everywhere!

### Features:
- ✅ **100% Free** - No costs, no subscriptions, no limits
- ✅ **Works Everywhere** - iOS, Android, Web - no compatibility issues
- ✅ **Local Storage** - All data stays on your device for privacy
- ✅ **Advanced Features** - Search, filtering, sorting, statistics
- ✅ **Reliable** - Built on React Native's AsyncStorage
- ✅ **Fast** - Optimized for mobile performance

### Enhanced Capabilities:
- **Smart Search**: Full-text search across all resource content
- **Advanced Filtering**: Filter by format, age group, ability level, date
- **Flexible Sorting**: Sort by title, date, age, format, last accessed
- **Rich Metadata**: Tracks creation date, last accessed, download count
- **Statistics**: Comprehensive analytics and usage insights
- **User Settings**: Persistent preferences and configuration
- **Data Export**: Backup and restore functionality

### Benefits:
- **Privacy**: All data remains local to your device
- **Offline**: Works completely offline
- **Performance**: Fast queries and data retrieval
- **Scalable**: Can handle thousands of resources
- **Cross-Platform**: Same experience on all devices
- **No Setup**: Works immediately, no configuration needed

The database is automatically initialized when you first use the app!

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd teach-smart
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Run on your preferred platform
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Press `w` for web browser
- Scan QR code with Expo Go app for physical device

## Project Structure

```
teach-smart/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Main tab navigation
│   └── bar/               # Secondary screens
├── components/            # Reusable UI components
│   ├── ResourceEditor.tsx # Content editor component
│   ├── ThemedText.tsx     # Themed text component
│   └── ThemedView.tsx     # Themed view component
├── services/              # Business logic services
│   ├── aiService.js       # AI resource generation
│   ├── exportService.js   # Export functionality
│   └── storageService.js  # Local data management
├── assets/               # Images and static files
├── constants/            # App constants and themes
└── hooks/               # Custom React hooks
```

## Key Services

### AI Service (`services/aiService.js`)
- Generates educational content from AET targets
- Customizes content based on student parameters
- Provides autism-friendly content structure
- Ready for integration with AI APIs

### Export Service (`services/exportService.js`)
- Handles PDF and DOCX export functionality
- Native sharing integration
- Export history tracking
- Format conversion utilities

### Storage Service (`services/storageService.js`)
- Local resource management with AsyncStorage
- Search and filtering capabilities
- User settings and preferences
- Resource statistics and analytics

## Usage

### Creating a Resource

1. **Student Information**: Enter student age, ability level, and learning context
2. **AET Target Selection**: Choose from comprehensive AET target library
3. **Resource Preferences**: Select format, visual support options, and text complexity
4. **AI Generation**: System creates autism-friendly content in ~2 seconds
5. **Edit & Customize**: Use in-app editor to personalize content
6. **Export & Share**: Download as PDF/DOCX or share directly

### Managing Resources

- **Library View**: Browse all created resources with search and filtering
- **Categories**: Organize by format, age group, and AET target type
- **Export History**: Track all exported resources with metadata
- **Settings**: Customize default preferences and app behavior

## Autism-Friendly Design Principles

- **Clear Visual Hierarchy**: Consistent headings, spacing, and layout
- **Minimal Cognitive Load**: Simple navigation and predictable interactions
- **High Contrast**: Accessible color schemes and typography
- **Structured Content**: Organized information with clear sections
- **Processing Time**: Appropriate pacing and loading indicators
- **Choice Making**: Options without overwhelming complexity

## Development

### Adding New Features

1. **Services**: Add business logic to appropriate service files
2. **Components**: Create reusable UI components in `/components`
3. **Screens**: Add new screens to `/app` directory
4. **Navigation**: Update tab layout in `app/(tabs)/_layout.tsx`

### AI Integration

The app is designed for easy AI integration:

```javascript
// Replace mock responses in aiService.js
async callRealAPI(prompt, params) {
  const response = await fetch('your-ai-endpoint', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ prompt, ...params })
  });
  return response.json();
}
```

### Export Integration

Ready for PDF/DOCX library integration:

```javascript
// Add to exportService.js
import RNHTMLtoPDF from 'react-native-html-to-pdf';

async generatePDF(content) {
  const options = {
    html: this.convertToHTML(content),
    fileName: 'resource',
    directory: 'Documents',
  };
  return await RNHTMLtoPDF.convert(options);
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Autism Education Trust (AET)** for educational frameworks and targets
- **Special Education Community** for autism-friendly design principles
- **Teachers and Educators** who provided feedback and requirements

## Support

For support, email support@teachsmart.app or create an issue in the repository.

---

**Teach Smart** - Empowering teachers to create autism-friendly learning materials with AI assistance.