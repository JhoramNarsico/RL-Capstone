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
    const currentLocation = window.location.pathname.split("/").pop();
    const navItems = document.querySelectorAll('.nav-links a');

    navItems.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentLocation || (currentLocation === '' && linkPath === 'index.html')) {
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

            formStatus.classList.remove('success', 'error', 'visible'); // Reset classes

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
            formStatus.className = 'form-status visible'; 

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
                    // Child elements with .stagger-item-X classes will animate via CSS
                    // due to their transition-delay and the parent having .is-visible.
                    observerInstance.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
            // rootMargin: "0px 0px -50px 0px" // Optional: adjust viewport bounds
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
});