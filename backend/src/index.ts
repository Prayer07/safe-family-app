import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db.js";
import authRoutes from "./routes/authRoute.js"
import familyRoutes from "./routes/familyRoute.js"
import sosRoutes from "./routes/sosRoute.js"
import locationRoutes from "./routes/location.js";
import historyRoutes from "./routes/history.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json())

await connectDB();

const HOST = "0.0.0.0"

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on ${HOST}:${PORT}`));

app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/history", historyRoutes);