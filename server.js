const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const xlsx = require('xlsx');
const app = express();

// إعداد تخزين الملفات باستخدام Multer
const upload = multer({ dest: 'uploads/' });

// إنشاء قاعدة بيانات SQLite
const db = new sqlite3.Database('./database.db');

// إنشاء الجداول
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        class TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS Reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER,
        date TEXT,
        author TEXT,
        reason TEXT,
        actions TEXT
    )`);
});

// البحث عن الطلاب
app.get('/students', (req, res) => {
    const query = req.query.query;
    db.all(`SELECT * FROM Students WHERE firstName LIKE ? OR lastName LIKE ?`, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// إضافة تقرير
app.post('/reports', (req, res) => {
    const { studentId, date, author, reason, actions } = req.body;
    db.run(`INSERT INTO Reports (studentId, date, author, reason, actions) VALUES (?, ?, ?, ?, ?)`,
        [studentId, date, author, reason, actions.join(', ')],
        err => {
            if (err) return res.status(500).send(err);
            res.send({ success: true });
        });
});

// عرض التقارير
app.get('/reports', (req, res) => {
    const query = req.query.query;
    db.all(`SELECT * FROM Reports WHERE reason LIKE ?`, [`%${query}%`], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// استيراد الطلاب
app.post('/import-students', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const importType = req.body.importType;

    // قراءة الملف
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (importType === 'new') {
        // حذف القائمة القديمة
        db.run('DELETE FROM Students', err => {
            if (err) return res.status(500).send(err);
            insertStudents(data, res);
        });
    } else if (importType === 'update') {
        // تحديث القائمة بإضافة جديدة
        insertStudents(data, res);
    } else {
        res.status(400).send({ success: false, message: 'نوع الاستيراد غير صحيح.' });
    }
});

function insertStudents(students, res) {
    const placeholders = students.map(() => '(?, ?, ?)').join(', ');
    const values = students.flatMap(student => [student.firstName, student.lastName, student.class]);

    db.run(`INSERT INTO Students (firstName, lastName, class) VALUES ${placeholders}`, values, err => {
        if (err) return res.status(500).send(err);
        res.send({ success: true });
    });
}

// تشغيل الخادم
app.listen(3000, () => console.log('Server running on http://localhost:3000'));