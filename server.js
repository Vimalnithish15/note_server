const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

// Updated CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    credentials: true
}));

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// API routes with proper error handling
app.use('/api/auth', (req, res, next) => {
    console.log('Auth route hit:', req.path);
    authRoutes(req, res, next);
});

app.use('/api/notes', (req, res, next) => {
    console.log('Notes route hit:', req.path);
    notesRoutes(req, res, next);
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