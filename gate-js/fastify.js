import fastify from "fastify";
import goQuery from "./db.js";
import LRUCache from "lru-cache";

const app = fastify();

// cache

const cache = new LRUCache({
  max: 100,
  // 2 minutes
  maxAge: 1000 * 60 * 2,
});

app.get("/test", async (request, reply) => {
  try {
    if (cache.has(request.url)) {
      console.log("cache hit");
      return cache.get(request.url);
    } else {
      const result = await goQuery("SELECT * FROM kartu_akses");
      cache.set(request.url, result);
      console.log("cache miss");
      return result;
    }
  } catch (error) {
    throw error;
  }
});

// post idkartu
app.post("/masuk", async (request, reply) => {
  try {
    const { idkartu } = request.body;
    const result = await goQuery(
      `SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}' AND is_aktif = 1`
    );
    if (result.length > 0) {
      return {
        status: "success",
        message: "Kartu masuk",
        data: result,
      };
    } else {
      return {
        status: "error",
        message: "Kartu tidak aktif / tidak ada",
      };
    }
  } catch (error) {
    throw error;
  }
});

app.post("/keluar", async (request, reply) => {
  try {
    const { idkartu } = request.body;
    const result = await goQuery(
      `SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}' AND is_aktif = 1`
    );
    if (result.length > 0) {
      return {
        status: "success",
        message: "Kartu masuk",
        data: result,
      };
    } else {
      return {
        status: "error",
        message: "Kartu tidak aktif / tidak ada",
      };
    }
  } catch (error) {
    throw error;
  }
});

try {
  await app.listen({
    port: 3000,
  });
  console.log("Server listening on port 3000");
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
