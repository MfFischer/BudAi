import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebugInfo = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [backendUrl, setBackendUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the backend URL being used
    const apiUrl = process.env.NODE_ENV === "production" 
      ? "https://budai-backend-9cb72ccad5cf.herokuapp.com"
      : "http://localhost:5001";
    
    setBackendUrl(apiUrl);
    
    // Check if backend is reachable
    const checkBackend = async () => {
      try {
        const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
        if (response.status === 200) {
          setBackendStatus('Online ✓');
        } else {
          setBackendStatus(`Error: Unexpected status ${response.status}`);
        }
      } catch (err) {
        setBackendStatus('Offline ✗');
        setError(err.message);
      }
    };
    
    checkBackend();
  }, []);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-2">Connection Diagnostics</h2>
      <div className="mb-2">
        <span className="font-semibold">Environment:</span> {process.env.NODE_ENV}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Backend URL:</span> {backendUrl}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Backend Status:</span> {backendStatus}
      </div>
      {error && (
        <div className="bg-red-900 p-2 rounded mt-2">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}
      <div className="text-xs mt-4">
        This diagnostic information can help identify connection issues.
      </div>
    </div>
  );
};

export default DebugInfo;