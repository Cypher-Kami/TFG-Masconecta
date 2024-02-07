import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import moment from 'moment';

function EventFormModal({ show, onHide, onSubmit, onDelete, event }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    useEffect(() => {
        if (event) {
            console.log(event);
            setTitle(event.title);
            setDescription(event.Descripcion);
            setLocation(event.Ubicacion);
            setStart(moment(event.start).format('YYYY-MM-DDTHH:mm'));
            setEnd(event.end ? moment(event.end).format('YYYY-MM-DDTHH:mm') : '');
        } else {
            resetForm();
        }
    }, [event]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setStart('');
        setEnd('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const eventData = {
            title,
            desc: description,
            ubicacion: location,
            start: new Date(start),
            end: new Date(end),
        };
        onSubmit(eventData, event ? event.id : null);
        onHide();
    };

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que deseas borrar este evento?')) {
            onDelete(event.ID);
            onHide();
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="md" centered>
            <Modal.Header closeButton>
                <Modal.Title>{event ? "Editar Evento" : "Crear Evento"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Título del Evento</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Ubicación</Form.Label>
                        <Form.Control
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Inicio del Evento</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Fin del Evento</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="secondary" className="mt-2 mr-2" type="submit">
                        {event ? "Editar Evento" : "Crear Evento"}
                    </Button>
                    {event && (
                        <Button variant="danger" className="mt-2" onClick={handleDelete}>
                            Borrar Evento
                        </Button>
                    )}
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default EventFormModal;
