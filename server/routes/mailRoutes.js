import express from "express";
import { sendContact } from "../controllers/mailController.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ service: "Digvijay Express Mail API" }));
router.post("/send", sendContact);

export default router;