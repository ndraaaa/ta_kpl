const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const app = express();
const port = 8000;

// Konfigurasi MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_kpl'
});

db.connect((err) => {
  if (err) {
    console.log('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(express.static('static'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });
  
app.get('/register', async (req, res) => {
  res.sendFile(__dirname + '/views/regist.html');
});
  
app.post('/register', async (req, res) => {
    const { username, nama, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const jenis_user = "user";

    const sql = 'INSERT INTO users (username, nama, password, jenis_user) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, nama, hashedPassword, jenis_user], (err, result) => {
        if (err) {
          console.log('Error registering user:', err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log('User registered successfully');
          res.redirect('/login');
        }
      });
    });
  
app.get('/login', async (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});
  
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, result) => {
        if (err) {
          console.log('Error checking user:', err);
          res.status(500).send('Internal Server Error');
        } else {
          if (result.length > 0) {
            const match = await bcrypt.compare(password, result[0].password);
            if (match) {
              console.log('Login successful');
              res.redirect('/home');
            } else {
              console.log('Incorrect password');
              res.status(401).send('Incorrect password');
            }
          } else {
            console.log('User not found');
            res.status(404).send('User not found');
          }
        }
      });
    });
  
app.get('/home', async (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});
    
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});