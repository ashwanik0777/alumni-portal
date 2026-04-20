const { Pool } = require('pg');
const { randomBytes, scryptSync } = require('node:crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_accounts (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      roles TEXT[] NOT NULL DEFAULT ARRAY['user']::TEXT[],
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const email = 'admin@jnvportal.in';
  const password = 'admin123';
  const firstName = 'Admin';
  const roles = ['admin', 'user'];

  const existing = await pool.query('SELECT id FROM auth_accounts WHERE email = $1 LIMIT 1', [email]);

  if (existing.rowCount === 0) {
    await pool.query(
      'INSERT INTO auth_accounts (email, password_hash, first_name, roles, is_active) VALUES ($1, $2, $3, $4, TRUE)',
      [email, hashPassword(password), firstName, roles],
    );
  } else {
    await pool.query(
      'UPDATE auth_accounts SET first_name = $2, roles = $3, is_active = TRUE, updated_at = NOW() WHERE email = $1',
      [email, firstName, roles],
    );
  }

  const result = await pool.query(
    'SELECT email, first_name, roles, is_active FROM auth_accounts WHERE email = $1 LIMIT 1',
    [email],
  );

  console.log(JSON.stringify(result.rows[0], null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
