const Note = require('../models/note');

exports.createNote = async (req, res) => {
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
};

exports.getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ 
            user_id: req.user.id,
            isDeleted: false 
        });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
};

exports.getNoteById = async (req, res) => {
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
};

exports.updateNote = async (req, res) => {
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
};

exports.deleteNote = async (req, res) => {
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
};