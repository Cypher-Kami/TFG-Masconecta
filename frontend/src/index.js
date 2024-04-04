import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import jwt_decode from 'jwt-decode';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from './Usercontext';
import AuthContainer from './Components/Auth/AuthContainer';
import FeedContainer from './Pages/feedContainer';
import ResetPassword from './Pages/resetPass';
import ForgotPass from './Components/Auth/ForgotPass';
import PrivateRoute from './Components/Auth/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Styles/index.css';
import './Styles/fontawesome.css';

function Index() {
  const isTokenExpired = (decodedToken) => {
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  }

  const token = localStorage.getItem('authToken');
  let userID = null;

  if (token) {
    const decodedToken = jwt_decode(token);
    if (isTokenExpired(decodedToken)) {
      localStorage.removeItem('authToken');
      token = null;
    } else {
      userID = decodedToken.UserID;
    }
  }

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
  }, []);

  return (
      <UserProvider initialUserID={userID}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={token ? <Navigate to="/feed" /> : <AuthContainer />} />
            <Route path="/feed" element={<PrivateRoute><FeedContainer /></PrivateRoute>} />
            <Route path="/forgotpassword" element={<ForgotPass />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
          </Routes>
        </BrowserRouter>
    </UserProvider>
  );
}

ReactDOM.render(<Index />, document.getElementById('root'));