import express from 'express';
import mainrouter from './routes/index.js'
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Set debug environment for production
if (process.env.NODE_ENV === 'production') {
    process.env.DEBUG = '';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// API routes
app.use('/api', mainrouter)

// Database connection
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bla_bla_travel';
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

// Middleware to ensure database connection for API routes
app.use('/api', async (req, res, next) => {
    await connectDB();
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Serve HTML files for specific routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Catch all handler for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For development
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`App listening on port ${port}!`));
}

export default app;