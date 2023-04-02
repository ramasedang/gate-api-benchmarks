import sql from "mssql";

const config = {
  server: "10.199.14.47",
  database: "GATE_DEV",
  user: "integratif",
  password: "G3rb4ng!",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, 
    trustServerCertificate: false 
  }
};

const pool = new sql.ConnectionPool(config);

try {
  await pool.connect();
} catch (error) {
  console.log(error);
}

const goQuery = async (query) => {
  try {
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default goQuery;
