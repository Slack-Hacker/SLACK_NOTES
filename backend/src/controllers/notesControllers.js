import Note from "../models/Note.js";

export async function getNoteById(req, res) {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        res.status(200).json({ success: true, note });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid Note ID format" });
        }
        console.error("Error in getNoteById controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, notes });
    } catch (error) {
        console.error("Error in getAllNotes controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content, imageUrl, reminderDate, isPinned } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }
        const newNote = new Note({ 
            title: title.trim(), 
            content: content.trim(), 
            imageUrl: imageUrl || "", 
            reminderDate: reminderDate || null,
            isPinned: Boolean(isPinned)
        });
        await newNote.save();
        res.status(201).json({ success: true, message: "Note created successfully", note: newNote });
    } catch (error) {
        console.error("Error in createNote controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function updateNote(req, res) {
    try {
        const { title, content, imageUrl, reminderDate, isPinned } = req.body;
        const updateFields = {};
        if (title !== undefined) updateFields.title = title.trim();
        if (content !== undefined) updateFields.content = content.trim();
        if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
        if (reminderDate !== undefined) updateFields.reminderDate = reminderDate;
        if (isPinned !== undefined) updateFields.isPinned = isPinned;

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        res.status(200).json({ success: true, message: "Note updated successfully", note: updatedNote });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid Note ID format" });
        }
        console.error("Error in updateNote controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function deleteNote(req, res) {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }
        res.status(200).json({ success: true, message: "Note deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Invalid Note ID format" });
        }
        console.error("Error in deleteNote controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function deleteMultipleNotes(req, res) {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "No note IDs provided" });
        }
        const result = await Note.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ 
            success: true, 
            message: `${result.deletedCount} notes deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error in deleteMultipleNotes controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
