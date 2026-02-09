const pool = require('../../dbconnection/employeesConnection')
exports.specialistsList = async (req, res) => {
  try {
    const result = await pool.query(`SELECT fullname FROM public.employees WHERE position = ' علاج طبيعي'`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching specialists:', err);
    res.status(500).json({ error: 'Server error' });
  }
};