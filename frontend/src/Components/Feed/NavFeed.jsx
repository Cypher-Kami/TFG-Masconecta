import React, {useState} from 'react';
import { useUserContext } from '../../Usercontext';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
    const id = userState.id;

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
        <ul class="nav nav-pills flex-column">
            <li class="nav-item">
                <a class={`nav-link px-5 ${activeLink === 'Home' ? 'active' : ''}`} aria-current="page"
                    onClick={() => handleComponent("Home")}
                >
                    <img src={HomeIcon} width="16px" height="16px" className='mx-3' />
                    Inicio
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <img src={NotifIcon} width="16px" height="16px" className='mx-3' />
                    Notificaciones
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
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
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <img src={EventIcon} width="16px" height="16px" className='mx-3' />
                    Eventos
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">
                    <img src={GroupIcon} width="16px" height="16px" className='mx-3' />
                    Grupos
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" onClick={handleLogout}>
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