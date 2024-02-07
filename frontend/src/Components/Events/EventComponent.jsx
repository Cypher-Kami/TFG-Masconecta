import React from 'react';
import { Button } from 'react-bootstrap';

const EventComponent = ({ event, onEdit, onDelete, userId }) => (
  <div>
    <strong>{event.title}</strong>
    <p>{event.desc}</p>
    {event.propietario === userId && (
      <div>
        <Button size="sm" onClick={() => onEdit(event)}>Editar</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(event.id)}>Borrar</Button>
      </div>
    )}
  </div>
);

export default EventComponent;
