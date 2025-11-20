import dotenv from "dotenv";
dotenv.config();
import mailRoutes from "./routes/mailRoutes.js"
import express from "express";
import cors from "cors";

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api", mailRoutes);

const PORT = process.env.PORT || 8000;
console.log("startup EMAIL_USER:", process.env.EMAIL_USER ? "FOUND" : "MISSING");
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
