import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebase/config";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login success:", result.user);
      navigate("/chat");
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/chat");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
      <img src="/images/budai-avatar.png" alt="Budd Logo" className="login-logo" />
        <h2>Welcome to Budd</h2>
        <p>Your AI companion for emotional well-being</p>

        <form onSubmit={handleEmailAuth} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            {isRegistering ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button onClick={handleGoogleLogin} className="google-button">
          <img src="/images/google-icon.svg" alt="Google" />
          Sign in with Google
        </button>

        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="auth-switch-button"
        >
          {isRegistering ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;