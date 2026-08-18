import express from "express";
import { getNoteById, getAllNotes, createNote, updateNote, deleteNote, deleteMultipleNotes } from "../controllers/notesControllers.js";

const router = express.Router();

router.get("/:id", getNoteById);
router.get("/", getAllNotes);
router.post("/", createNote);
router.post("/delete-multiple", deleteMultipleNotes);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;