import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Publicacion from './Publicacion'
import { useUserContext } from '../../Usercontext';
import VideoIcon from '../../Assets/iconos/Crear publicacion/Video.svg';
import ImagenIcon from '../../Assets/iconos/Crear publicacion/Imagen.svg';
import EventoIcon from '../../Assets/iconos/Crear publicacion/Evento.svg';
import Img2 from '../../Assets/fotos_mascotas/perro-1.png';
import PerroFoto from '../../Assets/fotos_mascotas/perro-9.png';

function CenterContent() {
    const { userState, dispatch } = useUserContext();
    const [values, setValues] = useState({
        Mote: '',
        Foto: null,
    });
    const id = userState.id  || 0;
    console.log(id);
    useEffect(() => {
        axios.get(`http://localhost:3001/usuario/${id}`)
          .then(response => {
            const userData = response.data;
            console.log(userData);
            setValues({
                ...values,
                Mote: userData.Mote,
                Foto: userData.Foto,
            });
          })
          .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
          });
    }, [id]);

    return (
    <>
        <ul class="nav border-bottom justify-content-center ">
            <li class="nav-item menu-central">
                <a class="nav-link active" href="#">Para ti</a>
            </li>
            <li class="nav-item menu-central">
                <a class="nav-link" href="#">Siguiendo</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Filtrar</a>
                <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
            </li>
        </ul>
        <div className='container-fluid'>
            <div className='row mt-4'>
                <div className='col border rounded-3'>
                    <div className='row mb-2'>
                        <div className='col-2 mt-2 d-flex justify-content-end'>
                            <img src={values.Foto} alt="Profile" height="90px" width="90px" className="rounded-circle" />
                        </div>
                        <div className='col-10 d-flex align-items-center'>
                            <h2>{values.Mote}</h2>
                        </div>
                    </div>
                    <form>
                        <div className='row'>
                            <input className='inputs px-2 my-2' type="text" placeholder='¿Que hace tú mascota hoy?' />
                        </div>
                        <div className='row'>
                            <div className='col-9'>
                                <button type="button" className='btn btn-light'>
                                    <img src={ImagenIcon} width="16px" height="16px" className='mx-1' />
                                    Foto
                                </button>
                                <button type="button" className='btn btn-light mx-2'>
                                    <img src={VideoIcon} width="16px" height="16px" className='mx-1' />
                                    Video
                                </button>
                                <button type="button" className='btn btn-light'>
                                    <img src={EventoIcon} width="16px" height="16px" className='mx-1' />
                                    Evento
                                </button>
                            </div>
                            <div className='col-3 d-flex justify-content-end'>
                                <button type="submit" className='btn submit-bt mb-4 p-4'>
                                    Publicar
                                </button>
                            </div> 
                        </div>
                    </form>
                </div>
            </div>
            <div className='row mt-4'>
                <div className='col'>
                    
                </div>
            </div>
            <div className='row mt-2'>
                <div className='col d-flex justify-content-start'>
                    <img
                        src={Img2}
                        alt="Imagen 2"
                        className="rounded-circle me-2"
                        width="50"
                        height="50"
                    />
                    <h3>{values.Mote}</h3>
                    <img
                        src={Img2}
                        alt="Imagen 2"
                        className="rounded-circle me-2"
                        width="50"
                        height="50"
                    />
                    <img
                        src={Img2}
                        alt="Imagen 2"
                        className="rounded-circle me-2"
                        width="50"
                        height="50"
                    />
                </div>
                <div className='col d-flex justify-content-end'>
                    <button type='button' className='btn btn-outline-info px-4 rounded-pill'>
                        Seguir
                    </button>
                </div>
            </div>
            <div className='row'>
                <img src={PerroFoto} height="200px" className='rounded-4' />
            </div>
            <div className='row'>
                <div className='col d-flex justify-content-start'>
                    Descripcion
                </div>
                <div className='col d-flex justify-content-end'>
                    <button type="button" className='btn btn-light'>
                        <img src={ImagenIcon} width="16px" height="16px" className='mx-1' />
                        Foto
                    </button>
                    <button type="button" className='btn btn-light mx-2'>
                        <img src={VideoIcon} width="16px" height="16px" className='mx-1' />
                        Video
                    </button>
                    <button type="button" className='btn btn-light'>
                        <img src={EventoIcon} width="16px" height="16px" className='mx-1' />
                        Evento
                    </button>
                </div>
            </div>
            <hr />
        </div>
    </>
  )
}

export default CenterContent