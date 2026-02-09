import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If user is already authenticated, they shouldn't see this screen
  // The root layout will handle the redirect
  useEffect(() => {
    if (user && !authLoading) {
      router.replace('/(tabs)');
    }
  }, [user, authLoading, router]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(username.trim(), password);
      
      if (result.success && result.user) {
        Alert.alert(
          'Welcome!', 
          `Hello ${result.user.fullName}! Welcome to TeachSmart.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // The AuthContext will update and root layout will handle navigation
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showCredentials = () => {
    Alert.alert(
      'Demo Credentials',
      'Use these credentials to login:\n\n' +
      '👤 Admin Account:\n' +
      'Username: admin\n' +
      'Password: teachsmart123\n\n' +
      '👤 Teacher Account:\n' +
      'Username: teacher\n' +
      'Password: teacher123',
      [
        {
          text: 'Use Admin',
          onPress: () => {
            setUsername('admin');
            setPassword('teachsmart123');
          }
        },
        {
          text: 'Use Teacher',
          onPress: () => {
            setUsername('teacher');
            setPassword('teacher123');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Show loading if auth is still being checked
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>TeachSmart</Text>
            <Text style={styles.subtitle}>AI-Powered Educational Resources</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Sign in to continue</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Demo Credentials Button */}
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={showCredentials}
              disabled={isLoading}
            >
              <Ionicons name="information-circle-outline" size={16} color="#2C3E50" />
              <Text style={styles.demoButtonText}>Show Demo Credentials</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure authentication for educators
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#34495E',
    marginBottom: 8,
    fontFamily: 'SF Pro Display',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    textAlign: 'center',
    fontFamily: 'SF Pro Text',
  },

  // Form
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F4F6F8',
    ...Platform.select({
      ios: {
        shadowColor: '#2C3E50',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34495E',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'SF Pro Display',
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'SF Pro Text',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#34495E',
    paddingVertical: 16,
    fontFamily: 'SF Pro Text',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#8B9DC3',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2C3E50',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  demoButtonText: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});