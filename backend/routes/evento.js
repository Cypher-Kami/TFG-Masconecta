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
router.get('/event', async (req, res) => {
  try {
    // Lógica para obtener todos los eventos desde la base de datos...
    res.status(200).json({ message: 'Lista de eventos obtenida exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de eventos.' });
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

// Resto de las rutas relacionadas con eventos...

module.exports = router;