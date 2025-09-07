/**
 * NotificationSoundManager.js
 * 
 * A comprehensive utility for managing notification sounds in the application.
 * Handles browser autoplay policies, different sound types, and provides a
 * consistent API for playing notification sounds across the application.
 */

// Sound assets mapping - centralized for easy management
const SOUND_ASSETS = {
  // Message sounds
  message: '/mixkit-message-pop-alert-2354.mp3',
  longPop: '/mixkit-long-pop-2358.wav',
  
  // Agreement/important notification sounds
  happyBells: '/mixkit-happy-bells-notification-937.wav',
  
  // Call sounds
  ringtone: '/ringtone.mp3',
  
  // Default fallback
  default: '/mixkit-message-pop-alert-2354.mp3',
};

class NotificationSoundManager {
  constructor() {
    // Audio context for WebAudio API
    this.audioContext = null;
    
    // Cache for HTMLAudio elements
    this.audioElements = {};
    
    // Cache for decoded audio buffers
    this.audioBuffers = {};
    
    // Track user interaction to handle autoplay restrictions
    this.hasUserInteracted = false;
    
    // Track last played time to prevent sound spam
    this.lastPlayedAt = 0;
    
    // Minimum time between sounds in milliseconds
    this.throttleTime = 700;
    
    // Default volume
    this.defaultVolume = 0.7;
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the sound manager
   */
  init() {
    // Set up user interaction tracking
    this.setupUserInteractionTracking();
    
    // Try to initialize AudioContext
    this.initAudioContext();
    
    // Pre-load commonly used sounds
    this.preloadSounds(['message', 'longPop']);
  }

  /**
   * Set up listeners to detect user interaction for autoplay policy
   */
  setupUserInteractionTracking() {
    const markInteracted = () => {
      this.hasUserInteracted = true;
      
      // Try to initialize/resume AudioContext after interaction
      this.initAudioContext();
      
      // Remove the listeners after first interaction
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
    
    window.addEventListener('click', markInteracted, { once: true });
    window.addEventListener('touchstart', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
  }

  /**
   * Initialize or resume AudioContext
   */
  async initAudioContext() {
    try {
      // Only create if it doesn't exist yet
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioContext = new AudioContext();
          console.log('🔊 [NotificationSoundManager] AudioContext initialized');
        }
      }
      
      // Resume if suspended and user has interacted
      if (this.audioContext && this.audioContext.state === 'suspended' && this.hasUserInteracted) {
        await this.audioContext.resume();
        console.log('🔊 [NotificationSoundManager] AudioContext resumed');
      }
    } catch (error) {
      console.error('🔊 [NotificationSoundManager] Error initializing AudioContext:', error);
    }
  }

  /**
   * Preload sounds for faster playback
   * @param {Array} soundKeys - Array of sound keys to preload
   */
  preloadSounds(soundKeys) {
    if (!Array.isArray(soundKeys)) return;
    
    soundKeys.forEach(key => {
      const soundPath = SOUND_ASSETS[key];
      if (soundPath) {
        // Create and load audio element
        const audio = new Audio(soundPath);
        audio.preload = 'auto';
        this.audioElements[key] = audio;
        
        // Also fetch and decode for WebAudio as backup
        this.fetchAndDecodeAudio(soundPath).catch(() => {
          // Silent fail - we'll try again when needed
        });
      }
    });
  }

  /**
   * Fetch and decode audio file for WebAudio API
   * @param {string} soundPath - Path to the sound file
   * @returns {Promise<AudioBuffer>} - Decoded audio buffer
   */
  async fetchAndDecodeAudio(soundPath) {
    if (!this.audioContext) {
      await this.initAudioContext();
      if (!this.audioContext) {
        throw new Error('AudioContext not available');
      }
    }
    
    try {
      // Use cached buffer if available
      if (this.audioBuffers[soundPath]) {
        return this.audioBuffers[soundPath];
      }
      
      // Fetch the audio file
      const response = await fetch(soundPath, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`Failed to fetch sound: ${response.status}`);
      }
      
      // Decode the audio data
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Cache the decoded buffer
      this.audioBuffers[soundPath] = audioBuffer;
      
      return audioBuffer;
    } catch (error) {
      console.error('🔊 [NotificationSoundManager] Error fetching/decoding audio:', error);
      throw error;
    }
  }

  /**
   * Get user's preferred volume from localStorage
   * @returns {number} - Volume between 0 and 1
   */
  getVolume() {
    const volumeStr = localStorage.getItem('notificationVolume');
    return Math.min(1, Math.max(0, Number(volumeStr || this.defaultVolume) || this.defaultVolume));
  }

  /**
   * Check if notification sounds are enabled
   * @returns {boolean} - Whether sounds are enabled
   */
  areSoundsEnabled() {
    const enabled = localStorage.getItem('notificationSoundEnabled');
    return enabled !== 'false'; // Enabled by default
  }

