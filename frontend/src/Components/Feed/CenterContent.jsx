import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Publicacion from './Publicacion'
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import VideoIcon from '../../Assets/iconos/Crear publicacion/Video.svg';
import ImagenIcon from '../../Assets/iconos/Crear publicacion/Imagen.svg';
import EventoIcon from '../../Assets/iconos/Crear publicacion/Evento.svg';

function CenterContent() {
    const { userState, dispatch } = useUserContext();
    const id = userState.id  || 0;
    const [publicacion, setPublicacion] = useState("");
    const [fotoPubli, setFotoPubli] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [values, setValues] = useState({
        Mote: '',
        Foto: null,
    });

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFotoPubli(file);
        }
    };

    const refrescarPublicaciones = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    useEffect(() => {
        axios.get(`http://localhost:3001/usuario/${id}`)
          .then(response => {
            const userData = response.data;
            setValues({
                ...values,
                Mote: userData.Mote,
                Foto: userData.Foto,
            });
            dispatch({
                type: 'SET_USER',
                payload: {
                  id: id,
                  mote: userData.Mote,
                  foto: userData.Foto,
                  email: userData.Email,
                  esEmpresa: userData.EsEmpresa,
                },
            });
          })
          .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
          });
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        if (fotoPubli) {
            formData.append('Foto', fotoPubli);
        }
        formData.append('Contenido', publicacion);
        formData.append('UsuarioID', id);
        try {
        const response = await axios.post('http://localhost:3001/publicacion/publish', formData);
        if (response.status >= 200 && response.status < 300) {
            setPublicacion("");
            refrescarPublicaciones();
            toast.success('Publicación exitosa');
        } else {
            toast.error('Error al publicar');
        }
        } catch (error) {
            toast.error('Error al publicar');
            console.error(error);
        }
    };

    const addEmoji = (emoji) => {
        setPublicacion((prev) => prev + emoji.native);
    }; 

    return (
    <>
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
                    <form onSubmit={handleSubmit}>
                        <div className='row px-4'>
                            <textarea
                                className='inputs px-2 my-2 rounded'
                                placeholder='¿Que hace tú mascota hoy?'
                                rows="1"
                                value={publicacion}
                                onChange={(event) => setPublicacion(event.target.value)}
                            />
                        </div>
                        <div className='row px-2'>
                            <div className='col-9'>
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
                            <div className='col-3 d-flex justify-content-end position-relative'>
                                <button type="button" className='btn btn-light btn-circle mb-4 mx-2' onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    😀
                                </button>
                                {showEmojiPicker && <div style={{ position: 'absolute', bottom: '2px', right: '180px' }}>
                                                        <Picker data={data} onEmojiSelect={addEmoji} navPosition="bottom" perLine="6" theme="light" />
                                                    </div>}
                                <button type="submit" className='btn feed-bt px-4 py-2 rounded mb-4'>
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
            <Publicacion 
                refreshKey={refreshKey} 
                refrescarPublicaciones={refrescarPublicaciones} 
            />
            
        <ToastContainer />
        </div>
    </>
  )
}

export default CenterContent