const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const { getAlllistNotes } = require('./controllers/notesController');
const { getAlllistUser } = require('./controllers/authController');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Vercel!' });
});
console.log('authRoutes loaded:', authRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api', authRoutes); 
app.get('/getAlllistNotes', getAlllistNotes);
app.get('/getAlllistUser', getAlllistUser);
app.use('/api/notes', notesRoutes);

const PORT = process.env.PORT || 6002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});