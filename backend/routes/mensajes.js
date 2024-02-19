const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const connection = require('../db');
const dotenv = require('dotenv');
const { pusher } = require('../config/pusher');
dotenv.config();

router.use(fileUpload());

// Crear un mensaje
router.post('/mensaje/crear', async (req, res) => {
    const { usuarioID1, usuarioID2, contenido } = req.body;
  
    try {
      const query = 'INSERT INTO Mensaje (UsuarioID1, UsuarioID2, Contenido) VALUES (?, ?, ?)';
      const [results] = await connection.promise().query(query, [usuarioID1, usuarioID2, contenido]);
  
      pusher.trigger('chat-channel', 'new-message', {
        id: results.insertId,
        usuarioID1,
        usuarioID2,
        contenido
      });

      res.status(201).json({ message: "Mensaje creado con éxito", messageId: results.insertId });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el mensaje: ' + error });
    }
});

//Listar mensajes
router.get('/mensajes/:usuarioID1/:usuarioID2', async (req, res) => {
    const { usuarioID1, usuarioID2 } = req.params;
  
    try {
      const query = `
        SELECT * FROM Mensaje 
        WHERE (UsuarioID1 = ? AND UsuarioID2 = ?) OR (UsuarioID1 = ? AND UsuarioID2 = ?)
        ORDER BY Fecha ASC`;
      const [messages] = await connection.promise().query(query, [usuarioID1, usuarioID2, usuarioID2, usuarioID1]);
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar los mensajes: ' + error });
    }
});

//Editar mensajes
router.put('/mensaje/editar/:mensajeID', async (req, res) => {
    const { mensajeID } = req.params;
    const { contenido } = req.body;
  
    try {
      const query = 'UPDATE Mensaje SET Contenido = ? WHERE ID = ?';
      await connection.promise().query(query, [contenido, mensajeID]);
  
      res.json({ message: "Mensaje actualizado con éxito" });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el mensaje: ' + error });
    }
});
  
//Eliminar mensajes
router.delete('/mensaje/eliminar/:mensajeID', async (req, res) => {
    const { mensajeID } = req.params;
  
    try {
      const query = 'DELETE FROM Mensaje WHERE ID = ?';
      await connection.promise().query(query, [mensajeID]);
  
      res.json({ message: "Mensaje eliminado con éxito" });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el mensaje: ' + error });
    }
});
  

module.exports = router;