const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 7000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Rakesh514@',
  database: 'mydatabase',
});

app.use(cors());
app.use(bodyParser.json());

app.get('/api/projectss', (req, res) => {
  const query = 'SELECT * FROM projectss';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ error: 'Failed to fetch projects' });
    } else {
      res.json(results);
    }
  });
});

// API endpoint to fetch month data
app.get('/api/month-data', (req, res) => {
  const query = 'SELECT * FROM month_data';

pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching month data:', err);
      res.status(500).json({ error: 'Failed to fetch month data' });
    } else {
      res.json(results);
    }
  });
});


app.get('/weekdata', (req, res) => {
  const query = `
    SELECT week_name, person_name, hours_worked
    FROM weekly_hours;
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});



app.get('/projects', (req, res) => {
  const query = `
    SELECT id, name AS project_name
    FROM projects;
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.get('/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const query = `
    SELECT p.name AS project_name, c.name AS client_name, h.hours_worked, p.remaining_time
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    JOIN hours h ON p.id = h.project_id
    WHERE p.id = ?;
  `;
  pool.query(query, [projectId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length === 0) {
        res.status(404).send('Project not found');
        return;
      }
      res.send(results);
    }
  });
});

app.get('/weeklydata/:month/:year', (req, res) => {
  const { month, year } = req.params;
  const query = `
    SELECT w.week_number, w.people, w.hours, w.task, p.name AS project_name
    FROM weekly_data w
    JOIN months m ON w.month_id = m.id
    JOIN projects p ON m.projectid = p.id
    WHERE m.name = ? AND m.year = ?;
  `;

  pool.query(query, [month, year], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});






app.get('/months', (req, res) => {
  const query = `SELECT * FROM months;`;
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.get('/months-with-projects', (req, res) => {
  const query = `
    SELECT m.name AS month_name, m.year, p.name AS project_name
    FROM months m
    JOIN projects p ON m.projectid = p.id;
  `;

  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});


app.get('/roles', (req, res) => {
  const query = 'SELECT * FROM roles';
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM roles WHERE username = ? AND password = ?';
  pool.query(query, [username, password], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length === 0) {
        res.status(401).send('Invalid username or password');
        return;
      }
      const role = results[0].role;
      res.send({ role });
    }
  });
});



app.get('/users', (req, res) => {
  const query = `
    SELECT name,TotalHours FROM users;
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.get('/listoftasks', (req, res) => {
  const query = `
    SELECT project_name, description FROM listtasks;
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.get('/tasks', (req, res) => {
  const query = `
    SELECT * FROM tasks;
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(results);
    }
  });
});

app.post('/addtasks', (req, res) => {
  const { name, assignedTo, status } = req.body;

  const query = `
    INSERT INTO tasks (name, assignedTo, status)
    VALUES (?, ?, ?);
  `;

  pool.query(query, [name, assignedTo, status], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Task added successfully');
    }
  });
});

app.put('/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { name, assignedTo, status } = req.body;

  const query = `
    UPDATE tasks
    SET name = ?, assignedTo = ?, status = ?
    WHERE id = ?;
  `;

  pool.query(query, [name, assignedTo, status, taskId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else if (results.affectedRows === 0) {
      res.status(404).send('Task not found');
    } else {
      res.send('Task updated successfully');
    }
  });
});

app.delete('/tasks/:taskId', (req, res) => {
  const taskId = req.params.taskId;

  const query = `
    DELETE FROM tasks
    WHERE id = ?;
  `;
  const values = [taskId];

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error: ' + error.message); // Add error message to the response
    } else {
      res.send(results);
    }
  });
});

