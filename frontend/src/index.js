import React from 'react';
import ReactDOM from 'react-dom';
import jwt_decode from 'jwt-decode';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from './Usercontext';
import AuthContainer from './Components/Auth/AuthContainer';
import FeedContainer from './Pages/feedContainer';
import ResetPassword from './Pages/resetPass';
import ForgotPass from './Components/Auth/ForgotPass';
import Profile from './Components/Feed/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/index.css';
import './Styles/fontawesome.css';

function Index() {
  const token = localStorage.getItem('authToken');
  let userID = null;
  if (token) {
    const decodedToken = jwt_decode(token);
    userID = decodedToken.UserID;
  }
  return (
    <UserProvider initialUserID={userID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/feed" /> : <AuthContainer />} />
          <Route path="/feed" element={<FeedContainer />} />
          <Route path="/forgotpassword" element={<ForgotPass />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

ReactDOM.render(<Index />, document.getElementById('root'));