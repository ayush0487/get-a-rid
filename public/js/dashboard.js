
document.addEventListener('DOMContentLoaded', async function() {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (user) {
                document.getElementById('userName').textContent = user.username;
                document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
            }

        const postRideBtn = document.getElementById('postRideBtn');
        const findRidesBtn = document.getElementById('findRidesBtn');
        const myBookingsBtn = document.getElementById('myBookingsBtn');
        const notificationsBtn = document.getElementById('notificationsBtn');
        const postingsForm = document.getElementById('postings');
        const findSection = document.getElementById('find');
        const myBookingsSection = document.getElementById('myBookings');
        const notificationsSection = document.getElementById('notifications');
        const defaultContent = document.getElementById('defaultContent');
        const pageTitle = document.getElementsByClassName('page-title');
        const postRideForm = document.getElementById('postRideForm');
        const findRidesForm = document.getElementById('findRidesForm');
        const showRides = document.getElementById('show_rides');
        const bookingsList = document.getElementById('bookings-list');
        const logoutBtn = document.getElementById('logoutBtn');

        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                authManager.clearAuth();
                window.location.href = '/login.html';
            });
        }

     
        function hideAllSections() {
            defaultContent.style.display = 'none';
            postingsForm.classList.remove('show');
            findSection.classList.remove('show');
            myBookingsSection.classList.remove('show');
            notificationsSection.classList.remove('show');
        }

      
        postRideBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            hideAllSections();
            pageTitle[0].innerHTML = 'Post a Ride';
            postingsForm.classList.add('show');
        });

        
        findRidesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllSections();
            pageTitle[0].innerHTML = 'Find Rides';
            findSection.classList.add('show');
        });

        // My Bookings section
        myBookingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllSections();
            pageTitle[0].innerHTML = 'My Bookings';
            myBookingsSection.classList.add('show');
            loadUserBookings();
        });

      
        notificationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllSections();
            pageTitle[0].innerHTML = 'Notifications';
            notificationsSection.classList.add('show');
        });

        // Handle ride posting form submission
        if (postRideForm) {
            postRideForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Get user data from localStorage
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user || !user.username || !user.email) {
                    alert('Please login to post a ride.');
                    window.location.href = '/login.html';
                    return;
                }
                
                const formData = new FormData(postRideForm);
                const rideData = {
                    driverName: user.username, // Get from localStorage
                    driverEmail: user.email,   // Get from localStorage
                    source: formData.get('source'),
                    destination: formData.get('destination'),
                    date: formData.get('date'),
                    time: formData.get('time'),
                    seats: formData.get('seats'),
                    price: formData.get('price'),
                    vehicle: formData.get('vehicle')
                };

                try {
                    const token = localStorage.getItem('authToken');
                    
                    const response = await fetch('/api/rides', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify(rideData)
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert('Ride posted successfully!');
                        postRideForm.reset();
                        
                        // Show success message
                        hideAllSections();
                        pageTitle[0].innerHTML = 'Ride Posted Successfully';
                        defaultContent.innerHTML = '<p class="placeholder-text">Your ride has been posted successfully! Other users can now find and book your ride.</p>';
                        defaultContent.style.display = 'block';
                    } else {
                        if (response.status === 401) {
                            alert('Session expired. Please login again.');
                            window.location.href = '/login.html';
                            return;
                        }
                        alert('Error posting ride: ' + result.message);
                    }
                } catch (error) {
                    console.error('Network/API Error:', error);
                    alert('Failed to post ride. Please check your internet connection and try again.');
                }
            });
        }

        // Handle ride search form submission
        if (findRidesForm) {
            findRidesForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(findRidesForm);
                const source = formData.get('source').trim();
                const destination = formData.get('destination').trim();
                if (!source && !destination) {
                    alert('Please enter at least a source or destination city.');
                    return;
                }
                const searchData = {
                    source: source ? source.trim() : '',
                    destination: destination ? destination.trim() : ''
                };

                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch('/api/rides/search', {
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify(searchData) 
                    });
                    
                    const result = await response.json();

                    if (result.success) {
                        displayRides(result.rides);
                    } else {
                        if (response.status === 401) {
                            alert('Session expired. Please login again.');
                            window.location.href = '/login.html';
                            return;
                        }
                        showRides.innerHTML = '<p class="placeholder-text">Error fetching rides: ' + result.message + '</p>';
                    }
                } catch (error) {
                    console.error('Search API Error:', error);
                    showRides.innerHTML = '<p class="placeholder-text">Failed to search rides. Please check your internet connection and try again.</p>';
                }
            });
        }

        // Function to display rides
        function displayRides(rides) {
            if (!rides || rides.length === 0) {
                showRides.innerHTML = '<p class="placeholder-text">No rides found matching your criteria.</p>';
                return;
            }

            // Get current user email
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const currentUserEmail = user ? user.email : null;

            let ridesHTML = '<div class="rides-list">';
            rides.forEach(ride => {
                const rideDate = new Date(ride.date).toLocaleDateString();
                // Fix: Properly handle 0 available seats
                const availableSeats = ride.availableSeats !== undefined ? ride.availableSeats : ride.seats;
                const totalSeats = ride.seats;
                
                // Check if this is user's own ride
                const isOwnRide = currentUserEmail && ride.driverEmail === currentUserEmail;
                
                ridesHTML += `
                    <div class="ride-card ${isOwnRide ? 'own-ride' : ''}">
                        <div class="ride-header">
                            <h3>${ride.source} → ${ride.destination}</h3>
                            <span class="ride-price">₹${ride.price}/seat</span>
                        </div>
                        <div class="ride-details">
                            <p><strong>Date:</strong> ${rideDate}</p>
                            <p><strong>Time:</strong> ${ride.time}</p>
                            <p><strong>Available Seats:</strong> ${availableSeats}/${totalSeats}</p>
                            <p><strong>Vehicle:</strong> ${ride.vehicle}</p>
                            ${ride.driverName ? `<p><strong>Driver:</strong> ${ride.driverName}</p>` : ''}
                            ${isOwnRide ? `<p class="own-ride-label"><strong>Your Ride</strong></p>` : ''}
                        </div>
                        ${isOwnRide ? 
                            `<div class="own-ride-actions">
                                ${ride.bookedSeats > 0 ? 
                                    `<p class="booking-info">⚠️ ${ride.bookedSeats} seat${ride.bookedSeats > 1 ? 's' : ''} already booked - Cannot edit/delete</p>
                                     <button class="btn btn-secondary own-ride-btn" disabled>Your Ride</button>` :
                                    `<div class="edit-delete-buttons">
                                        <button class="btn btn-edit edit-ride-btn" data-ride-id="${ride._id}">Edit</button>
                                        <button class="btn btn-delete delete-ride-btn" data-ride-id="${ride._id}">Delete</button>
                                    </div>`
                                }
                            </div>` :
                            availableSeats <= 0 ? 
                            `<button class="btn btn-secondary book-ride-btn" disabled>Fully Booked</button>` :
                            `<div class="booking-section">
                                <div class="seat-selection">
                                    <label for="seats-${ride._id}">Select Seats:</label>
                                    <select id="seats-${ride._id}" class="seat-dropdown" data-max-seats="${availableSeats}">
                                        ${Array.from({length: availableSeats}, (_, i) => i + 1).map(num => 
                                            `<option value="${num}">${num} seat${num > 1 ? 's' : ''}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <button class="btn btn-secondary book-ride-btn" data-ride-id="${ride._id}">
                                    Book Ride
                                </button>
                            </div>`
                        }
                    </div>
                `;
            });
            ridesHTML += '</div>';

            showRides.innerHTML = ridesHTML;

            // Add event listeners for book ride buttons
            const bookRideButtons = document.querySelectorAll('.book-ride-btn:not([disabled])');
            bookRideButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const rideId = this.dataset.rideId;
                    // Get selected number of seats
                    const seatDropdown = document.getElementById(`seats-${rideId}`);
                    const selectedSeats = seatDropdown ? parseInt(seatDropdown.value) : 1;
                    bookRide(rideId, selectedSeats);
                });
            });

            // Add event listeners for edit ride buttons
            const editRideButtons = document.querySelectorAll('.edit-ride-btn');
            editRideButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const rideId = this.dataset.rideId;
                    editRide(rideId);
                });
            });

            // Add event listeners for delete ride buttons
            const deleteRideButtons = document.querySelectorAll('.delete-ride-btn');
            deleteRideButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const rideId = this.dataset.rideId;
                    deleteRide(rideId);
                });
            });
        }

     
        

        // Function to handle booking a ride
        async function bookRide(rideId, seatsToBook = 1) {
            try {
                // Get user data to send email
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user || !user.email) {
                    alert('Please login to book a ride.');
                    window.location.href = '/login.html';
                    return;
                }

                // Validate seats to book
                if (seatsToBook <= 0) {
                    alert('Please select at least 1 seat.');
                    return;
                }

                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/rides/book/${rideId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        seatsToBook: seatsToBook
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert(`Successfully booked ${seatsToBook} seat${seatsToBook > 1 ? 's' : ''}!`);
                    // Refresh the ride list to show updated seat count
                    await refreshRideList();
                } else {
                    if (response.status === 401) {
                        alert('Session expired. Please login again.');
                        window.location.href = '/login.html';
                        return;
                    }
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Booking API Error:', error);
                alert('Failed to book ride. Please check your internet connection and try again.');
            }
        }

        // Function to handle editing a ride
        async function editRide(rideId) {
            try {
                // Get user data
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user || !user.email) {
                    alert('Please login to edit a ride.');
                    window.location.href = '/login.html';
                    return;
                }

                // Get ride data first
                const response = await fetch(`/api/rides`);
                const result = await response.json();
                
                if (!result.success) {
                    alert('Failed to fetch ride details');
                    return;
                }

                const ride = result.rides.find(r => r._id === rideId);
                if (!ride) {
                    alert('Ride not found');
                    return;
                }

                // Create edit form
                const newSource = prompt('Enter new source city:', ride.source) || ride.source;
                const newDestination = prompt('Enter new destination city:', ride.destination) || ride.destination;
                const newDate = prompt('Enter new date (YYYY-MM-DD):', ride.date.split('T')[0]) || ride.date.split('T')[0];
                const newTime = prompt('Enter new time (HH:MM):', ride.time) || ride.time;
                const newSeats = prompt('Enter new number of seats:', ride.seats) || ride.seats;
                const newPrice = prompt('Enter new price per seat:', ride.price) || ride.price;
                const newVehicle = prompt('Enter new vehicle type:', ride.vehicle) || ride.vehicle;

                const updateData = {
                    source: newSource.trim(),
                    destination: newDestination.trim(),
                    date: newDate,
                    time: newTime,
                    seats: parseInt(newSeats),
                    price: parseFloat(newPrice),
                    vehicle: newVehicle.trim()
                };

                const token = localStorage.getItem('authToken');
                const updateResponse = await fetch(`/api/rides/${rideId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(updateData)
                });

                const updateResult = await updateResponse.json();

                if (updateResult.success) {
                    alert('Ride updated successfully!');
                    // Refresh the ride list
                    if (findRidesForm) {
                        findRidesForm.dispatchEvent(new Event('submit'));
                    }
                } else {
                    if (updateResponse.status === 401) {
                        alert('Session expired. Please login again.');
                        window.location.href = '/login.html';
                        return;
                    }
                    alert('Error: ' + updateResult.message);
                }
            } catch (error) {
                console.error('Edit API Error:', error);
                alert('Failed to update ride. Please check your internet connection and try again.');
            }
        }

        // Function to handle deleting a ride
        async function deleteRide(rideId) {
            try {
                // Get user data
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user || !user.email) {
                    alert('Please login to delete a ride.');
                    window.location.href = '/login.html';
                    return;
                }

                // Confirm deletion
                if (!confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
                    return;
                }

                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/rides/${rideId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });

                const result = await response.json();

                if (result.success) {
                    alert('Ride deleted successfully!');
                    // Refresh the ride list
                    if (findRidesForm) {
                        findRidesForm.dispatchEvent(new Event('submit'));
                    }
                } else {
                    if (response.status === 401) {
                        alert('Session expired. Please login again.');
                        window.location.href = '/login.html';
                        return;
                    }
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                console.error('Delete API Error:', error);
                alert('Failed to delete ride. Please check your internet connection and try again.');
            }
        }

        // Function to refresh ride list with current search or show all rides
        async function refreshRideList() {
            try {
                const token = localStorage.getItem('authToken');
                
                // Get the current search values if any
                const formData = new FormData(findRidesForm);
                const source = formData.get('source');
                const destination = formData.get('destination');
                
                let apiUrl = '/api/rides';
                let requestBody = null;
                
                // If there are search criteria, use search endpoint, otherwise get all rides
                if (source && source.trim() || destination && destination.trim()) {
                    apiUrl = '/api/rides/search';
                    requestBody = JSON.stringify({
                        source: source ? source.trim() : '',
                        destination: destination ? destination.trim() : ''
                    });
                }
                
                const response = await fetch(apiUrl, {
                    method: apiUrl.includes('/search') ? 'POST' : 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: requestBody
                });
                
                const result = await response.json();
                
                if (result.success) {
                    displayRides(result.rides);
                } else {
                    console.error('Failed to refresh ride list:', result.message);
                    // Fallback to triggering form submit
                    if (findRidesForm) {
                        findRidesForm.dispatchEvent(new Event('submit'));
                    }
                }
            } catch (error) {
                console.error('Error refreshing ride list:', error);
                // Fallback to triggering form submit
                if (findRidesForm) {
                    findRidesForm.dispatchEvent(new Event('submit'));
                }
            }
        }

        // Function to load user's bookings
        async function loadUserBookings() {
            try {
                bookingsList.innerHTML = '<p class="placeholder-text">Loading your bookings...</p>';
                
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                if (!user || !user.email) {
                    bookingsList.innerHTML = '<p class="placeholder-text">Please login to view your bookings.</p>';
                    return;
                }

                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/rides/my-bookings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });

                const result = await response.json();

                if (result.success) {
                    displayUserBookings(result.bookings);
                } else {
                    if (response.status === 401) {
                        bookingsList.innerHTML = '<p class="placeholder-text">Session expired. Please login again.</p>';
                        return;
                    }
                    bookingsList.innerHTML = `<p class="placeholder-text">Error loading bookings: ${result.message}</p>`;
                }
            } catch (error) {
                console.error('Error loading bookings:', error);
                bookingsList.innerHTML = '<p class="placeholder-text">Failed to load bookings. Please check your internet connection and try again.</p>';
            }
        }

        // Function to display user bookings
        function displayUserBookings(bookings) {
            if (!bookings || bookings.length === 0) {
                bookingsList.innerHTML = '<p class="placeholder-text">You haven\'t booked any rides yet. Use "Find Rides" to book your first ride!</p>';
                return;
            }

            let bookingsHTML = '<div class="bookings-list">';
            bookings.forEach(booking => {
                const ride = booking.rideId;
                const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
                const rideDate = new Date(ride.date).toLocaleDateString();
                const isPastRide = new Date(ride.date) < new Date();
                
                bookingsHTML += `
                    <div class="booking-card ${isPastRide ? 'past-ride' : ''}">
                        <div class="booking-header">
                            <h3>${ride.source} → ${ride.destination}</h3>
                            <span class="booking-price">₹${booking.totalPrice} (${booking.seatsBooked} seat${booking.seatsBooked > 1 ? 's' : ''})</span>
                        </div>
                        <div class="booking-details">
                            <p><strong>Ride Date:</strong> ${rideDate}</p>
                            <p><strong>Time:</strong> ${ride.time}</p>
                            <p><strong>Seats Booked:</strong> ${booking.seatsBooked}</p>
                            <p><strong>Vehicle:</strong> ${ride.vehicle}</p>
                            <p><strong>Driver:</strong> ${ride.driverName}</p>
                            <p><strong>Booked On:</strong> ${bookingDate}</p>
                            <p class="booking-status ${booking.status}"><strong>Status:</strong> ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</p>
                            ${isPastRide ? '<p class="past-ride-label">✓ Completed</p>' : '<p class="upcoming-ride-label">🚗 Upcoming</p>'}
                        </div>
                    </div>
                `;
            });
            bookingsHTML += '</div>';

            bookingsList.innerHTML = bookingsHTML;
        }
});