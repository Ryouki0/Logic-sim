import express from 'express';
import cors from 'cors';
import {BinaryIOBase, entities} from '@Shared/interfaces';
import path from 'path';
import authRoutes from './routes/auth';
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TestDb.db');
const fs = require('fs');
const app = express();
const port = 3002;
require('dotenv').config();

app.use(cookieParser());
db.serialize(() => {
	db.run('CREATE TABLE IF NOT EXISTS ayaya_data (x INTEGER)');
	
	db.run(`CREATE TABLE IF NOT EXISTS binary_io 
		(
			id TEXT PRIMARY KEY, 
			state INTEGER NOT NULL,
			gateId TEXT,
			name TEXT NOT NULL,
			isGlobalIo BOOLEAN NOT NULL,
			parent TEXT NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('input', 'output')),
			position TEXT,
			"to" TEXT,
			"from" TEXT
		)`
	);

	db.run(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT,
		role TEXT)`, (err:any) => {
			if(err){
				console.error(`error creating users table: ${err.message}`);
			}else{
				console.log(`Users table created or exists`);
			}
		}
	);
	
	

	db.run(`CREATE TABLE IF NOT EXISTS cpu (
		id INTEGER PRIMARY KEY,
		wires TEXT NOT NULL,
		gates TEXT NOT NULL,
		bluePrints TEXT NOT NULL,
		binaryIO TEXT NOT NULL,
		currentComponent TEXT NOT NULL,
		misc TEXT NOT NULL)`
	, (err: any) => {
		if(err){
			console.error(err.message);
		}
	});

	db.run(`CREATE TABLE IF NOT EXISTS projects (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		wires TEXT NOT NULL,
		gates TEXT NOT NULL,
		bluePrints TEXT NOT NULL,
		binaryIO TEXT NOT NULL,
		currentComponent TEXT NOT NULL,
		name TEXT NOT NULL,
		userId INTEGER NOT NULL,
		FOREIGN KEY (userId) REFERENCES users(id))`, (err:any) => {
		if(err){
			console.error(err.message);
		}
	});
})

const allowedOrigins = ['http://localhost:3000', 'https://logicsim-89yacgy6l-ryouki0s-projects.vercel.app/'];
app.use(cors({
    credentials: true,
	origin: function (origin, callback) {
	  if(!origin || allowedOrigins?.includes(origin)) {
		callback(null, true);
	  }else {
		callback(new Error('Not allowed by CORS'));
	  }
	}
}));
app.use(express.json({ limit: '60mb' }));


  const createOrUpdateSuperuser = async () => {
    const username = 'Superuser';
    const rawPassword = 'Testpassword123';
    const role = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(rawPassword, 10); // Hash password with a salt round of 10

        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err: any, row:any) => {
            if (err) {
                console.error('Error fetching user:', err.message);
                return;
            }

            if (row) {
                // Update the existing user's password
                db.run(`UPDATE users SET password = ? WHERE username = ?`, [hashedPassword, username], (err:any) => {
                    if (err) {
                        console.error('Error updating password:', err.message);
                    } else {
                        console.log('Updated Superuser password with hashed password');
                    }
                });
            } else {
                // Create a new user if none exists
                db.run(`INSERT INTO users (username, password, role) VALUES (?,?,?)`, [username, hashedPassword, role], (err:any) => {
                    if (err) {
                        console.error('Error creating user:', err.message);
                    } else {
                        console.log('Created Superuser account with hashed password');
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
    }
};

createOrUpdateSuperuser();
const jwt = require('jsonwebtoken');
function checkRole(requiredRole:any) {
    return (req:any, res:any, next:any) => {
        // Check for token in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        // Verify the token
        jwt.verify(token, 'your_secret_key', (err:any, decoded:any) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Check the role in the database
            db.get(`SELECT role FROM users WHERE id = ?`, [decoded.user_id], (err:any, row:any) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                if (!row) {
                    return res.status(404).json({ error: 'User not found' });
                }

                if (row.role !== requiredRole) {
                    return res.status(403).json({ error: 'Forbidden access' });
                }

                // Proceed if the role matches
                next();
            });
        });
    };
}


app.get('/api/cpu', (req, res) => {
	db.get(`SELECT * FROM cpu WHERE id = ?`, [1], (err:any, row:any) => {
		if(err){
			return res.status(500).json({error: 'Server error'});
		}

		if(!row){
			return res.status(404).json({error: 'Not found'});
		}
		return res.json(row);
	})
})

app.put('/api/cpu', checkRole('admin'), (req, res) => {
    const { wires, gates, bluePrints, binaryIO, currentComponent, misc } = req.body;
    const id = 1;

    const wiresStr = JSON.stringify(wires);
    const gatesStr = JSON.stringify(gates);
    const bluePrintsStr = JSON.stringify(bluePrints);
    const binaryIOStr = JSON.stringify(binaryIO);
    const currentComponentStr = JSON.stringify(currentComponent);
	const miscStr = JSON.stringify(misc);

	const updateOrInsertSQL = `
    INSERT INTO cpu (wires, gates, bluePrints, binaryIO, currentComponent, id, misc)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        wires = excluded.wires,
        gates = excluded.gates,
        bluePrints = excluded.bluePrints,
        binaryIO = excluded.binaryIO,
        currentComponent = excluded.currentComponent,
		misc = excluded.misc;
    `;

    db.run(
        updateOrInsertSQL,
        [wiresStr, gatesStr, bluePrintsStr, binaryIOStr, currentComponentStr, id, miscStr],
        function (err:any) {
            if (err) {
                console.error(`SQL Error: ${err.message}`);
                return res.status(500).send({ error: 'Failed to update data' });
            }
			//@ts-ignore
            if (this.changes === 0) {
                console.log('No rows updated.');
                return res.status(404).send({ error: 'No record found with that ID' });
            }

            res.status(200).send({ message: 'Data updated successfully' });
        }
    );
});
  

app.use('/api', authRoutes)


function checkAuth(req:any, res:any, next:any) {
    const user = req.cookies.user;
    if (user) {
      next();
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  }
  
app.get('/api/checkAuth', checkAuth, (req:any, res:any) => {
    res.json({ message: 'User is authenticated', user: req.cookies.user });
});

app.post('/api/saveData', (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, 'data.json');

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err:any) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to save data' });
    }
    res.status(200).json({ message: 'Data saved successfully' });
  });
});

// const commonEntitiesFile = path.resolve(__dirname, '../Client/fixtures/commonEntities.json');
// let commonEntities:entities = JSON.parse(fs.readFileSync(commonEntitiesFile, 'utf8'));

// const doubleDelay = path.resolve(__dirname, '../Client/fixtures/doubleDelayEdgeCase.json');
// let doubleDelayEdgeCase:entities = JSON.parse(fs.readFileSync(doubleDelay, 'utf8'));

// app.get('/api/commonEntities', (req, res) => {
// 	res.json(doubleDelayEdgeCase);
// })

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});