import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const EditServiceModal = ({ show, handleClose, initialData, handleSuccess, searchAddress }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        telefono: '',
        email: '',
        ubicacion: '',
        lat: '',
        lon: '',
        foto: null
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [addressError, setAddressError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre: initialData.Nombre || '',
                descripcion: initialData.Descripcion || '',
                telefono: initialData.Telefono || '',
                email: initialData.Email || '',
                ubicacion: initialData.Ubicacion || '',
                lat: initialData.latitud?.toString() || '',
                lon: initialData.longitud?.toString() || '',
                foto: initialData.Foto || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(currentFormData => ({
            ...currentFormData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.ubicacion) {
            const coords = await searchAddress(formData.ubicacion);
            if (!coords) {
                setAddressError('Dirección no encontrada. Por favor, ingresa una dirección válida.');
                toast.error('Dirección no encontrada. Por favor, ingresa una dirección válida.');
                return;
            }
            const dataWithCoords = { ...formData, ...coords };
            const formDataToUpdate = new FormData();
            Object.keys(dataWithCoords).forEach(key => {
                if (key !== 'foto') {
                    formDataToUpdate.append(key, dataWithCoords[key]);
                }
            });
            if (selectedFile) {
                formDataToUpdate.append('foto', selectedFile);
            }

            try {
                const response = await axios.put(`http://localhost:3001/servicio/servicio/${initialData.ID}`, formDataToUpdate, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                handleSuccess(response.data);
                handleClose();
            } catch (error) {
                console.error('Error al actualizar el servicio:', error);
                toast.error("Error actualizando el servicio. Inténtalo de nuevo.");
            }
        } else {
            setAddressError('Por favor, proporciona una ubicación válida.');
            toast.error('Por favor, proporciona una ubicación válida.');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Servicio</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* Nombre del servicio */}
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

                    {/* Foto del servicio */}
                    <Form.Group className="mb-3">
                        <Form.Label>Foto</Form.Label>
                        <Form.Control
                            type="file"
                            name="foto"
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    {/* Descripción del servicio */}
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

                    {/* Teléfono del servicio */}
                    <Form.Group className="mb-3">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    {/* Email del servicio */}
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

                    {/* Ubicación del servicio */}
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
                    {addressError && <div className="alert alert-danger" role="alert">{addressError}</div>}

                    <Button variant="primary" type="submit">
                        Actualizar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditServiceModal;
