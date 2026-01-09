import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Products API
export const productsApi = {
    getAll: (search, category) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        return axios.get(`${API}/products?${params}`);
    },
    getById: (id) => axios.get(`${API}/products/${id}`),
    getCategories: () => axios.get(`${API}/products/categories/list`)
};

// Plans API
export const plansApi = {
    getInternet: (minSpeed, maxPrice) => {
        const params = new URLSearchParams();
        if (minSpeed) params.append('min_speed', minSpeed);
        if (maxPrice) params.append('max_price', maxPrice);
        return axios.get(`${API}/plans/internet?${params}`);
    },
    getMobile: (minData, maxPrice) => {
        const params = new URLSearchParams();
        if (minData) params.append('min_data', minData);
        if (maxPrice) params.append('max_price', maxPrice);
        return axios.get(`${API}/plans/mobile?${params}`);
    },
    getStreaming: (minScreens, maxPrice) => {
        const params = new URLSearchParams();
        if (minScreens) params.append('min_screens', minScreens);
        if (maxPrice) params.append('max_price', maxPrice);
        return axios.get(`${API}/plans/streaming?${params}`);
    }
};

// Favorites API
export const favoritesApi = {
    getAll: () => axios.get(`${API}/favorites`, { headers: getAuthHeader() }),
    add: (itemType, itemId, itemData) => axios.post(`${API}/favorites`, 
        { item_type: itemType, item_id: itemId, item_data: itemData },
        { headers: getAuthHeader() }
    ),
    remove: (itemType, itemId) => axios.delete(`${API}/favorites/${itemType}/${itemId}`, 
        { headers: getAuthHeader() }
    )
};

// Alerts API
export const alertsApi = {
    getAll: () => axios.get(`${API}/alerts`, { headers: getAuthHeader() }),
    create: (data) => axios.post(`${API}/alerts`, data, { headers: getAuthHeader() }),
    update: (id, data) => axios.put(`${API}/alerts/${id}`, data, { headers: getAuthHeader() }),
    delete: (id) => axios.delete(`${API}/alerts/${id}`, { headers: getAuthHeader() })
};

// Expenses API
export const expensesApi = {
    getAll: (month) => {
        const params = month ? `?month=${month}` : '';
        return axios.get(`${API}/expenses${params}`, { headers: getAuthHeader() });
    },
    getSummary: (month) => {
        const params = month ? `?month=${month}` : '';
        return axios.get(`${API}/expenses/summary${params}`, { headers: getAuthHeader() });
    },
    create: (data) => axios.post(`${API}/expenses`, data, { headers: getAuthHeader() }),
    update: (id, data) => axios.put(`${API}/expenses/${id}`, data, { headers: getAuthHeader() }),
    delete: (id) => axios.delete(`${API}/expenses/${id}`, { headers: getAuthHeader() })
};
