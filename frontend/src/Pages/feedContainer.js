import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavFeed from '../Components/Feed/NavFeed';
import RightContent from '../Components/Feed/RightContent';
import CenterContent from '../Components/Feed/CenterContent';
import Profile from '../Components/Feed/Profile';
import Events from '../Components/Events/EventsCalendar';
import Maps from '../Components/Maps/CurrentLocationMap';
import Chats from './ChatPage';
import Banner from '../Assets/LogoPrincipal.svg'
import { useUserContext } from '../Usercontext';
import 'react-toastify/dist/ReactToastify.css';

function FeedContainer() {
  const navigate = useNavigate();
  const { userState, dispatch } = useUserContext();
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <div className='container-fluid pt-3 home-container'>
      <div className='row'>
        <div className='col-md-2'>
          <img src={Banner} width="220px" height="50px" className='mb-1' />
          <NavFeed />
        </div>
        <div className='col-md-7'>
          {userState.currentComponent === 'Home' ? (
            <CenterContent />
          ) : userState.currentComponent === 'Events' ? (
            <Events />
          ) : userState.currentComponent === 'Chats' ? (
            <Chats />
          ) : userState.currentComponent === 'Maps' ? (
            <Maps />
          )  : (
            <Profile />
          )}
        </div>
        <div className='col-md-3'>
          <RightContent />
        </div>
      </div>
    </div>
  );
}

export default FeedContainer;