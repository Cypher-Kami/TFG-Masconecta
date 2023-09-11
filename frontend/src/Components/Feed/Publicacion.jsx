import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';
import MeGustaIcon from '../../Assets/iconos/Publicaciones/Me gusta.svg';
import ComentarioIcon from '../../Assets/iconos/Publicaciones/Comentario.svg';

function Publicacion() {
  const { userState, dispatch } = useUserContext();
  const { id, mote, foto, publicaciones: publicacionesContext } = userState;
  const [publicacionesBD, setPublicacionesBD] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:3001/publicacion/publicaciones/${id}`)
      .then(response => {
        const publicacionesResponse = response.data;
        console.log(publicacionesResponse);
        const nuevasPublicaciones = publicacionesResponse.map(item => ({
          Contenido: item.Contenido,
          Foto: item.Foto,
          UsuarioID: item.ID,
        }
        ));
        setPublicacionesBD(nuevasPublicaciones);
      })
      .catch(error => {
        toast.error('Error al obtener las publicaciones:', error);
      });
  }, [id, refreshKey]);

  const todasLasPublicaciones = [...publicacionesContext, ...publicacionesBD];

  const handleDelete = async (publiID) => {
    try {
        await axios.delete(`http://localhost:3001/publicacion/delete-publication/${publiID}`);
        setRefreshKey(prevKey => prevKey + 1);
      } catch (error) {
        toast.error("Error al eliminar la publicación:", error);
    }
}

  return (
  <>
    {
  todasLasPublicaciones.map((publi) => (
    <div key={publi.UsuarioID}>
      <div className='row mt-2'>
        <div className='col d-flex justify-content-start'>
          <img
            src={foto}
            alt="Imagen 2"
            className="rounded-circle me-2"
            width="50"
            height="50"
          />
          <h4 className="align-items-center mx-2">{mote}</h4>
        </div>
        <div className='col d-flex justify-content-end'>
        <div class="dropdown">
          <a class="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            ...
          </a>

          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Editar</a></li>
            <li><a class="dropdown-item" href="#" onClick={() => handleDelete(publi.ID)}>Eliminar</a></li>
          </ul>
        </div>
          <button type="submit" className='btn feed-bt px-4 py-2 rounded mb-4'>
            Seguir
          </button>
        </div>
      </div>
      { publi.Foto }
      <div className='row'>
        {publi.Foto ? <img src={publi.Foto} height="200px" className='rounded-4' /> : null}
      </div>
      <div className='row'>
        <div className='col d-flex justify-content-start'>
          <h2>{publi.Contenido}</h2>
        </div>
        <div className='col d-flex justify-content-end'>
          <button type="button" className='btn btn-light'>
            <img src={ComentarioIcon} width="16px" height="16px" className='mx-1' />
            Foto
          </button>
          <button type="button" className='btn btn-light mx-2'>
            <img src={MeGustaIcon} width="16px" height="16px" className='mx-1' />
            Video
          </button>
        </div>
      </div>
      <hr />
    </div>
  ))
}
  </>
  )
}

export default Publicacion