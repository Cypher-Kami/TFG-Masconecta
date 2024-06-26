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
  const Propietario = req.query.propietario;
  try {
    const events = await new Promise((resolve, reject) => {
      const query = `
        SELECT e.* FROM Evento e
        WHERE e.Propietario = ?
        OR e.Propietario IN (
          SELECT UsuarioID2 FROM Amigo WHERE UsuarioID1 = ?
          UNION
          SELECT UsuarioID1 FROM Amigo WHERE UsuarioID2 = ?
        )
      `;
      connection.query(query, [Propietario, Propietario, Propietario], (error, results) => {
        if (error) reject(error);
        else resolve(results);
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
    res.status(200).json({ message: `Evento con ID ${id} obtenido exitosamente.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el evento.' });
  }
});

// Ruta para crear un nuevo evento
router.post('/event', async (req, res) => {
  const { title, Descripcion, Fecha_Inicio, Fecha_Fin, Ubicacion, Propietario } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      const query = 'INSERT INTO Evento (Nombre, Descripcion, Fecha_Inicio, Fecha_Fin, Ubicacion, Propietario) VALUES (?, ?, ?, ?, ?, ?)';
      connection.query(query, [title, Descripcion, Fecha_Inicio, Fecha_Fin, Ubicacion, Propietario], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    res.status(200).json({ message: 'Evento creado exitosamente.', eventId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el evento: ' + error.message });
  }
});

router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, Descripcion, Fecha_Inicio, Fecha_Fin, Ubicacion, Propietario } = req.body; // Nuevos datos del evento

  try {
    await new Promise((resolve, reject) => {
      const query = 'UPDATE Evento SET Nombre = ?, Descripcion = ?, Fecha_Inicio = ?, Fecha_Fin = ?, Ubicacion = ? WHERE ID = ? AND Propietario = ?';
      connection.query(query, [title, Descripcion, Fecha_Inicio, Fecha_Fin, Ubicacion, id, Propietario], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    res.status(200).json({ message: 'Evento actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el evento: ' + error.message });
  }
});

router.delete('/events/:id', async (req, res) => {
  const { id } = req.params; 

  try {
    await new Promise((resolve, reject) => {
      const query = 'DELETE FROM Evento WHERE ID = ?';
      connection.query(query, [id], (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
    res.status(200).json({ message: 'Evento borrado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar el evento: ' + error.message });
  }
});

router.get('/ultimos-eventos/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
      SELECT E.ID, E.Nombre, E.Fecha_Inicio, E.Fecha_Fin, U.Foto, U.Mote
      FROM Evento E
      JOIN Usuario U ON E.Propietario = U.ID
      LEFT JOIN Amigo A ON A.UsuarioID1 = U.ID OR A.UsuarioID2 = U.ID
      WHERE E.Propietario = ? OR A.UsuarioID1 = ? OR A.UsuarioID2 = ?
      GROUP BY E.ID
      ORDER BY ABS(DATEDIFF(E.Fecha_Inicio, CURDATE())) ASC
      LIMIT 3
    `;

    const [eventos] = await connection.promise().query(query, [userId, userId, userId]);
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los últimos eventos agregados: ' + error });
  }
});

module.exports = router;