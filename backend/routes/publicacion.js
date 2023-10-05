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
                'SELECT p.*, ' +
                'u.Foto AS UsuarioFoto, ' + 
                'u.Mote AS UsuarioMote, ' +
                'MAX(CASE WHEN mg.ObjetoID IS NULL THEN 0 ELSE 1 END) AS liked ' +
                'FROM Publicacion AS p ' +
                'JOIN Usuario AS u ON p.UsuarioID = u.ID ' +
                'LEFT JOIN MeGusta AS mg ON p.ID = mg.ObjetoID AND mg.UsuarioID = ? ' +
                'WHERE p.UsuarioID = ? ' +
                'OR p.UsuarioID IN ( ' +
                    'SELECT UsuarioID1 FROM Amigo WHERE UsuarioID2 = ? ' +
                    'UNION ' +
                    'SELECT UsuarioID2 FROM Amigo WHERE UsuarioID1 = ? ' +
                ') ' +
                'GROUP BY p.ID, p.Contenido, p.Foto, p.Fecha_Creacion, p.UsuarioID, u.Foto, u.Mote ' +
                'ORDER BY p.Fecha_Creacion DESC',
                [usuarioID, usuarioID, usuarioID, usuarioID],
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
    const currentUserID = req.query.userID;

    try {
        const [users] = await new Promise((resolve, reject) => {
            connection.query(
                `
                SELECT u.*, 
                    CASE 
                        WHEN a.ID IS NOT NULL THEN 'amigo'
                        WHEN sa.Estado IS NULL THEN 'no enviado'
                        ELSE sa.Estado
                    END AS estado_solicitud
                FROM Usuario AS u
                LEFT JOIN Amigo AS a ON (u.ID = a.UsuarioID1 AND ? = a.UsuarioID2) OR (u.ID = a.UsuarioID2 AND ? = a.UsuarioID1)
                LEFT JOIN SolicitudAmistad AS sa ON (u.ID = sa.SolicitanteID AND ? = sa.SolicitadoID) OR (u.ID = sa.SolicitadoID AND ? = sa.SolicitanteID)
                WHERE u.Mote LIKE ?
                `,
                [currentUserID, currentUserID, currentUserID, currentUserID, `%${searchTerm}%`],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json({
            users
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al realizar la búsqueda: ' + error });
    }
});

router.post('/like', async (req, res) => {
    const { TipoObjeto, ObjetoID, UsuarioID, Accion } = req.body;
    console.log("SQL Parameters:", TipoObjeto, ObjetoID, UsuarioID);
    try {
        const existingLike = await new Promise((resolve, reject) => {
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
            if (existingLike && existingLike.length) {
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

//Endpoint para obtener todos los comentarios de una publicación específica
router.get('/publicaciones/:id/comentarios', async (req, res) => {
    const publicacionID = req.params.id;
    const usuarioID = req.query.UsuarioID;
    try {
        const comentarios = await new Promise((resolve, reject) => {
            connection.query(
                'SELECT c.*, ' +
                'u.Foto AS UsuarioFoto, ' + 
                'u.Mote AS UsuarioMote, ' + 
                'CASE WHEN mg.ID IS NOT NULL THEN 1 ELSE 0 END AS liked ' +
                'FROM Comentario AS c ' +
                'LEFT JOIN MeGusta AS mg ON mg.ObjetoID = c.ID AND mg.TipoObjeto = \'comentario\' AND mg.UsuarioID = ? ' +
                'LEFT JOIN Usuario AS u ON c.UsuarioID = u.ID ' +
                'WHERE c.PublicacionID = ? ' +
                'ORDER BY c.Fecha_Creacion DESC',
                [usuarioID, publicacionID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json(comentarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los comentarios: ' + error });
    }
});

router.put('/comentarios/:id', async (req, res) => {
    const comentarioID = req.params.id;
    const { Contenido, Foto } = req.body;

    try {
        await new Promise((resolve, reject) => {
            connection.query(
                'UPDATE Comentario SET Contenido = ?, Foto = ? WHERE ID = ?',
                [Contenido, Foto, comentarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json({ message: "Comentario actualizado con éxito." });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el comentario: ' + error });
    }
});

router.delete('/comentarios/:id', async (req, res) => {
    const comentarioID = req.params.id;

    try {
        await new Promise((resolve, reject) => {
            connection.query(
                'DELETE FROM Comentario WHERE ID = ?',
                [comentarioID],
                (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                }
            );
        });

        res.status(200).json({ message: "Comentario eliminado con éxito." });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el comentario: ' + error });
    }
});

module.exports = router;