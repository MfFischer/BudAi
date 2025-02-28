import axios from 'axios';

// Centralized API URL configuration
export const BACKEND_API_URL = process.env.NODE_ENV === "production" 
  ? "https://budai-backend-9cb72ccad5cf.herokuapp.com"
  : "http://localhost:5001";

// Create a reusable axios instance
export const api = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

// Helper to add auth token to requests
export const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});