import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUserContext } from '../../Usercontext';

function SearchModal({ show, handleClose, users }) {
    const { userState } = useUserContext();
    const UserID = userState.id  || 0;

    const handleSendFriendRequest = async (friendId) => {
        try {
            const response = await axios.post('http://localhost:3001/usuario/send-friend-request', { 
                solicitanteID: UserID,
                solicitadoID: friendId 
            });
            
            if (response.status >= 200 && response.status < 300) {
                toast.success("Amigo agregado exitosamente");
            } else {
                toast.error("Error al agregar al amigo.");
            }
        } catch (error) {
            toast.error("Error al agregar al amigo:", error);
        }
    };

    const handleRejectFriendRequest = async (friendId) => {
        try {
            const response = await axios.post('http://localhost:3001/usuario/reject-friend-request', { 
                solicitanteID: friendId, 
                solicitadoID: UserID 
            });
            
            if (response.data.success) {
                toast.success("Solicitud de amistad rechazada");
            } else {
                toast.error("Hubo un error al rechazar la solicitud.");
            }
        } catch (error) {
            toast.error("Error al rechazar la solicitud de amistad: " + error.message);
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
                    {user.Mote}
                    {user.estado_solicitud === 'no enviado' && (
                        <Button variant="success" size="sm" onClick={() => handleSendFriendRequest(user.ID)}>Enviar solicitud</Button>
                    )}
                    {user.estado_solicitud === 'pendiente' && (
                        <Button variant="secondary" size="sm" disabled>Pendiente</Button>
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