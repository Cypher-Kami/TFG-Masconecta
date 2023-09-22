import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';
import ImagenIcon from '../../Assets/iconos/Crear publicacion/Imagen.svg';

function Publicacion( { searchResults, refrescarPublicaciones, refreshKey } ) {
  const { userState } = useUserContext();
  const { id, mote, foto } = userState;
  const [publicacionesBD, setPublicacionesBD] = useState([]);
  const [editingPostID, setEditingPostID] = useState(null);
  const [tempPostContent, setTempPostContent] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

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

  useEffect(() => {
    if (searchResults && searchResults.publications) {
      setPublicacionesBD([searchResults.publications]);
    }
  }, [searchResults]);
  
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
      let formData = new FormData();
      formData.append('Contenido', tempPostContent);
      if (selectedImageFile) {
        formData.append('Foto', selectedImageFile);
      }
      const response = await axios.put(`http://localhost:3001/publicacion/edit-publication/${editingPostID}`, formData);

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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setSelectedImageFile(file);
    }
  }

  const startEditing = (postID, currentContent) => {
    setEditingPostID(postID);
    setTempPostContent(currentContent);
  };

  const handleLikeClick = async (publicacionID, liked) => {
    try {
        const likeData = {
            TipoObjeto: 'publicacion',
            ObjetoID: publicacionID,
            UsuarioID: id,
            Accion: liked ? 'dislike' : 'like',
        };

        const response = await axios.post('http://localhost:3001/publicacion/like', likeData);

        if (response.status >= 200 && response.status < 300) {          
          setPublicacionesBD(prevPublicaciones => {
                return prevPublicaciones.map(publi => {
                    if (publi.ID === publicacionID) {
                        return {
                            ...publi,
                            liked: !liked
                        };
                    }
                    return publi;
                });
            });
        } else {
            console.error('Error al dar Me gusta:', response.data.error);
        }
    } catch (error) {
        console.error('Error al dar Me gusta:', error);
    }
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
                    Agregar
                  </button>
                </div>
              </div>
              <div className="row px-2">
                {editingPostID === publi.ID ? (
                  <>
                    <div className='d-flex justify-content-center align-items-center overflow-hidden'>
                      {previewImage && <img src={previewImage} height="200px" alt="Preview" />}
                    </div>
                    <input
                      type="text"
                      className='inputs'
                      value={tempPostContent}
                      onChange={(e) => setTempPostContent(e.target.value)}
                    />
                    <div className='d-flex justify-content-start'>
                      <label className="btn btn-light">
                          <input
                              type="file"
                              className='d-none'
                              onChange={handleImageChange}
                          />
                          <img src={ImagenIcon} width="16px" height="16px" className='mx-1' />
                          Foto
                      </label>
                    </div>
                  <div className='d-flex justify-content-center align-items-center'>
                    <button className='btn feed-bt mx-2' onClick={handleUpdate}>Guardar</button>
                    <button className='btn btn-secondary' onClick={()=> setEditingPostID(null)}>Cancelar</button>
                  </div>
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
                <FontAwesomeIcon icon={faComment} className='mx-1' />
                Comentarios
              </button>
              <button
                type="button"
                className={`btn btn-light mx-2 ${publi.liked ? 'liked' : ''}`}
                onClick={() => handleLikeClick(publi.ID, publi.liked)}
              >
              <FontAwesomeIcon
                  icon={publi.liked ? faThumbsDown : faThumbsUp}
                  className='mx-1'
              />
                {publi.liked ? 'Ya No Me Gusta' : 'Me Gusta'}
              </button>
            </div>
          <ToastContainer />
          </div>
        ))
      }
    </>
);
}

export default Publicacion;