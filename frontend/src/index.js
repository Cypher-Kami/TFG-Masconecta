import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from './Usercontext';
import AuthContainer from './Components/Auth/AuthContainer';
import FeedContainer from './Pages/feedContainer';
import ForgotPass from './Pages/forgotPassword';
import Profile from './Pages/profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/index.css';
import './Styles/fontawesome.css';

export default function Index() {
  const token = localStorage.getItem('authToken');
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/feed" /> : <AuthContainer />} />
          <Route path="/feed" element={<FeedContainer />} />
          <Route path="/editar-perfil/:id" element={<Profile />} />
          <Route path="/forgotpassword" element={<ForgotPass />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Index />);
