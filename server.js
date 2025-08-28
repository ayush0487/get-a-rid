import express from 'express';
import mainrouter from './routes/index.js'
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
    
    const mongoUri = 'mongodb+srv://ayush0487negi0487:tlKe36k2v3p8oDWd@cluster0.xcfg2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    
    // Debug logging (with password masked)
    const maskedUri = mongoUri.replace(/:[^:@]*@/, ':***@');
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', maskedUri);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    try {
        // Set mongoose options to prevent buffering
        mongoose.set('bufferCommands', false);
        
        // Simple, modern connection with only supported options
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
        });
        isConnected = true;
        console.log('✅ Connected to MongoDB successfully');
        
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

// Startup function
async function startServer() {
    try {
        // Connect to database first
        console.log('Starting server...');
        await connectDB();
        
        // Start the server only in development
        if (process.env.NODE_ENV !== 'production') {
            app.listen(port, () => {
                console.log(`App listening on port ${port}!`);
                console.log(`Health check: http://localhost:${port}/api/health`);
            });
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
if (process.env.NODE_ENV !== 'production') {
    startServer();
} else {
    // In production, ensure DB connection is established
    connectDB().catch(console.error);
}

export default app;