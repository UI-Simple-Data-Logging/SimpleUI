import axios from 'axios';

const BASE = 'http://localhost:5050/api';

export const getItems = async () => {
  const res = await axios.get(`${BASE}/items`);
  return res.data;
};

export const createItem = async (item) => {
  const res = await axios.post(`${BASE}/items`, item);
  return res.data;
};

export const updateItem = async (id, item) => {
  const res = await axios.put(`${BASE}/items/${id}`, item);
  return res.data;
};

export const deleteItem = async (id) => {
  const res = await axios.delete(`${BASE}/items/${id}`);
  return res.data;
};