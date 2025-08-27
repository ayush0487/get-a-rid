import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    rideId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ride', 
        required: true 
    },
    userId: { 
        type: String, 
        required: true 
    }, // User email for simplicity
    userName: { 
        type: String, 
        required: true 
    },
    seatsBooked: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    totalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    bookingDate: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['confirmed', 'cancelled'], 
        default: 'confirmed' 
    }
});

export default mongoose.model("Booking", bookingSchema);
