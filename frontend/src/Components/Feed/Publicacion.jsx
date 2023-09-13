import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';
import MeGustaIcon from '../../Assets/iconos/Publicaciones/Me gusta.svg';
import ComentarioIcon from '../../Assets/iconos/Publicaciones/Comentario.svg';

function Publicacion() {
  const { userState, dispatch } = useUserContext();
  const { id, mote, foto, publicaciones: publicacionesContext } = userState;
  const [publicacionesBD, setPublicacionesBD] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createdObjectURLs, setCreatedObjectURLs] = useState([]);

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

  useEffect(() => {
    return () => {
        createdObjectURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [createdObjectURLs]);

  const todasLasPublicaciones = [...publicacionesContext, ...publicacionesBD];

  const publicacionesUnicas = todasLasPublicaciones.reduce((accumulator, current) => {
    if (!accumulator.some(publicacion => publicacion.UsuarioID === current.UsuarioID)) {
      accumulator.push(current);
    }
    return accumulator;
  }, []);

  const handleDelete = async (publiID) => {
    console.log(publiID);
    try {
        await axios.delete(`http://localhost:3001/publicacion/delete-publication/${publiID}`);
        setRefreshKey(prevKey => prevKey + 1);
      } catch (error) {
        toast.error("Error al eliminar la publicación:", error);
    }
  }

  function getPublicacionImageUrl(publicacionFoto) {
    if (publicacionFoto instanceof File) {
      const objectURL = URL.createObjectURL(publicacionFoto);
      setCreatedObjectURLs((prevURLs) => [...prevURLs, objectURL]);
      return objectURL;
    }
    return publicacionFoto;
  }

  return (
  <>
  {
  publicacionesUnicas.map((publi) => (
    <div key={publi.ID} className='card mb-4'>
      <div className='card-body'>
        <div className='row'>
          <div className='col-10 d-flex align-items-center'>
            <img
              src={foto}
              alt="Imagen 2"
              className="rounded-circle me-2"
              width="50"
              height="50"
            />
            <h4 className="mx-2">{mote}</h4>
          </div>
          <div className='col-2 d-flex justify-content-end'>
            <Dropdown>
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                ...
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#">Editar</Dropdown.Item>
                <Dropdown.Item href="#" onClick={() => handleDelete(publi.ID)}>Eliminar</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <button type="submit" className='btn feed-bt px-4 py-2 mx-2 rounded mb-4'>
              Seguir
            </button>
          </div>
        </div>
        <div className="row">
          <p className="fs-5">{publi.Contenido}</p>
          {publi.Foto ? 
            (
              <div class="d-flex justify-content-center align-items-center overflow-hidden">
                <img src={getPublicacionImageUrl(publi.Foto)} height="200px" />
              </div>
            )
            : null}
        </div>
      </div>
      <div className='card-footer'>
        <button type="button" className='btn btn-light'>
          <img src={ComentarioIcon} width="16px" height="16px" className='mx-1' />
          Comentarios
        </button>
        <button type="button" className='btn btn-light mx-2'>
          <img src={MeGustaIcon} width="16px" height="16px" className='mx-1' />
          Me gusta
        </button>
      </div>
    </div>
  ))
}
</>
)}

export default Publicacion;