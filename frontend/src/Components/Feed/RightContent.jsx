import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import SearchModal from '../Search/SearchModal';
import axios from 'axios';
import { useUserContext } from '../../Usercontext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function RightContent() {
    const { userState } = useUserContext();
    const UserID = userState.id  || 0;
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [ultimosAmigos, setUltimosAmigos] = useState([]);
    const [ultimosEventos, setUltimosEventos] = useState([]);

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

    useEffect(() => {
        const cargarUltimosAmigos = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/usuario/ultimos-amigos/${userState.id}`);
                setUltimosAmigos(response.data);
            } catch (error) {
                console.error('Error al cargar los últimos amigos agregados:', error);
            }
        };

        const cargarUltimosEventos = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/evento/ultimos-eventos/${userState.id}`);
                setUltimosEventos(response.data);
            } catch (error) {
                console.error('Error al cargar los últimos eventos:', error);
                toast.error('Error al cargar los últimos eventos.');
            }
        };

        cargarUltimosAmigos();
        cargarUltimosEventos();
    }, [userState.id]);

    const formatearFecha = (fecha) => {
        try {
            return format(parseISO(fecha), "PPPP", { locale: es });
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return '';
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
                    <h4>Últimos amigos agregados</h4>
                    <ul className="list-unstyled">
                        {ultimosAmigos.map(amigo => (
                            <li key={amigo.ID} className="d-flex align-items-center mb-2">
                                <img
                                    src={amigo.Foto}
                                    alt={amigo.Mote}
                                    className="rounded-circle me-2"
                                    width="50"
                                    height="50"
                                />
                                {amigo.Mote}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <div className="right-content mt-4 p-3 rounded-4">
                    <h4>Eventos próximos</h4>
                    <ul className="list-unstyled">
                        {ultimosEventos.map(evento => (
                            <li key={evento.ID} className="d-flex align-items-center mb-2">
                                <img
                                    src={evento.Foto}
                                    alt={evento.Mote}
                                    className="rounded-circle me-2"
                                    width="50"
                                    height="50"
                                />
                                <div>
                                    <strong>{evento.Nombre}</strong> - {evento.Mote}<br />
                                    <small>
                                        {evento.Fecha_Inicio ? `Inicio: ${formatearFecha(evento.Fecha_Inicio)}` : 'N/A'} - 
                                        {evento.Fecha_Fin ? `Fin: ${formatearFecha(evento.Fecha_Fin)}` : 'N/A'}
                                    </small>
                                </div>
                            </li>
                        ))}
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