
exports.login = (req, res) => {
    res.render('login/login');
}

exports.dashboard = (req, res) => {
    res.render('dashboard/dashboardAdmin');
}
exports.dashboardUser = (req, res) => {
    res.render('dashboard/dashboardUser');
}
exports.addPatients = (req, res) => {
    res.render('Patients/addPatients');
}
exports.showPatients = (req, res) => {
    res.render('Patients/showPatients');
}

exports.appointmentsNew = (req, res) => {
    res.render('appointments/addAppointments');
}
exports.pendingAppointments = (req, res) => {
    res.render('appointments/pendingAppointment');
}
exports.completeAppointments = (req, res) => {
    res.render('appointments/completeAppointments');
}
exports.employesFiles = (req, res) => {
    res.render('FilesAndDocuments/employesFiles');
}
exports.filesAndReports = (req, res) => {
    res.render('FilesAndDocuments/filesAndReports');
}
exports.AttendanceAndDepartureFiles = (req, res) => {
    res.render('FilesAndDocuments/AttendanceAndDepartureFiles');
}
exports.addAdvances = (req, res) => {
    res.render('money/addAdvances');
}

exports.addExpenses = (req, res) => {
    res.render('money/addExpenses');
}
exports.dailyReport = (req, res) => {
    res.render('reports/dailyReport');
}
exports.weeklyReports = (req, res) => {
    res.render('reports/weeklyReports');
}
exports.monthlyReports = (req, res) => {
    res.render('reports/monthlyReports');
}
exports.Profile = (req, res) => {
    res.render('FilesAndDocuments/Profile');
}

