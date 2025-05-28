const express = require('express');
const { createNote, getAllNotes, getNoteById, updateNote, deleteNote,getAlllistNotes } = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createNote);
router.get('/', getAllNotes);
// router.get('/', getAlllistNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;