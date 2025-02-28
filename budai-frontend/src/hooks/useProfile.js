// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from "react";
import { fetchUserProfile, updateUserProfile } from "../services/profileService";
import { useAuth } from "../contexts/AuthContext";

const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      console.log("No authenticated user for profile");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = await user.getIdToken(true);
      const profileData = await fetchUserProfile(token);
      
      console.log("Profile loaded successfully:", profileData);
      setProfile(profileData.data || {});
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updateData) => {
    if (!user) {
      console.error("No authenticated user");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = await user.getIdToken(true);
      const response = await updateUserProfile(updateData, token);
      
      setProfile(prev => ({
        ...prev,
        ...updateData
      }));
      
      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user, loadProfile]);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile
  };
};

export default useProfile;