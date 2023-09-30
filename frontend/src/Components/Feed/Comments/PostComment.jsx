import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useUserContext } from '../../../Usercontext';
import CommentsList from './CommentsList';
import { ToastContainer, toast } from 'react-toastify';
import { Picker } from 'emoji-mart';
import ImagenIcon from '../../../Assets/iconos/Crear publicacion/Imagen.svg';

function PostComment({postID, userID, userMote, userFoto}) {
    const { userState, dispatch } = useUserContext();
    const id = userState.id  || 0;
    const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
    const [comentario, setComentario] = useState("");
    const [fotoComment, setFotoComment] = useState(null);
    const [comments, setComments] = useState([]);

    const loadComments = () => {
        axios.get(`http://localhost:3001/publicacion/publicaciones/${postID}/comentarios`, {
            params: {
              UsuarioID: userID
            }
        })
        .then(response => {
            const commentsResponse = response.data;
            setComments(commentsResponse);
        })
        .catch(error => {
            console.error('Error al obtener los comentarios:', error);
        });
    }

    useEffect(() => {
        loadComments();
    }, [postID, userID]);

    const handleCommentImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFotoComment(file);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        if (fotoComment) {
            formData.append('Foto', fotoComment);
        }
        formData.append('Contenido', comentario);
        formData.append('UsuarioID', id);
        formData.append('PublicacionID', postID);
        try {
        const response = await axios.post('http://localhost:3001/publicacion/create-comment', formData);
        if (response.status >= 200 && response.status < 300) {
            setComentario("");
            loadComments();
            toast.success('Comentario exitoso');
        } else {
            toast.error('Error al comentar');
        }
        } catch (error) {
            toast.error('Error al comentar');
            console.error(error);
        }
    };

    const addCommentEmoji = (e) => {
        let emoji = e.native;
        setComentario((prev) => prev + emoji);
    }; 

  return (
    <>
        <form onSubmit={handleCommentSubmit}>
            <div className='row px-3'>
                <div className='d-flex align-items-center'>
                    <img
                        src={userFoto}
                        alt="Imagen del usuario"
                        className="rounded-circle me-2 my-2"
                        width="35"
                        height="35"
                    />
                    <input 
                        className='comment-inputs my-2 rounded' 
                        type="text" 
                        placeholder='Deja un comentario...'
                        value={comentario}
                        style={{width: "100%"}}
                        onChange={(event) => setComentario(event.target.value)}
                    />
                </div>
                <div className='d-flex justify-content-between'>
                    <label className="btn btn-light mb-4">
                        <input
                            type="file"
                            className='d-none'
                            onChange={handleCommentImageChange}
                        />
                        <img src={ImagenIcon} width="16px" height="16px" className='mx-1' />
                        Foto
                    </label>
                
                    <div className='d-flex'>
                        <button type="button" className='btn btn-light btn-circle mb-4 mx-2' onClick={() => setShowCommentEmojiPicker(!showCommentEmojiPicker)}>
                            😀
                        </button>
                        {showCommentEmojiPicker && <Picker onSelect={addCommentEmoji} />}
                        <button type="submit" className='btn feed-bt px-4 py-2 rounded mb-4'>
                            Comentar
                        </button>
                    </div>
                </div>
            </div>
        </form>
        < CommentsList postID={postID} userID={userID} comments={comments} loadComments={loadComments}/>
    </>
  )
}

export default PostComment