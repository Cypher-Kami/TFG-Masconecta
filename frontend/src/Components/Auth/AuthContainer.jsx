import React, { useState } from 'react';
import Login from './Login';
import LogoP from '../../Assets/LogoPrincipal.svg';
import Perrito from '../../Assets/fotos_mascotas/perro-9.png';
import Hamster from '../../Assets/fotos_mascotas/hamster.png';
import Gato from '../../Assets/fotos_mascotas/gato-7.png';
import Gato2 from '../../Assets/fotos_mascotas/gato-2.png';
import Erizo from '../../Assets/fotos_mascotas/erizo.png';
import Perrito2 from '../../Assets/fotos_mascotas/perro-5.png';

function AuthContainer() {
  return(
    <div className='container-fluid px-4'>
      <div className='row px-3 flex-column-reverse flex-md-row'>
        <div className='col-md-7 p-2 px-5'>
          <img src={LogoP} alt="Logo Masconecta" width='400px' height='130px' />
          <h2 className='my-2 tituloh2'>Únete hoy mismo</h2>
          <h4>Consigue mascoamigos cerca de ti</h4>
          <div className='container-fluid mt-3'>
            <div className='row'>
              <div className='col p-2 mt-2'>
                <div className='mascota1 rounded'>
                  <img src={Perrito} width='200px' height='200px'/>
                </div>
              </div>
              <div className='col p-2 mt-2 d-flex align-items-center justify-content-center'>
                <div className='mascota2 rounded-circle circle d-flex align-items-center justify-content-center'>
                  <div className='circle-mask'>
                    <img src={Hamster} className='hamster'/>
                  </div>
                </div>
              </div>
              <div className='col p-2 mt-2 gato1-container'>
                <div className='mascota3'>
                  <img src={Gato} className='gato1'/>
                </div>
              </div>
            </div>
            <div className='row px-4'>
              <div className='col p-2 mt-2'>
                <div className='mascota4'>
                  <img src={Gato2} className='gato2'/>
                </div>
              </div>
              <div className='col p-2 mt-2'>
                <div className='mascota5'>
                  <img src={Erizo} className='erizo'/>
                </div>
              </div>
              <div className='col p-2 mt-2'>
                <div className='mascota6'>
                  <img src={Perrito2} className='perro2'/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-md-5 p-2 px-5 mt-4'>
          <Login/>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;