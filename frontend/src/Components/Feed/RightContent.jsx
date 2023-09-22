import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import Img1 from '../../Assets/fotos_mascotas/gato-5.png';
import Img2 from '../../Assets/fotos_mascotas/perro-1.png';

function RightContent({setSearchResults}) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = async (query) => {
        try {
            if (query.trim() === "") {
                setSearchResults([]);
                return;
            }
            const response = await axios.get('http://localhost:3001/publicacion/search', {
                params: { query: query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error al buscar las publicaciones:', error);
        }
    }

  return (
    <div className="container">
        <div className="row">
            <div className="col">
                <div className="search-input">
                    <input type="text" 
                        placeholder="Buscar..."
                        value={searchTerm} 
                        onChange={e => {
                            setSearchTerm(e.target.value);
                            handleSearch(e.target.value);
                        }}
                        className='inputs rounded-pill'
                    />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="right-content mt-4 p-3 rounded-4">
                    <h4>Mascotas asociadas</h4>
                    <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                            <img
                            src={Img1}
                            alt="Imagen 1"
                            className="rounded-circle me-2"
                            width="50px"
                            height="50px"
                            />
                            Coco
                        </li>

                        <li className="d-flex align-items-center mb-2">
                            <img
                            src={Img2}
                            alt="Imagen 2"
                            className="rounded-circle me-2"
                            width="50"
                            height="50"
                            />
                            Chanel
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="right-content mt-4 p-3 rounded-4">
                    <h4>Comunidades Top</h4>
                    <ul className="list-unstyled">
                        <li className="d-flex align-items-center mb-2">
                            <img
                            src={Img1}
                            alt="Imagen 1"
                            className="rounded-circle me-2"
                            width="50px"
                            height="50px"
                            />
                            Coco
                        </li>

                        <li className="d-flex align-items-center mb-2">
                            <img
                            src={Img2}
                            alt="Imagen 2"
                            className="rounded-circle me-2"
                            width="50"
                            height="50"
                            />
                            Chanel
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RightContent