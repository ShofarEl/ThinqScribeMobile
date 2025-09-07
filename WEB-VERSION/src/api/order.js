import client from './client';

export const createOrder = async (orderData) => {
  try {
    const response = await client.post('/order', orderData);
    return response.order;
  } catch (error) {
    throw error;
  }
};

export const getOrder = async (orderId) => {
  try {
    const response = await client.get(`/order/${orderId}`);
    return response.order;
  } catch (error) {
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await client.get('/order/user');
    return response.orders;
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (orderId, updates) => {
  try {
    const response = await client.patch(`/order/${orderId}`, updates);
    return response.order;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await client.delete(`/order/${orderId}`);
    return response.message;
  } catch (error) {
    throw error;
  }
};

export const uploadOrderFile = async (orderId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // You might need a different content type for file uploads, Axios handles multipart/form-data automatically
    // when FormData is used, so no need to explicitly set 'Content-Type': 'multipart/form-data'
    const response = await client.post(`/order/${orderId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.fileInfo;
  } catch (error) {
    throw error;
  }
};