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
        // Consulta para obtener todas las publicaciones de un usuario y si al usuario le gusta o no
        const publicaciones = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT p.*,' + 
                    ' MAX(CASE WHEN mg.ObjetoID IS NULL THEN 0 ELSE 1 END) AS liked ' +
                'FROM Publicacion AS p ' +
                'LEFT JOIN MeGusta AS mg ON p.ID = mg.ObjetoID AND mg.UsuarioID = ? ' +
                'WHERE p.UsuarioID = ? ' +
                'GROUP BY p.ID, p.Contenido, p.Foto, p.Fecha_Creacion, p.UsuarioID ' +
                'ORDER BY p.Fecha_Creacion DESC',
                [usuarioID, usuarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json(publicaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las publicaciones: ' + error });
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
    const { TipoObjeto, ObjetoID, UsuarioID, Accion } = req.body;

    try {
        const [existingLike] = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM MeGusta WHERE TipoObjeto = ? AND ObjetoID = ? AND UsuarioID = ?',
                [TipoObjeto, ObjetoID, UsuarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        if (Accion === 'like') {
            if (existingLike && existingLike.length) {
                res.status(409).json({ message: 'Ya existe un Me gusta para esta publicación.' });
            } else {
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
            }
        } else if (Accion === 'dislike') {
            if (existingLike.length) {
                await new Promise((resolve, reject) => {
                    connection.query(
                        'DELETE FROM MeGusta WHERE TipoObjeto = ? AND ObjetoID = ? AND UsuarioID = ?',
                        [TipoObjeto, ObjetoID, UsuarioID],
                        (error, results) => {
                            if (error) reject(error);
                            resolve(results);
                        }
                    );
                });
                res.status(200).json({ message: 'Dislike procesado exitosamente.' });
            } else {
                res.status(409).json({ message: 'No existe un Me gusta para eliminar.' });
            }
        } else {
            res.status(400).json({ message: 'Accion no válida.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar el Me Gusta: ' + error });
    }
});


router.post('/create-comment', async (req, res) => {
    const { Contenido, UsuarioID, PublicacionID } = req.body;
    const Foto = req.files && req.files.Foto;

    // Objeto para almacenar los datos del comentario
    let commentData = {
        Contenido,
        UsuarioID,
        PublicacionID
    };

    try {
        if (Foto) {
            const b64 = Buffer.from(Foto.data).toString("base64");
            let dataURI = "data:" + Foto.mimetype + ";base64," + b64;
            const uploadResult = await handleUpload(dataURI);
            commentData.Foto = uploadResult.secure_url;
        }

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