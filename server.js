const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('El bot está funcionando correctamente.');
});

app.listen(PORT, () => {
  console.log(`Servidor express escuchando en el puerto ${PORT}`);
});
