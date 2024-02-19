import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const MapModal = ({ show, onHide, onLocationSelect }) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (show && !map && mounted) {
      const google = window.google;
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.416775, lng: -3.703790 },
        zoom: 12,
      });

      google.maps.event.addListener(map, 'click', function(event) {
        onLocationSelect({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      setMap(map);
      return () => {
        mounted = false;
        if (map) {
          google.maps.event.clearListeners(map, 'click');
        }
      };
    }
  }, [show, map, onLocationSelect]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Seleccione una Ubicación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div id="map" style={{ height: '400px', width: '100%' }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MapModal;
