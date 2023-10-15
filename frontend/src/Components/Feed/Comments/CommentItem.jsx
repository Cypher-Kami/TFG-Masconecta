import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { ToastContainer, toast } from 'react-toastify';
import ConfiguracionIcon from '../../../Assets/iconos/Configuracion.svg';
import disLikeIcon from '../../../Assets/iconos/Crear publicacion/ME GUSTA SELECT.svg';
import LikeIcon from '../../../Assets/iconos/Crear publicacion/ME GUSTA.svg';

function CommentItem({ comment, userID , index, totalComments, loadComments }) {
  const [editingCommentID, setEditingCommentID] = useState(null);
  const [tempCommentContent, setTempCommentContent] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const LIKE_STATUS = {
    NONE: "NONE",
    LIKED: "LIKED",
    DISLIKED: "DISLIKED"
  };

  const [likeStatus, setLikeStatus] = useState(comment.liked ? LIKE_STATUS.LIKED : LIKE_STATUS.NONE);

  const timeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
  
    if (diffInSeconds < minute) return 'hace unos segundos';
    if (diffInSeconds < hour) return `hace ${Math.floor(diffInSeconds / minute)} minutos`;
    if (diffInSeconds < day) return `hace ${Math.floor(diffInSeconds / hour)} horas`;
    if (diffInSeconds < week) return `hace ${Math.floor(diffInSeconds / day)} días`;
    return `hace ${Math.floor(diffInSeconds / week)} semanas`;
  };

  const handleLikeClick = async (commentID) => {
    let newStatus = likeStatus === LIKE_STATUS.LIKED ? LIKE_STATUS.NONE : LIKE_STATUS.LIKED;
    setLikeStatus(newStatus);

    try {
        const likeData = {
            TipoObjeto: 'comentario',
            ObjetoID: commentID,
            UsuarioID: userID,
            Accion: newStatus === LIKE_STATUS.LIKED ? 'like' : 'dislike',
        };

        const response = await axios.post('http://localhost:3001/publicacion/like', likeData);
        
        if (!(response.status >= 200 && response.status < 300)) {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        setLikeStatus(likeStatus); // Restaurar estado anterior
        console.error('Error al dar Me gusta:', error);
    }
  };

  const handleDelete = async (CommentID) => {
    try {
      const response = await axios.delete(`http://localhost:3001/publicacion/comentarios/${CommentID}`);
        if (response.status >= 200 && response.status < 300) {
          loadComments();
          toast.success('Comentario eliminado');
        } else {
          toast.error('Error al eliminar');
      }
      } catch (error) {
        toast.error("Error al eliminar el comentario:", error);
    }
  }

  const handleUpdate = async () => {
    try {
      let formData = new FormData();
      formData.append('Contenido', tempCommentContent);
      if (selectedImageFile) {
        formData.append('Foto', selectedImageFile);
      } else {
        formData.append('Foto', comment.Foto);
      }
      const response = await axios.put(`http://localhost:3001/publicacion/comentarios/${editingCommentID}`, formData);

      if (response.status >= 200 && response.status < 300) {
        loadComments();
        toast.success('Comentario actualizado con éxito');
      } else {
        toast.error('Error al actualizar el comentario');
      }
      setEditingCommentID(null);
      comment.Contenido = tempCommentContent;
      setTempCommentContent('');
    } catch (error) {
      toast.error('Error al actualizar el comentario:', error);
    }
  };

  const startEditing = (commentID, currentContent, currentFoto) => {
    setEditingCommentID(commentID);
    setTempCommentContent(currentContent);
    setSelectedImageFile(currentFoto);
  };

  return (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        {editingCommentID === comment.ID ? (
            <div className="d-flex align-items-center flex-grow-1">
                <input 
                    type="text"
                    className="form-control mr-2" 
                    value={tempCommentContent}
                    onChange={(e) => setTempCommentContent(e.target.value)}
                />
                <button className="btn feed-bt mx-1" onClick={handleUpdate}>Guardar</button>
                <button className="btn btn-secondary" onClick={() => setEditingCommentID(null)}>Cancelar</button>
            </div>
        ) : (<>
              <div className="d-flex flex-column align-items-start">
                  <div className="d-flex align-items-center mb-2">
                      <img src={comment.UsuarioFoto} width="40" height="40" className="rounded-circle me-2" />
                      <strong>{comment.UsuarioMote}</strong>&nbsp;dice:
                  </div>
                  <p className="flex-grow-1 m-0">{comment.Contenido}</p>
              </div>
            </>
        )}

        <div className="ml-3 d-flex align-items-center">
            <button
                type="button"
                className={`btn btn-light mx-1 ${likeStatus === LIKE_STATUS.LIKED ? 'liked' : ''}`}
                onClick={() => handleLikeClick(comment.ID)}
            >   
              <img src={likeStatus === LIKE_STATUS.LIKED ? disLikeIcon : LikeIcon} width="16px" height="16px" className='mx-1' />
              {likeStatus === LIKE_STATUS.LIKED ? 'No me Gusta' : 'Me Gusta'}
            </button>

            {
              comment.UsuarioID === userID && (
                <Dropdown className="ml-2">
                    <Dropdown.Toggle variant="light" id="dropdown-basic">
                        <img src={ConfiguracionIcon} width="16px" height="16px" className='mx-1' />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item href="#" onClick={() => startEditing(comment.ID, comment.Contenido, comment.Foto)}>Editar</Dropdown.Item>
                        <Dropdown.Item href="#" onClick={() => handleDelete(comment.ID)}>Eliminar</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
              )
            }
        </div>
    </div>
    {comment.Foto && <img src={comment.Foto} alt="Imagen del comentario" height="100px" className="mt-2" />}
    <p className='date-style fw-bold mt-2'>{timeAgo(new Date(comment.Fecha_Creacion))}</p>
    {index !== totalComments - 1 && <hr />}
    </>
  )
}

export default CommentItem;