import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

const Login = () => {
  const [err, setErr] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    console.log('Email:', email);
    console.log('Password:', password);

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
    } catch (err) {
      setErr(true)
      console.log(err);
    }
  }
    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-l from-amber-300 via-orange-200 to-amber-100">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-amber-800">Chit-Chat</span>
              <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="email"
                name='email'
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md bg-orange-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                required
                name='password'
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded-md bg-orange-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button className="w-full py-2 px-4 bg-amber-700 text-white font-semibold rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 transition-colors duration-300">
                Sign In
              </button>
              {err && <span>Something went wrong</span>}
            </form>
            <p className="mt-4 text-center text-gray-600">
              You don't have an account?{" "}
              <Link to="/register" className="text-amber-600 font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>
      );
}

export default Login
