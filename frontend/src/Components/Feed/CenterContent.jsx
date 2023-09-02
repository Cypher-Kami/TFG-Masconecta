import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Publicacion from './Publicacion'
import { useUserContext } from '../../Usercontext';
import VideoIcon from '../../Assets/iconos/Crear publicacion/Video.svg';
import ImagenIcon from '../../Assets/iconos/Crear publicacion/Imagen.svg';
import EventoIcon from '../../Assets/iconos/Crear publicacion/Evento.svg';

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
                        <div className='col-2 mt-2'>
                            <img src={values.Foto} alt="Profile" height="90px" width="90px" className="rounded-circle" />
                        </div>
                        <div className='col-10 d-flex align-items-center'>
                            <h2>{values.Mote}</h2>
                        </div>
                    </div>
                    <form>
                        <div className='row'>

                            <div className="col-12 form-group my-4">
                                <div className="input-group">
                                    <input className='inputs ' type="text" placeholder='¿Que hace tú mascota hoy?' />
                                </div>
                            </div>
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
                    <Publicacion />
                    soy una cambio
                </div>
            </div>
        </div>
    </>
  )
}

export default CenterContent