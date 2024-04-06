import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';

const AddServiceModal = ({ show, handleClose, handleSubmit, searchAddress }) => {
    const { userState } = useUserContext();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        telefono: '',
        email: '',
        ubicacion: '',
        foto: null
    });
    const [addressError, setAddressError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "ubicacion") {
      setAddressError('');
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, foto: e.target.files[0] });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ubicacion) {
      toast.error("Por favor, ingresa una dirección.");
      return;
    }
    if (formData.ubicacion) {
        try {
          const coords = await searchAddress(formData.ubicacion);
          if (!coords) {
            setAddressError('Dirección no encontrada. Por favor, ingresa una dirección válida.');
            toast.error('Dirección no encontrada. Por favor, ingresa una dirección válida.');
            return;
          }
          const dataWithCoords = { ...formData, ...coords, propietario: userState.id };
          handleSubmit(dataWithCoords);
        } catch (error) {
          console.error("Error buscando la dirección:", error);
          toast.error("Error buscando la dirección. Inténtalo de nuevo.");
        }
      } else {
        handleSubmit(formData);
      }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Servicio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleFormSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Foto</Form.Label>
            <Form.Control
              type="file"
              name="foto"
              required
              onChange={handleFileChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              required
              value={formData.descripcion}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ubicación</Form.Label>
            <Form.Control
              type="text"
              name="ubicacion"
              required
              value={formData.ubicacion}
              onChange={handleInputChange}
            />
          </Form.Group>
          {addressError && <div className="alert alert-danger mt-2">{addressError}</div>}
          <Button variant="primary" type="submit">
            Agregar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddServiceModal;
