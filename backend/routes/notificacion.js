const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { handleUpload } = require('../config/CloudinaryConfig');
const { transporter } = require('../config/mailConfig');
const connection = require('../db');
const dotenv = require('dotenv');
dotenv.config();

router.use(fileUpload());

router.get('/notificaciones/:usuarioID', async (req, res) => {
    const usuarioID = req.params.usuarioID;
  
    try {
        const [notificaciones] = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT n.*, u.Mote, u.Foto ' +
                'FROM Notificaciones n ' +
                'JOIN Usuario u ON n.UsuarioID = u.ID ' +
                'WHERE n.UsuarioID = ? ORDER BY n.Fecha DESC',
                [usuarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });
  
        res.status(200).json({ notificaciones });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las notificaciones: ' + error });
    }
}); 

router.put('/marcar-notificaciones', async (req, res) => {
    const { usuarioID } = req.body;

    try {
        await new Promise((resolve, reject) => {
            connection.query(
                'UPDATE Notificaciones SET Leida = TRUE WHERE UsuarioID = ?',
                [usuarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json({ message: 'Notificaciones marcadas como leídas.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al marcar las notificaciones: ' + error });
    }
});

module.exports = router;