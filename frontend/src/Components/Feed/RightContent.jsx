import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import SearchModal from '../Search/SearchModal';
import axios from 'axios';
import Img1 from '../../Assets/fotos_mascotas/gato-5.png';
import Img2 from '../../Assets/fotos_mascotas/perro-1.png';
import { useUserContext } from '../../Usercontext';

function RightContent() {
    const { userState } = useUserContext();
    const UserID = userState.id  || 0;
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const handleSearch = async () => {
        try {
            const response = await axios.get('http://localhost:3001/publicacion/search', {
                params: {
                    query: searchTerm,
                    userID: UserID
                }
            });

            if (response.data.users) {
                const usersArray = Array.isArray(response.data.users) ? response.data.users : [response.data.users];
                setSearchResults(usersArray);
                setShowModal(true);
            } else {
                toast.warn('No se encontraron resultados para la búsqueda.');
            }
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            toast.error('Hubo un error al realizar la búsqueda. Por favor, intenta nuevamente.');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
    <div className="container">
        <div className="row">
            <div className="col">
                <div className="search-input">
                    <input 
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onKeyDown={handleKeyDown}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='inputs rounded-pill'
                    />
                    <FontAwesomeIcon icon={faSearch} className="search-icon" onClick={handleSearch} />
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
            <SearchModal 
                show={showModal} 
                handleClose={() => setShowModal(false)}
                users={searchResults}
            />
        </div>
    </div>
  )
}

export default RightContent