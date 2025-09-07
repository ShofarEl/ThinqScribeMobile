// api/writerDashboard.js
import client from './client'; // Assuming your axios client is in ./client.js

/**
 * Fetches all dashboard data for a writer.
 * @returns {Promise<Object>} The writer's dashboard data.
 */
export const fetchWriterDashboardData = async () => {
  try {
    console.log('🎯 [API] Fetching writer dashboard data...');
    const response = await client.get('/writer/dashboard');
    console.log('✅ [API] Writer dashboard data received:', response);
    
    // The client interceptor already extracts the data, so response IS the data
    return response;
  } catch (error) {
    console.error("❌ [API] Error in fetchWriterDashboardData:", error);
    // Return default data structure instead of throwing
    return {
      availableAssignments: [],
      assignmentsInProgressList: [],
      recentCompletedAssignments: [],
      assignmentsInProgress: 0,
      completedAssignmentsCount: 0,
      totalEarnings: 0,
      currentBalance: 0,
      pendingAmount: 0,
      writerRating: 0
    };
  }
};

/**
 * Accepts a specific assignment (service agreement).
 * @param {string} agreementId The ID of the service agreement to accept.
 * @returns {Promise<Object>} The response from the API.
 */
export const acceptAssignment = async (agreementId) => {
  try {
    console.log('🔄 [API] Accepting assignment:', agreementId);
    const response = await client.put(`/writer/agreements/${agreementId}/accept`);
    console.log('✅ [API] Assignment accepted:', response);
    return response;
  } catch (error) {
    console.error("❌ [API] Error in acceptAssignment:", error);
    throw error;
  }
};

/**
 * Marks a specific assignment (service agreement) as complete.
 * @param {string} agreementId The ID of the service agreement to complete.
 * @returns {Promise<Object>} The response from the API.
 */
export const completeAssignment = async (agreementId) => {
  try {
    console.log('🔄 [API] Completing assignment:', agreementId);
    
    // Try writer dashboard endpoint first, fallback to general agreements endpoint
    let response;
    try {
      response = await client.put(`/writer/agreements/${agreementId}/complete`);
      console.log('✅ [API] Assignment completed via writer endpoint:', response);
    } catch (writerError) {
      console.error('❌ [API] Writer endpoint failed:', {
        status: writerError.response?.status,
        message: writerError.response?.data?.error || writerError.message,
        details: writerError.response?.data
      });
      
      console.log('🔄 [API] Trying general endpoint as fallback...');
      try {
        response = await client.post(`/agreements/${agreementId}/complete`);
        console.log('✅ [API] Assignment completed via general endpoint:', response);
      } catch (generalError) {
        console.error('❌ [API] General endpoint also failed:', {
          status: generalError.response?.status,
          message: generalError.response?.data?.error || generalError.message,
          details: generalError.response?.data
        });
        
        // Throw the more specific error from the writer endpoint if available
        const errorToThrow = writerError.response?.data?.error || writerError.message;
        throw new Error(errorToThrow);
      }
    }
    
    return response;
  } catch (error) {
    console.error("❌ [API] Error in completeAssignment:", error);
    throw error;
  }
};

/**
 * Updates the progress of a specific assignment (service agreement).
 * @param {string} agreementId The ID of the service agreement.
 * @param {number} progress The new progress percentage (0-100).
 * @returns {Promise<Object>} The response from the API.
 */
export const updateAssignmentProgress = async (agreementId, progress) => {
  try {
    console.log('🔄 [API] Updating assignment progress:', agreementId, progress);
    const response = await client.put(`/writer/agreements/${agreementId}/progress`, { progress });
    console.log('✅ [API] Progress updated:', response);
    return response;
  } catch (error) {
    console.error("❌ [API] Error in updateAssignmentProgress:", error);
    throw error;
  }
};
