import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useUserContext } from '../../Usercontext';

const EditServiceModal = ({ show, handleClose, initialData, handleSuccess }) => {
    const { userState } = useUserContext();
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

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                foto: null
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = `http://localhost:3001/servicio/servicio/${initialData.id}`;
        const updateData = new FormData();
        
        for (const key in formData) {
            if (formData[key] !== null && key !== 'foto') {
                updateData.append(key, formData[key]);
            }
        }
        if (selectedFile) {
            updateData.append('foto', selectedFile);
        }

        try {
            const response = await axios.put(url, updateData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            handleSuccess(response.data);
            handleClose();
        } catch (error) {
            console.error('Error al actualizar el servicio:', error);
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

                    {/* Foto del servicio */}
                    <Form.Group className="mb-3">
                        <Form.Label>Foto</Form.Label>
                        <Form.Control
                            type="file"
                            name="foto"
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Actualizar
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditServiceModal;
