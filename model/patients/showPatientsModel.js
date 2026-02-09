const pool = require('../../dbconnection/patientsConnection')


exports.showPatients = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, exam_type, fullname, age, phone, dates, price FROM patients ORDER BY id`
      );
  
      res.render('Patients/showPatients', { patients: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'حدث خطأ أثناء جلب البيانات' });
    }
  };
  exports.showPatientsById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT * FROM patients WHERE id = $1`,
        [id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المريض" });
    }
  }
  exports.updatePatient = async (req, res) => {
    const { id } = req.params;
    const { exam_type, fullname, age, sex, phone, dates, price } = req.body;
  
    try {
      const result = await pool.query(
        `UPDATE patients 
         SET exam_type = $1, fullname = $2, age = $3, sex = $4, phone = $5, dates = $6, price = $7
         WHERE id = $8 RETURNING *`,
        [exam_type, fullname, age, sex, phone, dates, price, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'المريض غير موجود' });
      }
  
      res.json({ message: 'تم تحديث بيانات المريض بنجاح', patient: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'خطأ أثناء تحديث بيانات المريض' });
    }
  };
  
  exports.deletePatents = async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM patients WHERE id = $1", [id]);
      res.json({ message: "تم حذف المريض بنجاح" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
    }
  };
  exports.showPatientsMale = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total_males FROM patients WHERE sex = 'ذكر'`
      );
      res.json({ total_males: result.rows[0].total_males });
    } catch (err) {
      console.error('Error fetching male patients count:', err.message);
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المريض" });
    }
  };
  exports.showPatientsFemale = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total_females FROM patients WHERE sex = 'أنثى'`
      );
  
      res.json({ total_females: result.rows[0].total_females });
    } catch (err) {
      console.error('Error fetching female patients count:', err.message);
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المريض" });
    }
  };
  exports.showPatientsDashbourd = async (req, res) => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`; // '2025-11-11'

    const result = await pool.query(
      'SELECT * FROM public.patients WHERE dates = $1 ORDER BY dates ASC',
      [todayStr]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};