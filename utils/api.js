import axios from 'axios';

// Use Next.js internal API routes
const API_URL = '/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Note: Authentication is now handled by NextAuth
// No need for manual token management

export default api;

