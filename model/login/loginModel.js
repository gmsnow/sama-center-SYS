const pool = require('../../dbconnection/usersConnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.findUserByNameAndPassword = async (name, password) => {
  const query = 'SELECT * FROM users WHERE name = $1 AND password = $2';
  const result = await pool.query(query, [name, password]);

  const user = result.rows[0];
  if (!user) return null;

  const token = jwt.sign(
    { username: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { user, token };
};
