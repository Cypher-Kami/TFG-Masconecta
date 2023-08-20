import React from 'react';
import NavFeed from '../Components/Feed/NavFeed';

function ForgotPass() {

  return (
    <div className='container-fluid login-container p-5 py-5 rounded-4 d-flex flex-column align-items-center'>
        <form >
            <h3 className="text-center">Resetear contraseña</h3>
            <input type='Email' className='inputs' />
            <button type="submit" className="btn submit-bt">
                Enviar
            </button>
        </form>
    </div>
  );
}

export default ForgotPass;