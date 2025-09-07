import client from './client';

export const fetchTopWriters = async () => {
  try {
    const response = await client.get('/writer/top');
    return response.writers;
  } catch (error) {
    throw error;
  }
};

export const fetchWriterProfile = async (writerId) => {
  try {
    const response = await client.get(`/writer/${writerId}`);
    return response.writer;
  } catch (error) {
    throw error;
  }
};

export const searchWriters = async (filters) => {
  try {
    const response = await client.get('/writer/search', { params: filters });
    return response.writers;
  } catch (error) {
    throw error;
  }
};

export const requestWriter = async (writerId, assignmentDetails) => {
  try {
    const response = await client.post(`/writer/${writerId}/request`, assignmentDetails);
    return response.order;
  } catch (error) {
    throw error;
  }
};

export const rateWriter = async (writerId, orderId, rating, review) => {
  try {
    const response = await client.post(`/writer/${writerId}/rate`, {
      orderId,
      rating,
      review
    });
    return response.review;
  } catch (error) {
    throw error;
  }
};