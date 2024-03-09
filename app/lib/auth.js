import pool from '../lib/pool.js';

async function auth(req, res, options) {
  options = options || {};
  const header = req.get("authorization");
  if (! header || !header.match(/^[bB]earer/)) {
    var err = new Error("Missing or invalid Authorization header");
    err.status = 401;
    throw err;
  }
  const token = header.replace(/^[bB]earer /, "");
  const user = await pool.query(
    "SELECT * FROM users u, tokens t" +
    "  WHERE u.email = t.email AND t.token = $1::text AND" +
    "        t.status = 'validated'",
    [token]
  );
  if (user.rows.length == 0) {
    var err = new Error("No such user");
    err.status = 401;
    throw err;
  }
  if (user.rows.length > 1) {
    console.warn(`Multiple users for token! First user: ${users.rows[0].email}`)
  }
  if (!!options.admin) {
    if (!user.rows[0].admin) {
        var err = new Error("Not admin.");
        err.status = 401;
        throw err;
    }
  }
  return user.rows[0];
}

export default auth;
