import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        reminderDate: {
            type: Date,
            default: null,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;