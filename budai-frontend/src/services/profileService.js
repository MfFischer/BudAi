// src/services/profileService.js
import axios from 'axios';

// Use the same backend URL as chat service
const BACKEND_API_URL = process.env.NODE_ENV === "production" 
  ? "https://budai-backend-9cb72ccad5cf.herokuapp.com"
  : "http://localhost:5001"; 

export const fetchUserProfile = async (token) => {
  console.log("Fetching profile with token:", token ? "Token present" : "No token");
  
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Profile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    
    // Log detailed error information
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("No response received");
    } else {
      console.error("Error setting up request:", error.message);
    }
    
    throw error;
  }
};

export const updateUserProfile = async (profileData, token) => {
  console.log("Updating profile with data:", profileData);
  
  try {
    const response = await axios.put(
      `${BACKEND_API_URL}/api/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Profile update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};