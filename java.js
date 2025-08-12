document.addEventListener('DOMContentLoaded', function () {
    // Loading Screen
    const loadingScreen = document.querySelector('.loading-screen');

    // Simulate loading (we'll replace this with actual data loading)
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);

    // Mobile Navigation
    setupMobileMenu();

    // Smooth scrolling for anchor links
    setupSmoothScrolling();

    setupHomeBookingForm();

    // Initialize specific page functionality
    if (document.querySelector('.room-listing')) {
        initStayPage();
    }

    // Initialize contact form if it exists
    if (document.getElementById('contactForm')) {
        setupContactForm();
    }


  const showMoreBtn = document.getElementById('showMoreBtn');
  const hiddenItems = document.querySelectorAll('.gallery-item.hidden');
  let itemsToShow = 6; // Number of items to show each click

  showMoreBtn.addEventListener('click', function() {
    // Show next batch of hidden items
    let shownCount = 0;
    for (let i = 0; i < hiddenItems.length && shownCount < itemsToShow; i++) {
      if (hiddenItems[i].classList.contains('hidden')) {
        hiddenItems[i].classList.remove('hidden');
        shownCount++;
      }
    }

    // Hide button if no more items to show
    if (document.querySelectorAll('.gallery-item.hidden').length === 0) {
      showMoreBtn.style.display = 'none';
    }

    // Recalculate masonry layout
    if (typeof Masonry !== 'undefined') {
      const msnry = new Masonry('.gallery-masonry');
      msnry.layout();
    }
  });

  // Initially hide button if no hidden items
  if (hiddenItems.length === 0) {
    showMoreBtn.style.display = 'none';
  }
});

// ========================================================
// Mobile Menu Functionality
// ========================================================

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function () {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Toggle the hamburger animation
        const spans = this.querySelectorAll('span');
        if (this.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans.forEach(span => {
                span.style.transform = '';
                span.style.opacity = '';
            });
        }
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function () {
            if (navMenu.classList.contains('active')) {
                hamburger.click();
            }
        });
    });
}

// ========================================================
// Smooth Scrolling Functionality
// ========================================================

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================================
// Stay Page Functionality
// ========================================================

