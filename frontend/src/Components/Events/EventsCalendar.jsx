import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useUserContext } from '../../Usercontext';
import EventFormModal from './EventFormModal';
import EventComponent from './EventComponent';

const localizer = momentLocalizer(moment);

function EventsCalendar() {
    const { userState } = useUserContext();
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const userID = userState.id;
                const response = await axios.get(`http://localhost:3001/evento/events?propietario=${userID}`);
                console.log('Respuesta del servidor:', response.data);
                const fetchedEvents = response.data.map(event => ({
                    ...event,
                    ID: event.ID,
                    start: event.Fecha_Inicio ? new Date(event.Fecha_Inicio) : new Date(),
                    end: event.Fecha_Fin ? new Date(event.Fecha_Fin) : new Date(),
                    title: event.Nombre,
                    Ubicacion: event.Ubicacion,
                    Description: event.Descripcion,
                }));
                setEvents(fetchedEvents);
                console.log('Eventos cargados:', fetchedEvents);
            } catch (error) {
                console.error('Error al cargar eventos:', error);
                toast.error('Error al cargar eventos');
            }
        };
        fetchEvents();
    }, [userState.id]);

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleEditEvent = (event) => {
        console.log('Evento seleccionado:', event);
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSelectSlot = ({ start, end }) => {
        const newEvent = {
            start: start,
            end: end,
        };
        setSelectedEvent(newEvent);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData, eventId) => {
        console.log('Datos del formulario a enviar:', formData);
        const id = selectedEvent?.ID || eventId;
        const url = id ? `http://localhost:3001/evento/events/${id}` : 'http://localhost:3001/evento/event';
        const method = id ? 'put' : 'post';
    
        const dataToSend = {
            title: formData.title,
            Descripcion: formData.Descripcion,
            Ubicacion: formData.Ubicacion,
            Fecha_Inicio: moment(formData.start).format('YYYY-MM-DD HH:mm:ss'),
            Fecha_Fin: formData.end ? moment(formData.end).format('YYYY-MM-DD HH:mm:ss') : null,
            Propietario: userState.id,
        };
    
        try {
            const response = await axios[method](url, dataToSend);
            console.log('Respuesta del servidor al enviar el formulario:', response);

            if (method === 'put') {
                // Actualiza el evento en el estado
                setEvents(events.map(event => event.ID === eventId ? {...event, ...formData} : event));
                console.log('Estado actualizado de eventos:', events);
                toast.success('Evento actualizado exitosamente');
            } else {
                // Agrega el nuevo evento al estado
                const newEvent = { 
                    ...response.data, 
                    start: new Date(dataToSend.Fecha_Inicio), 
                    end: new Date(dataToSend.Fecha_Fin),
                    title: dataToSend.Nombre
                };                
                setEvents([...events, newEvent]);
                console.log('Estado actualizado de eventos:', events);
                toast.success('Evento creado exitosamente');
            }
        } catch (error) {
            console.error(`Error al ${eventId ? 'actualizar' : 'crear'} el evento:`, error);
            toast.error(`Error al ${eventId ? 'actualizar' : 'crear'} el evento`);
        }
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const handleDeleteEvent = async (eventId) => {
        console.log('Eliminando evento con ID:', eventId);
        if (window.confirm('¿Estás seguro de que deseas borrar este evento?')) {
            try {
                await axios.delete(`http://localhost:3001/evento/events/${eventId}`);
                setEvents(currentEvents => currentEvents.filter(event => event.ID !== eventId));
                toast.success('Evento borrado exitosamente');
            } catch (error) {
                console.error('Error al borrar el evento:', error);
                toast.error('Error al borrar el evento');
            }
        }
    };
    console.log('Eventos a renderizar en el calendario:', events);

    return (
        <>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable={true}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                components={{
                    event: props => <EventComponent {...props} onEdit={handleEditEvent} onDelete={handleDeleteEvent} userId={userState.id} />
                }}
            />
            <EventFormModal
                show={isModalOpen}
                onHide={() => {
                    setIsModalOpen(false);
                    setSelectedEvent(null);
                }}
                onSubmit={(formData) => handleFormSubmit(formData, selectedEvent?.ID)}
                onDelete={handleDeleteEvent}
                event={selectedEvent}
            />
        </>
    );
}

export default EventsCalendar