import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function RightContent() {
  return (
    <div className="container">
        <div className="row">
            <div className="col">
                <div className="search-input">
                    <input type="text" placeholder="Buscar..."  className='inputs rounded-pill'/>
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="right-content mt-4 p-3 rounded-4">
                    Mascotas asociadas
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="right-content mt-4 p-3 rounded-4">
                    Grupos populares
                </div>
            </div>
        </div>
    </div>
  )
}

export default RightContent