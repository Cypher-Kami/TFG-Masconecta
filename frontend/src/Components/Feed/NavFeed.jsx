import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../Usercontext';
import { useNavigate, Link } from 'react-router-dom';
import { Popover, OverlayTrigger, Button, Image, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HomeIcon from '../../Assets/iconos/Menu/Inicio.svg'
import MsgIcon from '../../Assets/iconos/Menu/Mensaje.svg'
import NotifIcon from '../../Assets/iconos/Menu/Notificacion.svg'
import ProfIcon from '../../Assets/iconos/Menu/Perfil.svg'
import EventIcon from '../../Assets/iconos/Menu/Eventos.svg'
import GroupIcon from '../../Assets/iconos/Menu/Grupos.svg'
import CerrarSesionIcon from '../../Assets/iconos/Menu/Cerrar sesion.svg'

function NavFeed() {
    const navigate = useNavigate();
    const { userState, dispatch } = useUserContext();
    const [activeLink, setActiveLink] = useState('Home');
    const [solicitudes, setSolicitudes] = useState([]);
    const id = userState.id;

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/usuario/friend-request/${id}`);
                setSolicitudes(response.data);
            } catch (error) {
                console.error("Error fetching friend requests:", error);
            }
        };
    
        fetchFriendRequests();
    }, [id]);

    const handleAcceptFriendRequest = async (solicitudId) => {
        try {
            const response = await axios.post('http://localhost:3001/usuario/accept-friend-request', { 
                solicitudID: solicitudId,
                solicitadoID: id,
            });
    
            if (response.status >= 200 && response.status < 300) {
                const updatedSolicitudes = solicitudes.filter(solicitud => solicitud.ID !== solicitudId);
                setSolicitudes(updatedSolicitudes);
                toast.success("Solicitud de amistad aceptada");
            } else {
                toast.error("Hubo un error al aceptar la solicitud.");
            }
        } catch (error) {
            toast.error("Error al aceptar la solicitud de amistad: " + error.message);
        }
    };

    const handleRejectFriendRequest = async (friendId) => {
        try {
            const response = await axios.post('http://localhost:3001/usuario/reject-friend-request', { 
                solicitudID: friendId
            });
            
            if (response.status >= 200 && response.status < 300) {
                const updatedSolicitudes = solicitudes.filter(solicitud => solicitud.ID !== friendId);
                setSolicitudes(updatedSolicitudes);
                toast.success("Solicitud de amistad rechazada");
            } else {
                toast.error("Hubo un error al rechazar la solicitud.");
            }
        } catch (error) {
            toast.error("Error al rechazar la solicitud de amistad: " + error.message);
        }
    };

    const notificationsPopover = (
        <Popover id="notifications-popover" className="custom-popover">
            <Popover.Header>Notificaciones</Popover.Header>
            <Popover.Body>
                <ListGroup>
                    {solicitudes.length === 0 ? (
                        <div>No hay notificaciones</div>
                    ) : (
                        solicitudes.map(solicitud => (
                            <ListGroup.Item key={solicitud.ID} className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <Image src={solicitud.Foto} roundedCircle width="40" height="40" className="me-2" />
                                    <strong className='mx-1'>{solicitud.Mote}</strong>
                                </div>
                                <div className="d-flex">
                                    <Button variant="success" size="sm" onClick={() => handleAcceptFriendRequest(solicitud.ID)}>Aceptar</Button>
                                    <Button variant="danger" size="sm" className="ms-2" onClick={() => handleRejectFriendRequest(solicitud.ID)}>Rechazar</Button>
                                </div>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            </Popover.Body>
        </Popover>
    );
    
    

    const handleComponent = ( Component ) => {
        setActiveLink(Component);
        dispatch({ type: 'SET_CURRENT_COMPONENT', payload: Component });
    };

    const handleLogout = () => {
        if (localStorage.getItem('authToken')) {
            localStorage.removeItem('authToken');
        }
        
        if (sessionStorage.getItem('authToken')) {
            sessionStorage.removeItem('authToken');
        }
    
        navigate('/');
    };
    
  return (
    <>
        <ul className="nav nav-pills flex-column">
            <li className="nav-item">
                <Link to="#" className="nav-link" onClick={() => handleComponent("Home")}>
                    <img src={HomeIcon} width="16px" height="16px" className='mx-3' />
                    Inicio
                </Link>
            </li>
            <li className="nav-item">
                <OverlayTrigger trigger="hover" placement="right" overlay={notificationsPopover}>
                    <li className="nav-item">
                        <a className="nav-link d-flex align-items-center" href="#">
                            <img src={NotifIcon} width="16px" height="16px" className='mx-3' />
                            Notificaciones
                        </a>
                    </li>
                </OverlayTrigger>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <img src={MsgIcon} width="16px" height="16px" className='mx-3' />
                    Mensajes
                </a>
            </li>
            <li className="nav-item">
                <a
                    className={`nav-link px-5 ${activeLink === 'Profile' ? 'active' : ''}`}
                    onClick={() => handleComponent("Profile")}
                >
                    <img src={ProfIcon} width="16px" height="16px" className='mx-3' />
                    Editar Perfil
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <img src={EventIcon} width="16px" height="16px" className='mx-3' />
                    Eventos
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <img src={GroupIcon} width="16px" height="16px" className='mx-3' />
                    Grupos
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" onClick={handleLogout}>
                    <img src={CerrarSesionIcon} width="16px" height="16px" className='mx-3' />
                    Cerrar sesión
                </a>
            </li>
        </ul>
        <hr />
        <div className='d-flex justify-content-center'>
            <button className="btn submit-bt p-4">
                Configuración
            </button>
        </div>
    </>
  );
}

export default NavFeed;