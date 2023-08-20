import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthContainer from './Components/Auth/AuthContainer';
import FeedContainer from './Pages/feedContainer';
import ForgotPass from './Pages/forgotPassword';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/index.css';
import './Styles/fontawesome.css';

export default function Index() {
  const token = localStorage.getItem('authToken');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/feed" /> : <AuthContainer />} />
        <Route path="/feed" element={<FeedContainer />} />
        <Route path="/forgotpassword" element={<ForgotPass />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Index />);
