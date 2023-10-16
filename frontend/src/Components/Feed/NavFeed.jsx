import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../Usercontext';
import { useNavigate, Link } from 'react-router-dom';
import { Popover, OverlayTrigger, Button, Image, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
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
    const [solicitudesAmistad, setSolicitudesAmistad] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const id = userState.id;

    const fetchNotificationsAndFriendRequests = async () => {
        try {
            const friendResponse = await axios.get(`http://localhost:3001/usuario/friend-request/${id}`);
            console.log(friendResponse.data);
            setSolicitudesAmistad(friendResponse.data || []);

            const notifResponse = await axios.get(`http://localhost:3001/notificacion/notificaciones/${id}`);
            setNotificaciones(notifResponse.data.notificaciones || []);
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

    const handleNotificationsClick = () => {
        axios.put('http://localhost:3001/notificacion/marcar-notificaciones', { usuarioID: id })
            .then(response => {
                if (response.status === 200) {
                    console.log(response.data.message);
                    toast.success("Notificaciones marcadas como leídas");
                    fetchNotificationsAndFriendRequests();
                } else {
                    console.error("Respuesta inesperada del servidor:", response.status);
                    toast.error("Ocurrió un problema al marcar las notificaciones.");
                }
            })
            .catch(error => {
                if (error.response) {
                    // El servidor respondió con un código de estado fuera del rango de 2xx
                    console.error("Error del servidor:", error.response.data);
                    toast.error("Error del servidor: " + error.response.data.error);
                } else if (error.request) {
                    // La solicitud se realizó pero no se recibió una respuesta
                    console.error("No se recibió respuesta del servidor:", error.request);
                    toast.error("No se recibió respuesta del servidor. Inténtalo de nuevo.");
                } else {
                    // Algo sucedió al configurar la solicitud y se disparó un error
                    console.error("Error al crear la solicitud:", error.message);
                    toast.error("Ocurrió un error al intentar marcar las notificaciones.");
                }
            });
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
                        ))}
                        {solicitudesAmistad.map(solicitud => (
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