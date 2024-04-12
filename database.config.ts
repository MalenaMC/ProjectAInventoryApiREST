import { Pool } from 'pg';

const pool:Pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'inventary_users',
  password: 'maddie',
  port: 5432,
});

export default pool;