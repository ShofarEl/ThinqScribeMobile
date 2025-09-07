// Mobile Writer Store for managing writer display and profile data
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to create consistent hash from writer ID
const createHash = (writerId) => {
  const hash = writerId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return Math.abs(hash);
};

// Generate consistent display data for a writer
const generateWriterDisplayData = (writerId) => {
  const seed = createHash(writerId);
  
  const ratingSeed = (seed % 20) / 100; // 0-0.19
  const reviewSeed = seed % 50; // 0-49
  const projectSeed = seed % 100; // 0-99
  const onlineSeed = seed % 10; // 0-9
  const verifiedSeed = seed % 10; // 0-9
  
  return {
    rating: 4.6 + ratingSeed, // 4.6-4.8 range
    reviewCount: reviewSeed + 10, // 10-60 reviews
    projectsCompleted: projectSeed + 20, // 20-120 projects
    isOnline: onlineSeed > 4, // 60% online
    verified: verifiedSeed > 3, // 70% verified
    generatedAt: Date.now()
  };
};

class MobileWriterStore {
  constructor() {
    this.writerDisplayData = {};
    this.writerProfileData = {};
    this.initialized = false;
  }

  // Initialize store from AsyncStorage
  async initialize() {
    if (this.initialized) return;
    
    try {
      const [displayData, profileData] = await Promise.all([
        AsyncStorage.getItem('writer-display-data'),
        AsyncStorage.getItem('writer-profile-data')
      ]);

      this.writerDisplayData = displayData ? JSON.parse(displayData) : {};
      this.writerProfileData = profileData ? JSON.parse(profileData) : {};
      this.initialized = true;
      
      console.log('📱 [WriterStore] Initialized with data:', {
        displayDataCount: Object.keys(this.writerDisplayData).length,
        profileDataCount: Object.keys(this.writerProfileData).length
      });
    } catch (error) {
      console.error('📱 [WriterStore] Failed to initialize:', error);
      this.initialized = true; // Continue anyway
    }
  }

  // Save data to AsyncStorage
  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem('writer-display-data', JSON.stringify(this.writerDisplayData)),
        AsyncStorage.setItem('writer-profile-data', JSON.stringify(this.writerProfileData))
      ]);
    } catch (error) {
      console.error('📱 [WriterStore] Failed to save data:', error);
    }
  }

  // Get display data for a writer (generate if not exists)
  async getWriterDisplayData(writerId, writerData = {}) {
    await this.initialize();
    
    if (!this.writerDisplayData[writerId]) {
      // Generate new display data for this writer
      const displayData = generateWriterDisplayData(writerId);
      
      // Update store with new data
      this.writerDisplayData[writerId] = displayData;
      
      // Save to AsyncStorage
      this.saveData();
      
      return displayData;
    }
    
    return this.writerDisplayData[writerId];
  }

  // Get profile data for a writer
  async getWriterProfileData(writerId) {
    await this.initialize();
    return this.writerProfileData[writerId] || null;
  }

  // Update a writer's display data (for real-time updates)
  async updateWriterDisplayData(writerId, updates) {
    await this.initialize();
    
    this.writerDisplayData[writerId] = {
      ...this.writerDisplayData[writerId],
      ...updates
    };
    
    // Save to AsyncStorage
    this.saveData();
  }

  // Update a writer's profile data (for real-time updates)
  async updateWriterProfileData(writerId, profileUpdates) {
    await this.initialize();
    
    this.writerProfileData[writerId] = {
      ...this.writerProfileData[writerId],
      ...profileUpdates,
      lastUpdated: Date.now()
    };
    
    // Save to AsyncStorage
    this.saveData();
    
    console.log('📱 [WriterStore] Updated profile data for writer:', writerId, profileUpdates);
  }

  // Process raw writer data with persistent display values and profile data
  async processWriterData(writers) {
    await this.initialize();
    
    const processedWriters = await Promise.all(
      writers.map(async (writer) => {
        const displayData = await this.getWriterDisplayData(writer._id);
        const persistedProfileData = await this.getWriterProfileData(writer._id);
        
        // Merge persisted profile data with fresh API data
        // Prefer persisted profile data only if it's very recent (within last 5 minutes)
        // This allows backend updates to take precedence after a reasonable time
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const shouldUsePersistedProfile = persistedProfileData && 
          persistedProfileData.lastUpdated && 
          persistedProfileData.lastUpdated > fiveMinutesAgo;
        
        // If no persisted profile data exists, store the current API data as baseline
        if (!persistedProfileData && writer.writerProfile) {
          await this.updateWriterProfileData(writer._id, {
            name: writer.name,
            avatar: writer.avatar,
            bio: writer.writerProfile.bio,
            specialties: writer.writerProfile.specialties || [],
            responseTime: writer.writerProfile.responseTime || 24
          });
        }
        
        return {
          ...writer,
          // Use real data when available, otherwise use generated persistent data
          rating: writer.rating || displayData.rating,
          reviewCount: writer.reviewCount || displayData.reviewCount,
          projectsCompleted: writer.projectsCompleted || displayData.projectsCompleted,
          isOnline: writer.isOnline !== undefined ? writer.isOnline : displayData.isOnline,
          verified: writer.writerProfile?.verified !== undefined ? writer.writerProfile.verified : displayData.verified,
          
          // Profile data - use persisted if more recent, otherwise use API data
          name: shouldUsePersistedProfile ? (persistedProfileData.name || writer.name) : writer.name,
          avatar: shouldUsePersistedProfile ? (persistedProfileData.avatar || writer.avatar) : writer.avatar,
          responseTime: shouldUsePersistedProfile ? 
            (persistedProfileData.responseTime || writer.writerProfile?.responseTime || 24) : 
            (writer.writerProfile?.responseTime || 24),
          writerProfile: {
            ...writer.writerProfile,
            bio: shouldUsePersistedProfile ? 
              (persistedProfileData.bio !== undefined ? persistedProfileData.bio : writer.writerProfile?.bio || '') :
              (writer.writerProfile?.bio || ''),
            specialties: shouldUsePersistedProfile ?
              (persistedProfileData.specialties || writer.writerProfile?.specialties || []) :
              (writer.writerProfile?.specialties || []),
            responseTime: shouldUsePersistedProfile ?
              (persistedProfileData.responseTime || writer.writerProfile?.responseTime || 24) :
              (writer.writerProfile?.responseTime || 24)
          }
        };
      })
    );
    
    return processedWriters;
  }

  // Clear all stored data (for development/testing)
  async clearWriterData() {
    this.writerDisplayData = {};
    this.writerProfileData = {};
    
    try {
      await Promise.all([
        AsyncStorage.removeItem('writer-display-data'),
        AsyncStorage.removeItem('writer-profile-data')
      ]);
      console.log('📱 [WriterStore] All data cleared');
    } catch (error) {
      console.error('📱 [WriterStore] Failed to clear data:', error);
    }
  }
}

// Create singleton instance
const writerStore = new MobileWriterStore();

export default writerStore;

// Export utility functions for direct use
export {
  createHash, generateWriterDisplayData
};

