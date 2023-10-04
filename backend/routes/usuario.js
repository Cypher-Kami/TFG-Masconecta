const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const { handleUpload } = require('../config/CloudinaryConfig');
const { transporter } = require('../config/mailConfig');
const connection = require('../db');
const dotenv = require('dotenv');
dotenv.config();

router.use(fileUpload());

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
  const userId = req.params.id;
  try {
    const results = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM Usuario WHERE ID = ?',
        [userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
    
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ error: `Usuario con ID ${userId} no encontrado.` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

router.put('/editar-perfil/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { Mote, Email, Gustos, Nombre, Apellido, Descripcion, Contrasena } = req.body;
  const Foto = req.files && req.files.Foto;
  let updateFields = {
    Mote,
    Gustos,
    Email,
    Nombre,
    Apellido,
    Descripcion,
  };

  if (Contrasena) {
    const hashedContrasena = await bcrypt.hash(Contrasena, 10);
    updateFields.Contrasena = hashedContrasena;
  }

  if (Foto) {
    const b64 = Buffer.from(Foto.data).toString("base64");
    let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
    const uploadResult = await handleUpload(dataURI);
    updateFields.Foto = uploadResult.secure_url;
  }
  
  try {
    await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE Usuario SET ? WHERE ID = ?',
        [updateFields, userId],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
    res.status(200).json({ message: 'Perfil actualizado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
});

router.post('/send-friend-request', async (req, res) => {
  const { solicitanteID, solicitadoID } = req.body;
  try {
      await new Promise((resolve, reject) => {
          connection.query(
              'INSERT INTO SolicitudAmistad (solicitanteID, solicitadoID) VALUES (?, ?)',
              [solicitanteID, solicitadoID],
              (error, results) => {
                  if (error) reject(error);
                  resolve(results);
              }
          );
      });
      res.status(200).json({ message: "Solicitud de amistad enviada con éxito." });
  } catch (error) {
      res.status(500).json({ error: 'Error al enviar la solicitud de amistad: ' + error });
  }
});

router.post('/accept-friend-request', async (req, res) => {
  const { solicitudID, solicitanteID, solicitadoID } = req.body;
  try {
      // Primero, inserta en la tabla de amigos
      await new Promise((resolve, reject) => {
          connection.query(
              'INSERT INTO Amigo (UsuarioID1, UsuarioID2) VALUES (?, ?)',
              [solicitanteID, solicitadoID],
              (error, results) => {
                  if (error) reject(error);
                  resolve(results);
              }
          );
      });
      // elimina la solicitud de la tabla de solicitudes pendientes
      await new Promise((resolve, reject) => {
          connection.query(
              'DELETE FROM SolicitudAmistad WHERE ID = ?',
              [solicitudID],
              (error, results) => {
                  if (error) reject(error);
                  resolve(results);
              }
          );
      });
      res.status(200).json({ message: "Solicitud de amistad aceptada con éxito." });
  } catch (error) {
      res.status(500).json({ error: 'Error al aceptar la solicitud de amistad: ' + error });
  }
});

router.post('/reject-friend-request', async (req, res) => {
  const { solicitudID } = req.body;

  try {
      // Elimina la solicitud de la tabla de solicitudes pendientes
      await new Promise((resolve, reject) => {
          connection.query(
              'DELETE FROM SolicitudAmistad WHERE ID = ?',
              [solicitudID],
              (error, results) => {
                  if (error) reject(error);
                  resolve(results);
              }
          );
      });

      res.status(200).json({ message: "Solicitud de amistad rechazada con éxito." });
  } catch (error) {
      res.status(500).json({ error: 'Error al rechazar la solicitud de amistad: ' + error });
  }
});

module.exports = router;