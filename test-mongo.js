#!/usr/bin/env node
import mongoose from 'mongoose';

console.log('=== MongoDB Connection Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.log('Please set MONGODB_URI in your Render environment variables.');
    process.exit(1);
}

// Mask password for logging
const maskedUri = mongoUri.replace(/:[^:@]*@/, ':***@');
console.log('Connection string:', maskedUri);

async function testConnection() {
    try {
        console.log('🔄 Attempting to connect to MongoDB...');
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds for quick test
            bufferCommands: false,
            bufferMaxEntries: 0
        });
        
        console.log('✅ Successfully connected to MongoDB!');
        console.log('Database name:', mongoose.connection.db.databaseName);
        console.log('Connection ready state:', mongoose.connection.readyState);
        
        await mongoose.disconnect();
        console.log('✅ Connection test completed successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error('Error:', error.message);
        
        if (error.message.includes('Authentication failed')) {
            console.log('\n💡 Possible fixes:');
            console.log('1. Check your MongoDB Atlas username and password');
            console.log('2. Make sure the user has read/write permissions');
            console.log('3. Check if the database name is correct');
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('\n💡 Possible fixes:');
            console.log('1. Check your cluster URL in the connection string');
            console.log('2. Make sure your MongoDB cluster is running');
            console.log('3. Check MongoDB Atlas network access settings');
        }
        
        process.exit(1);
    }
}

testConnection();
