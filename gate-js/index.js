import fastify from 'fastify';
import goQuery from './db.js';
import LRUCache from 'lru-cache';

const app = fastify();

// cache

const cache = new LRUCache({
  max: 100,
  // 2 minutes
  maxAge: 1000 * 60 * 2,
});

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

app.get('/test', async (request, reply) => {
  try {
    if (cache.has(request.url)) {
      console.log('cache hit');
      return cache.get(request.url);
    } else {
      const result = await goQuery('SELECT * FROM kartu_akses');
      cache.set(request.url, result);
      console.log('cache miss');
      return result;
    }
  } catch (error) {
    throw error;
  }
});

// post idkartu , idgate
app.post('/gate', async (request, reply) => {
  try {
    const { idkartu, idgate } = request.body;
    const result = await goQuery(
      `SELECT * FROM kartu_akses WHERE idkartu = ${idkartu} AND idgate = ${idgate}`
    );
    return result;
  } catch (error) {
    throw error;
  }
});

app.post('/cari_pengguna', async (request, reply) => {
  try {
    const { id_pengguna } = request.body;
    let result;
    //cache
    if (cache.has(request.url)) {
      console.log('cache hit');
      result = cache.get(request.url);
      return result;
    } else {
      result = await goQuery(
        `SELECT * FROM pengguna WHERE id_pengguna = '${id_pengguna}'`
      );
      cache.set(request.url, result);
      console.log('cache miss');
      return result;
    }
  } catch (error) {
    throw error;
  }
});

try {
  await app.listen({
    port: 3000,
  });
  console.log('Server listening on port 3000');
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