  /**
   * Get user's preferred notification sound
   * @returns {string} - Path to the sound file
   */
  getPreferredSoundPath() {
    return localStorage.getItem('notificationSoundUrl') || SOUND_ASSETS.default;
  }

  /**
   * Play a notification sound using the best available method
   * @param {string} soundKey - Key of the sound to play
   * @returns {Promise<void>}
   */
  async playSound(soundKey = 'default') {
    try {
      // Check if sounds are enabled and user has interacted
      if (!this.hasUserInteracted || !this.areSoundsEnabled()) {
        return;
      }
      
      // Throttle sound playback
      const now = Date.now();
      if (now - this.lastPlayedAt < this.throttleTime) {
        return;
      }
      this.lastPlayedAt = now;
      
      // Get sound path and volume
      const soundPath = SOUND_ASSETS[soundKey] || this.getPreferredSoundPath();
      const volume = this.getVolume();
      
      // Try HTMLAudio first (most compatible)
      const played = await this.playWithHtmlAudio(soundKey, soundPath, volume);
      if (played) return;
      
      // Fallback to WebAudio API
      const playedWithWebAudio = await this.playWithWebAudio(soundPath, volume);
      if (playedWithWebAudio) return;
      
      // Final fallback: synthesized sound
      await this.playSynthesizedSound(volume);
    } catch (error) {
      console.error('🔊 [NotificationSoundManager] Error playing sound:', error);
    }
  }

  /**
   * Play sound using HTML Audio element
   * @param {string} soundKey - Sound key for cached audio elements
   * @param {string} soundPath - Path to the sound file
   * @param {number} volume - Volume between 0 and 1
   * @returns {Promise<boolean>} - Whether playback was successful
   */
  async playWithHtmlAudio(soundKey, soundPath, volume) {
    try {
      // Get or create audio element
      let audioElement = this.audioElements[soundKey];
      if (!audioElement) {
        audioElement = new Audio(soundPath);
        audioElement.preload = 'auto';
        this.audioElements[soundKey] = audioElement;
      }
      
      // Set volume and play
      audioElement.volume = volume;
      audioElement.currentTime = 0;
      await audioElement.play();
      
      return true;
    } catch (error) {
      console.warn('🔊 [NotificationSoundManager] HTMLAudio playback failed:', error);
      return false;
    }
  }

  /**
   * Play sound using WebAudio API
   * @param {string} soundPath - Path to the sound file
   * @param {number} volume - Volume between 0 and 1
   * @returns {Promise<boolean>} - Whether playback was successful
   */
  async playWithWebAudio(soundPath, volume) {
    try {
      if (!this.audioContext) {
        await this.initAudioContext();
        if (!this.audioContext) return false;
      }
      
      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Get or fetch audio buffer
      let buffer = this.audioBuffers[soundPath];
      if (!buffer) {
        buffer = await this.fetchAndDecodeAudio(soundPath);
      }
      
      // Create source and gain nodes
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      
      // Connect and play
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
      
      return true;
    } catch (error) {
      console.warn('🔊 [NotificationSoundManager] WebAudio playback failed:', error);
      return false;
    }
  }

  /**
   * Play a synthesized notification sound as final fallback
   * @param {number} volume - Volume between 0 and 1
   * @returns {Promise<boolean>} - Whether playback was successful
   */
  async playSynthesizedSound(volume) {
    try {
      if (!this.audioContext) {
        await this.initAudioContext();
        if (!this.audioContext) return false;
      }
      
      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create a pleasant notification chime
      const createTone = (freq, startTime, duration) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      };
      
      // Create a pleasant two-tone chime
      const t0 = this.audioContext.currentTime;
      const base = 987.77; // B5
      const fifth = base * 1.5; // F#6
      const octave = base * 2; // B6
      
      createTone(base, t0, 0.18);
      createTone(fifth, t0, 0.2);
      createTone(octave, t0 + 0.07, 0.14);
      
      return true;
    } catch (error) {
      console.warn('🔊 [NotificationSoundManager] Synthesized sound failed:', error);
      return false;
    }
  }

  /**
   * Play sound for a specific notification type
   * @param {string} type - Notification type (message, agreement, etc.)
   */
  playNotificationSound(type) {
    // Map notification types to sound keys
    const soundMapping = {
      message: 'longPop',
      agreement: 'happyBells',
      payment: 'happyBells',
      call: 'ringtone',
      default: 'message'
    };
    
    const soundKey = soundMapping[type] || soundMapping.default;
    this.playSound(soundKey);
  }
}

// Create singleton instance
const notificationSoundManager = new NotificationSoundManager();

export default notificationSoundManager;



