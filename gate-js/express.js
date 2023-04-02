import express from 'express';
import goQuery from './db.js';
import LRUCache from 'lru-cache';

const app = express();

// cache
const cache = new LRUCache({
  max: 100,
  // 2 minutes
  maxAge: 1000 * 60 * 2,
});

app.get('/test', async (req, res) => {
  try {
    if (cache.has(req.url)) {
      console.log('cache hit');
      res.send(cache.get(req.url));
    } else {
      const result = await goQuery('SELECT * FROM kartu_akses');
      cache.set(req.url, result);
      console.log('cache miss');
      res.send(result);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// post idkartu 
app.post('/masuk', async (req, res) => {
  try {
    const { idkartu } = req.body;
    const result = await goQuery(
      `SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}' AND is_aktif = 1`
    );
   if (result.length > 0) {
      res.send({
        status: 'success',
        message: 'Kartu masuk',
        data: result,
      });
    } else {
      res.send({
        status: 'error',
        message: 'Kartu keluar',
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/keluar', async (req, res) => {
  try {
    const { idkartu } = req.body;
    const result = await goQuery(
      `SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}' AND is_aktif = 1`
    );
   if (result.length > 0) {
      res.send({
        status: 'success',
        message: 'Kartu masuk',
        data: result,
      });
    } else {
      res.send({
        status: 'error',
        message: 'Kartu keluar',
      });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
