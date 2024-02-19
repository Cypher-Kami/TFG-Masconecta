const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importar las rutas
const usuarioRouter = require('./routes/usuario');
const eventoRouter = require('./routes/evento');
const notificacionRouter = require('./routes/notificacion');
const publicacionRouter = require('./routes/publicacion');
const mensajesRouter = require('./routes/mensajes');
const authRouter = require('./routes/auth');

// Usar las rutas
app.use('/usuario', usuarioRouter);
app.use('/evento', eventoRouter);
app.use('/auth', authRouter);
app.use('/publicacion', publicacionRouter);
app.use('/notificacion', notificacionRouter);
app.use('/mensajes', mensajesRouter);

app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({ error: 'Hubo un error en el servidor.' });
});

// Iniciar el servidor
const port = 3001;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});