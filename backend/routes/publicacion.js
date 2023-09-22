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
        'SELECT * FROM Publicacion WHERE UsuarioID = ? ORDER BY Fecha_Creacion DESC',
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
    console.log(Contenido, publicacionID, Foto);
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

router.get('/search', async (req, res) => {
    const searchTerm = req.query.query;

    try {
        // Buscar publicaciones que coincidan
        const [publications] = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM Publicacion WHERE Contenido LIKE ? ORDER BY Fecha_Creacion DESC',
                [`%${searchTerm}%`],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        // Buscar usuarios que coincidan
        const [users] = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM Usuario WHERE Mote LIKE ?',
                [`%${searchTerm}%`],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json({
            publications,
            users
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al realizar la búsqueda: ' + error });
    }
});

router.post('/like', async (req, res) => {
    const { TipoObjeto, ObjetoID, UsuarioID } = req.body;

    if (!TipoObjeto || !ObjetoID || !UsuarioID) {
        return res.status(400).json({ error: 'Faltan datos para añadir el Me Gusta.' });
    }

    try {
        await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO MeGusta (TipoObjeto, ObjetoID, UsuarioID) VALUES (?, ?, ?)',
                [TipoObjeto, ObjetoID, UsuarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });
        res.status(201).json({ message: 'Me gusta añadido exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir el Me Gusta: ' + error });
    }
});

router.post('/create-comment', async (req, res) => {
    const { Contenido, UsuarioID, PublicacionID } = req.body;
    const Foto = req.files && req.files.Foto; // Si deseas permitir fotos en los comentarios

    // Objeto para almacenar los datos del comentario
    let commentData = {
        Contenido,
        UsuarioID,
        PublicacionID
    };

    try {
        // Si se incluye una foto en el comentario, cárgala a Cloudinary (si es necesario)
        if (Foto) {
            const b64 = Buffer.from(Foto.data).toString("base64");
            let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
            const uploadResult = await handleUpload(dataURI);
            commentData.Foto = uploadResult.secure_url; // Almacena la URL de la foto en el comentario
        }

        // Inserta el comentario en la base de datos
        await new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO Comentario (Contenido, Foto, UsuarioID, PublicacionID) VALUES (?, ?, ?, ?)',
                [commentData.Contenido, commentData.Foto || null, commentData.UsuarioID, commentData.PublicacionID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(201).json({ message: 'Comentario creado con éxito.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el comentario: ' + error });
    }
});


module.exports = router;