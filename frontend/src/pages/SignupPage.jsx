// src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmailPassword, signInWithGoogle } from '../services/authService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Sign-Up with Email/Password
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const user = await signUpWithEmailPassword(name, email, password);
      console.log('Signed up:', user);
      toast.success('Signed up successfully! Redirecting to login...', {
        position: 'bottom-right',
        autoClose: 2000, // 2 seconds
        onClose: () => navigate('/login') // Redirect after toast closes
      });
    } catch (error) {
      toast.error('Error signing up: ' + error.message);
    };
  };

  // Handle Google Sign-Up
  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log('Google Signed up:', user);
      navigate('/home'); // Redirect after successful sign-up
    } catch (error) {
      toast.error('Error signing up with Google: ' + error.message);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#121212]">
      <div className="absolute top-[-150px] right-[-150px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(123,97,255,0.2)_0%,rgba(123,97,255,0)_70%)] blur-[30px] animate-pulse"></div>
      
      <div className="w-full flex justify-center">
        <div className="w-[450px] bg-[linear-gradient(145deg,#1c1c1c,#252525)] border border-[rgba(255,255,255,0.05)] rounded-[20px] shadow-lg p-8 flex flex-col items-center space-y-4 transition-all duration-400 hover:transform hover:scale-[1.02] hover:shadow-xl">
          <h2 className="text-center text-[#e0e0e0] text-2xl font-bold mb-2">
            <span className="bg-[linear-gradient(90deg,#7b61ff,#3dcfff)] bg-clip-text text-transparent">
              Sign Up 
            </span>
            <span className="text-[#e0e0e0]"> for an Account</span>
          </h2>

          <div className="tip-container w-full mb-6 bg-[rgba(123,97,255,0.08)] border-l-4 border-[#7b61ff] p-4 rounded-lg text-left shadow-md">
            <div className="text-[#7b61ff] font-semibold mb-1">Quick Tip</div>
            <div className="text-[#d0d0d0] italic text-sm">Create a strong password or use Google Sign-up for a more secure account.</div>
          </div>

          <form className="w-full" onSubmit={handleSignUp}>
            {/* Name Field */}
            <div className="w-full mb-4">
              <label htmlFor="name" className="text-[#a0a0a0] text-sm mb-2 block">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full h-12 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md pl-4 text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#7b61ff] focus:border-transparent transition-all duration-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email Field */}
            <div className="w-full mb-4">
              <label htmlFor="email" className="text-[#a0a0a0] text-sm mb-2 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="w-full h-12 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md pl-4 text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#7b61ff] focus:border-transparent transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="w-full mb-6">
              <label htmlFor="password" className="text-[#a0a0a0] text-sm mb-2 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                className="w-full h-12 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md pl-4 text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#7b61ff] focus:border-transparent transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full h-12 bg-[linear-gradient(90deg,#7b61ff,#6a4fff)] text-white font-bold rounded-[50px] hover:bg-[linear-gradient(90deg,#8671ff,#7b61ff)] transition-all duration-300 hover:transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              Sign Up
            </button>
          </form>

          {/* Sign in with Google Button */}
          <div className="relative w-full text-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(255,255,255,0.1)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-[#1c1c1c] text-[#a0a0a0] text-sm">or continue with</span>
            </div>
          </div>

          <button
            className="w-full h-12 border border-[rgba(255,255,255,0.1)] rounded-[50px] bg-[rgba(255,255,255,0.05)] text-[#e0e0e0] font-bold flex items-center justify-center gap-3 hover:bg-[rgba(255,255,255,0.1)] transition-all duration-300"
            onClick={handleGoogleSignIn}
          >
            <img
              src="https://imagepng.org/wp-content/uploads/2019/08/google-icon.png"
              alt="Google Icon"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-[#a0a0a0] text-sm flex flex-row items-center justify-center gap-3">
              Already have an account?{' '}
              <div 
                onClick={() => navigate('/login')} 
                className="text-[#7b61ff] font-bold cursor-pointer hover:text-[#8671ff] transition-all duration-300"
              >
                Log in
              </div>
            </span>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}