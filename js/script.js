document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Navigation Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            menuToggle.classList.toggle('open');
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !expanded);
        });
    }

    // --- Active Navigation Link ---
    const currentLocation = window.location.pathname.split("/").pop() || 'index.html'; // Ensure index.html default
    const navItems = document.querySelectorAll('.nav-links a');

    navItems.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').split("/").pop();
        // Handle root path explicitly mapping to index.html
        if (linkPath === currentLocation || (currentLocation === 'index.html' && linkPath === '')) {
            link.classList.add('active');
        } else if (currentLocation === '' && linkPath === 'index.html') { // Case for when server serves index.html for root
             link.classList.add('active');
        }
    });

    // --- Dynamic Copyright Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Basic Contact Form Handling (Client-Side) ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            formStatus.classList.remove('success', 'error', 'visible', 'sending'); // Reset classes

            if (!name || !email || !subject || !message) {
                formStatus.textContent = 'Please fill out all required fields.';
                formStatus.className = 'form-status error visible';
                return;
            }

            if (!isValidEmail(email)) {
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.className = 'form-status error visible';
                return;
            }

            formStatus.textContent = 'Sending your message...';
            formStatus.className = 'form-status sending visible'; // Use 'sending' class for specific styling

            setTimeout(() => {
                formStatus.textContent = 'Message sent successfully! We will get back to you soon.';
                formStatus.className = 'form-status success visible';
                contactForm.reset();
            }, 2000);
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // --- Intersection Observer for Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // --- SCROLLING BACKGROUND ANIMATION ---
    const bodyElement = document.body;
    let scrollableHeight = document.documentElement.scrollHeight - window.innerHeight; // Use let for reassignment

    function animateBackgroundOnScroll() {
        // Only run if the page is actually scrollable
        if (scrollableHeight <= 0) {
            // Check if the class indicating mobile view is present or viewport width
            const isMobileView = window.innerWidth <= 767.98;
            if (!isMobileView) { // Only reset if not in mobile view where bg is scroll
                 bodyElement.style.backgroundPositionY = '0%';
            }
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / scrollableHeight) * 100;

        let newYPosition = scrollPercent;
        newYPosition = Math.min(100, Math.max(0, newYPosition)); // Cap between 0 and 100

        bodyElement.style.backgroundPositionY = newYPosition + '%';
    }

    // Initial call and listeners
    if (scrollableHeight > 0) {
        animateBackgroundOnScroll();
    }

    window.addEventListener('scroll', animateBackgroundOnScroll, { passive: true });

    window.addEventListener('resize', () => {
        scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        // Re-check if fixed attachment should apply based on viewport width after resize
        if (window.innerWidth > 767.98) {
            bodyElement.style.backgroundAttachment = 'fixed';
        } else {
            bodyElement.style.backgroundAttachment = 'scroll';
        }
        animateBackgroundOnScroll(); // Call animation function after recalculating
    }, { passive: true });

    // Initial check for background-attachment on load
    if (window.innerWidth <= 767.98) {
        bodyElement.style.backgroundAttachment = 'scroll';
    } else {
        bodyElement.style.backgroundAttachment = 'fixed';
    }
    // --- END OF SCROLLING BACKGROUND ANIMATION ---

});