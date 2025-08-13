const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import Data Access Object
const mysqlDao = require('./dao/mysqlDao');
const mongoDao = require('./dao/mongoDao');

const app = express();
const PORT = 3004;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



// Route to home page
app.get('/', (req, res) => {
    res.render('home');
});

// GET request for all students
// This shows the students page with a list of all students
app.get('/students', async (req, res) => {
    try {
        const students = await mysqlDao.getAllStudents();
        res.render('students', { students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).send('Error fetching students');
    }
});

// This is updated by student ID
app.get('/students/edit/:sid', async (req, res) => {
    try {
        const student = await mysqlDao.getStudentById(req.params.sid);
        if (!student) {
            return res.status(404).send('Student not found');
        }
        res.render('editStudent', { student, errors: [] });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).send('Error fetching student');
    }
});

// Update the students details
app.post('/students/edit/:sid', async (req, res) => {
    const { name, age } = req.body;
    const sid = req.params.sid;
    const errors = [];

    // Validation
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!age || parseInt(age) < 18) {
        errors.push('Age must be 18 or older');
    }

    if (errors.length > 0) {
        const student = { sid, name, age };
        return res.render('editStudent', { student, errors });
    }

    try {
        await mysqlDao.updateStudent(sid, name.trim(), parseInt(age));
        res.redirect('/students');
    } catch (error) {
        console.error('Error updating student:', error);
        const student = { sid, name, age };
        errors.push('Error updating student');
        res.render('editStudent', { student, errors });
    }
});

// Handles the add new student form
app.get('/students/add', (req, res) => {
    res.render('addStudent', { student: {}, errors: [] });
});

// Adds student
app.post('/students/add', async (req, res) => {
    const { sid, name, age } = req.body;
    const errors = [];
    const student = { sid, name, age };

    // Validation
    if (!sid || sid.trim().length !== 4) {
        errors.push('Student ID must be exactly 4 characters');
    }
    
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!age || parseInt(age) < 18) {
        errors.push('Age must be 18 or older');
    }

    if (errors.length > 0) {
        return res.render('addStudent', { student, errors });
    }

    try {
        // Check if student already exists
        const existingStudent = await mysqlDao.getStudentById(sid.trim());
        if (existingStudent) {
            errors.push(`Student with ID ${sid.trim()} already exists`);
            return res.render('addStudent', { student, errors });
        }

        await mysqlDao.addStudent(sid.trim(), name.trim(), parseInt(age));
        res.redirect('/students');
    } catch (error) {
        console.error('Error adding student:', error);
        errors.push('Error adding student');
        res.render('addStudent', { student, errors });
    }
});

// Display all grades
app.get('/grades', async (req, res) => {
    try {
        const gradesData = await mysqlDao.getAllGrades();
        res.render('grades', { gradesData });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).send('Error fetching grades');
    }
});

// Display all lecturers from mongo database
app.get('/lecturers', async (req, res) => {
    try {
        const lecturers = await mongoDao.getAllLecturers();
        res.render('lecturers', { lecturers });
    } catch (error) {
        console.error('Error fetching lecturers:', error);
        res.status(500).send('Error fetching lecturers');
    }
});

// Delete lecturer by ID
app.get('/lecturers/delete/:lid', async (req, res) => {
    try {
        const lecturerId = req.params.lid;
        
        // Check if lecturer teaches any modules
        const hasModules = await mysqlDao.lecturerHasModules(lecturerId);
        
        if (hasModules) {
            const lecturers = await mongoDao.getAllLecturers();
            const errorMessage = `Cannot delete Lecturer ${lecturerId} as he/she has associated modules`;
            return res.render('lecturers', { lecturers, error: errorMessage });
        }
        
        await mongoDao.deleteLecturer(lecturerId);
        res.redirect('/lecturers');
    } catch (error) {
        console.error('Error deleting lecturer:', error);
        const lecturers = await mongoDao.getAllLecturers();
        res.render('lecturers', { lecturers, error: 'Error deleting lecturer' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});