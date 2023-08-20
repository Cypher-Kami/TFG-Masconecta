const express = require('express');
const router = express.Router();
const connection = require('../db');

// Ruta para obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuario = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM Usuario',
        (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        }
      );
    });
    res.status(200).json({ message: usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de usuarios.' });
  }
});

// Ruta para obtener un usuario por su ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Lógica para obtener un usuario por su ID desde la base de datos...
    res.status(200).json({ message: `Usuario con ID ${id} obtenido exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

// Resto de las rutas relacionadas con usuarios...

module.exports = router;