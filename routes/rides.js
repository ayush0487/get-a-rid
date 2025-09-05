import express from 'express';
import { postRide, getAllRides, searchRides, bookRide, updateRide, deleteRide, getUserBookings, cancelBooking } from '../controllers/rideController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();


router.use(verifyToken);


router.post('/', postRide);


router.get('/', getAllRides);

// Get user's bookings
router.get('/my-bookings', getUserBookings);

router.post('/search', searchRides);


router.post('/book/:id', bookRide);


router.put('/:id', updateRide);

// Cancel a booking
router.put('/cancel-booking/:id', cancelBooking);


router.delete('/:id', deleteRide);

export default router;