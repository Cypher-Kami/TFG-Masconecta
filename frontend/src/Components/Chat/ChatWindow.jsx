import React, { useState, useEffect } from 'react';
import { InputGroup, FormControl, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import Pusher from 'pusher-js';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserContext } from '../../Usercontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function ChatWindow({ chatId }) {
    const [mensaje, setMensaje] = useState('');
    const [mensajes, setMensajes] = useState([]);
    const { userState } = useUserContext();
    const [editandoMensaje, setEditandoMensaje] = useState(null);

    useEffect(() => {
        cargarMensajes();
        const pusher = new Pusher('91d2cc9b6e40b8c0804d', {
          cluster: 'eu',
          encrypted: true
        });
      
        const channel = pusher.subscribe('chat-channel');
        channel.bind('new-message', function(data) {
            if (data.usuarioID1 === userState.id && data.usuarioID2 === chatId || 
                data.usuarioID2 === userState.id && data.usuarioID1 === chatId) {
                    setMensajes(mensajes => [...mensajes, {
                        ...data,
                        id: data.id
                    }]);
            }
        });
    
        channel.bind('edited-message', function(data) {
            setMensajes(mensajes => {
                const nuevosMensajes = mensajes.map(msg => 
                    Number(msg.id) === Number(data.id) ? { ...msg, contenido: data.contenido } : msg
                );
                return nuevosMensajes;
            });
        });
    
        channel.bind('deleted-message', function(data) {
            setMensajes(mensajes => 
                mensajes.filter(msg => Number(msg.id) !== Number(data.id))
            );
        });        
      
        return () => {
          channel.unbind_all();
          channel.unsubscribe();
        };
    }, [chatId, userState.id]);

    const cargarMensajes = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/mensajes/mensajes/${userState.id}/${chatId}`);
            const mensajes = response.data.map(msg => ({
                ...msg,
                id: msg.ID
            }));
            setMensajes(mensajes);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!mensaje.trim()) return;
    
        try {
            const usuarioID1 = userState.id;
            const usuarioID2 = chatId;
            const contenido = mensaje;
    
            const response = await axios.post('http://localhost:3001/mensajes/mensaje/crear', {
                usuarioID1,
                usuarioID2,
                contenido
            });
            const nuevoMensaje = {
                ID: response.data.messageId, 
                UsuarioID1: usuarioID1,
                UsuarioID2: usuarioID2,
                Contenido: contenido,
                Fecha: new Date().toISOString(), 
                FotoRemitente: userState.foto, 
                MoteRemitente: userState.mote, 
            };
    
            setMensaje('');
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    };

    const confirmarEdicion = async () => {
        try {
            await axios.put(`http://localhost:3001/mensajes/mensaje/editar/${editandoMensaje.id}`, {
                contenido: editandoMensaje.contenido
            });
            const mensajesActualizados = mensajes.map(msg => {
                if(msg.id === editandoMensaje.id) {
                    return { ...msg, contenido: editandoMensaje.contenido };
                }
                return msg;
            });
            setMensajes(mensajesActualizados);
            setEditandoMensaje(null);
        } catch (error) {
            console.error("Error al editar el mensaje:", error);
        }
    };

    const iniciarEdicion = (msg) => {
        setEditandoMensaje({ id: msg.id, contenido: msg.Contenido || msg.contenido });
    };

    const eliminarMensaje = async (mensajeID) => {
        try {
            await axios.delete(`http://localhost:3001/mensajes/mensaje/eliminar/${mensajeID}`);
            setMensajes(mensajes.filter(msg => msg.id !== mensajeID));
        } catch (error) {
            console.error("Error al eliminar el mensaje:", error);
        }
    };
    

    return (
        <div className="chat-container">
            {chatId ? (
                <>
                    <div className="messages-scroll-container">
                        <ListGroup variant="flush">
                            {mensajes.map((msg) => (
                                <ListGroup.Item key={msg.id} style={{ backgroundColor: '#edeffe', borderRadius: '10px', marginBottom: '10px', padding: '10px' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center" style={{ marginRight: '10px' }}>
                                            <img src={msg.FotoRemitente || msg.FotoDestinatario} alt="Avatar" className="rounded-circle" style={{ width: '30px', height: '30px', marginRight: '15px' }} />
                                            <div>
                                                <strong>{msg.MoteRemitente || msg.MoteDestinatario} dice:</strong>
                                                <div>{msg.contenido || msg.Contenido}</div>
                                            </div>
                                        </div>
                                        {String(msg.usuarioID1) === String(userState.id) || String(msg.UsuarioID1) === String(userState.id) ? (
                                            <div className="ml-auto d-flex">
                                                <Button variant="outline-light" className="rounded-circle mx-2" onClick={() => iniciarEdicion(msg)} style={{ color: '#9B41FE', border: '1px solid #9B41FE', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <FontAwesomeIcon icon={faEdit} style={{ fontSize: '14px' }} />
                                                </Button>
                                                <Button variant="outline-light" className="rounded-circle" onClick={() => eliminarMensaje(msg.id)} style={{ color: 'red', border: '1px solid red', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: '14px' }} />
                                                </Button>
                                            </div>
                                        ) : null}
                                    </div>
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        Enviado {msg.Fecha && formatDistanceToNow(new Date(msg.Fecha), { addSuffix: true, locale: es })}
                                    </span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                    {editandoMensaje && (
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            confirmarEdicion();
                        }}>
                            <InputGroup className="mb-3">
                                <FormControl
                                    value={editandoMensaje.contenido}
                                    onChange={(e) => setEditandoMensaje({...editandoMensaje, contenido: e.target.value})}
                                />
                                <Button variant="outline-secondary" type="submit">
                                    Confirmar Edición
                                </Button>
                            </InputGroup>
                        </Form>
                    )}
                    <div className="message-input-container">
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            enviarMensaje(e);
                        }}>
                            <InputGroup className="mb-3">
                                <FormControl
                                    placeholder="Escribe un mensaje..."
                                    aria-label="Mensaje"
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                />
                                <Button className='btn submit-bt' type="submit">
                                    Enviar
                                </Button>
                            </InputGroup>
                        </Form>
                    </div>
                </>
            ) : (
                <div className='text-center'>Seleccione un chat para comenzar</div>
            )}
        </div>
    );
}

export default ChatWindow;