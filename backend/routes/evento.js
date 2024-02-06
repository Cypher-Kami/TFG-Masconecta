const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const connection = require('../db');
const { handleUpload } = require('../config/CloudinaryConfig');
const { transporter } = require('../config/mailConfig');
const dotenv = require('dotenv');
dotenv.config();

router.use(fileUpload());

// Ruta para obtener todos los eventos
router.get('/events', async (req, res) => {
  try {
    const [events] = await new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Evento';
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de eventos: ' + error.message });
  }
});


// Ruta para obtener un evento por su ID
router.get('/event/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Lógica para obtener un evento por su ID desde la base de datos...
    res.status(200).json({ message: `Evento con ID ${id} obtenido exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el evento.' });
  }
});

// Ruta para crear un nuevo evento
router.post('/event', async (req, res) => {
  const { Nombre, Descripcion, Fecha_Evento, Ubicacion, Propietario } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      const query = 'INSERT INTO Evento (Nombre, Descripcion, Fecha_Evento, Ubicacion, Propietario) VALUES (?, ?, ?, ?, ?)';
      connection.query(query, [Nombre, Descripcion, Fecha_Evento, Ubicacion, Propietario], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    res.status(200).json({ message: 'Evento creado exitosamente.', eventId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el evento: ' + error.message });
  }
});

module.exports = router;