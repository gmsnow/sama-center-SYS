const pool = require('../../dbconnection/patientsConnection')
exports.patientsFiles = async (req, res) => {
    try {
      // Example: fetch patients from database
      const result = await pool.query('SELECT * FROM patients'); // Adjust table name and columns
      res.render('Patients/patientsFile', { patients: result.rows }); // Pass array to EJS
    } catch (err) {
      console.error(err);
      res.send('Error fetching patients');
    }
  };
  exports.patientsfileDownload = async (req, res) => {
    const { id } = req.params;
    const patientId = parseInt(id, 10);
  
    if (isNaN(patientId)) {
      return res.status(400).send('Invalid patient ID');
    }
  
    try {
      const result = await pool.query(
        'SELECT * FROM patients WHERE id = $1',
        [patientId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send('Patient not found');
      }
  
      res.render('print/patientsFiles', { patients: result.rows }); // Pass array to EJS
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };