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

// cache middleware

const cacheMiddleware = async (request, reply, next) => {
  const key = request.url;
  const cached = cache.get(key);
  if (cached) {
    reply.send(cached);
  } else {
    next();
  }
};

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

// test db connection and cache

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

try {
  await app.listen({
    port: 3000,
  });
  console.log("Server listening on port 3000");
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