app.get('/api/task', (req, res) => {
  pool.query('SELECT * FROM task', (error, results) => {
    if (error) {
      console.error('Error fetching tasks: ', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
      return;
    }
    res.status(200).json(results);
  });
});

app.put('/api/task/:id', (req, res) => {
  const taskId = req.params.id;
  const { assignedTo, projectName } = req.body;

  pool.query(
    'UPDATE task SET assignedTo = ?, projectName = ? WHERE id = ?',
    [assignedTo, projectName, taskId],
    (error, results) => {
      if (error) {
        console.error('Error updating task: ', error);
        res.status(500).json({ error: 'Failed to update task' });
        return;
      }
      res.status(200).json({ message: 'Task updated successfully' });
    }
  );
});


app.delete('/api/task/:id', (req, res) => {
  const taskId = req.params.id;

  pool.query('DELETE FROM task WHERE id = ?', taskId, (error, results) => {
    if (error) {
      console.error('Error deleting task: ', error);
      res.status(500).json({ error: 'Failed to delete task' });
      return;
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});





// app.get('/employeeno/:empno', (req, res) => {
//   const empno = req.params.empno;

//   const query = `SELECT * FROM emp WHERE empno = ${empno}`;

//   pool.query(query, (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Error retrieving employee data');
//     } else {
//       res.send(results);
//     }
//   });
// });

// app.get('/employeename/:ename', (req, res) => {
//   const ename = req.params.ename;

//   const query = `SELECT * FROM emp WHERE ename = '${ename}'`;

//   pool.query(query, (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Error retrieving employee data');
//     } else {
//       res.send(results);
//     }
//   });
// });


// app.get('/joinedbeforemonth/:month', (req, res) => {
//   const month = req.params.month;

//   const query = `SELECT * FROM emp WHERE MONTH(hiredate) < ${month}`;

//   pool.query(query, (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Error retrieving employee data');
//     } else {
//       res.send(results);
//     }
//   });
// });


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});



// app.get('/api/employees/:id', (req, res) => {
//   const userId = req.params.id;
//   pool.query(`SELECT e.Id, e.Name, e.Email, e.Mobileno, d.DeptName AS Department \
//               FROM employees e \
//               JOIN department d ON e.Id = d.Id \
//               WHERE e.Id = ${userId}`, 
//               (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     } else if (results.length === 0) {
//       res.status(404).send(`User with ID ${userId} not found`);
//     } else {
//       res.send(results);
//     }
//   });
// });

// app.post('/register', (req, res) => {
//   const { Name, Mobileno, Email, Password } = req.body;

//   // Perform validation and error handling as needed
//   if (!Name || !Mobileno || !Email || !Password) {
//     return res.status(400).send('All fields are required');
//   }

//   // Check if the email already exists in the database
//   const checkQuery = 'SELECT COUNT(*) AS count FROM clinic WHERE Email = ?';
//   pool.query(checkQuery, [Email], (error, results) => {
//     if (error) {
//       console.error(error);
//       return res.status(500).send('Internal Server Error');
//     }

//     const emailExists = results[0].count > 0;
//     if (emailExists) {
//       return res.status(409).send('Email already exists');
//     }

//     // Save the user data to the database
//     const insertQuery = 'INSERT INTO clinic (Name, Mobileno, Email, Password) VALUES (?, ?, ?, ?)';
//     const values = [Name, Mobileno, Email, Password];

//     pool.query(insertQuery, values, (error, results) => {
//       if (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//       } else {
//         res.send('Registration successful');
//       }
//     });
//   });
// });

// app.post('/check-email', (req, res) => {
//   const { email } = req.body;

//   // Perform a query to check if the email exists in the database
//   const checkQuery = 'SELECT * FROM clinic WHERE Email = ?';
//   pool.query(checkQuery, [email], (error, results) => {
//     if (error) {
//       console.error(error);
//       return res.status(500).send('Internal Server Error');
//     }

//     const emailExists = results.length > 0;
//     res.json({ exists: emailExists });
//   });
// });

// app.post('/appointments', (req, res) => {
//   const { date, time, patientName, doctorName } = req.body;

//   // Perform validation and error handling as needed
//   if (!date || !time || !patientName || !doctorName) {
//     return res.status(400).send('All fields are required');
//   }

//   // Save the appointment data to the database
//   const insertQuery = 'INSERT INTO appointments (date, time, patient_name, doctor_name) VALUES (?, ?, ?, ?)';
//   const values = [date, time, patientName, doctorName];

//   pool.query(insertQuery, values, (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     } else {
//       res.send('Appointment scheduled successfully');
//     }
//   });
// });




// app.put('/api/updateemployees', (req, res) => {
//   const { id } = req.params;
//   const { name, email, mobileno, deptname } = req.body;

//   if (!name) {
//     return res.status(400).send('Name is required');
//   }

//   pool.query(`SELECT * FROM employees WHERE id = ?`, [id], (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     } else if (results.length == 0) {
//       res.status(404).send(`Employee with id ${id} not found`);
//     } else {
//       pool.query(`UPDATE employees SET Name = ?, Email = ?, Mobileno = ? WHERE id = ?`, [name, email, mobileno, id], (error, results) => {
//         if (error) {
//           console.error(error);
//           res.status(500).send('Internal Server Error');
//         } else {
//           pool.query(`SELECT * FROM department WHERE DeptName = ?`, [deptname], (error, results) => {
//             if (error) {
//               console.error(error);
//               res.status(500).send('Internal Server Error');
//             } else if (results.length == 0) {
//               res.status(400).send(`Department ${deptname} does not exist`);
//             } else {
//               const deptId = results[0].Id;
//               pool.query(`UPDATE empdeptable SET DepId = ? WHERE EmpId = ?`, [deptId, id], (error, results) => {
//                 if (error) {
//                   console.error(error);
//                   res.status(500).send('Internal Server Error');
//                 } else {
//                   res.send(`Employee with id ${id} updated successfully`);
//                 }
//               });
//             }
//           });
//         }
//       });
//     }
//   });
// });






// app.post('/api/addemployees', (req, res) => {
//   const { name, email, mobileno, deptname } = req.body;
//   if (!name) {
//     return res.status(400).send('Name is required');
//   }
//   // Check if the employee email already exists in the database
//   pool.query(`SELECT * FROM employees WHERE email = ?`, [email], (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     } else if (results.length > 0) {
//       res.status(400).send(`Employee with email ${email} already exists`);
//     } else {
//       // If the email does not match an existing employee, insert the new employee into the database
//       pool.query(`INSERT INTO employees (Name, Email, Mobileno) VALUES (?, ?, ?)`, [name, email, mobileno], (error, results) => {
//         if (error) {
//           console.error(error);
//           res.status(500).send('Internal Server Error');
//         } else {
//           const Id = results.insertId;
//           pool.query(`INSERT INTO department (departname) VALUES (?) ON DUPLICATE KEY UPDATE departname = VALUES(deptname)`, [deptname], (error, results) => {
//             if (error) {
//               console.error(error);
//               res.status(500).send('Internal Server Error');
//             } else {
//               const deptId = results.insertId;
//               pool.query(`UPDATE employees SET deptId = ? WHERE Id = ?`, [deptId, Id], (error, results) => {
//                 if (error) {
//                   console.error(error);
//                   res.status(500).send('Internal Server Error');
//                 } else {
//                   res.send('Employee added successfully');
//                 }
//               });
//             }
//           });
//         }
//       });
//     }
//   });
// });






// app.delete('/api/deleteemployees/:id', (req, res) => {
//   const userId = req.params.id;
//   pool.query('DELETE FROM employees WHERE id = ?', [userId], (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     } else if (results.affectedRows === 0) {
//       res.status(404).send(`Employee with ID ${userId} not found`);
//     } else {
//       res.send(`Employee with ID ${userId} deleted successfully`);
//     }
//   });
// });


// const express = require('express');
// const https = require('https');
// const fs = require('fs');

// const app = express();
// const port = 9000;

// // Read the SSL certificate files
// const privateKeyPath = './SSL/OpenSSL-Win64/bin/privatekey.pem';
// const certificatePath = './SSL/OpenSSL-Win64/bin/certificate.crt';

// // Check if the private key file exists
// if (!fs.existsSync(privateKeyPath)) {
//   console.error('Private key file not found');
//   process.exit(1);
// }

// // Check if the certificate file exists
// if (!fs.existsSync(certificatePath)) {
//   console.error('Certificate file not found');
//   process.exit(1);
// }

// // Read the private key file
// const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

// // Read the certificate file
// const certificate = fs.readFileSync(certificatePath, 'utf8');

// // Create the credentials object
// const credentials = {
//   key: privateKey,
//   cert: certificate
// };

// // Define your routes
// app.get('/get', (req, res) => {
//   res.send('Hello, HTTPS!');
// });

// // Create an HTTPS server
// const server = https.createServer(credentials, app);

// // Start the server
// server.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const express = require('express');

// dotenv.config();

// const { SECRET_TOKEN,name } = process.env;
// const app = express();
// const port = 7000;

// app.use(express.json());

// function generateAccessToken(username, password) {
//   console.log("SECRET_TOKEN :" , SECRET_TOKEN)
//   return jwt.sign({ username, password }, SECRET_TOKEN, { expiresIn: '1800s' });
// }

// app.post('/api/createNewUser', (req, res) => {

//   console.log("name :", name)

//   const { username, password } = req.body;
//   console.log("1")
//   const token = generateAccessToken(username, password);
//   console.log("2")
//   res.json(token);
// });

// // Middleware function to authenticate the token
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, SECRET_TOKEN, (err, { username, password }) => {
//     console.log(err);

//     if (err) return res.sendStatus(403);

//     req.user = { username };
//     next();
//   });
// }

// app.get('/api/userOrders', authenticateToken, (req, res) => {
//   const user = req.user;
//   const orders = [
//     { id: 1, product: 'Product A' },
//     { id: 2, product: 'Product B' },
//     { id: 3, product: 'Product C' }
//   ];

//   res.json({ user, orders });
// });


// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const express = require('express');

// dotenv.config();

// const { SECRET_TOKEN, name } = process.env;
// const app = express();
// const port = 7000;

// app.use(express.json());

// function generateAccessToken(username, password) {
//   console.log("SECRET_TOKEN:", SECRET_TOKEN);
//   return jwt.sign({ username, password }, SECRET_TOKEN, { expiresIn: '1800s' });
// }

// app.post('/api/createNewUser', (req, res) => {
//   console.log("name:", name);
//   const { username, password } = req.body;
//   console.log("1");
//   // Perform user registration logic here
//   const user = {
//     username,
//     password
//   };
//   console.log("2");
//   res.json({ user, message: "User created successfully" });
// });



// app.post('/api/loginUser', (req, res) => {
//   console.log("name:", name);
//   const { username, password } = req.body;
//   console.log("1");
//   // Check if the provided username and password match the records in the database
//   if (username === 'Rake' && password === 'Rakesh514@') {
//     const token = generateAccessToken(username, password);
//     console.log("2", token);
//     res.json({ message: 'Login successful!', token });
//   } else {
//     console.log("3");
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// // Middleware function to authenticate the token
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, SECRET_TOKEN, (err, { username }) => {
//     console.log(err);

//     if (err) return res.sendStatus(403);

//     req.user = { username };
//     next();
//   });
// }

// app.get('/api/userOrders', authenticateToken, (req, res) => {
//   const user = req.user;
//   const orders = [
//     { id: 1, product: 'Product A' },
//     { id: 2, product: 'Product B' },
//     { id: 3, product: 'Product C' }
//   ];

//   res.json({ user, orders });
// });

// const idleTimeoutSeconds = 18; 

// // Set the idle timeout
// let timeoutId;

// function resetTimeout() {
//   clearTimeout(timeoutId);
//   timeoutId = setTimeout(() => {
//     console.log('Server idle for too long');
//     res.status(408).json({ message: 'Session expired due to inactivity' });
//   }, idleTimeoutSeconds * 1000);
// }


// // Middleware to reset the idle timeout on each request
// app.use((req, res, next) => {
//   resetTimeout();
//   next();
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
