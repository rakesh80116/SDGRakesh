const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql');

dotenv.config();

const { SECRET_TOKEN, name, MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;
const app = express();
const port = 7000;

app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
});

function generateAccessToken(username, password) {
  console.log("SECRET_TOKEN:", SECRET_TOKEN);
  return jwt.sign({ username, password }, SECRET_TOKEN, { expiresIn: '1800s' });
}

app.post('/api/createNewUser', (req, res) => {
  console.log("name:", name);
  const { username, password } = req.body;
  console.log("1");
  // Perform user registration logic here
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  const values = [username, password];
  
  pool.query(sql, values, (error, result) => {
    if (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ message: "Failed to create user" });
    } else {
      console.log("User created successfully");
      res.json({ user: { username, password }, message: "User created successfully" });
    }
  });
});

app.post('/api/loginUser', (req, res) => {
  console.log("name:", name);
  const { username, password } = req.body;
  console.log("1");
  // Check if the provided username and password match the records in the database
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  const values = [username, password];
  
  pool.query(sql, values, (error, result) => {
    if (error) {
      console.error("Failed to find user:", error);
      res.status(500).json({ message: "Failed to find user" });
    } else if (result.length > 0) {
      const token = generateAccessToken(username, password);
      console.log("2", token);
      res.json({ message: 'Login successful!', token });
    } else {
      console.log("3");
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Middleware function to authenticate the token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_TOKEN, (err, { username }) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.user = { username };
    next();
  });
}

app.get('/api/userOrders', authenticateToken, (req, res) => {
  const user = req.user;
  const orders = [
    { id: 1, product: 'Product A' },
    { id: 2, product: 'Product B' },
    { id: 3, product: 'Product C' }
  ];

  res.json({ user, orders });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// SECRET_TOKEN=your_secret_token        in .env file
// name=your_name
// MYSQL_HOST=your_mysql_host
// MYSQL_USER=your_mysql_user
// MYSQL_PASSWORD=your_mysql_password
// MYSQL_DATABASE=your_mysql_database
