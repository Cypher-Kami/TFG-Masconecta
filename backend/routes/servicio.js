const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const connection = require('../db');
const { handleUpload } = require('../config/CloudinaryConfig');
const dotenv = require('dotenv');
dotenv.config();

router.use(fileUpload());

router.post('/servicio', async (req, res) => {
    const { nombre, descripcion, telefono, email, ubicacion, lat, lon, propietario } = req.body;
    const foto = req.files && req.files.foto;

    try {
      const b64 = Buffer.from(foto.data).toString("base64");
      let dataURI = "data:" + foto.mimetype + ";base64," + b64;
      const uploadResult = await handleUpload(dataURI);
      const fotoUrl = uploadResult.secure_url;

      const nuevoServicio = {
        nombre,
        descripcion,
        foto: fotoUrl,
        telefono,
        email,
        ubicacion,
        latitud: lat,
        longitud: lon,
        propietario
      };

      const resultado = await new Promise((resolve, reject) => {
        connection.query('INSERT INTO Servicio SET ?', nuevoServicio, (error, results) => {
          if (error) reject(error);
          resolve(results.insertId);
        });
      });
  
      res.status(201).json({ message: 'Servicio creado exitosamente.', id: resultado });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el servicio.' });
      console.error("Error en la creación del servicio:", error);
    }
});
  
router.get('/servicios', async (req, res) => {
    try {
      const servicios = await new Promise((resolve, reject) => {
        connection.query('SELECT * FROM Servicio', (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });
  
      res.status(200).json(servicios);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los servicios.' });
    }
});

router.get('/servicio/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const servicio = await new Promise((resolve, reject) => {
          connection.query('SELECT * FROM Servicio WHERE ID = ?', [id], (error, results) => {
              if (error) reject(error);
              resolve(results[0]);
          });
      });
      if (servicio) {
          res.status(200).json(servicio);
      } else {
          res.status(404).json({ message: 'Servicio no encontrado.' });
      }
  } catch (error) {
      res.status(500).json({ error: 'Error al obtener el servicio.' });
  }
});
  
router.put('/servicio/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, telefono, email, ubicacion, lat, lon } = req.body;
  let fotoUrl = req.body.foto;

  if (req.files && req.files.foto) {
      const foto = req.files.foto;
      const b64 = Buffer.from(foto.data).toString("base64");
      let dataURI = "data:" + foto.mimetype + ";base64," + b64;
      const uploadResult = await handleUpload(dataURI);
      fotoUrl = uploadResult.secure_url;
  }

  let query = 'UPDATE Servicio SET nombre=?, descripcion=?, telefono=?, email=?, ubicacion=?, latitud=?, longitud=?';
  let queryParams = [nombre, descripcion, telefono, email, ubicacion, lat, lon];

  if (fotoUrl) {
    query += ', foto=?';
    queryParams.push(fotoUrl);
  }

  query += ' WHERE ID = ?';
  queryParams.push(id);

  try {
    await new Promise((resolve, reject) => {
        connection.query(query, queryParams, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
    res.status(200).json({ message: 'Servicio actualizado exitosamente.' });
  } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el servicio.' });
      console.error("Error en la actualización del servicio:", error);
  }
});

router.delete('/servicio/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await new Promise((resolve, reject) => {
        connection.query('DELETE FROM Servicio WHERE ID = ?', [id], (error, results) => {
          if (error) reject(error);
          resolve(results);
        });
      });
  
      res.status(200).json({ message: 'Servicio eliminado exitosamente.' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el servicio.' });
    }
});
  

module.exports = router;