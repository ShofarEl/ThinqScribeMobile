import client from './client';

export const createSupportTicket = async (ticketData) => {
  try {
    const response = await client.post('/support', ticketData);
    return response.ticket;
  } catch (error) {
    throw error;
  }
};

export const getSupportTickets = async (params) => {
  try {
    const response = await client.get('/support', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const respondToTicket = async (ticketId, message) => {
  try {
    const response = await client.post('/support/respond', { ticketId, message });
    return response.ticket;
  } catch (error) {
    throw error;
  }
};