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
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 30000, // 30 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionRetryDelayMS: 5000, // Keep trying to send operations for 5 seconds
            heartbeatFrequencyMS: 10000, // 10 seconds
            bufferMaxEntries: 0, // Disable mongoose buffering
            bufferCommands: false, // Disable mongoose buffering
        });
        isConnected = true;
        console.log('Connected to MongoDB successfully');
        
        // Connection event listeners
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
            isConnected = false;
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            isConnected = true;
        });
        
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        console.error('Connection string used:', mongoUri.replace(/:[^:@]*@/, ':***@')); // Hide password in logs
        isConnected = false;
        throw error;
    }
}

// Middleware to ensure database connection for API routes
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        if (!isConnected || mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database connection unavailable. Please try again later.'
            });
        }
        next();
    } catch (error) {
        console.error('Database connection middleware error:', error);
        return res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again later.'
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        res.json({ 
            status: 'OK', 
            message: 'Server is running',
            database: dbStates[dbStatus],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message
        });
    }
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