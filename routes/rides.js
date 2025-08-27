import express from 'express';
import { postRide, getAllRides, searchRides, bookRide, updateRide, deleteRide } from '../controllers/rideController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();


router.use(verifyToken);


router.post('/', postRide);


router.get('/', getAllRides);

router.post('/search', searchRides);


router.post('/book/:id', bookRide);


router.put('/:id', updateRide);


router.delete('/:id', deleteRide);

export default router;