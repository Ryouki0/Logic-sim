"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TestDb.db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// Register Route
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Check for username and password in the request body
    if (!username || !password) {
        return res.status(401).json({ error: 'No username or password' });
    }
    try {
        // Hash the password
        const hashedPassword = yield bcrypt.hash(password, 10); // 10 is the salt rounds, a good balance for security
        // Prepare and run the insert statement with the hashed password
        const stmt = db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`);
        stmt.run(username, hashedPassword, 'user', (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'User registered successfully' });
        });
        stmt.finalize();
    }
    catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
}));
// Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Compare hashed password
        const isMatch = yield bcrypt.compare(password, row.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        // Create JWT token with user id
        const token = jwt.sign({ user_id: row.id }, 'your_secret_key', { expiresIn: '7d' });
        // Set the JWT in the cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        res.status(200).json({ message: 'Login successful' });
    }));
});
router.get('/logout', (req, res) => {
    res.clearCookie('user', { path: '/', sameSite: 'none', secure: false, domain: '' });
    res.status(200).json({ message: 'Logout successful' });
});
exports.default = router;
