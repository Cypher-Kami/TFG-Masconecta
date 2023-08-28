const express = require('express');
const router = express.Router();
const connection = require('../db');

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
  const { Mote, Email, Gustos } = req.body;
  console.log(Mote, Email, Gustos);
  let Gusto = Gustos.join(",");
  console.log(Gusto);
  try {
    await new Promise((resolve, reject) => {
      connection.query(
        'UPDATE Usuario SET Mote = ?, Gustos = ?, Email = ? WHERE ID = ?',
        [Mote, Gusto, Email, userId],
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