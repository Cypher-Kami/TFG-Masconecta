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
    const { Publicacion, Evento, Video } = req.body;
    const Foto = req.files && req.files.Foto;
    try {
        
        // Subir la foto y obtener el nombre del archivo
        const b64 = Buffer.from(Foto.data).toString("base64");
        let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
        const uploadResult = await handleUpload(dataURI);
        const fotoUrl = uploadResult.secure_url;

        await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO Publicacion (Publicacion, Evento, Video, Foto) VALUES (?, ?, ?, ?)',
                [Publicacion, Evento, Video, Foto],
                (error, results) => {
                if (error) reject(error);
                resolve(results);
                }
            );
        });
        res.status(201).json({ message: 'Publicacion exitosa.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al publicar ' + error });
    }
    });  