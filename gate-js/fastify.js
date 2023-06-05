import fastify from "fastify";
import goQuery from "./db.js";
import LRUCache from "lru-cache";
import fastifyFormBody from '@fastify/formbody';

const app = fastify();

app.register(fastifyFormBody);

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

// post masuk
app.post("/masuk", async (request, reply) => {
  try {
    const { idkartu, idgate } = request.body;
    let result, gateCheck;

    try {
      gateCheck = await goQuery(`SELECT * FROM register_gate WHERE id_register_gate = '${idgate}'`);
      result = await goQuery(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}' AND is_aktif = 1`);
    } catch (error) {
      console.error("Error executing query:", error);
      return 0;
    }

    let isValid = 0;
    if (result.length > 0 && gateCheck.length > 0) {
      isValid = 1;
    }

    // Logging
    await goQuery(`INSERT INTO log_masuk (id_kartu_akses, id_register_gate, is_valid) VALUES ('${idkartu}', '${idgate}', '${isValid}')`);
    return isValid;
  } catch (error) {
    throw error;
  }
});

// post keluar
app.post("/keluar", async (request, reply) => {
  try {
    const { idkartu, idgate } = request.body;
    let result, gateCheck;

    try {
      gateCheck = await goQuery(`SELECT * FROM register_gate WHERE id_register_gate = '${idgate}'`);
      result = await goQuery(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}' AND is_aktif = 1`);
      console.log(result)
    } catch (error) {
      console.error("Error executing query:", error);
      return 0;
    }

    let isValid = 0;
    if (result.length > 0 && gateCheck.length > 0) {
      isValid = 1;
    }

    // Logging
    await goQuery(`INSERT INTO log_keluar (id_kartu_akses, id_register_gate, is_valid) VALUES ('${idkartu}', '${idgate}', '${isValid}')`);
    return isValid;
  } catch (error) {
    throw error;
  }
});

try {
  const port = process.env.PORT || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(
      `🚀 Application is running on: http://localhost:${port} env: ${process.env.NODE_ENV}`
    );
  });

  console.log("Server listening on port 3000");
} catch (error) {

  
  app.log.error(error);
  process.exit(1);
}
