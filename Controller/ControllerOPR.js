const login = require('../model/login/loginModel');


exports.login = async (req, res) => {
    const { name, password } = req.body;
  
    if (!name || !password) {
      return res.status(400).json({ success: false, message: 'الاسم وكلمة المرور مطلوبان' });
    }
  
    try {
      const user = await login.findUserByNameAndPassword(name, password);

      if (!user) {
        return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
      }
      res.cookie('token', user.token, {
        httpOnly: true,  // Secure if using HTTPS
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });
      res.status(200).json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر' });
    }
  };