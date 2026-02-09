const pool = require('../../dbconnection/patientsConnection')


exports.addPatients = async (req, res) => {
    try {
      const { exam_type, fullname, age, sex, phone, dates } = req.body;
      // تحديد السعر تلقائيًا حسب العمر
      const price = age < 14 ? 1500 : 3000;
  
      const query = `
        INSERT INTO patients (exam_type, fullname, age, sex, phone, dates, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
  
      const values = [exam_type, fullname, age, sex, phone, dates, price];
      await pool.query(`
      -- Drop the primary key constraint
      ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_pkey;

      -- Reassign sequential IDs using ROW_NUMBER()
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS new_id
        FROM public.patients
      )
      UPDATE public.patients
      SET id = ranked.new_id
      FROM ranked
      WHERE patients.id = ranked.id;

      -- Reset sequence to match new max ID
      SELECT setval('public.patients_id_seq', COALESCE((SELECT MAX(id) FROM public.patients), 1), true);

      -- Re-add the primary key
      ALTER TABLE public.patients ADD PRIMARY KEY (id);
    `);
      const result = await pool.query(query, values);
  
      res.json({
        success: true,
        message: `✅ تم حفظ بيانات المريض بنجاح! رقم المريض: ${result.rows[0].id}`,
        patientId: result.rows[0].id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: '❌ حدث خطأ أثناء الحفظ!'
      });
    }
  };