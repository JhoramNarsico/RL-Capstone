// js/script.js
document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Navigation Toggle ---
    // Make sure this targets the correct menu toggle and nav links for the current page
    // If you have multiple headers (e.g. one in dashboard, one in public pages)
    // you might need to make this selector more specific or run it conditionally.
    const menuToggle = document.querySelector('header .menu-toggle'); // More specific
    const navLinks = document.querySelector('header .nav-links');     // More specific

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            menuToggle.classList.toggle('open');
            const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !expanded);
        });
    }

    // --- Active Navigation Link (for main site navigation, not auth links) ---
    const publicNavItems = document.querySelectorAll('header .nav-links a:not(.auth-link)'); // Exclude auth links
    const currentLocation = window.location.pathname.split("/").pop() || 'index.html';

    publicNavItems.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href').split("/").pop();
        if (linkPath === currentLocation || (currentLocation === 'index.html' && linkPath === '')) {
            link.classList.add('active');
        } else if (currentLocation === '' && linkPath === 'index.html') {
            link.classList.add('active');
        }
    });

    // --- Dynamic Copyright Year ---
    const currentYearSpans = document.querySelectorAll('#current-year'); // Might be on multiple pages
    if (currentYearSpans) {
        currentYearSpans.forEach(span => {
            span.textContent = new Date().getFullYear();
        });
    }

    // --- Basic Contact Form Handling (Client-Side) --- from your original script.js
    const contactForm = document.getElementById('contactForm');
    const formStatusContactPage = document.getElementById('form-status'); // Specific to contact page

    if (contactForm && formStatusContactPage) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            formStatusContactPage.classList.remove('success', 'error', 'visible', 'sending');

            if (!name || !email || !subject || !message) {
                formStatusContactPage.textContent = 'Please fill out all required fields.';
                formStatusContactPage.className = 'form-status error visible';
                return;
            }
            if (!isValidEmail(email)) {
                formStatusContactPage.textContent = 'Please enter a valid email address.';
                formStatusContactPage.className = 'form-status error visible';
                return;
            }

            formStatusContactPage.textContent = 'Sending your message...';
            formStatusContactPage.className = 'form-status sending visible';
            setTimeout(() => {
                formStatusContactPage.textContent = 'Message sent successfully! We will get back to you soon.';
                formStatusContactPage.className = 'form-status success visible';
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
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    // --- SCROLLING BACKGROUND ANIMATION --- (Ensure this doesn't conflict if already in auth.js)
    // It's generally better to have such global UI effects in one place.
    // If you keep it here, ensure it works. If it's also in auth.js, remove one.
    const bodyElement = document.body;
    let scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    function animateBackgroundOnScroll() {
        if (scrollableHeight <= 0) {
            const isMobileView = window.innerWidth <= 767.98;
            if (!isMobileView) {
                 bodyElement.style.backgroundPositionY = '0%';
            }
            return;
        }
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / scrollableHeight) * 100;
        let newYPosition = Math.min(100, Math.max(0, scrollPercent));
        bodyElement.style.backgroundPositionY = newYPosition + '%';
    }

    if (scrollableHeight > 0) animateBackgroundOnScroll();
    window.addEventListener('scroll', animateBackgroundOnScroll, { passive: true });
    window.addEventListener('resize', () => {
        scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        bodyElement.style.backgroundAttachment = (window.innerWidth <= 767.98) ? 'scroll' : 'fixed';
        animateBackgroundOnScroll();
    }, { passive: true });
    bodyElement.style.backgroundAttachment = (window.innerWidth <= 767.98) ? 'scroll' : 'fixed';
});