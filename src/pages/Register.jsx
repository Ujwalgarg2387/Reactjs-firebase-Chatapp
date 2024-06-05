import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore"; 
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [err, setErr] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const displayName = formData.get('displayName');
    const email = formData.get('email');
    const password = formData.get('password');
    console.log('Display Name:', displayName);
    console.log('Email:', email);
    console.log('Password:', password);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const storageRef = ref(storage, displayName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          setErr(true);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then( async(downloadURL) => {
            await updateProfile(res.user, {
              displayName,
              photoURL:downloadURL,
            });
            
            await setDoc(doc(db, "users", res.user.uid),{
              uid: res.user.uid,
              displayName,
              email,
              photoURL:downloadURL,
            });
            
            await setDoc(doc(db, 'userChats', res.user.uid),{});
            navigate("/");
            
          });
        }
      );
      
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
              <h2 className="text-2xl font-semibold text-gray-800">Register</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="text"
                name='displayName'
                placeholder="Display Name"
                className="w-full px-4 py-2 rounded-md bg-orange-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                required
                type="email"
                name='email'
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md bg-orange-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                required
                type="password"
                name='password'
                placeholder="Password"
                className="w-full px-4 py-2 rounded-md bg-orange-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  name='avatar'
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file"
                  className="flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-md cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Add an avatar</span>
                </label>
              </div>
              <button className="w-full py-2 px-4 bg-amber-700 text-white font-semibold rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 transition-colors duration-300">
                Sign up
              </button>
              {err && <span>Something went wrong</span>}
            </form>
            <p className="mt-4 text-center text-gray-600">
              You do have an account?{" "}
              <Link to="/login" className="text-amber-600 font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      );
}

export default Register