async function initStayPage() {
    // DOM Elements
    const roomGrid = document.getElementById('roomGrid');
    const roomFilterForm = document.getElementById('roomFilterForm');
    const sortBy = document.getElementById('sortBy');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const roomModal = document.getElementById('roomModal');
    const bookingModal = document.getElementById('bookingModal');
    const modalCloseBtns = document.querySelectorAll('.modal-close');

    // Pagination variables
    let currentPage = 1;
    const roomsPerPage = 6;
    let filteredRooms = [];

    // Load rooms from Supabase
    const allRooms = await fetchRooms();
    if (!allRooms) {
        roomGrid.innerHTML = '<div class="error-message">Failed to load rooms. Please try again later.</div>';
        return;
    }

    filteredRooms = [...allRooms];
    renderRooms();

    // Setup event listeners
    setupStayPageEventListeners();

    // ====================================================
    // Stay Page Helper Functions
    // ====================================================

    async function fetchRooms() {
        try {
            const { data, error } = await supabase
                .from('Rooms')
                .select('*')
                .neq('availability', 'unavailable')
                .order('name');

            if (error) {
                console.error('Error fetching rooms:', error);
                return null;
            }

            console.log('Successfully fetched rooms:', data);
            return data;

        } catch (error) {
            console.error('Unexpected error:', error);
            return null;
        }
    }

    function renderRooms() {
        roomGrid.innerHTML = '';

        // Calculate pagination
        const startIndex = (currentPage - 1) * roomsPerPage;
        const endIndex = startIndex + roomsPerPage;
        const roomsToDisplay = filteredRooms.slice(startIndex, endIndex);

        // Update pagination controls
        updatePagination();

        if (roomsToDisplay.length === 0) {
            roomGrid.innerHTML = '<div class="no-rooms">No rooms match your filters. Please try different criteria.</div>';
            return;
        }

        // Render each room
        roomsToDisplay.forEach(room => {
            const roomCard = createRoomCard(room);
            roomGrid.appendChild(roomCard);
        });
    }

    function createRoomCard(room) {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.dataset.id = room.name.replace(/\s+/g, '-').toLowerCase();

        // Determine if room is popular (for badge)
        const isPopular = room.price > 180;

        // Construct image path - assuming your images follow this pattern:
        // /room-type/room-name.jpg (e.g., /apartments/apt-d4.jpg)
        const imagePath = `${room.image}`;

        card.innerHTML = `
            <div class="room-image">
                <img src="${imagePath}" alt="${room.name}" loading="lazy">
                ${isPopular ? '<div class="room-badge">Most Popular</div>' : ''}
            </div>
            <div class="room-details">
                <h3>${room.name}</h3>
                <div class="room-meta">
                    <span><i class="fas fa-bed"></i> ${room.type_of_room}</span>
                    <span><i class="fas fa-user-friends"></i> ${room.number_of_guests} Guests</span>
                    <span><i class="fas fa-expand"></i> ${room.size}</span>
                </div>
                <p class="room-description">${room.description}</p>
                <div class="room-features">
                    <span><i class="fas fa-check"></i> ${room.feature_no_1}</span>
                    <span><i class="fas fa-check"></i> ${room.feature_no_2}</span>
                </div>
                <div class="room-footer">
                    <div class="room-price">
                        <span class="amount">$${room.price}</span>
                        <span class="per-night">per night</span>
                    </div>
                    <button class="btn-primary btn-small view-details" data-room='${JSON.stringify(room).replace(/'/g, "\\'")}'>
                        View Details
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function filterRooms() {
        const roomType = document.getElementById('roomType').value;
        const priceRange = document.getElementById('priceRange').value;
        const capacity = document.getElementById('capacity').value;

        filteredRooms = allRooms.filter(room => {
            // Filter by room type
            if (roomType !== 'all') {
                const typeMap = {
                    'single': 'Standard Single Room',
                    'twin': 'Twin Room',
                    'apartment': 'Apartment'
                };
                if (room.type_of_room !== typeMap[roomType]) return false;
            }

            // Filter by price range
            if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-').map(Number);
                if (max && (room.price < min || room.price > max)) return false;
                if (priceRange === '200+' && room.price < 200) return false;
            }

            // Filter by capacity
            if (capacity !== 'all') {
                if (capacity === '4+' && room.number_of_guests < 4) return false;
                if (capacity !== '4+' && room.number_of_guests !== Number(capacity)) return false;
            }

            return true;
        });

        sortRooms();
        currentPage = 1;
        renderRooms();
    }

    function sortRooms() {
        const sortValue = sortBy.value;

        filteredRooms.sort((a, b) => {
            switch (sortValue) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'capacity-asc':
                    return a.number_of_guests - b.number_of_guests;
                case 'capacity-desc':
                    return b.number_of_guests - a.number_of_guests;
                default:
                    return 0;
            }
        });
    }

    function openRoomModal(room) {
        const modalTitle = document.getElementById('modalRoomTitle');
        const modalRoomType = document.getElementById('modalRoomType');
        const modalRoomCapacity = document.getElementById('modalRoomCapacity');
        const modalRoomSize = document.getElementById('modalRoomSize');
        const modalRoomFeatures = document.getElementById('modalRoomFeatures');
        const modalRoomDescription = document.getElementById('modalRoomDescription');
        const modalRoomPrice = document.getElementById('modalRoomPrice');
        const mainImage = document.getElementById('mainImage');
        const thumbnailGrid = document.getElementById('thumbnailGrid');

        // Set room details
        modalTitle.textContent = room.name;
        modalRoomType.textContent = room.type_of_room;
        modalRoomCapacity.textContent = `${room.number_of_guests} ${room.number_of_guests === 1 ? 'Guest' : 'Guests'}`;
        modalRoomSize.textContent = room.size;
        modalRoomDescription.textContent = room.description;
        modalRoomPrice.textContent = `$${room.price}/night`;

        // Set features
        modalRoomFeatures.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const featureValue = room[`feature_no_${i}`];
            if (featureValue) {
                const feature = document.createElement('div');
                feature.className = 'room-feature';
                feature.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${featureValue}</span>
            `;
                modalRoomFeatures.appendChild(feature);
            }
        }

        // Set main image - using the direct image path from Supabase
        mainImage.innerHTML = `<img src="${room.image}" alt="${room.name}" class="room-main-image">`;

        // Set thumbnails - using the thumb paths from Supabase
        thumbnailGrid.innerHTML = '';
        const thumbnails = [
            room.image, // First thumbnail is same as main image
            room['thumb-1'],
            room['thumb-2'],
            room['thumb-3']
        ].filter(Boolean); // Remove any undefined thumbnails

        thumbnails.forEach((thumbSrc, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.innerHTML = `<img src="${thumbSrc}" alt="${room.name} thumbnail ${index + 1}">`;
            thumbnail.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');

                // Update main image
                mainImage.innerHTML = `<img src="${thumbSrc}" alt="${room.name}" class="room-main-image">`;
            });
            thumbnailGrid.appendChild(thumbnail);
        });

        // Set up booking button
        document.getElementById('bookThisRoom').onclick = () => {
            roomModal.classList.remove('active');
            openBookingModal(room);
        };

        // Show modal
        roomModal.classList.add('active');
    }

    function openBookingModal(room) {
        document.getElementById('bookingRoomTitle').textContent = room.name;
        document.getElementById('bookingRoomId').value = room.name.replace(/\s+/g, '-').toLowerCase();

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        document.getElementById('bookingCheckIn').value = today.toISOString().split('T')[0];
        document.getElementById('bookingCheckIn').min = today.toISOString().split('T')[0];
        document.getElementById('bookingCheckOut').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('bookingCheckOut').min = tomorrow.toISOString().split('T')[0];

        bookingModal.classList.add('active');
    }

    function setupStayPageEventListeners() {
        // Filter form
        if (roomFilterForm) {
            roomFilterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                filterRooms();
            });

            roomFilterForm.addEventListener('reset', () => {
                setTimeout(() => {
                    filterRooms();
                }, 0);
            });
        }

        // Sort dropdown
        if (sortBy) {
            sortBy.addEventListener('change', filterRooms);
        }

        // Pagination buttons
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderRooms();
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderRooms();
                }
            });
        }

        // Room card clicks
        if (roomGrid) {
            roomGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('view-details')) {
                    const room = JSON.parse(e.target.dataset.room);
                    openRoomModal(room);
                }
            });
        }

        // Modal close buttons
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                roomModal.classList.remove('active');
                bookingModal.classList.remove('active');
            });
        });

        // Close modals when clicking outside
        [roomModal, bookingModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                    }
                });
            }
        });
        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                let isValid = true;
                const requiredFields = bookingForm.querySelectorAll('[required]');

                // Validate required fields
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.style.borderColor = 'red';

                        field.addEventListener('input', function () {
                            this.style.borderColor = '';
                        }, { once: true });
                    }
                });

                if (!isValid) {
                    alert('Please fill in all required fields.');
                    return;
                }

                // Check honeypot field
                const honeyValue = document.getElementById('bookingHoney').value.trim();
                if (honeyValue) {
                    console.log('Bot detected - honeypot field filled');
                    return; // Silently fail for bots
                }

                try {
                    // Collect form data
                    const roomId = document.getElementById('bookingRoomId').value;
                    const bookingData = {
                        room_id: roomId,
                        check_in: document.getElementById('bookingCheckIn').value,
                        check_out: document.getElementById('bookingCheckOut').value,
                        adults: document.getElementById('bookingAdults').value,
                        children: document.getElementById('bookingChildren').value || 0,
                        special_requests: document.getElementById('bookingSpecialRequests').value.trim(),
                        guest_name: `${document.getElementById('bookingFirstName').value.trim()} ${document.getElementById('bookingLastName').value.trim()}`,
                        guest_email: document.getElementById('bookingEmail').value.trim(),
                        guest_phone: document.getElementById('bookingPhone').value.trim(),
                        status: 'pending',
                        honey: honeyValue
                    };

                    // First mark room as unavailable
                    const { error: updateError } = await supabase
                        .from('Rooms')
                        .update({ availability: 'unavailable' })
                        .eq('name', roomId);

                    if (updateError) throw updateError;

                    // Then create booking
                    const { data, error } = await supabase
                        .from('bookings')
                        .insert([bookingData]);

                    if (error) throw error;

                    alert(`Thank you ${bookingData.guest_name} for your booking request for room ${bookingData.room_id}!
We will contact you shortly at ${bookingData.guest_email} to confirm your reservation.`);

                    bookingForm.reset();
                    bookingModal.classList.remove('active');

                } catch (error) {
                    console.error('Booking error:', error);
                    alert('There was an error processing your booking. Please try again.');
                }
            });
        }
    }

    // Read URL parameters and apply filters
    const urlParams = new URLSearchParams(window.location.search);
    const roomTypeParam = urlParams.get('roomType');
    const guestsParam = urlParams.get('guests');
    const priceRangeParam = urlParams.get('priceRange');

    if (roomTypeParam) {
        document.getElementById('roomType').value = roomTypeParam;
    }
    if (guestsParam) {
        document.getElementById('capacity').value = guestsParam;
    }
    if (priceRangeParam) {
        document.getElementById('priceRange').value = priceRangeParam;
    }

    // Apply filters if any parameters exist
    if (roomTypeParam || guestsParam || priceRangeParam) {
        filterRooms();
    }

}



