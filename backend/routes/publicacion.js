const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { handleUpload } = require('../config/CloudinaryConfig');
const connection = require('../db');
const dotenv = require('dotenv');
dotenv.config();

router.use(fileUpload());
  
router.post('/publish', async (req, res) => {
    const { Contenido, UsuarioID } = req.body;
    const Foto = req.files && req.files.Foto;
    let publishContent = {
        Contenido,
        UsuarioID
    }
    try {
        
        if (Foto) {
            const b64 = Buffer.from(Foto.data).toString("base64");
            let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
            const uploadResult = await handleUpload(dataURI);
            publishContent.Foto = uploadResult.secure_url;
        }

        await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO Publicacion (Contenido, Foto, UsuarioID) VALUES (?, ?, ?)',
                [publishContent.Contenido, publishContent.Foto || null, UsuarioID],
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

router.get('/publicaciones/:id', async (req, res) => {
    const usuarioID = req.params.id;
    try {
      connection.query(
        'SELECT * FROM Publicacion WHERE UsuarioID = ? ORDER BY Fecha_Creacion ASC',
        [usuarioID],
        (error, results) => {
          if (error) {
            res.status(500).json({ error: 'Error al obtener las publicaciones ' + error });
          } else {
            res.status(200).json(results);
          }
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las publicaciones ' + error });
    }
});

router.put('/edit-publication/:id', async (req, res) => {
  const publicacionID = req.params.id;
  const { Contenido } = req.body;
  const Foto = req.files && req.files.Foto;
  let updateContent = {
      Contenido,
  };

  try {
      if (Foto) {
          const b64 = Buffer.from(Foto.data).toString("base64");
          let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
          const uploadResult = await handleUpload(dataURI);
          updateContent.Foto = uploadResult.secure_url;
      }

      await new Promise((resolve, reject) => {
          const query = 'UPDATE Publicacion SET Contenido = ?, Foto = ? WHERE ID = ?';
          connection.query(
              query,
              [updateContent.Contenido, updateContent.Foto || null, publicacionID],
              (error, results) => {
                  if (error) reject(error);
                  resolve(results);
              }
          );
      });
      res.status(200).json({ message: 'Publicación actualizada exitosamente.' });
  } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la publicación: ' + error });
  }
});

router.delete('/delete-publication/:id', (req, res) => {
  const publicacionID = req.params.id;

  connection.query(
      'DELETE FROM Publicacion WHERE ID = ?',
      [publicacionID],
      (error, results) => {
          if (error) {
              res.status(500).json({ error: 'Error al eliminar la publicación: ' + error });
          } else if (results.affectedRows == 0) {
              res.status(404).json({ message: 'Publicación no encontrada.' });
          } else {
              res.status(200).json({ message: 'Publicación eliminada exitosamente.' });
          }
      }
  );
});

module.exports = router;