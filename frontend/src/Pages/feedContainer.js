import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFeed from '../Components/Feed/NavFeed';
import RightContent from '../Components/Feed/RightContent';
import CenterContent from '../Components/Feed/CenterContent';
import Profile from '../Components/Feed/Profile';
import Banner from '../Assets/LogoPrincipal.svg'
import { useUserContext } from '../Usercontext';
import 'react-toastify/dist/ReactToastify.css';

function FeedContainer() {
  const navigate = useNavigate();
  const { userState, dispatch } = useUserContext();
  const [searchResults, setSearchResults] = useState([]);
  
  return (
    <div className='container-fluid pt-3 login-container'>
      <div className='row'>
        <div className='col-md-2'>
          <img src={Banner} width="220px" height="50px" className='mb-1' />
          <NavFeed />
        </div>
        <div className='col-md-7'>
          {userState.currentComponent === 'Home' ? (
              <CenterContent searchResults={searchResults} />
            ) : (
              <Profile />
            )}
        </div>
        <div className='col-md-3'>
          <RightContent setSearchResults={setSearchResults} />
        </div>
      </div>
    </div>
  );
}

export default FeedContainer;