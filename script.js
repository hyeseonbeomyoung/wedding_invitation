document.addEventListener('DOMContentLoaded', () => {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDdspSs4bJONW8sJ-LTYUnvljJ-rjt52aE",
        authDomain: "wedding-invitation-cd5b2.firebaseapp.com",
        projectId: "wedding-invitation-cd5b2",
        storageBucket: "wedding-invitation-cd5b2.firebasestorage.app",
        messagingSenderId: "62055758486",
        appId: "1:62055758486:web:9455fb7bff5baff0abe0b7",
        measurementId: "G-V6ZSDN88GJ"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    const imagePaths = Array.from({ length: 31 }, (_, i) => `assets/images/date/${i + 1}.jpeg`);

    // BGM
    const bgm = document.getElementById('bgm');
    const bgmBtn = document.getElementById('bgm-toggle-btn');
    let isBgmPlaying = false;

    const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    function toggleBgm() {
        if (isBgmPlaying) {
            bgm.pause();
            bgmBtn.innerHTML = playIcon;
        } else {
            bgm.play();
            bgmBtn.innerHTML = pauseIcon;
        }
        isBgmPlaying = !isBgmPlaying;
    }

    bgmBtn.addEventListener('click', toggleBgm);
    bgmBtn.innerHTML = playIcon; // Set initial icon

    // Play BGM on first user interaction
    document.body.addEventListener('click', (event) => {
        if (!isBgmPlaying) {
            if (!bgmBtn.contains(event.target)) {
                toggleBgm();
            }
        }
    }, { once: true });


    // D-Day Counter
    const weddingDay = new Date('2026-09-19T12:30:00');
    const dDayCounter = document.getElementById('d-day-counter');

    function updateDDay() {
        const now = new Date();
        const diff = weddingDay - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        dDayCounter.innerHTML = `${days}일 : ${hours}시간 : ${minutes}분 : ${seconds}초`;
    }

    setInterval(updateDDay, 1000);
    updateDDay();

    // Gallery
    const imageGrid = document.querySelector('.image-grid');
    const galleryOverlay = document.getElementById('gallery-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    const imageCarousel = document.createElement('div');
    imageCarousel.className = 'image-carousel';
    galleryOverlay.insertBefore(imageCarousel, closeBtn.nextSibling);

    const originalImage = document.querySelector('.overlay-image');
    if (originalImage) {
        originalImage.remove();
    }

    const prevImage = document.createElement('img');
    const currentImage = document.createElement('img');
    const nextImage = document.createElement('img');
    
    [prevImage, currentImage, nextImage].forEach(img => {
        img.className = 'overlay-image';
        img.addEventListener('dragstart', (e) => e.preventDefault());
        imageCarousel.appendChild(img);
    });

    let currentIndex = 0;

    function updateCarouselImages(transition = false) {
        if (!transition) {
            [prevImage, currentImage, nextImage].forEach(img => img.style.transition = 'none');
        } else {
            [prevImage, currentImage, nextImage].forEach(img => img.style.transition = 'transform 0.3s ease-out');
        }

        const prevIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
        const nextIndex = (currentIndex + 1) % imagePaths.length;

        prevImage.src = imagePaths[prevIndex];
        currentImage.src = imagePaths[currentIndex];
        nextImage.src = imagePaths[nextIndex];

        prevImage.style.transform = 'translateX(-100%)';
        currentImage.style.transform = 'translateX(0)';
        nextImage.style.transform = 'translateX(100%)';
    }

    imagePaths.forEach((path, index) => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = `Gallery image ${index + 1}`;
        img.addEventListener('click', () => showOverlay(index));
        imageGrid.appendChild(img);
    });

    function showOverlay(index) {
        currentIndex = index;
        updateCarouselImages();
        galleryOverlay.classList.remove('hidden');
        bgmBtn.style.display = 'none';
        // Add a history entry to handle back button
        history.pushState({ gallery: 'open' }, 'Gallery', '#gallery');
    }

    function hideOverlay() {
        galleryOverlay.classList.add('hidden');
        bgmBtn.style.display = 'flex';
    }

    // Handle back button press
    window.addEventListener('popstate', (event) => {
        if (!galleryOverlay.classList.contains('hidden')) {
            hideOverlay();
        }
    });

    function showPrevImage() {
        currentIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
        updateCarouselImages();
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % imagePaths.length;
        updateCarouselImages();
    }

    closeBtn.addEventListener('click', () => {
        // Go back in history to close the overlay, which triggers the popstate event
        history.back();
    });

    prevBtn.addEventListener('click', () => {
        currentImage.style.transition = 'transform 0.3s ease-out';
        prevImage.style.transition = 'transform 0.3s ease-out';
        currentImage.style.transform = 'translateX(100%)';
        prevImage.style.transform = 'translateX(0)';
        prevImage.addEventListener('transitionend', showPrevImage, { once: true });
    });
    nextBtn.addEventListener('click', () => {
        currentImage.style.transition = 'transform 0.3s ease-out';
        nextImage.style.transition = 'transform 0.3s ease-out';
        currentImage.style.transform = 'translateX(-100%)';
        nextImage.style.transform = 'translateX(0)';
        nextImage.addEventListener('transitionend', showNextImage, { once: true });
    });

    // Drag/Swipe functionality
    let isDragging = false;
    let startX = 0;
    const dragThreshold = 50;

    function dragStart(e) {
        if (e.target.closest('.prev-btn, .next-btn, .close-btn')) return;
        isDragging = true;
        startX = e.pageX || e.touches[0].pageX;
        [prevImage, currentImage, nextImage].forEach(img => img.style.transition = 'none');
    }

    function dragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const currentX = e.pageX || e.touches[0].pageX;
        const diffX = currentX - startX;
        
        prevImage.style.transform = `translateX(${-window.innerWidth + diffX}px)`;
        currentImage.style.transform = `translateX(${diffX}px)`;
        nextImage.style.transform = `translateX(${window.innerWidth + diffX}px)`;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        const currentX = e.pageX || e.changedTouches[0].pageX;
        const diffX = currentX - startX;

        [prevImage, currentImage, nextImage].forEach(img => img.style.transition = 'transform 0.3s ease-out');

        if (diffX > dragThreshold) {
            currentImage.style.transform = 'translateX(100%)';
            prevImage.style.transform = 'translateX(0)';
            prevImage.addEventListener('transitionend', showPrevImage, { once: true });
        } else if (diffX < -dragThreshold) {
            currentImage.style.transform = 'translateX(-100%)';
            nextImage.style.transform = 'translateX(0)';
            nextImage.addEventListener('transitionend', showNextImage, { once: true });
        } else {
            prevImage.style.transform = 'translateX(-100%)';
            currentImage.style.transform = 'translateX(0)';
            nextImage.style.transform = 'translateX(100%)';
        }
    }

    galleryOverlay.addEventListener('mousedown', dragStart);
    galleryOverlay.addEventListener('touchstart', dragStart, { passive: true });
    galleryOverlay.addEventListener('mousemove', dragMove);
    galleryOverlay.addEventListener('touchmove', dragMove, { passive: false });
    galleryOverlay.addEventListener('mouseup', dragEnd);
    galleryOverlay.addEventListener('mouseleave', dragEnd);
    galleryOverlay.addEventListener('touchend', dragEnd);

    // Calendar
    const calendarBody = document.querySelector('.calendar-body');
    const year = 2026;
    const month = 8; // September (0-indexed)
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        calendarBody.appendChild(dayElement);
    });

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarBody.appendChild(emptyCell);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = i;
        if (i === 19) {
            dayCell.classList.add('wedding-day');
        }
        calendarBody.appendChild(dayCell);
    }

    // Naver Map
    const mapOptions = {
        center: new naver.maps.LatLng(37.401877, 126.901504),
        zoom: 17
    };

    const map = new naver.maps.Map('map', mapOptions);

    const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(37.401877, 126.901504),
        map: map
    });
});
