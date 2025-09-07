// Writer store for managing writer display and profile data
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useWriterStore = create(
  persist(
    (set, get) => ({
      // Writer display data (ratings, reviews, etc.)
      writerDisplayData: {},
      // Writer profile data (bio, specialties, name, avatar, etc.)
      writerProfileData: {},
      
      // Get display data for a writer (generate if not exists)
      getWriterDisplayData: (writerId, writerData = {}) => {
        const { writerDisplayData } = get();
        
        if (!writerDisplayData[writerId]) {
          // Generate new display data for this writer
          const displayData = generateWriterDisplayData(writerId);
          
          // Update store with new data
          set((state) => ({
            writerDisplayData: {
              ...state.writerDisplayData,
              [writerId]: displayData
            }
          }));
          
          return displayData;
        }
        
        return writerDisplayData[writerId];
      },
      
      // Get profile data for a writer
      getWriterProfileData: (writerId) => {
        const { writerProfileData } = get();
        return writerProfileData[writerId] || null;
      },
      
      // Update a writer's display data (for real-time updates)
      updateWriterDisplayData: (writerId, updates) => {
        set((state) => ({
          writerDisplayData: {
            ...state.writerDisplayData,
            [writerId]: {
              ...state.writerDisplayData[writerId],
              ...updates
            }
          }
        }));
      },
      
      // Update a writer's profile data (for real-time updates)
      updateWriterProfileData: (writerId, profileUpdates) => {
        set((state) => ({
          writerProfileData: {
            ...state.writerProfileData,
            [writerId]: {
              ...state.writerProfileData[writerId],
              ...profileUpdates,
              lastUpdated: Date.now()
            }
          }
        }));
      },
      
      // Process raw writer data with persistent display values and profile data
      processWriterData: (writers) => {
        const { getWriterDisplayData, getWriterProfileData, updateWriterProfileData } = get();
        
        return writers.map((writer) => {
          const displayData = getWriterDisplayData(writer._id);
          const persistedProfileData = getWriterProfileData(writer._id);
          
          // Merge persisted profile data with fresh API data
          // Prefer persisted profile data only if it's very recent (within last 5 minutes)
          // This allows backend updates to take precedence after a reasonable time
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          const shouldUsePersistedProfile = persistedProfileData && 
            persistedProfileData.lastUpdated && 
            persistedProfileData.lastUpdated > fiveMinutesAgo;
          
          // If no persisted profile data exists, store the current API data as baseline
          if (!persistedProfileData && writer.writerProfile) {
            updateWriterProfileData(writer._id, {
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
        });
      },
      
      // Clear all stored data (for development/testing)
      clearWriterData: () => {
        set({ writerDisplayData: {}, writerProfileData: {} });
      }
    }),
    {
      name: 'writer-display-storage', // localStorage key
      partialize: (state) => ({ 
        writerDisplayData: state.writerDisplayData,
        writerProfileData: state.writerProfileData
      }), // Persist both display and profile data
    }
  )
);
