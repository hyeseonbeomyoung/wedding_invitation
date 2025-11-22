document.addEventListener('DOMContentLoaded', () => {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "${API_KEY}",
        authDomain: "${AUTH_DOMAIN}",
        projectId: "${PROJECT_ID}",
        storageBucket: "${STORAGE_BUCKET}",
        messagingSenderId: "${MESSAGING_SENDER_ID}",
        appId: "${APP_ID}",
        measurementId: "${MEASUREMENT_ID}"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    // Initialize Remote Config
    const remoteConfig = firebase.remoteConfig();
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour

    // Set default values (in case fetch fails)
    remoteConfig.defaultConfig = {
        "contacts": JSON.stringify({
            "bride": {"name": "신부", "tel": ""},
            "bride_father": {"name": "아버지", "tel": ""},
            "bride_mother": {"name": "어머니", "tel": ""},
            "groom": {"name": "신랑", "tel": ""},
            "groom_father": {"name": "아버지", "tel": ""},
            "groom_mother": {"name": "어머니", "tel": ""}
        }),
        "family_info": JSON.stringify({
            "bride_parents": "아버지 · 어머니",
            "groom_parents": "아버지 · 어머니",
            "bride_name": "신부",
            "groom_name": "신랑"
        }),
        "accounts": JSON.stringify({
            "bride": {"bank": "", "account_number": "", "name": ""},
            "bride_father": {"bank": "", "account_number": "", "name": ""},
            "bride_mother": {"bank": "", "account_number": "", "name": ""},
            "groom": {"bank": "", "account_number": "", "name": ""},
            "groom_father": {"bank": "", "account_number": "", "name": ""},
            "groom_mother": {"bank": "", "account_number": "", "name": ""}
        })
    };

    // Fetch and activate Remote Config
    remoteConfig.fetchAndActivate()
        .then(() => {
            console.log("--- Fetched Remote Config Data ---");
            const contacts = JSON.parse(remoteConfig.getString("contacts"));
            const familyInfo = JSON.parse(remoteConfig.getString("family_info"));
            const accounts = JSON.parse(remoteConfig.getString("accounts"));
            
            console.log("Contacts:", contacts);
            console.log("Family Info:", familyInfo);
            console.log("Accounts:", accounts);

            updateContactInfo(contacts);
            updateFamilyInfo(familyInfo);
            updateAccountInfo(accounts);
        })
        .catch((err) => {
            console.error("Remote Config fetch failed", err);
            // Fetch failed, use default values
            const contacts = JSON.parse(remoteConfig.defaultConfig.contacts);
            const familyInfo = JSON.parse(remoteConfig.defaultConfig.family_info);
            const accounts = JSON.parse(remoteConfig.defaultConfig.accounts);
            updateContactInfo(contacts);
            updateFamilyInfo(familyInfo);
            updateAccountInfo(accounts);
        });

    function updateContactInfo(contacts) {
        for (const key in contacts) {
            const contactData = contacts[key];
            const contactRow = document.querySelector(`[data-contact="${key}"]`);
            if (contactRow) {
                const nameEl = contactRow.querySelector('[data-name]');
                const telEl = contactRow.querySelector('[data-tel]');
                const smsEl = contactRow.querySelector('[data-sms]');

                if (nameEl) nameEl.textContent = contactData.name;
                if (telEl) telEl.href = `tel:${contactData.tel}`;
                if (smsEl) smsEl.href = `sms:${contactData.tel}`;
            }
        }
    }

    function updateFamilyInfo(familyInfo) {
        for (const key in familyInfo) {
            const element = document.querySelector(`[data-family="${key}"]`);
            if (element) {
                if (key === 'bride_name' || key === 'groom_name') {
                    element.textContent = familyInfo[key];
                } else {
                    element.textContent = familyInfo[key];
                }
            }
        }
    }

    function updateAccountInfo(accounts) {
        for (const key in accounts) {
            const accountData = accounts[key];
            const accountRow = document.querySelector(`.account-details [data-account="${key}"]`);
            if (accountRow) {
                const bankEl = accountRow.querySelector('[data-bank]');
                const numberEl = accountRow.querySelector('[data-account-number]');
                const nameEl = accountRow.querySelector('[data-name]');

                if (bankEl) bankEl.textContent = accountData.bank;
                if (numberEl) numberEl.textContent = accountData.account_number;
                if (nameEl) nameEl.textContent = accountData.name;
            }
        }
    }

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
    const loadMoreBtn = document.getElementById('load-more-btn');
    
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
    const initialImageCount = 9;
    let isExpanded = false;

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

    const allImages = imagePaths.map((path, index) => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = `Gallery image ${index + 1}`;
        if (index >= initialImageCount) {
            img.classList.add('hidden');
        }
        img.addEventListener('click', () => showOverlay(index));
        imageGrid.appendChild(img);
        return img;
    });

    if (imagePaths.length <= initialImageCount) {
        loadMoreBtn.style.display = 'none';
    }

    loadMoreBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            allImages.forEach(img => img.classList.remove('hidden'));
            loadMoreBtn.textContent = '간략히 보기';
        } else {
            allImages.forEach((img, index) => {
                if (index >= initialImageCount) {
                    img.classList.add('hidden');
                }
            });
            loadMoreBtn.textContent = '더보기';
        }
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

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Deactivate all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate the clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Account Toggle
    const accountToggles = document.querySelectorAll('.account-toggle');
    accountToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const details = toggle.nextElementSibling;
            
            if (details.style.maxHeight) {
                details.style.maxHeight = null;
            } else {
                details.style.maxHeight = details.scrollHeight + 'px';
            }
        });
    });

    // Copy account number
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const accountRow = event.currentTarget.closest('.account-row');
            const bank = accountRow.querySelector('[data-bank]').textContent;
            const accountNumber = accountRow.querySelector('[data-account-number]').textContent;
            const textToCopy = `${bank} ${accountNumber}`;

            navigator.clipboard.writeText(textToCopy).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    });

    // Naver Map
    const mapOptions = {
        center: new naver.maps.LatLng(37.479988, 126.895287),
        zoom: 16,
        scrollWheel: false,
        draggable: false
    };

    const map = new naver.maps.Map('map', mapOptions);
    const mapDiv = document.getElementById('map');

    document.addEventListener('click', function(event) {
        if (mapDiv.contains(event.target)) {
            map.setOptions('draggable', true);
        } else {
            map.setOptions('draggable', false);
        }
    });

    const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(37.479988, 126.895287),
        map: map
    });

    // Share functionality
    const shareBtn = document.getElementById('share-btn');
    const linkCopyBtn = document.getElementById('link-copy-btn');

    function shareViaKakao() {
        // Kakao SDK를 동적으로 로드하고 공유 기능을 실행합니다.
        if (window.Kakao && window.Kakao.isInitialized()) {
            window.Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: '혜선이와 범영이의 결혼식에 초대합니다.',
                    description: '2026년 9월 19일 12:30 지타워컨벤션',
                    imageUrl: 'https://hyeseonbeomyoung.github.io/wedding_invitation/assets/images/date/thumbnail.jpeg',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                },
                buttons: [{
                    title: '청첩장 보기',
                    link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                    },
                }],
            });
        } else {
            const script = document.createElement('script');
            script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
            document.head.appendChild(script);
            script.onload = () => {
                window.Kakao.init('${KAKAO_JS_KEY}');
                shareViaKakao(); // SDK 로드 후 다시 호출
            };
        }
    }

    shareBtn.addEventListener('click', () => {
        if (navigator.userAgent.includes('KAKAOTALK')) {
            shareViaKakao();
        } else if (navigator.share) {
            navigator.share({
                title: '혜선이와 범영이의 결혼식에 초대합니다.',
                text: '2026년 9월 19일 12:30 지타워컨벤션에서 열리는 혜선이와 범영이의 결혼식에 여러분을 초대합니다.',
                url: window.location.href,
            })
            .then(() => console.log('성공적으로 공유되었습니다.'))
            .catch((error) => console.error('공유에 실패했습니다.', error));
        } else {
            // Fallback for desktop or unsupported browsers
            const url = window.location.href;
            navigator.clipboard.writeText(url).catch(err => {
                console.error('Could not copy text: ', err);
            });
        }
    });

    linkCopyBtn.addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });
});
