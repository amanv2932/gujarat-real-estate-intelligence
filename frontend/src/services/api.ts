import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export const getDatasetInfo = async () => {
  const response = await api.get('/api/dataset/info');
  return response.data;
};

export const getFilters = async () => {
  const response = await api.get('/api/properties/filters');
  return response.data;
};

export const getProperties = async (params: any) => {
  const response = await api.get('/api/properties', { params });
  return response.data;
};

export const getPropertyById = async (id: string) => {
  const response = await api.get(`/api/properties/${id}`);
  return response.data;
};

export const predictPropertyValue = async (data: any) => {
  const response = await api.post('/api/predict/property-value', data);
  return response.data;
};

export const analyzeDeal = async (data: any) => {
  const response = await api.post('/api/deal-analysis', data);
  return response.data;
};

// --- Market Intelligence APIs ---

export const getMarketOverview = async (params?: any) => {
  const response = await api.get('/api/market/overview', { params });
  return response.data;
};

export const getMarketCities = async () => {
  const response = await api.get('/api/market/cities');
  return response.data;
};

export const getMarketLocalities = async (params?: any) => {
  const response = await api.get('/api/market/localities', { params });
  return response.data;
};

export const getMarketPropertyTypes = async (params?: any) => {
  const response = await api.get('/api/market/property-types', { params });
  return response.data;
};

export const getMarketBhk = async (params?: any) => {
  const response = await api.get('/api/market/bhk', { params });
  return response.data;
};

export const getMarketFurnishing = async (params?: any) => {
  const response = await api.get('/api/market/furnishing', { params });
  return response.data;
};

export const getMarketPriceDistribution = async (params?: any) => {
  const response = await api.get('/api/market/price-distribution', { params });
  return response.data;
};

export const getMarketAreaPrice = async (params?: any) => {
  const response = await api.get('/api/market/area-price', { params });
  return response.data;
};

// --- Development Intelligence APIs ---

export const getDevelopmentOverview = async () => {
  const response = await api.get('/api/development/overview');
  return response.data;
};

export const getDevelopmentReraProjects = async (params?: any) => {
  const response = await api.get('/api/development/rera-projects', { params });
  return response.data;
};

export const getDevelopmentReraLocalities = async () => {
  const response = await api.get('/api/development/rera-localities');
  return response.data;
};

export const getDevelopmentTpSchemes = async () => {
  const response = await api.get('/api/development/tp-schemes');
  return response.data;
};

export const getDevelopmentZones = async () => {
  const response = await api.get('/api/development/zones');
  return response.data;
};

export const getDevelopmentSignals = async () => {
  const response = await api.get('/api/development/signals');
  return response.data;
};

export const getDevelopmentLocation = async (locality: string) => {
  const response = await api.get(`/api/development/location/${locality}`);
  return response.data;
};

// --- Investment Intelligence APIs ---

export const investmentAnalysis = async (data: any) => {
  const response = await api.post('/api/investment-analysis', data);
  return response.data;
};


