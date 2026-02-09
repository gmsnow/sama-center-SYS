const pool = require('../../dbconnection/patientsConnection')


exports.addAppointment =  async (req, res) => {
    try {
      const { name, email, phone, date, speacial, note } = req.body;
  
      const result = await pool.query(
        `INSERT INTO appointments (name, email, phone, date, speacial, note)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, email, phone, date, speacial, note]
      );
  
      res.json({ "success": true, "message": "تم حفظ الموعد بنجاح!" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ "success": false, "message": "حدث خطأ" });
    }
  }
  
exports.showAppointment =  async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY id");
    res.render("appointments/showAppointments", { appointments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("خطأ في جلب البيانات");
  }
};
exports.showPendingAppointment =  async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM public.appointments where status = 'pending' ORDER BY id ASC `);
    res.render("appointments/pendingAppointment", { appointments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("خطأ في جلب البيانات");
  }
};
exports.showCompleteAppointment =  async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM public.appointments where status = 'completed' ORDER BY id ASC `);
    res.render("appointments/completeAppointments", { appointments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("خطأ في جلب البيانات");
  }
};
exports.getAppointments =   async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM appointments WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "الموعد غير موجود" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};
exports.updateAppointments =   async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, date, speacial, notes } = req.body;

    const result = await pool.query(
      `UPDATE appointments 
       SET name = $1, email = $2, phone = $3, date = $4, speacial = $5, note = $6
       WHERE id = $7 RETURNING *`,
      [name, email, phone, date, speacial, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الموعد غير موجود' });
    }

    res.json({ message: 'تم تعديل الموعد' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
exports.deleteAppointment =  async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "الموعد غير موجود" });
    }

    res.json({ message: "تم الحذف بنجاح", data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const result = await poolAppointment.query('SELECT * FROM events ORDER BY start_date');

    function formatDateUTC(dateStr) {
      const d = new Date(dateStr);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}-${month}-${year}`;
    }

    const formattedEvents = result.rows.map(event => ({
      ...event,
      formattedStart: formatDateUTC(event.start_date),
      formattedEnd: formatDateUTC(event.end_date)
    }));

    // Send formatted events to EJS
    res.render('calendar/calendar', { events: formattedEvents });

  } catch (err) {
    console.error(err);
    res.send('Error loading events');
  }
};


exports.addEvent =  async (req, res) => {
  try {
    const { title, description, start, end } = req.body;
    const result = await pool.query(
      `INSERT INTO events (title, description, start_date, end_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, start, end]
    );
    res.json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAppointmentsStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query('UPDATE appointments SET status=$1 WHERE id=$2', [status, id]);
  res.json({ message: 'تم تحديث الحالة بنجاح' });
};

exports.showAppointmentsDashboard = async (req, res) => {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`; // '2025-11-11'

    // Query appointments for today
    const result = await pool.query(
      'SELECT * FROM appointments WHERE date = $1 ORDER BY date ASC',
      [todayStr] // pass as string, not integer
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};