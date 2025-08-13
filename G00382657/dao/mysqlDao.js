const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Blackboy1', // My SQL password
    database: 'proj2024mysql'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

class MySQLDao {
    
    // Get all students ordered by Student ID
    async getAllStudents() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT sid, name, age FROM student ORDER BY sid ASC'
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    // Get student by ID
    async getStudentById(sid) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT sid, name, age FROM student WHERE sid = ?',
                [sid]
            );
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    // Update student details
    async updateStudent(sid, name, age) {
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'UPDATE student SET name = ?, age = ? WHERE sid = ?',
                [name, age, sid]
            );
        } finally {
            connection.release();
        }
    }

    // Add new student
    async addStudent(sid, name, age) {
        const connection = await pool.getConnection();
        try {
            await connection.execute(
                'INSERT INTO student (sid, name, age) VALUES (?, ?, ?)',
                [sid, name, age]
            );
        } finally {
            connection.release();
        }
    }

    // Gets all the grades
    async getAllGrades() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(`
                SELECT 
                    s.name as student_name,
                    m.name as module_name,
                    g.grade
                FROM student s
                LEFT JOIN grade g ON s.sid = g.sid
                LEFT JOIN module m ON g.mid = m.mid
                ORDER BY s.name ASC, g.grade ASC
            `);
            
            // Group grades based on student name
            const groupedData = {};
            
            rows.forEach(row => {
                if (!groupedData[row.student_name]) {
                    groupedData[row.student_name] = [];
                }
                
                if (row.module_name && row.grade !== null) {
                    groupedData[row.student_name].push({
                        module_name: row.module_name,
                        grade: row.grade
                    });
                }
            });
            
            return groupedData;
        } finally {
            connection.release();
        }
    }

    // Check if the lecturer teaches any modules
    async lecturerHasModules(lecturerId) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT COUNT(*) as count FROM module WHERE lecturer = ?',
                [lecturerId]
            );
            return rows[0].count > 0;
        } finally {
            connection.release();
        }
    }
}

module.exports = new MySQLDao();