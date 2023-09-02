const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const connection = require('../db');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'bitarveronica@gmail.com',
    pass: 'gumdoeeatejydypw'
  }
});

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

router.post('/login', async (req, res) => {
    const { Email, Contrasena, Recordarme } = req.body;
    try {
      // Verificar si el usuario existe en la base de datos
      const usuario = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT * FROM Usuario WHERE Email = ?',
          [Email],
          (error, results) => {
            if (error) reject(error);
            resolve(results[0]);
          }
        );
      });
  
      if (!usuario) {
        return res.status(401).json({ error: 'El usuario no existe.' });
      }
  
      // Verificar la contraseña con la almacenada en la base de datos
      const contraseñaValida = await bcrypt.compare(Contrasena, usuario.Contrasena);
  
      if (!contraseñaValida) {
        return res.status(401).json({ error: 'La contraseña es incorrecta.' });
      }
  
      // Generar un token de autenticación
      const token = jwt.sign({ UserID: usuario.ID }, 'mi_secreto_secreto', { expiresIn: '12h' });
      
      res.status(200).json({ message: 'Inicio de sesión exitoso.', token, userID: usuario.ID });
    } catch (error) {
      res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

router.post('/register', async (req, res) => {
  const { Mote, Contrasena, Email, Gustos } = req.body;
  const Foto = req.files && req.files.Foto;
  try {
    // Verificar si el usuario ya existe en la base de datos
    const usuarioExistente = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM Usuario WHERE Mote = ? OR Email = ?',
        [Mote, Email],
        (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        }
      );
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'El nombre de usuario o correo electrónico ya están registrados.' });
    }
    // Hash de la contraseña antes de almacenarla en la base de datos
    const hashedContraseña = await bcrypt.hash(Contrasena, 10);
    // Subir la foto y obtener el nombre del archivo
    const b64 = Buffer.from(Foto.data).toString("base64");
    let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
    const uploadResult = await handleUpload(dataURI);
    const fotoUrl = uploadResult.secure_url;

    // Insertar el nuevo usuario en la base de datos
    await new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO Usuario (Mote, Contrasena, Email, Foto, Gustos) VALUES (?, ?, ?, ?, ?)',
        [Mote, hashedContraseña, Email, fotoUrl, Gustos],
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario ' + error });
  }
});


router.post('/forgotpassword', async (req, res) => {
  const { Email } = req.body;
  try {
    const usuario = await new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM Usuario WHERE Email = ?',
        [Email],
        (error, results) => {
          if (error) reject(error);
          resolve(results[0]);
        }
      );
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado, registrate' });
    }

    const token = jwt.sign({ userId: usuario.ID }, 'tu_secreto', { expiresIn: '1h' });

    const resetUrl = `http://localhost:3000/resetpassword/${token}`;

    await transporter.sendMail({
      from: '"masconecta - recuperar contraseña 🐕🐾" <bitarveronica@gmail.com>',
      to: Email,
      subject: "Recuperar contraseña",
      html: `
        <div class="container">
          <div class="header">
            <img className="" src="https://res.cloudinary.com/dbfuxhzss/image/upload/v1692545061/cbkyjcpmj0d5oj1xuddz.jpg" height="50px" width="350px" />
            <h2>Restablecimiento de Contraseña</h2>
            <p>¡Hola! <b>${usuario.Mote}</b> 🐾</p>
            <p>Has solicitado restablecer tu contraseña.</p>
          </div>
          <p><b>Por favor, haz clic en el siguiente enlace o pégalo en tu navegador:</b></p>
          <p><a class="link-button" href="${resetUrl}">Restablecer mi contraseña</a></p>
          <p>Si no solicitaste este restablecimiento, puedes ignorar este mensaje.</p>
          <p>¡Gracias!</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
});

router.post('/resetpassword/:token', async (req, res) => {
  const { token } = req.params;
  const { Contrasena } = req.body;

  try {
    // Verificar y decodificar el token
    const decodedToken = jwt.verify(token, 'tu_secreto');

    // Hashear la nueva contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(Contrasena, 10);

    // Actualizar la contraseña del usuario en la base de datos
    const updateQuery = 'UPDATE Usuario SET Contrasena = ? WHERE ID = ?';

    await new Promise((resolve, reject) => {
      connection.query(updateQuery, [hashedPassword, decodedToken.userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });

    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    if ( res.status >= 400 && res.status < 500 ) {
      res.status(401).json({ message: 'El enlace de restablecimiento es inválido o ha expirado' });
    }else {
      res.status(500).json({ message: 'Error al restablecer la contraseña' });
    }
  }
});

module.exports = router;