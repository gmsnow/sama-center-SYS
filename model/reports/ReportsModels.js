const pool = require('../../dbconnection/moneyConnection')
const patientsPool = require('../../dbconnection/patientsConnection')

exports.dailySummary = async (req, res) => {
  try {
    const incomeResult = await patientsPool.query(`
      SELECT 
        COALESCE((
          SELECT SUM(price) FROM patients WHERE dates::date = CURRENT_DATE
        ), 0)
        + 
        COALESCE((
          SELECT SUM(price) FROM session WHERE dates::date = CURRENT_DATE
        ), 0)
      AS total_income;
    `);
    const advancesResult = await pool.query(
      `SELECT SUM(amount) AS total_advance FROM advances WHERE advance_date = CURRENT_DATE`
    );
    const expensesResult = await pool.query(
      `SELECT SUM(amount) AS total_expense FROM expenses WHERE expense_date::date = CURRENT_DATE`
    );
    const PatientsResult = await patientsPool.query(`
  SELECT 
    COALESCE((
      SELECT COUNT(*) FROM patients WHERE dates::date = CURRENT_DATE
    ), 0)
    +
    COALESCE((
      SELECT COUNT(*) FROM session WHERE dates::date = CURRENT_DATE
    ), 0)
  AS total_visits;
`);
    res.json({
      income: incomeResult.rows[0].total_income || 0,
      advances: advancesResult.rows[0].total_advance || 0,
      expenses: expensesResult.rows[0].total_expense || 0,
      patients: PatientsResult.rows[0].total_visits || 0
    });
  } catch (err) {
    console.error('Error in dailySummary:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.dailyPatientsReports = async (req, res) => {
  try {
    const patientsResult = await patientsPool.query(`
    SELECT fullname, dates, price
    FROM patients
    WHERE dates::date = CURRENT_DATE
    ORDER BY dates DESC
    LIMIT 5
  `);

  // استعلام الجلسات اليوم
  const sessionsResult = await patientsPool.query(`
    SELECT fullname, dates, price
    FROM session
    WHERE dates::date = CURRENT_DATE
    ORDER BY dates DESC
    LIMIT 5
  `);

  res.json({
    patients: patientsResult.rows,
    sessions: sessionsResult.rows
  });
  } catch (error) {
    console.error("Error fetching patient report:", error);
    res.status(500).json({ error: "Server error" });
  }
};
exports.advancesToday = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM advances
      WHERE advance_date::date = CURRENT_DATE
      ORDER BY advance_date DESC
    `);

    res.json(result.rows); // returns array of advances
  } catch (err) {
    console.error("Error fetching today's advances:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.todayExpenses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, expense_date, amount
      FROM expenses
      WHERE expense_date::date = CURRENT_DATE
      ORDER BY expense_date DESC
    `);

    res.json(result.rows); // returns array of expenses
  } catch (err) {
    console.error("Error fetching today's expenses:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.dailyReportsPrint = async (req, res) => {
  try {
    const patientsResult = await patientsPool.query(`
    SELECT * FROM patients
    WHERE dates = CURRENT_DATE
    ORDER BY id ASC
  `);

  const sessionsResult = await patientsPool.query(`
    SELECT * FROM session
    WHERE dates = CURRENT_DATE
    ORDER BY id ASC
  `);

  const expensesResult = await pool.query(`
  SELECT * FROM expenses
WHERE expense_date::date = CURRENT_DATE
ORDER BY id ASC;

  `);
  const advancesResult = await pool.query(`
    SELECT * FROM advances
    WHERE advance_date::date = CURRENT_DATE
    ORDER BY id ASC
  `);

    res.render("print/dailyReport", {
      patients: patientsResult.rows,
      sessions: sessionsResult.rows,
      expenses: expensesResult.rows,
      advances: advancesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
exports.weeklyReportsPrint = async (req, res) => {
  try {
    // Calculate week range (Saturday → Friday)
    function getWeekRange(date = new Date()) {
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      let saturday = new Date(date);
      if (day !== 6) {
        const diffToSat = (day + 1) % 7;
        saturday.setDate(date.getDate() - diffToSat);
      }
      const friday = new Date(saturday);
      friday.setDate(saturday.getDate() + 6);
      const formatDate = (d) => d.toISOString().split('T')[0];
      return { start: formatDate(saturday), end: formatDate(friday) };
    }

    const { start, end } = getWeekRange();

    // Fetch data for the week
    const expensesResult = await pool.query(`
      SELECT expense_date, SUM(amount) AS total_expense
      FROM expenses
      WHERE expense_date BETWEEN $1 AND $2
      GROUP BY expense_date
    `, [start, end]);

    const advancesResult = await pool.query(`
      SELECT advance_date, SUM(amount) AS total_advance
      FROM advances
      WHERE advance_date BETWEEN $1 AND $2
      GROUP BY advance_date
    `, [start, end]);

    const sessionsResult = await patientsPool.query(`
      SELECT dates, SUM(price) AS total_sessions
      FROM session
      WHERE dates BETWEEN $1 AND $2
      GROUP BY dates
    `, [start, end]);

    const patientsResult = await patientsPool.query(`
      SELECT dates, SUM(price) AS total_patients
      FROM patients
      WHERE dates BETWEEN $1 AND $2
      GROUP BY dates
    `, [start, end]);

    // Map data to week days
    const days = ["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
    let weekData = [];
    function toLocalDateStr(d) {
      const date = new Date(d);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = toLocalDateStr(currentDate);
    
      const expense = expensesResult.rows.find(e => toLocalDateStr(e.expense_date) === dateStr);
      const advance = advancesResult.rows.find(a => toLocalDateStr(a.advance_date) === dateStr);
      const session = sessionsResult.rows.find(s => toLocalDateStr(s.dates) === dateStr);
      const patient = patientsResult.rows.find(p => toLocalDateStr(p.dates) === dateStr);
    
      const totalSessionsPatients = parseFloat(session?.total_sessions || 0) + parseFloat(patient?.total_patients || 0);
      const totalAdvancesExpenses = parseFloat(advance?.total_advance || 0) + parseFloat(expense?.total_expense || 0);
    
      const income = totalSessionsPatients;
      const expen = totalSessionsPatients - totalAdvancesExpenses;
    
      weekData.push({
        day: days[i],
        date: dateStr,
        income: income || '',
        expense: expen || ''
      });
    }
    
    res.render("print/weeklyReport", { weekData });

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.monthlyReportsPrint = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = يناير

    const monthNames = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    const monthName = monthNames[month];

    // 🗓️ بداية الشهر ونهايته
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const lastDate = lastDayOfMonth.getDate(); // رقم آخر يوم

    // 📅 تقسيم الشهر إلى أسابيع من اليوم 1
    const weeks = [];
    for (let startDay = 1; startDay <= lastDate; startDay += 7) {
      const start = new Date(year, month, startDay);
      const end = new Date(year, month, Math.min(startDay + 6, lastDate));

      const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      weeks.push({
        start: formatDate(start),
        end: formatDate(end)
      });
    }

    // 🧮 جلب البيانات لكل أسبوع
    const weeklyData = [];

    for (let i = 0; i < weeks.length; i++) {
      const { start, end } = weeks[i];

      const expensesResult = await pool.query(`
        SELECT SUM(amount) AS total_expense
        FROM expenses
        WHERE expense_date BETWEEN $1 AND $2
      `, [start, end]);

      const advancesResult = await pool.query(`
        SELECT SUM(amount) AS total_advance
        FROM advances
        WHERE advance_date BETWEEN $1 AND $2
      `, [start, end]);

      const sessionsResult = await patientsPool.query(`
        SELECT SUM(price) AS total_sessions
        FROM session
        WHERE dates BETWEEN $1 AND $2
      `, [start, end]);

      const patientsResult = await patientsPool.query(`
        SELECT SUM(price) AS total_patients
        FROM patients
        WHERE dates BETWEEN $1 AND $2
      `, [start, end]);

      const totalIncome = parseFloat(sessionsResult.rows[0]?.total_sessions || 0) +
                          parseFloat(patientsResult.rows[0]?.total_patients || 0);
      const totalExpense = parseFloat(expensesResult.rows[0]?.total_expense || 0) +
                           parseFloat(advancesResult.rows[0]?.total_advance || 0);
      const net = totalIncome - totalExpense;

      weeklyData.push({
        weekNumber: i + 1,
        startDate: start,
        endDate: end,
        totalIncome,
        totalExpense,
        net
      });
    }

    res.render("print/monthlyReports", {
      monthName,
      year,
      weeklyData
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};




exports.weeklySummary = async (req, res) => {
  try {
    // احسب بداية ونهاية الأسبوع (السبت → الجمعة)
    function getWeekRange(date = new Date()) {
      const day = date.getDay(); // 0 = الأحد, 6 = السبت
      let saturday = new Date(date);
      if (day !== 6) {
        const diffToSat = (day + 1) % 7;
        saturday.setDate(date.getDate() - diffToSat);
      }
      const friday = new Date(saturday);
      friday.setDate(saturday.getDate() + 6);

      const formatDate = (d) => d.toISOString().split('T')[0];
      return { start: formatDate(saturday), end: formatDate(friday) };
    }

    const { start, end } = getWeekRange();

    // إجمالي الدخل الأسبوعي
    const incomeResult = await patientsPool.query(`
      SELECT
        COALESCE((
          SELECT SUM(price) FROM patients WHERE dates::date BETWEEN $1 AND $2
        ), 0)
        +
        COALESCE((
          SELECT SUM(price) FROM session WHERE dates::date BETWEEN $1 AND $2
        ), 0)
      AS total_income;
    `, [start, end]);

    // إجمالي السلف الأسبوعي
    const advancesResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_advance
      FROM advances
      WHERE advance_date::date BETWEEN $1 AND $2
    `, [start, end]);

    // إجمالي المصروفات الأسبوعية
    const expensesResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_expense
      FROM expenses
      WHERE expense_date::date BETWEEN $1 AND $2
    `, [start, end]);

    // إجمالي عدد الزيارات الأسبوعية
    const PatientsResult = await patientsPool.query(`
      SELECT
        COALESCE((
          SELECT COUNT(*) FROM patients WHERE dates::date BETWEEN $1 AND $2
        ), 0)
        +
        COALESCE((
          SELECT COUNT(*) FROM session WHERE dates::date BETWEEN $1 AND $2
        ), 0)
      AS total_visits;
    `, [start, end]);

    res.json({
      start,
      end,
      income: incomeResult.rows[0].total_income || 0,
      advances: advancesResult.rows[0].total_advance || 0,
      expenses: expensesResult.rows[0].total_expense || 0,
      patients: PatientsResult.rows[0].total_visits || 0
    });

  } catch (err) {
    console.error('Error in weeklySummary:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.weeklychartSummary = async (req, res) => {
  try {
    // Calculate start (Saturday) and end (Friday) of the current week
    function getWeekRange(date = new Date()) {
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday
      let saturday = new Date(date);
      if (day !== 6) {
        const diffToSat = (day + 1) % 7;
        saturday.setDate(date.getDate() - diffToSat);
      }
      const friday = new Date(saturday);
      friday.setDate(saturday.getDate() + 6);

      const formatDate = (d) => d.toISOString().split('T')[0];
      return { start: formatDate(saturday), end: formatDate(friday) };
    }

    const { start, end } = getWeekRange();

    // Fetch daily income from patients and sessions
    const dailyIncomeResult = await patientsPool.query(`
      SELECT day::date, SUM(price) as income
      FROM (
        SELECT dates::date as day, price FROM patients WHERE dates::date BETWEEN $1 AND $2
        UNION ALL
        SELECT dates::date as day, price FROM session WHERE dates::date BETWEEN $1 AND $2
      ) AS combined
      GROUP BY day
      ORDER BY day;
    `, [start, end]);

    // Build 7-day array, filling 0 if no data
    const dailyTotals = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dailyIncomeResult.rows.find(r => r.day.toISOString().split('T')[0] === dateStr);
      dailyTotals.push(dayData ? Number(dayData.income) : 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      start,
      end,
      dailyTotals,
      totalIncome: dailyTotals.reduce((a, b) => a + b, 0)
    });

  } catch (err) {
    console.error('Error in weeklySummary:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.monthlySummary = async (req, res) => {
  try {
    // احسب بداية ونهاية الشهر الحالي
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1); // أول يوم في الشهر
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // آخر يوم في الشهر

    // تحويل التاريخ لصيغة YYYY-MM-DD
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startStr = formatDate(start);
    const endStr = formatDate(end);

    // إجمالي الدخل للشهر
    const incomeResult = await patientsPool.query(`
      SELECT
        COALESCE((
          SELECT SUM(price) FROM patients WHERE dates::date BETWEEN $1 AND $2
        ), 0)
        +
        COALESCE((
          SELECT SUM(price) FROM session WHERE dates::date BETWEEN $1 AND $2
        ), 0)
      AS total_income;
    `, [startStr, endStr]);

    // إجمالي السلف للشهر
    const advancesResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_advance
      FROM advances
      WHERE advance_date::date BETWEEN $1 AND $2
    `, [startStr, endStr]);

    // إجمالي المصروفات للشهر
    const expensesResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_expense
      FROM expenses
      WHERE expense_date::date BETWEEN $1 AND $2
    `, [startStr, endStr]);

    // إجمالي عدد الزيارات للشهر
    const PatientsResult = await patientsPool.query(`
      SELECT
        COALESCE((
          SELECT COUNT(*) FROM patients WHERE dates::date BETWEEN $1 AND $2
        ), 0)
        +
        COALESCE((
          SELECT COUNT(*) FROM session WHERE dates::date BETWEEN $1 AND $2
        ), 0)
      AS total_visits;
    `, [startStr, endStr]);

    res.json({
      start: startStr,
      end: endStr,
      income: incomeResult.rows[0].total_income || 0,
      advances: advancesResult.rows[0].total_advance || 0,
      expenses: expensesResult.rows[0].total_expense || 0,
      patients: PatientsResult.rows[0].total_visits || 0
    });

  } catch (err) {
    console.error('Error in monthlySummary:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};