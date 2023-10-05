import React, { useState } from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUserContext } from '../../Usercontext';

function SearchModal({ show, handleClose, users }) {
    const { userState } = useUserContext();
    const UserID = userState.id  || 0;
    const [pendingRequests, setPendingRequests] = useState([]);

    const handleSendFriendRequest = async (friendId) => {
        try {
            setPendingRequests(prev => [...prev, friendId]);
            const response = await axios.post('http://localhost:3001/usuario/send-friend-request', { 
                solicitanteID: UserID,
                solicitadoID: friendId 
            });
            
            if (response.status >= 200 && response.status < 300) {
                toast.success("Solicitud enviada exitosamente");
            } else {
                toast.error("Error al enviar la solicitud.");
                setPendingRequests(prev => prev.filter(id => id !== friendId));
            }
        } catch (error) {
            toast.error("Error al enviar la solicitud:", error);
            setPendingRequests(prev => prev.filter(id => id !== friendId));
        }
    };

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Usuarios encontrados</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup style={{maxHeight: '300px', overflowY: 'auto'}}>
            {users?.map(user => (
                <ListGroup.Item key={user.ID} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <img src={user.Foto} width="40" height="40" className="rounded-circle me-2" />
                        {user.Mote}
                    </div>
                    {user.estado_solicitud === 'no enviado' && (
                        <Button variant="success" 
                        size="sm" 
                        onClick={() => handleSendFriendRequest(user.ID)}
                        disabled={pendingRequests.includes(user.ID)}
                    >Enviar solicitud</Button>
                    )}
                    {user.estado_solicitud === 'pendiente' && (
                        <Button variant="secondary" size="sm" disabled>Pendiente</Button>
                    )}
                    {user.estado_solicitud === 'amigo' && (
                        <Button variant="success" size="sm" disabled>Amigos</Button>
                    )}
                </ListGroup.Item>
            ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SearchModal;