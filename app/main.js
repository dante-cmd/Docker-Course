import express from "express";
import mongoose from "mongoose";

const app = express();

// 1. Middleware to parse JSON bodies
app.use(express.json());

const port = 3000;

// 2. Define a Mongoose Schema (Data Model)
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 3. Connect to MongoDB
try {
    const mongoConnection = await mongoose.connect("mongodb://db/dbstats");
    console.log(`Connected to database: ${mongoConnection.connection.db.databaseName}`);
} catch (error) {
    console.error("Database connection failed:", error);
}

// 4. API Routes

// GET: Fetch all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// POST: Create a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: "Failed to create user" });
    }
});

// GET: Find a user by their specific ID (Parameter example)
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});