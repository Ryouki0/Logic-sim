
import express from 'express';
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TestDb.db');

// Register Route
router.post('/register', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(401).json({ error: 'No username or password' });
	}

	const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);

	stmt.run(username, password, 'user', (err: any) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.status(200).json({ message: 'User registered successfully' });
	});

	stmt.finalize();
});

// Login Route
router.post('/login', (req, res) => {
	const { username, password } = req.body;

	db.get(`SELECT * FROM users WHERE username = ?`, [username], (err:any, row:any) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!row) {
			return res.status(404).json({ error: 'User not found' });
		}

		if (password !== row.password) {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		// Set cookie on server-side only
		res.cookie('user', username, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: '/', 
			secure: true, 
			sameSite: 'none', 
			domain: ''});
		res.status(200).json({ message: 'Login successful' });
	});
});

router.get('/logout', (req, res) => {
	res.clearCookie('user', {path: '/', sameSite: 'none', secure: true, domain: ''});
	res.status(200).json({ message: 'Logout successful' });
});



export default router;