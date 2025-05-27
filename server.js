const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    });

// Define Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    credentials: true
}));

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Auth Routes (without /api/auth prefix)
app.post('/register', async (req, res) => {
    try {
        await User.create({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name
        });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ 
            token,
            user: { 
                id: user._id, 
                username: user.username, 
                name: user.name 
            } 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Notes Routes (keeping /api/notes prefix)
app.post('/api/notes', authMiddleware, async (req, res) => {
    try {
        const note = await Note.create({
            title: req.body.title,
            content: req.body.content,
            user_id: req.user.id
        });
        res.status(201).json({ message: 'Note created successfully', note });
    } catch (err) {
        res.status(500).json({ error: 'Error creating note' });
    }
});

app.get('/api/notes', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ 
            user_id: req.user.id,
            isDeleted: false 
        });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

app.get('/api/notes/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user_id: req.user.id,
            isDeleted: false
        });
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json(note);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching note' });
    }
});

app.put('/api/notes/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { title: req.body.title, content: req.body.content },
            { new: true }
        );
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json({ message: 'Note updated successfully', note });
    } catch (err) {
        res.status(500).json({ error: 'Error updating note' });
    }
});

app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { isDeleted: true },
            { new: true }
        );
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting note' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.url} not found` });
});

const PORT = process.env.PORT || 6002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;