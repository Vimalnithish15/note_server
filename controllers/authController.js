const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res) => {
    try {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
            name: req.body.name
        });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user' });
    }
};

exports.getAlllistUser = async (req, res) => {
    try {
        const Userslist = await User.find();
        res.json(Userslist);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Looking for user:', req.body.username);
        const user = await User.findOne({ username: req.body.username });
        console.log('User found:', user);
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
        console.log('Error in login:', err);
        res.status(500).json({ error: 'Error logging in', details: err.message });
    }
};