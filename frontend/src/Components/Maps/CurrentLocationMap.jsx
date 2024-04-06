import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserContext } from '../../Usercontext';
import { ToastContainer, toast } from 'react-toastify';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CurrentLocationMap = () => {
    const { userState } = useUserContext();
    const mapRef = useRef(null);
    const [userServices, setUserServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [markers, setMarkers] = useState([]);

    const handleAddServiceLocation = () => {
      setShowModal(true);
    };

    const handleSubmitService = async (formData) => {
      const url = 'http://localhost:3001/servicio/servicio';
      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Servicio creado con exitosamente');
        setShowModal(false);
        loadAndShowServices();
      } catch (error) {
        toast.error('Error al crear el servicio:', error);
      }
    };

    const searchAddressAndAddMarker = async (address) => {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          return { lat, lon };
        }
        return null;
      } catch (error) {
        console.error("Error searching the address:", error);
        return null;
      }
    };

    const loadAndShowServices = async () => {
      markers.forEach(marker => mapRef.current.removeLayer(marker));
      setMarkers([]);

      try {
        const response = await axios.get('http://localhost:3001/servicio/servicios');
        setUserServices(response.data);
        const newMarkers = response.data.map(servicio => {
          if (servicio.latitud && servicio.longitud) {
            const marker = L.marker([servicio.latitud, servicio.longitud], { title: servicio.Nombre })
                            .addTo(mapRef.current)
                            .bindPopup(`${servicio.Nombre}: ${servicio.Descripcion}`);
            return marker;
          }
          return null;
        }).filter(marker => marker !== null);

        setMarkers(newMarkers);
      } catch (error) {
        console.error("Error loading services:", error);
      }
    };

    useEffect(() => {
      mapRef.current = L.map('map', { center: [40.4167, -3.70325], zoom: 13 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      loadAndShowServices();

      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
              const { latitude, longitude } = position.coords;
              mapRef.current.setView([latitude, longitude], 13);
          }, () => {
              console.log("Geolocation is not supported by this browser.");
          });
      }
    }, []);

    const handleDelete = async () => {
        if (!selectedService) return;
        try {
            await axios.delete(`http://localhost:3001/servicio/servicio/${selectedService}`);
            setUserServices(userServices.filter(service => service.ID !== parseInt(selectedService)));
            setSelectedService(null);
            toast.error("Servicio eliminado exitosamente");
            loadAndShowServices();
        } catch (error) {
            console.error("Error al eliminar el servicio:", error);
        }
    }

    const handleUpdateService = async () => {
      toast.success("Servicio editado exitosamente");
      loadAndShowServices();
    };
  
    useEffect(() => {
      if (selectedService) {
          const serviceToEdit = userServices.find(service => service.ID === selectedService);
          setEditingService(serviceToEdit);
          setShowEditModal(true);
      }
    }, [selectedService, userServices]);

    const handleEdit = async () => {
      if (!selectedService) {
          alert('Por favor, selecciona un servicio para editar.');
          return;
      }
      try {
          const response = await axios.get(`http://localhost:3001/servicio/servicio/${selectedService}`);
          setEditingService(response.data); 
          setShowEditModal(true); 
          console.log(response.data, "datos a editar");
      } catch (error) {
          console.error("Error al obtener los datos del servicio:", error);
      }
    };
  
    return (
      <>
        {userState.esEmpresa && (
          <div className="d-flex mb-3">
            <button
              className="btn"
              style={{ backgroundColor: "#9B41FE", color: "white" }}
              onClick={handleAddServiceLocation}
            >
              Agregar servicio
            </button>
            {userServices.length > 0 && (
              <div className="ms-auto">
                <select
                  className="form-select me-2"
                  style={{ display: 'inline-block', width: 'auto' }}
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="">Selecciona un servicio</option>
                  {userServices.map((service) => (
                    <option key={service.ID} value={service.ID}>
                      {service.Nombre}
                    </option>
                  ))}
                </select>
                <button className='btn btn-light me-2' onClick={handleEdit}>Editar</button>
                <button className='btn btn-danger' onClick={handleDelete}>Eliminar</button>
              </div>
            )}
          </div>
        )}
        <div id="map" style={{ height: '600px', width: '100%' }}></div>
        <AddServiceModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleSubmit={handleSubmitService}
          searchAddress={searchAddressAndAddMarker}
        />
        {editingService && (
          <EditServiceModal
              show={showEditModal}
              handleClose={() => {
                  setShowEditModal(false);
                  setSelectedService(null);
              }}
              initialData={editingService}
              handleSuccess={handleUpdateService}
          />
        )}
        <ToastContainer />
      </>
    );
};

export default CurrentLocationMap;