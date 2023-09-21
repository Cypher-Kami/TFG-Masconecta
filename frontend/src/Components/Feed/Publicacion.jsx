import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';
import MeGustaIcon from '../../Assets/iconos/Publicaciones/Me gusta.svg';
import ComentarioIcon from '../../Assets/iconos/Publicaciones/Comentario.svg';

function Publicacion( { refrescarPublicaciones, refreshKey } ) {
  const { userState } = useUserContext();
  const { id, mote, foto } = userState;
  const [publicacionesBD, setPublicacionesBD] = useState([]);
  const [editingPostID, setEditingPostID] = useState(null);
  const [tempPostContent, setTempPostContent] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3001/publicacion/publicaciones/${id}`)
      .then(response => {
        const publicacionesResponse = response.data;
        const nuevasPublicaciones = publicacionesResponse.map(item => ({
          ID: item.ID,
          Contenido: item.Contenido,
          Foto: item.Foto,
          UsuarioID: item.UsuarioID,
        }
      ));
        setPublicacionesBD(nuevasPublicaciones);
      })
      .catch(error => {
        toast.error('Error al obtener las publicaciones:', error);
      });
  }, [id, refreshKey]);
  
  const handleDelete = async (publiID) => {
    try {
      const response = await axios.delete(`http://localhost:3001/publicacion/delete-publication/${publiID}`);
        if (response.status >= 200 && response.status < 300) {
          refrescarPublicaciones();
          toast.success('Publicación eliminada');
        } else {
          toast.error('Error al eliminar');
      }
      } catch (error) {
        toast.error("Error al eliminar la publicación:", error);
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:3001/publicacion/edit-publication/${editingPostID}`, {
        Contenido: tempPostContent,
      });

      if (response.status >= 200 && response.status < 300) {
        refrescarPublicaciones();
        toast.success('Publicación actualizada con éxito');
      } else {
        toast.error('Error al actualizar la publicación');
      }
      setEditingPostID(null);
      setTempPostContent('');
    } catch (error) {
      toast.error('Error al actualizar la publicación:', error);
    }
  };

  const startEditing = (postID, currentContent) => {
    setEditingPostID(postID);
    setTempPostContent(currentContent);
  };

  return (
    <>
      {
        publicacionesBD.map((publi) => (
          <div key={publi.ID} className='card mb-4'>
            <div className='card-body'>
              <div className='row'>
                <div className='col-10 d-flex align-items-center'>
                  <img
                    src={foto}
                    alt="Imagen del usuario"
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
                      <Dropdown.Item href="#" onClick={() => startEditing(publi.ID, publi.Contenido)}>Editar</Dropdown.Item>
                      <Dropdown.Item href="#" onClick={() => handleDelete(publi.ID)}>Eliminar</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <button type="submit" className='btn feed-bt px-4 py-2 mx-2 rounded mb-4'>
                    Seguir
                  </button>
                </div>
              </div>
              <div className="row">
                {editingPostID === publi.ID ? (
                  <>
                    <input
                      type="text"
                      className='inputs'
                      value={tempPostContent}
                      onChange={(e) => setTempPostContent(e.target.value)}
                    />
                    <button className='btn feed-bt' onClick={handleUpdate}>Guardar</button>
                    <button className='btn feed-bt' onClick={()=> setEditingPostID(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <p className="fs-5">{publi.Contenido}</p>
                    {publi.Foto && (
                      <div className="d-flex justify-content-center align-items-center overflow-hidden">
                        <img src={publi.Foto} height="200px" alt="Foto de la publicación" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className='card-footer'>
              <button type="button" className='btn btn-light'>
                <img src={ComentarioIcon} width="16px" height="16px" className='mx-1' alt="Comentario Icono" />
                Comentarios
              </button>
              <button type="button" className='btn btn-light mx-2'>
                <img src={MeGustaIcon} width="16px" height="16px" className='mx-1' alt="Me Gusta Icono" />
                Me gusta
              </button>
            </div>
          </div>
        ))
      }
    </>
);
}

export default Publicacion;