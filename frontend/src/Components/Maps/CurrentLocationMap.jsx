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
        loadAndShowServices();
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

    const loadAndShowServices = async () => {
      try {
          const response = await axios.get('http://localhost:3001/servicio/servicios');
          response.data.forEach(servicio => {
              if (servicio.latitud && servicio.longitud) {
                  L.marker([servicio.latitud, servicio.longitud], { title: servicio.Nombre })
                    .addTo(mapRef.current)
                    .bindPopup(`${servicio.Nombre}: ${servicio.Descripcion}`);
              }
          });
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

    return (
      <>
        {userState.esEmpresa && (
          <button className="btn btn-primary" onClick={handleAddServiceLocation}>
            Agregar Ubicación de Servicio
          </button>
        )}
        <div id="map" style={{ height: '600px', width: '100%' }}></div>
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