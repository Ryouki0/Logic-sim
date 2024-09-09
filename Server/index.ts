import express from 'express';
import cors from 'cors';
import {BinaryIOBase, entities} from '@Shared/interfaces';
import path from 'path';
import authRoutes from './routes/auth';
const cookieParser = require('cookie-parser');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TestDb.db');
const fs = require('fs');
const app = express();
const port = 3002;
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

	db.run(`INSERT INTO users (username, password, role) VALUES (?,?,?)`, ['Superuser', 'Testpassword123', 'admin'], (err: any) => {
		if(err){
			console.error(err.message);
		}else{
			console.log(`created admin account`);
		}
	});

	db.run(`CREATE TABLE IF NOT EXISTS cpu (
		id INTEGER PRIMARY KEY,
		wires TEXT NOT NULL,
		gates TEXT NOT NULL,
		bluePrints TEXT NOT NULL,
		binaryIO TEXT NOT NULL,
		currentComponent TEXT NOT NULL)`
	, (err: any) => {
		if(err){
			console.error(err.message);
		}
	});
})
app.use(cors({credentials: true, origin: 'https://logicsim-kmybep9pq-ryouki0s-projects.vercel.app'}));
app.use(express.json({limit: '10mb'}));



function checkRole(requiredRole: string){
	return (req:any, res:any, next:any) => {
		if(!req.cookies.user){
			return res.status(401).json({error: 'Unauthorized access'});
		}

		const username = req.cookies.user;

		db.get(`SELECT role FROM users WHERE username = ?`, [username], (err:any, row:any) => {
			if(err){
				return res.status(500).json({error: 'Server error'});
			}

			if(!row){
				return res.status(404).json({error: 'User not found'});
			}

			if(row.role !== requiredRole){
				return res.status(403).json({error: 'Forbidden access'});
			}

			next();
		})
	}
}

app.post('/api/adminAccess', checkRole('admin'), (req, res) => {
	
})

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
    const { wires, gates, bluePrints, binaryIO, currentComponent } = req.body;
    const id = 1;

    const wiresStr = JSON.stringify(wires);
    const gatesStr = JSON.stringify(gates);
    const bluePrintsStr = JSON.stringify(bluePrints);
    const binaryIOStr = JSON.stringify(binaryIO);
    const currentComponentStr = JSON.stringify(currentComponent);

	const updateOrInsertSQL = `
    INSERT INTO cpu (wires, gates, bluePrints, binaryIO, currentComponent, id)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        wires = excluded.wires,
        gates = excluded.gates,
        bluePrints = excluded.bluePrints,
        binaryIO = excluded.binaryIO,
        currentComponent = excluded.currentComponent;
    `;

    db.run(
        updateOrInsertSQL,
        [wiresStr, gatesStr, bluePrintsStr, binaryIOStr, currentComponentStr, id],
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

app.post(`/api/testPost`, (req, res) => {
	const binaryIO:BinaryIOBase = req.body;

	const stmt = db.prepare(`INSERT OR REPLACE INTO binary_io 
		(
			id,
			state,
			gateId,
			name,
			type,
			isGlobalIo,
			parent,
			position,
			"to",
			"from"
		) VALUES (?,?,?,?,?,?,?,?,?,?)`
	);
	stmt.run(
		binaryIO.id,
		binaryIO.state,
		binaryIO.gateId || null,
		binaryIO.name,
		binaryIO.type,
		binaryIO.isGlobalIo,
		binaryIO.parent,
		binaryIO.position || null,
		binaryIO.to,
		binaryIO.from || null
	);
	res.status(200).json('Succesfully inserted binaryIO');
})

app.get('/api/testGet',(req,res) => {
	console.log('called');
	const id = req.query.id;
	if(!id){
		res.status(401).json({error: 'ID required!'});
	}
	db.get('SELECT * FROM binary_io WHERE ID = ?', [id], (err:any, row:any) => {
		if(err){
			console.error(`${err.message}`);
			res.status(500).json({error: 'Db error'});
			return;
		}
		if(!row){
			console.error(`there is no row`);
			res.json({error: 'no row'});
			return;
		}
		res.status(200).json(row);
	})
})

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