import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../Usercontext';
import { useNavigate, Link } from 'react-router-dom';
import { Popover, OverlayTrigger, Button, Image, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import Pusher from 'pusher-js';
import { toast } from 'react-toastify';
import HomeIcon from '../../Assets/iconos/Menu/Inicio.svg'
import MsgIcon from '../../Assets/iconos/Menu/Grupos.svg'
import NotifIcon from '../../Assets/iconos/Menu/Notificacion.svg'
import ProfIcon from '../../Assets/iconos/Menu/Perfil.svg'
import EventIcon from '../../Assets/iconos/Menu/Eventos.svg'
import MapIcon from '../../Assets/iconos/Menu/Mas opciones.svg'
import CerrarSesionIcon from '../../Assets/iconos/Menu/Cerrar sesion.svg'

function NavFeed() {
    const navigate = useNavigate();
    const { userState, dispatch } = useUserContext();
    const [activeLink, setActiveLink] = useState('Home');
    const [solicitudesAmistad, setSolicitudesAmistad] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
    const [solicitudesNoLeidas, setSolicitudesNoLeidas] = useState(0);
    const id = userState.id;

    const fetchNotificationsAndFriendRequests = async () => {
        try {
            const friendResponse = await axios.get(`http://localhost:3001/usuario/friend-request/${id}`);
            setSolicitudesAmistad(Array.isArray(friendResponse.data) ? friendResponse.data : []);

            const notifResponse = await axios.get(`http://localhost:3001/notificacion/notificaciones/${id}`);
            setNotificaciones(Array.isArray(notifResponse.data.notificaciones) ? notifResponse.data.notificaciones : []);
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
                setRefreshKey(prevKey => prevKey + 1);
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

    const handleNotificationsClick = async () => {
        try {
            const response = await axios.put('http://localhost:3001/notificacion/marcar-notificaciones', { usuarioID: id });
            if (response.status === 200) {
                toast.success("Notificaciones marcadas como leídas");
                setNotificaciones(notificaciones.map(n => ({ ...n, Leida: true })));
                setSolicitudesNoLeidas(0);
            }
        } catch (error) {
            console.error("Error al marcar notificaciones como leídas:", error);
        }
    };

    const cargarMensajesNoLeidos = async () => {
        try {
            const { data } = await axios.get(`http://localhost:3001/mensajes/no-leidos/${userState.id}`);
            setMensajesNoLeidos(data.noLeidos);
        } catch (error) {
            console.error("Error al cargar mensajes no leídos:", error);
        }
    };

    useEffect(() => {
        cargarMensajesNoLeidos();
    
        const pusher = new Pusher('91d2cc9b6e40b8c0804d', {
            cluster: 'eu',
            encrypted: true
        });
    
        const channel = pusher.subscribe('chat-channel');
        channel.bind('new-message', (data) => {
            if (data.usuarioID2 === userState.id) {
                if (activeLink !== 'Chats') {
                    setMensajesNoLeidos((prevCount) => prevCount + 1);
                }
            }
        });
    
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [userState.id, activeLink]);

    useEffect(() => {
        const fetchSolicitudesNoLeidas = async () => {
            const response = await axios.get(`http://localhost:3001/usuario/solicitudes-no-leidas/${userState.id}`);
            setSolicitudesNoLeidas(response.data.noLeidas);
        };
    
        fetchNotificationsAndFriendRequests();
        fetchSolicitudesNoLeidas();

        const pusher = new Pusher('91d2cc9b6e40b8c0804d', {
            cluster: 'eu',
            encrypted: true
        });

        const channel = pusher.subscribe('amistad-channel');
        channel.bind('nueva-solicitud', () => {
            setSolicitudesNoLeidas((prevCount) => prevCount + 1);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [userState.id]);
    
    const handleMessagesClick = async () => {
        try {
            await axios.put(`http://localhost:3001/mensajes/marcar-leidos/${userState.id}`);
            setMensajesNoLeidos(0); // Resetear el contador de mensajes no leídos
        } catch (error) {
            console.error("Error al marcar mensajes como leídos:", error);
        }
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        document.body.setAttribute('data-theme', currentTheme);
    };

    const notificationsPopover = (
        <Popover id="notifications-popover" className="custom-popover">
            <Popover.Header>Notificaciones</Popover.Header>
            <Popover.Body>
                <ListGroup>
                    {notificaciones.length === 0 && solicitudesAmistad.length === 0 ? (
                    <div>No hay notificaciones ni solicitudes de amistad</div>
                    ) : (
                    <>
                        {notificaciones.map(notificacion => (
                        <ListGroup.Item key={notificacion.ID} className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <Image src={notificacion.Foto} roundedCircle width="40" height="40" className="me-2" />
                                <div>
                                    <strong>{notificacion.Mote}</strong>
                                    <div>{notificacion.tipo === 'solicitud' ? 'quiere ser tu mascoamigo.' : 'le ha gustado tu publicación/comentario.'}</div>
                                </div>
                            </div>
                            {notificacion.tipo === 'solicitud' && (
                            <div className="d-flex align-items-center ms-auto">
                                <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleAcceptFriendRequest(notificacion.ID)}>
                                    <i className="fas fa-check"></i>
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleRejectFriendRequest(notificacion.ID)}>
                                    <i className="fas fa-times"></i>
                                </Button>
                            </div>
                            )}
                        </ListGroup.Item>
                        ))}
                        {solicitudesAmistad.map(solicitud => (
                            <ListGroup.Item key={solicitud.ID} className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <Image src={solicitud.Foto} roundedCircle width="30" height="30" className="me-2" />
                                    <strong>{solicitud.Mote}</strong>
                                </div>
                                <div className="d-flex align-items-center ms-auto">
                                    <Button variant="success" size="sm" className="me-1" onClick={() => handleAcceptFriendRequest(solicitud.ID)}>
                                        <i className="fas fa-check"></i>
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleRejectFriendRequest(solicitud.ID)}>
                                        <i className="fas fa-times"></i>
                                    </Button>
                                </div>
                            </ListGroup.Item>    
                        ))}     
                    </>
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
                            {(notificaciones.length > 0 || solicitudesNoLeidas > 0) && <span className="notification-dot"></span>}
                        </a>
                    </li>
                </OverlayTrigger>
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
                <a className="nav-link" href="#" onClick={() => handleComponent("Events")}>
                    <img src={EventIcon} width="16px" height="16px" className='mx-3' />
                    Eventos
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#" onClick={() => {
                    handleComponent("Chats");
                    handleMessagesClick();
                }}>
                    <img src={MsgIcon} width="16px" height="16px" className='mx-3' />
                    Mensajes
                    {mensajesNoLeidos > 0 && (
                        <span className="notification-dot"></span>
                    )}
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#" onClick={() => handleComponent("Maps")}>
                    <img src={MapIcon} width="16px" height="16px" className='mx-3' />
                    Servicios
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
            <button className="btn submit-bt p-2" onClick={toggleTheme}>
                Cambiar tema
            </button>
        </div>
    </>
  );
}

export default NavFeed;