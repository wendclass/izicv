import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 iziCV Server ready and listening on http://0.0.0.0:${PORT}`);
});
