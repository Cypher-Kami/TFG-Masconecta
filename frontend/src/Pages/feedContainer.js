import React from 'react';
import NavFeed from '../Components/Feed/NavFeed';
import 'react-toastify/dist/ReactToastify.css';

function FeedContainer() {

  return (
    <div>
      <NavFeed  />
      <h1>Feed</h1>
      <div className='container-fluid mt-4 login-container'>
        <div className='row d-flex align-items-center '>
          <div className='col-md-3'>
            col 1
          </div>
          <div className='col-md-6'>
            col 2
          </div>
          <div className='col-md-3'>
            col 3
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedContainer;