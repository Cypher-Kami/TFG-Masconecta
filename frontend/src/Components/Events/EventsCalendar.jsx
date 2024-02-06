import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useUserContext } from '../../Usercontext';
import EventFormModal from './EventFormModal';

// Configurar localizador
const localizer = momentLocalizer(moment);

function EventsCalendar() {
    const { userState, dispatch } = useUserContext();
    const id = userState.id;
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Cargar eventos existentes al montar el componente
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3001/evento/events');
                const fetchedEvents = response.data.map(event => ({
                    ...event,
                    start: new Date(event.Fecha_Evento),
                    end: new Date(event.Fecha_Evento),
                    title: event.Nombre,
                }));
                setEvents(fetchedEvents);
            } catch (error) {
                console.error('Error al cargar eventos:', error);
                toast.error('Error al cargar eventos');
            }
        };
        
        fetchEvents();
    }, []);

    const handleSelectSlot = ({ start, end }) => {
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (eventData) => {
        eventData.Propietario = userState.id; // Usa el ID del usuario desde el contexto
        try {
            const response = await axios.post('http://localhost:3001/evento/event', eventData);
            if (response.data) {
                toast.success('Evento creado exitosamente');
                // Añade el nuevo evento al estado para que se muestre en el calendario
                const newEvent = {
                    ...eventData,
                    start: new Date(eventData.Fecha_Evento),
                    end: new Date(eventData.Fecha_Evento),
                    title: eventData.Nombre,
                };
                setEvents([...events, newEvent]);
            }
        } catch (error) {
            console.error('Error al crear el evento:', error);
            toast.error('Error al crear el evento');
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable={true}
                onSelectSlot={handleSelectSlot}
            />
            <EventFormModal
                show={isModalOpen}
                onHide={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
            />
        </>
    );
}

export default EventsCalendar