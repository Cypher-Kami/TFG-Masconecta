import React, { useState, useEffect } from 'react';
import { InputGroup, FormControl, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import Pusher from 'pusher-js';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserContext } from '../../Usercontext';

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
              setMensajes(mensajes => [...mensajes, data]);
            }
        });
    
        channel.bind('edited-message', function(data) {
            setMensajes(mensajes => mensajes.map(msg => {
                if (msg.id === data.id) {
                    return { ...msg, contenido: data.contenido };
                }
                return msg;
            }));
        });
    
        channel.bind('deleted-message', function(data) {
            setMensajes(mensajes => mensajes.filter(msg => msg.id !== data.id));
        });
      
        return () => {
          channel.unbind_all();
          channel.unsubscribe();
        };
    }, [chatId, userState.id]);

    const cargarMensajes = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/mensajes/mensajes/${userState.id}/${chatId}`);
            setMensajes(response.data);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
        }
    };

    const enviarMensaje = async () => {
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
    
            const nuevaFecha = response.data.Fecha || new Date().toISOString(); // Utiliza la fecha actual como fallback
    
            const nuevoMensaje = {
                id: response.data.messageId,
                UsuarioID1: usuarioID1,
                UsuarioID2: usuarioID2,
                Contenido: contenido,
                Fecha: nuevaFecha,
            };
    
            setMensajes(mensajes => [...mensajes, nuevoMensaje]);
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

    return (
        <div>
            {chatId ? (
                <>
                    <div className="messages-container">
                        <ListGroup variant="flush">
                            {mensajes.map((msg) => (
                                <ListGroup.Item key={msg.id} className="d-flex justify-content-start align-items-center border-bottom-0">
                                    <div className="d-flex flex-column flex-grow-1">
                                        <div className="d-flex justify-content-between">
                                            <span>
                                                <strong>{msg.MoteRemitente || msg.MoteDestinatario} dice:</strong>
                                            </span>
                                            <span className="text-muted">
                                                Enviado {msg.Fecha && formatDistanceToNow(new Date(msg.Fecha), { addSuffix: true, locale: es })}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <img src={msg.FotoRemitente || msg.FotoDestinatario} alt="Avatar" className="rounded-circle mr-2" style={{width: '30px', height: '30px'}} />
                                            <span>{msg.Contenido}</span>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                    {/* Área para editar un mensaje */}
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
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        enviarMensaje();
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
                </>
            ) : (
                <div>Seleccione un chat para comenzar</div>
            )}
        </div>
    );
}

export default ChatWindow