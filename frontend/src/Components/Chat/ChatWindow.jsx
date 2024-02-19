import React, { useState, useEffect } from 'react';
import { InputGroup, FormControl, Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import Pusher from 'pusher-js';
import { useUserContext } from '../../Usercontext';

function ChatWindow({ chatId }) {
    const [mensaje, setMensaje] = useState('');
    const [mensajes, setMensajes] = useState([]);
    const { userState } = useUserContext();
    console.log(chatId, "Chatid");

    useEffect(() => {
        cargarMensajes();
        // Suscribirse al canal de Pusher
        const pusher = new Pusher('91d2cc9b6e40b8c0804d', {
          cluster: 'eu',
          encrypted: true
        });
      
        const channel = pusher.subscribe('chat-channel');
        channel.bind('new-message', function(data) {
          // Asegúrate de que solo se agreguen mensajes relevantes para el chat actual
          if (data.usuarioID1 === userState.id && data.usuarioID2 === chatId || 
              data.usuarioID2 === userState.id && data.usuarioID1 === chatId) {
            setMensajes(mensajes => [...mensajes, data]);
          }
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

            const { messageId } = response.data;
            setMensajes([...mensajes, { id: messageId, usuarioID1, usuarioID2, contenido }]);
            setMensaje('');
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    };

    return (
        <div>
            {chatId ? (
                <>
                    <ListGroup variant="flush">
                        {mensajes.map((msg) => (
                            <ListGroup.Item key={msg.id}>
                                {msg.Contenido}
                                {/* Aquí puedes agregar botones para editar/eliminar si el mensaje es del usuario actual */}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
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