const express = require('express');
const app = express();
// const http = require('http');

// const server = http.createServer(app);
// // ✨ هذه السطر مهم جداً لتحليل بيانات JSON القادمة من POST requests
// app.use(express.json());
// const cors = require('cors');
// // ✅ تحليل بيانات x-www-form-urlencoded (مثل forms من المتصفح)
// app.use(express.urlencoded({ extended: true }));

const router = express.Router();
const Controller = require('../Controller/controller');
const ControllerOPR = require('../Controller/ControllerOPR');
const addPatients = require('../model/patients/addPatientsModel');
const showPatients = require('../model/patients/showPatientsModel');
const patientSession = require('../model/patients/patientSessionModel');
const patientAppointment = require('../model/appointment/addAppointmentModel');
const filesAndDocuments = require('../model/filesAndDocuments/patientsFilesModel');
const attendanceEmployees = require('../model/attendance/attendanceModel');
const moneyModel = require('../model/money/moneyModel');
const reportsModel = require('../model/reports/ReportsModels');
const todosModel = require('../model/todos/todoModel');
const employeesModel = require('../model/employees/employeesModel');
const {authenticateToken, adminOnly }  = require('../middleware/auth');


// //Get requst
router.get('/', Controller.login);
router.get('/dashboard',authenticateToken, adminOnly, Controller.dashboard);
router.get('/dashboardUser',authenticateToken, Controller.dashboardUser);
router.get('/patients/new',authenticateToken, Controller.addPatients);
router.get('/patients', authenticateToken,showPatients.showPatients);
router.get('/patients/files', authenticateToken,filesAndDocuments.patientsFiles);
router.get('/patients/session', authenticateToken,patientSession.patientSession);
router.get('/appointments/new', authenticateToken,Controller.appointmentsNew);
router.get('/appointments', authenticateToken,patientAppointment.showAppointment);
// router.get('/calendar', authenticateToken,patientAppointment.getEvents);
router.get('/appointments/pending', authenticateToken,patientAppointment.showPendingAppointment);
router.get('/appointments/complete', authenticateToken,patientAppointment.showCompleteAppointment);
router.get('/employees/files', authenticateToken,Controller.employesFiles);
router.get('/filesAndReports', authenticateToken,Controller.filesAndReports);
router.get('/AttendanceAndDepartureFiles', authenticateToken,Controller.AttendanceAndDepartureFiles);
router.get('/Attendance/new', authenticateToken,attendanceEmployees.showAttendance);
router.get('/advances/new', authenticateToken,Controller.addAdvances);
router.get('/advances', authenticateToken,moneyModel.showAdvances);
router.get('/Expenses/new', authenticateToken,Controller.addExpenses);
router.get('/Expenses', authenticateToken,moneyModel.showExpenses);
router.get('/dailyReport', authenticateToken,Controller.dailyReport);
router.get('/weeklyReports', authenticateToken,Controller.weeklyReports);
router.get('/monthlyReports', authenticateToken,Controller.monthlyReports);
router.get('/Profile', authenticateToken,Controller.Profile);
router.get('/api/showPatient/:id', showPatients.showPatientsById);
router.get('/api/sessions/:id', patientSession.showsessionsById);
router.get('/patients-files/download/:id', filesAndDocuments.patientsfileDownload);
router.get('/dailyReportsPrint', reportsModel.dailyReportsPrint);
router.get('/weeklyReportsPrint', reportsModel.weeklyReportsPrint);
router.get('/monthlyReportsPrint', reportsModel.monthlyReportsPrint);







//Post requst
router.post('/api/login', ControllerOPR.login);
router.post('/add-patient',addPatients.addPatients)
router.post('/addsession',patientSession.addpatientSession)
router.post('/addAppointment',patientAppointment.addAppointment)
router.post('/events',patientAppointment.addAppointment)
router.post('/events/add', patientAppointment.addEvent);
router.post('/attendance/add', attendanceEmployees.addEttendance);
router.post('/noattendance/add', attendanceEmployees.addNoAttendance);
router.post('/advances/add', moneyModel.addAdvances);
router.post('/expense/add', moneyModel.addExpenses);
router.post('/api/todos', todosModel.addTodo);


//API requst 
router.get('/api/showPatientsNames',patientSession.showPatientsName)
router.get('/api/showTodaySessions',patientSession.showTodaySessions)
router.get('/api/appointments/:id', patientAppointment.getAppointments);
router.get('/api/showAppointmentsDashboard', patientAppointment.showAppointmentsDashboard);
router.get('/api/showPatientssDashboard', showPatients.showPatientsDashbourd);
router.get('/api/daily-Summary', reportsModel.dailySummary);
router.get('/api/weekly-Summary', reportsModel.weeklySummary);
router.get('/api/monthly-Summary', reportsModel.monthlySummary);
router.get('/api/patients-report', reportsModel.dailyPatientsReports);
router.get('/api/advances-today', reportsModel.advancesToday);
router.get('/api/expenses-today', reportsModel.todayExpenses);
router.get('/api/malePatients', showPatients.showPatientsMale);
router.get('/api/femalePatients', showPatients.showPatientsFemale);
router.get("/api/totalAmount", moneyModel.totalAmount);
router.get('/api/todos', todosModel.todos);
router.get('/api/specialists', employeesModel.specialistsList);


// //put requsts
router.put('/api/patients/:id', showPatients.updatePatient);
router.put('/api/updateStatus/:id', patientSession.updateStatusInTheTable);
router.put('/api/updateSession/:id', patientSession.updateSession);
router.put('/api/appointments/:id', patientAppointment.updateAppointments);
router.put('/api/appointments/:id/status', patientAppointment.updateAppointmentsStatus);
router.put("/advances/update/:id", moneyModel.updateAdvance);
router.put("/Expenses/update/:id", moneyModel.updateExpenses);
router.put("/api/todos/:id", todosModel.editTodo);








// // delete requst
router.delete('/api/patients/:id',showPatients.deletePatents)
router.delete('/api/deleteSession/:id',patientSession.deleteSession)
router.delete('/api/appointments/:id',patientAppointment.deleteAppointment)
router.delete('/advances/delete/:id',moneyModel.deleteAdvance)
router.delete('/Expenses/delete/:id',moneyModel.deleteExpenses)
router.delete('/api/todos/:id',todosModel.deleteTodo)
module.exports = router;
