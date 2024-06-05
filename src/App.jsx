import React, { useContext, useState } from 'react'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { AuthContext } from './context/AuthContext';

const App = () => {
  const { currUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currUser){
      return <Navigate to="/login"/>
    };
    return children;
  };
  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App