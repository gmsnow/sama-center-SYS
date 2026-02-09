const pool = require('../../dbconnection/moneyConnection');
const patientsPool = require('../../dbconnection/patientsConnection')
exports.addAdvances = async (req, res) => {
  try {
    const { employee_name, specialty, amount, advance_date, notes } = req.body;

    await pool.query(
      `INSERT INTO advances (employee_name, specialty, amount, advance_date, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [employee_name, specialty, amount, advance_date, notes]
    );

    res.status(200).json({ message: "تم الحفظ بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء الحفظ" });
  }
};
exports.showAdvances = async (req, res) => {
  try {
    const result = await pool.query(
   `SELECT * FROM public.advances`
    );

    res.render("money/showAdvances", { Advances: result.rows });
  } catch (err) {
    console.error("Error fetching attendance:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
};

exports.updateAdvance = async (req, res) => {
  const { id } = req.params;
  const { employee_name, specialty, amount, advance_date, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE advances 
       SET employee_name = $1, specialty = $2, amount = $3, advance_date = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [employee_name, specialty, amount, advance_date, notes, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "السلفة غير موجودة" });
    }

    res.json({ success: true, message: "تم تعديل السلفة بنجاح", data: result.rows[0] });
  } catch (err) {
    console.error("خطأ أثناء تعديل السلفة:", err);
    res.status(500).json({ success: false, message: "حصل خطأ أثناء التعديل" });
  }
};
exports.deleteAdvance = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM advances WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "السلفة غير موجودة" });
    }

    res.json({ success: true, message: "تم حذف السلفة بنجاح" });
  } catch (err) {
    console.error("خطأ أثناء حذف السلفة:", err);
    res.status(500).json({ success: false, message: "حصل خطأ أثناء الحذف" });
  }
};
exports.addExpenses = async (req, res) => {
  try {
      const { category, amount, expense_date, payment_method, notes } = req.body;

      // Validate required fields
      if (!category || !amount || !expense_date || !payment_method) {
          return res.status(400).json({ success: false, error: 'يرجى تعبئة جميع الحقول المطلوبة.' });
      }

      const query = `
          INSERT INTO expenses (category, amount, expense_date, payment_method, notes, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING *;
      `;
      const values = [category, amount, expense_date, payment_method, notes || null];

      const result = await pool.query(query, values);

      res.json({ success: true, expense: result.rows[0] });

  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'حدث خطأ أثناء حفظ المصروف.' });
  }
};
exports.showExpenses = async (req, res) => {
  try {
    const result = await pool.query(
   `SELECT * FROM public.expenses`
    );

    res.render("money/showExpenses", { Expensesces: result.rows });
  } catch (err) {
    console.error("Error fetching attendance:", err.message);
    res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
};
exports.updateExpenses = async (req, res) => {
  const { id } = req.params;
  const { category, amount, expense_date, payment_method, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE expenses 
       SET category = $1, amount = $2, expense_date = $3, payment_method = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [category, amount, expense_date, payment_method, notes, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "السلفة غير موجودة" });
    }
    res.json({ success: true, message: "تم تعديل المصروف بنجاح", data: result.rows[0] });
  } catch (err) {
    console.error("خطأ أثناء تعديل المصروف:", err);
    res.status(500).json({ success: false, message: "حصل خطأ أثناء التعديل" });
  }
};
exports.deleteExpenses = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "المصروف غير موجودة" });
    }

    res.json({ success: true, message: "تم حذف المصروف بنجاح" });
  } catch (err) {
    console.error("خطأ أثناء حذف المصروف:", err);
    res.status(500).json({ success: false, message: "حصل خطأ أثناء الحذف" });
  }
};
exports.totalAmount = async (req, res) => {
  try {
    // Current month filter
    const currentMonthFilter = `DATE_TRUNC('month', CURRENT_DATE)`;

    const resultAdvances = await pool.query(`
      SELECT SUM(amount) AS total_advances
      FROM public.advances
      WHERE DATE_TRUNC('month', advance_date) = ${currentMonthFilter};
    `);

    const resultExpenses = await pool.query(`
      SELECT SUM(amount) AS total_expenses
      FROM public.expenses
      WHERE DATE_TRUNC('month', expense_date) = ${currentMonthFilter};
    `);

    const resultPatients = await patientsPool.query(`
      SELECT SUM(price) AS total_patients
      FROM public.patients
      WHERE DATE_TRUNC('month', dates) = ${currentMonthFilter};
    `);

    const resultSessions = await patientsPool.query(`
      SELECT SUM(price) AS total_sessions
      FROM public.session
      WHERE DATE_TRUNC('month', dates) = ${currentMonthFilter};
    `);

    // Extract totals and handle nulls
    const totalAdvances = resultAdvances.rows[0].total_advances || 0;
    const totalExpenses = resultExpenses.rows[0].total_expenses || 0;
    const totalPatients = resultPatients.rows[0].total_patients || 0;
    const totalSessions = resultSessions.rows[0].total_sessions || 0;

    // Calculate totalAmount
    const totalAmount = (Number(totalPatients) + Number(totalSessions)) - 
                        (Number(totalAdvances) + Number(totalExpenses));

    res.json({
      totalPatients,
      totalSessions,
      totalAdvances,
      totalExpenses,
      totalAmount
    });
    
  } catch (err) {
    console.error("Error calculating total for current month:", err);
    res.status(500).json({ error: "Error calculating total for current month" });
  }
};
