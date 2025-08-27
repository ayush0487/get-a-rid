import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    source: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    seats: { type: Number, required: true, min: 1, max: 8 },
    price: { type: Number, required: true, min: 0 },
    vehicle: { type: String, required: true },
    driverName: { type: String, required: true },
    driverEmail: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    bookedSeats: { type: Number, default: 0 },
    availableSeats: { 
        type: Number, 
        default: 0
    }
});





export default mongoose.model("Ride", rideSchema);
