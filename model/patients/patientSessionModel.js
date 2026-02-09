const pool = require('../../dbconnection/patientsConnection')
exports.addpatientSession =  async (req, res) => {
    try {
      const { fullname, date, sessions, speacial, price, note } = req.body;
      if (!fullname || !date || !sessions || !speacial || !price) {
        return res.status(400).json({ message: "⚠️ كل الحقول مطلوبة" });
      }
      const query = `
        INSERT INTO session (fullname, dates, session_type, speacial, price, note)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
  
      const result = await pool.query(query, [
        fullname,
        date,
        sessions,
        speacial,
        price,
        note || null,
      ]);
  
      res.json({
        message: "✅ تم حفظ الجلسة بنجاح",
        session: result.rows[0],
      });
    } catch (err) {
      console.error("❌ خطأ في السيرفر:", err);
      res.status(500).json({ message: "❌ خطأ داخلي في السيرفر" });
    }
  };
  exports.updateSession =  async (req, res) => {
  const { id } = req.params;
  const { fullname, session_type, speacial, session_date, price, notes } = req.body;

  // Validation (optional)
  if (!fullname || !session_type || !speacial || !session_date || !price) {
    return res.status(400).json({ message: 'الرجاء ملء جميع الحقول المطلوبة' });
  }

  try {
    const query = `
      UPDATE session
      SET 
        fullname = $1,
        session_type = $2,
        speacial = $3,
        dates = $4,
        price = $5,
        note = $6
      WHERE id = $7
      RETURNING *;
    `;

    const values = [fullname, session_type, speacial, session_date, price, notes, id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'الجلسة غير موجودة' });
    }

    res.json({ message: 'تم تحديث الجلسة بنجاح', session: result.rows[0] });

  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ message: 'حدث خطأ أثناء التحديث' });
  }
}

exports.updateStatusInTheTable = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params; 
    if (!id || !status) {
      return res.status(400).json({ message: "❌ مفقود id أو status" });
    }
  
    try {
      const result = await pool.query(
        "UPDATE session SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "❌ لم يتم العثور على المريض" });
      }
  
      res.json({ message: "✅ تم تحديث الحالة", patient: result.rows[0] });
    } catch (err) {
      console.error("❌ خطأ في تحديث الحالة:", err);
      res.status(500).json({ message: "⚠️ خطأ في السيرفر" });
    }
  }
  
exports.showPatientsName = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, fullname, session_type, status
        FROM session
        WHERE status IS NULL OR status != 'complete'
        ORDER BY id DESC
      `);
      res.json(result.rows); 
    } catch (err) {
      console.error("❌ خطأ في جلب المرضى:", err);
      res.status(500).json({ message: "❌ خطأ في السيرفر" });
    }
  }
  exports.patientSession = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM session ORDER BY id DESC");
  
      // تحويل التواريخ إلى DD-MM-YYYY
      const sessionsWithFormattedDate = result.rows.map(s => {
        const dateObj = new Date(s.dates); // assuming s.dates is a Date object or date string
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // الأشهر تبدأ من 0
        const year = dateObj.getFullYear();
  
        return {
          ...s,
          formattedDate: `${day}-${month}-${year}`
        };
      });
  
      res.render('Patients/patientSession', {
        session: sessionsWithFormattedDate
      });
    } catch (err) {
      console.error("❌ خطأ في جلب الجلسات:", err);
      res.status(500).send("❌ خطأ في السيرفر");
    }
  };

  exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { fullname, session_type, speacial, session_date, price, notes } = req.body;
  
    try {
      await pool.query(
        `UPDATE session
         SET fullname=$1, session_type=$2, speacial=$3, dates=$4, price=$5, note=$6
         WHERE id=$7`,
        [fullname, session_type, speacial, session_date, price, notes, id]
      );
      res.json({ message: "تم تحديث الجلسة بنجاح" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "فشل في تحديث الجلسة" });
    }
  }
  exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM session WHERE id = $1 RETURNING *", [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "الجلسة غير موجودة" });
      }
      res.json({ message: "تم حذف الجلسة بنجاح!" });
    } catch (err) {
      console.error("❌ خطأ في حذف الجلسة:", err);
      res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
    }
  };  
  exports.showsessionsById = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM session WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "الجلسة غير موجودة" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ خطأ في جلب الجلسة:", err);
      res.status(500).json({ message: "خطأ في السيرفر" });
    }
  };

  exports.showTodaySessions = async (req, res) => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`; // '2025-11-11'

    const result = await pool.query(
      'SELECT * FROM session WHERE dates = $1 ORDER BY dates ASC',
      [todayStr]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};