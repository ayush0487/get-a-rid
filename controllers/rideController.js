import Ride from '../models/app.js';


export const postRide = async (req, res) => {
    try {
        const { source, destination, date, time, seats, price, vehicle } = req.body;
        
        // Get driver info from authenticated user (JWT token)
        const { username: driverName, email: driverEmail } = req.user;

        if (!source || !destination || !date || !time || !seats || !price || !vehicle) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

      
        const rideDate = new Date(date);
        const today = new Date();
     
        
        if (rideDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Ride date cannot be in the past'
            });
        }

        
        const seatsNumber = parseInt(seats);
        const priceNumber = parseFloat(price);

        if (seatsNumber < 1 || seatsNumber > 8) {
            return res.status(400).json({
                success: false,
                message: 'Seats must be between 1 and 8'
            });
        }

        if (priceNumber < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

      
        const newRide = new Ride({
            source: source.trim(),
            destination: destination.trim(),
            date: rideDate,
            time: time.trim(),
            seats: seatsNumber,
            price: priceNumber,
            vehicle: vehicle.trim(),
            driverName: driverName.trim(),
            driverEmail: driverEmail.trim(),
            availableSeats: seatsNumber,
            bookedSeats: 0,
            
        });

        // Save to database
        const savedRide = await newRide.save();

        res.status(201).json({
            success: true,
            message: 'Ride posted successfully',
            ride: savedRide
        });

    } catch (error) {
        console.error('Error posting ride:', error);
     
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to post ride',
            error: error.message
        });
    }
};

// Get all active rides
export const getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find({ 
            status: 'active',
            date: { $gte: new Date() }
        }).sort({ date: 1, time: 1 });
        
        res.status(200).json({
            success: true,
            rides: rides,
            count: rides.length
        });
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rides',
            error: error.message
        });
    }
};


export const searchRides = async (req, res) => {
    try {
       
        const { source, destination } = req.body;

        console.log('Search request data:', { source, destination }); 

        let query = { 
            status: 'active',
            date: { $gte: new Date() } 
        };
        
        // Add search filters if provided
        if (source && source.trim()) {
            query.source = new RegExp(source.trim(), 'i'); 
        }
        if (destination && destination.trim()) {
            query.destination = new RegExp(destination.trim(), 'i');
        }

        console.log('MongoDB query:', query); // Debug log

        const rides = await Ride.find(query).sort({ date: 1, time: 1 });
        
        console.log('Found rides:', rides.length); // Debug log
        
        res.status(200).json({
            success: true,
            rides: rides,
            count: rides.length,
            searchCriteria: { source, destination }
        });
    } catch (error) {
        console.error('Error searching rides:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search rides',
            error: error.message
        });
    }
};

export const bookRide = async (req, res) => {
    try {
        const { seatsToBook = 1 } = req.body;
        const { email: userEmail } = req.user; // Get user email from JWT token
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ride not found' 
            });
        }

        // Check if user is trying to book their own ride
        if (ride.driverEmail === userEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot book your own ride' 
            });
        }

        // Validate seats to book
        const seatsRequested = parseInt(seatsToBook);
        if (seatsRequested <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Number of seats must be at least 1'
            });
        }

        if (seatsRequested > ride.availableSeats) {
            return res.status(400).json({
                success: false,
                message: `Only ${ride.availableSeats} seat${ride.availableSeats !== 1 ? 's' : ''} available`
            });
        }

        if (ride.availableSeats >= seatsRequested) {
            ride.availableSeats -= seatsRequested;
            ride.bookedSeats += seatsRequested;

            await ride.save();

            res.status(200).json({ 
                success: true, 
                message: `Successfully booked ${seatsRequested} seat${seatsRequested > 1 ? 's' : ''}`, 
                ride,
                seatsBooked: seatsRequested
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Not enough available seats' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update a ride (only by the driver who posted it)
export const updateRide = async (req, res) => {
    try {
        const { email: userEmail } = req.user; // Get user email from JWT token
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check if the user is the driver of this ride
        if (ride.driverEmail !== userEmail) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own rides'
            });
        }

        // Don't allow updates if ride has bookings
        const bookedSeats = ride.bookedSeats || 0;
        if (bookedSeats > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update ride that already has bookings'
            });
        }

        const { source, destination, date, time, seats, price, vehicle } = req.body;

        // Validate date if provided
        if (date) {
            const rideDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (rideDate < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Ride date cannot be in the past'
                });
            }
            ride.date = rideDate;
        }

        // Update fields if provided
        if (source) ride.source = source.trim();
        if (destination) ride.destination = destination.trim();
        if (time) ride.time = time;
        if (seats) {
            const seatsNumber = parseInt(seats);
            if (seatsNumber < 1 || seatsNumber > 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Seats must be between 1 and 8'
                });
            }
            ride.seats = seatsNumber;
            ride.availableSeats = seatsNumber; // Reset available seats
        }
        if (price) {
            const priceNumber = parseFloat(price);
            if (priceNumber < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price cannot be negative'
                });
            }
            ride.price = priceNumber;
        }
        if (vehicle) ride.vehicle = vehicle.trim();

        await ride.save();

        res.status(200).json({
            success: true,
            message: 'Ride updated successfully',
            ride
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a ride (only by the driver who posted it)
export const deleteRide = async (req, res) => {
    try {
        const { email: userEmail } = req.user; // Get user email from JWT token
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Check if the user is the driver of this ride
        if (ride.driverEmail !== userEmail) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own rides'
            });
        }

        // Don't allow deletion if ride has bookings
        const bookedSeats = ride.bookedSeats || 0;
        if (bookedSeats > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete ride that already has bookings'
            });
        }

        await Ride.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Ride deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};