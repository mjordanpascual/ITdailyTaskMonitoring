// server.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection MySQL Administrator
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root', // replace with your MySQL username
//     password: '', // replace with your MySQL password
//     //database: 'todo_db'
//     port: '3307',
//     database: 'ospar_db_api'
// });

// MySQL connection XAMPP
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: '', // replace with your MySQL password
    //database: 'todo_db'
    port: '3307',
    database: 'todo_db'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes
app.get('/todos', (req, res) => {
    db.query('SELECT * FROM todos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/todos', (req, res) => {
    const { text } = req.body;
    db.query('INSERT INTO todos (text) VALUES (?)', [text], (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: results.insertId, text, completed: false });
    });
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;
    db.query('UPDATE todos SET text = ?, completed = ? WHERE id = ?', [text, completed, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ id, text, completed });
    });
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.status(204).send();
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});