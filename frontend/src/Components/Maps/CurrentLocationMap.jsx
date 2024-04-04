import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AddServiceModal from './AddServiceModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserContext } from '../../Usercontext';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const CurrentLocationMap = () => {
    const { userState } = useUserContext();
    const mapRef = useRef(null);
    const [location, setLocation] = useState([40.4167, -3.70325]);
    const [initialLocationSet, setInitialLocationSet] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
        console.log(response.data);
        setShowModal(false);
      } catch (error) {
        console.error('Error al crear el servicio:', error);
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

    useEffect(() => {
        console.log(userState.esEmpresa);
        console.log(userState, "Es empresa");
        // Solo inicializa el mapa una vez
        if (!mapRef.current) {
          mapRef.current = L.map('map', { center: location, zoom: 13 });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          }).addTo(mapRef.current);
  
          L.marker(location).addTo(mapRef.current)
            .bindPopup('Tu ubicación actual.')
            .openPopup();
        }
  
        // Actualiza la ubicación sólo si el mapa ya fue inicializado
        if (navigator.geolocation && !initialLocationSet) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocation([latitude, longitude]);
              setInitialLocationSet(true);
              mapRef.current.setView([latitude, longitude], 13);
              L.marker([latitude, longitude]).addTo(mapRef.current)
                .bindPopup('Tu ubicación actual.')
                .openPopup();
            },
            () => {
              setInitialLocationSet(true);
            }
          );
        }
      }, [initialLocationSet]);

    return (
        <>
          {userState.esEmpresa && (
            <button className="btn btn-primary" onClick={handleAddServiceLocation}>
              Agregar Ubicación de Servicio
            </button>
          )}
          <div id="map" style={{ height: '600px', width: '100%' }} />
          <AddServiceModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleSubmit={handleSubmitService}
            searchAddress={searchAddressAndAddMarker}
          />
        </>
    );

};

export default CurrentLocationMap;