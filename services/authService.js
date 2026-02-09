/**
 * Authentication Service
 * Handles user login, logout, and session management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  constructor() {
    this.AUTH_TOKEN_KEY = 'auth_token';
    this.USER_DATA_KEY = 'user_data';
    this.USERS_KEY = 'registered_users';
    
    // Initialize with default admin user
    this.initializeDefaultUsers();
  }

  /**
   * Initialize default users in the database
   */
  async initializeDefaultUsers() {
    try {
      const existingUsers = await this.getStoredUsers();
      
      // If no users exist, create default admin user
      if (existingUsers.length === 0) {
        const defaultUsers = [
          {
            id: 'admin_001',
            username: 'admin',
            password: 'teachsmart123', // In production, this should be hashed
            email: 'admin@teachsmart.com',
            role: 'administrator',
            fullName: 'System Administrator',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
          },
          {
            id: 'teacher_001',
            username: 'teacher',
            password: 'teacher123', // In production, this should be hashed
            email: 'teacher@teachsmart.com',
            role: 'teacher',
            fullName: 'Demo Teacher',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
          }
        ];
        
        await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
        console.log('✅ Default users initialized');
        console.log('👤 Admin: username="admin", password="teachsmart123"');
        console.log('👤 Teacher: username="teacher", password="teacher123"');
      }
    } catch (error) {
      console.error('Error initializing default users:', error);
    }
  }

  /**
   * Get all stored users from database
   */
  async getStoredUsers() {
    try {
      const usersJson = await AsyncStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting stored users:', error);
      return [];
    }
  }

  /**
   * Authenticate user with username and password
   */
  async login(username, password) {
    try {
      console.log(`🔐 Attempting login for username: ${username}`);
      
      const users = await this.getStoredUsers();
      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password &&
        u.isActive
      );

      if (user) {
        // Update last login time
        user.lastLogin = new Date().toISOString();
        await this.updateUser(user);

        // Generate session token (simple implementation)
        const token = this.generateSessionToken(user);
        
        // Store authentication data
        await AsyncStorage.setItem(this.AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          lastLogin: user.lastLogin
        }));

        console.log(`✅ Login successful for ${user.fullName} (${user.role})`);
        
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            lastLogin: user.lastLogin
          },
          token: token
        };
      } else {
        console.log('❌ Login failed: Invalid credentials');
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Logout user and clear session
   */
  async logout() {
    try {
      await AsyncStorage.multiRemove([
        this.AUTH_TOKEN_KEY,
        this.USER_DATA_KEY
      ]);
      
      console.log('✅ User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(this.AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      
      if (token && userData) {
        // In a real app, you'd validate the token with a server
        // For now, we'll just check if they exist
        return {
          isAuthenticated: true,
          user: JSON.parse(userData)
        };
      }
      
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Authentication check error:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Update user information
   */
  async updateUser(updatedUser) {
    try {
      const users = await this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return { success: true };
      }
      
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Update failed' };
    }
  }

  /**
   * Register new user (for admin use)
   */
  async registerUser(userData) {
    try {
      const users = await this.getStoredUsers();
      
      // Check if username already exists
      const existingUser = users.find(u => 
        u.username.toLowerCase() === userData.username.toLowerCase()
      );
      
      if (existingUser) {
        return { success: false, error: 'Username already exists' };
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: userData.username,
        password: userData.password, // In production, hash this
        email: userData.email || '',
        role: userData.role || 'teacher',
        fullName: userData.fullName || userData.username,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      };

      users.push(newUser);
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      console.log(`✅ New user registered: ${newUser.fullName}`);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Generate simple session token
   */
  generateSessionToken(user) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 15);
    return `${user.id}_${timestamp}_${randomString}`;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'administrator') {
        return { success: false, error: 'Access denied' };
      }

      const users = await this.getStoredUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      }));

      return { success: true, users: safeUsers };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { success: false, error: 'Failed to get users' };
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const users = await this.getStoredUsers();
      const user = users.find(u => u.id === currentUser.id);
      
      if (!user || user.password !== currentPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      user.password = newPassword; // In production, hash this
      await this.updateUser(user);
      
      console.log(`✅ Password changed for user: ${user.username}`);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }

  /**
   * Clear all authentication data (for testing)
   */
  async clearAllAuthData() {
    try {
      await AsyncStorage.multiRemove([
        this.AUTH_TOKEN_KEY,
        this.USER_DATA_KEY,
        this.USERS_KEY
      ]);
      
      // Reinitialize default users
      await this.initializeDefaultUsers();
      
      console.log('✅ All authentication data cleared and reset');
      return { success: true };
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return { success: false, error: 'Clear failed' };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;