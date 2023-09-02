const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const connection = require('../db');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: 'dbfuxhzss', 
  api_key: '722694822355158',
  api_secret: 'NUNSBuPDPB0-NEmZiYj9TIDGmyg'
});

router.use(fileUpload());

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

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
  console.log(Mote, Email, Gustos, Nombre, Apellido, Descripcion, Contrasena, Foto);
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

module.exports = router;