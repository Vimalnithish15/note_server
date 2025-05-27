const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', (req, res) => {
  console.log('Register route hit:', req.body);
  register(req, res);
});

router.post('/login', (req, res) => {
  console.log('Login route hit:', req.body);
  login(req, res);
});

module.exports = router;