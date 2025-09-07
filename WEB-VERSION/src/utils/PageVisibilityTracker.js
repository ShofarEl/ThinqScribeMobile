/**
 * PageVisibilityTracker.js
 * 
 * Utility to track page visibility state using the Page Visibility API.
 * Helps determine if the user is actively viewing the current tab or has switched away.
 */

class PageVisibilityTracker {
  constructor() {
    // Store current visibility state
    this.isVisible = !document.hidden;
    
    // Callbacks for visibility change events
    this.visibilityChangeCallbacks = [];
    
    // Initialize visibility tracking
    this.init();
  }

  /**
   * Initialize visibility tracking
   */
  init() {
    // Determine which vendor prefix to use for the hidden property
    if (typeof document.hidden !== "undefined") {
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }

    // Set up event listener for visibility changes
    document.addEventListener(this.visibilityChange, this.handleVisibilityChange.bind(this), false);
    
    // Log initial state
    console.log(`👁️ [PageVisibility] Initial state: ${this.isVisible ? 'visible' : 'hidden'}`);
  }

  /**
   * Handle visibility change events
   */
  handleVisibilityChange() {
    const wasVisible = this.isVisible;
    this.isVisible = !document[this.hidden];
    
    console.log(`👁️ [PageVisibility] State changed: ${wasVisible ? 'visible' : 'hidden'} → ${this.isVisible ? 'visible' : 'hidden'}`);
    
    // Notify all registered callbacks
    this.visibilityChangeCallbacks.forEach(callback => {
      try {
        callback(this.isVisible);
      } catch (error) {
        console.error('👁️ [PageVisibility] Error in callback:', error);
      }
    });
  }

  /**
   * Check if the page is currently visible
   * @returns {boolean} - Whether the page is visible
   */
  isPageVisible() {
    return this.isVisible;
  }

  /**
   * Register a callback to be notified of visibility changes
   * @param {Function} callback - Function to call when visibility changes
   * @returns {Function} - Function to unregister the callback
   */
  onVisibilityChange(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    this.visibilityChangeCallbacks.push(callback);
    
    // Return function to unregister
    return () => {
      this.visibilityChangeCallbacks = this.visibilityChangeCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Create singleton instance
const pageVisibilityTracker = new PageVisibilityTracker();

export default pageVisibilityTracker;



