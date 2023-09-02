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
  
router.post('/publish', async (req, res) => {
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