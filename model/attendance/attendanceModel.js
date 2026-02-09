const pool = require('../../dbconnection/attendanceConnection');
exports.addEttendance = async (req, res) => {
  const { employee_name, status, attendance_date, notes, signed } = req.body;

  try {
    await pool.query(
      "INSERT INTO attendance (employee_name, status, attendance_date, notes, signed) VALUES ($1, $2, $3, $4, $5)",
      [employee_name, status, attendance_date, notes, signed]
    );
    res.send("تم حفظ الحضور بنجاح ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("حدث خطأ أثناء الحفظ");
  }
};
exports.addNoAttendance = async (req, res) => {
  const { employee_name, attendance_date, notes, signed } = req.body;

  try {
    await pool.query(
      "INSERT INTO noAttendance (employee_name, attendance_date, notes, signed) VALUES ($1, $2, $3, $4)",
      [employee_name, attendance_date, notes, signed]
    );
    res.send("تم حفظ الحضور بنجاح ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("حدث خطأ أثناء الحفظ");
  }
};
exports.showAttendance = async (req, res) => {
  try {
    const attendanceResult = await pool.query(
      `SELECT *
       FROM public.attendance 
       ORDER BY id ASC`
    );

    const noAttendanceResult = await pool.query(
      `SELECT * 
       FROM public.noattendance 
       ORDER BY id ASC`
    );

    res.render("Attendance/addAttendance", { 
      attendances: attendanceResult.rows, 
      noAttendances: noAttendanceResult.rows 
    });
  } catch (err) {
    console.error("Error fetching attendance:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
};