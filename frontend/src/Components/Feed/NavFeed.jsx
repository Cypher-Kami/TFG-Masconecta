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
    const [notificaciones, setNotificaciones] = useState([]);
    const id = userState.id;

    const fetchNotificationsAndFriendRequests = async () => {
        try {
            const { data: friendData } = await axios.get(`http://localhost:3001/usuario/friend-request/${id}`);
            setSolicitudes(friendData);

            const { data: notifData } = await axios.get(`http://localhost:3001/notificacion/notificaciones/${id}`);
            if (notifData && notifData.notificaciones) {
                setNotificaciones(notifData.notificaciones);
            } else {
                setNotificaciones([]);
            }
              
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchNotificationsAndFriendRequests();
    }, [id]);

    const handleAcceptFriendRequest = async (notificationID) => {
        try {
            const response = await axios.post('http://localhost:3001/usuario/accept-friend-request', { 
                solicitudID: notificationID,
                solicitadoID: id,
            });
    
            if (response.status >= 200 && response.status < 300) {
                fetchNotificationsAndFriendRequests();
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
                toast.success("Solicitud de amistad rechazada");
            } else {
                toast.error("Hubo un error al rechazar la solicitud.");
            }
        } catch (error) {
            toast.error("Error al rechazar la solicitud de amistad: " + error.message);
        }
    };

    const handleNotificationsClick = () => {
        axios.put('/notificacion/marcar-notificaciones', { usuarioID: id })
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => {
                console.error("Error al marcar notificaciones:", error);
            });
    };    

    const notificationsPopover = (
        <Popover id="notifications-popover" className="custom-popover">
            <Popover.Header>Notificaciones</Popover.Header>
            <Popover.Body>
            <ListGroup>
                {notificaciones.length === 0 ? (
                    <div>No hay notificaciones</div>
                ) : (
                    notificaciones.map(notificacion => (
                    <ListGroup.Item key={notificacion.ID} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                        <Image src={notificacion.Foto} roundedCircle width="40" height="40" className="me-2" />
                        <strong className='mx-1'>{notificacion.Mote}</strong>
                        <span>{notificacion.tipo === 'solicitud' ? 'quiere ser tu mascoamigo.' : 'le ha gustado tu publicación/comentario.'}</span> 
                        </div>
                        {notificacion.tipo === 'solicitud' && (
                        <div className="d-flex">
                            <Button variant="success" size="sm" onClick={() => handleAcceptFriendRequest(notificacion.ID)}>Aceptar</Button>
                            <Button variant="danger" size="sm" className="ms-2" onClick={() => handleRejectFriendRequest(notificacion.ID)}>Rechazar</Button>
                        </div>
                        )}
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
            <li className="nav-item position-relative">
                <OverlayTrigger trigger="click" placement="right" overlay={notificationsPopover}>
                    <li className="nav-item" onClick={handleNotificationsClick}>
                        <a className="nav-link d-flex align-items-center" href="#">
                            <img src={NotifIcon} width="16px" height="16px" className='mx-3' />
                            Notificaciones
                            {notificaciones.length > 0 && <span className="notification-dot"></span>}
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
                <a to="#" onClick={handleLogout} className="nav-link">
                    <img src={CerrarSesionIcon} alt="Cerrar sesión" width="16px" height="16px" className='mx-3' />
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