// ========================================================
// Contact Form Functionality
// ========================================================

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');

        // Validate required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';

                field.addEventListener('input', function () {
                    this.style.borderColor = '';
                }, { once: true });
            }
        });

        if (!isValid) return;

        try {
            // Collect form data manually since we're not using name attributes
            const contactData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim(),
                honey: document.getElementById('honey').value.trim(),
                status: 'unread'
            };

            // Validate honeypot
            if (contactData.honey) {
                console.log('Bot detected - honeypot field filled');
                return; // Silently fail for bots
            }



            // Insert into Supabase
            const { data, error } = await supabase
                .from('contact_messages')
                .insert([contactData]);

            if (error) throw error;

            // Success message
            alert(`Thank you for your message, ${contactData.name}!\nWe will get back to you soon at ${contactData.email}.`);

            // Reset form
            contactForm.reset();

        } catch (error) {
            console.error('Contact form error:', error);
            alert('There was an error sending your message. Please try again later.');
        }
    });
}

// Add this to your existing JavaScript file
function setupHomeBookingForm() {
    const homeBookingForm = document.getElementById('homeBookingForm');

    if (homeBookingForm) {
        homeBookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const roomType = document.getElementById('home-room-type').value;
            const guests = document.getElementById('home-guests').value;
            const priceRange = document.getElementById('home-price-range').value;

            // Construct URL parameters
            const params = new URLSearchParams();
            if (roomType !== 'all') params.append('roomType', roomType);
            if (guests !== 'all') params.append('guests', guests);
            if (priceRange !== 'all') params.append('priceRange', priceRange);

            // Redirect to stay page with filters
            window.location.href = `stay.html?${params.toString()}`;
        });
    }
}
