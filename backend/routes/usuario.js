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

router.get('/friend-request/:id', async (req, res) => {
  const userId = req.params.id;
  try {
      const result = await new Promise((resolve, reject) => {
          connection.query(
              `SELECT sa.ID, sa.SolicitanteID, sa.SolicitadoID, sa.Fecha_Solicitud, sa.Estado, u.Mote, u.Foto 
               FROM SolicitudAmistad sa
               JOIN Usuario u ON sa.SolicitanteID = u.ID 
               WHERE sa.SolicitadoID = ?`,
              [userId],
              (error, results) => {
                  if (error) reject(error);
                  resolve(results);
              }
          );
      });
      
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: 'Error al obtener las solicitudes de amistad: ' + error });
  }
});

router.post('/accept-friend-request', async (req, res) => {
  const { solicitudID, solicitadoID } = req.body;

  try {
      // Se obtiene solicitadoID basado en la solicitudID
      const [rows] = await new Promise((resolve, reject) => {
        connection.query(
            'SELECT SolicitanteID FROM SolicitudAmistad WHERE ID = ?',
            [solicitudID],
            (error, results) => {
                if (error) reject(error);
                resolve(results);
            }
        );
      });
      if (!rows || rows.length === 0) {
          return res.status(400).json({ error: 'Solicitud no encontrada.' });
      }

      const solicitanteID = Array.isArray(rows) ? rows[0].SolicitanteID : rows.SolicitanteID;

      // Inserta en la tabla de amigos
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
      
      //Agrega una notificación
      await new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO Notificaciones (UsuarioID, Tipo, ReferenciaID) VALUES (?, "solicitud_amistad", ?)',
            [solicitanteID, solicitudID],
            (error, results) => {
                if (error) reject(error);
                resolve(results);
            }
        );
    });
      
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

router.get('/amigos/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
        Usuario.ID, Usuario.Mote, Usuario.Foto 
      FROM 
        Amigo 
      JOIN 
        Usuario ON Usuario.ID = Amigo.UsuarioID2 OR Usuario.ID = Amigo.UsuarioID1
      WHERE 
        (Amigo.UsuarioID1 = ? OR Amigo.UsuarioID2 = ?) AND Usuario.ID != ?
    `;

    const amigos = await new Promise((resolve, reject) => {
      connection.query(query, [userId, userId, userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const uniqueAmigos = [...new Map(amigos.map(amigo => [amigo['ID'], amigo])).values()];

    res.status(200).json(uniqueAmigos);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar amigos: ' + error });
  }
});

router.get('/solicitudes-no-leidas/:usuarioID', async (req, res) => {
  const { usuarioID } = req.params;

  try {
      const resultado = await new Promise((resolve, reject) => {
          connection.query(
              'SELECT COUNT(*) AS noLeidas FROM SolicitudAmistad WHERE SolicitadoID = ? AND Estado = "pendiente"',
              [usuarioID],
              (error, results) => {
                  if (error) reject(error);
                  else resolve(results[0]);
              }
          );
      });

      if (resultado) {
          res.json({ noLeidas: resultado.noLeidas });
      } else {
          res.json({ noLeidas: 0 });
      }
  } catch (error) {
      res.status(500).json({ error: 'Error al consultar solicitudes no leídas: ' + error });
  }
});

router.get('/ultimos-amigos/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const query = `
      SELECT U.ID, U.Mote, U.Foto
      FROM Amigo A
      JOIN Usuario U ON U.ID = A.UsuarioID2 OR U.ID = A.UsuarioID1
      WHERE ? IN (A.UsuarioID1, A.UsuarioID2) AND U.ID != ?
      ORDER BY A.ID DESC
      LIMIT 3
    `;

    const amigos = await connection.promise().query(query, [userId, userId]);
    res.json(amigos[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los últimos amigos agregados: ' + error });
  }
});

module.exports = router;