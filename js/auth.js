// js/auth.js

// VERIFIED: Correct Project URL
const SUPABASE_URL = 'https://qstvxipgjsggoutimwng.supabase.co';
// VERIFIED: Using the NEW public anon key you just provided.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdHZ4aXBnanNnZ291dGltd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTA4NzksImV4cCI6MjA2NTM4Njg3OX0.Xh4ENp_R_GD3OmIpDW2dfBn6YIYgM0Gytl9ruVsBkss';

// Correct initialization
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;

// Header UI Elements
const authLinksContainer = document.getElementById('auth-links-container');
const userInfoContainer = document.getElementById('user-info-container');
const loggedInUserEmailEl = document.getElementById('loggedInUserEmail');
const logoutBtnHeader = document.getElementById('logoutBtnHeader');

function updateHeaderUI(user) {
    if (user) {
        if (authLinksContainer) authLinksContainer.style.display = 'none';
        if (userInfoContainer) {
            userInfoContainer.style.display = 'flex';
            userInfoContainer.style.alignItems = 'center';
        }
        if (loggedInUserEmailEl) loggedInUserEmailEl.textContent = `${user.email}`;
        if (logoutBtnHeader) {
            logoutBtnHeader.onclick = async () => { await handleLogout(); };
        }
    } else {
        if (authLinksContainer) authLinksContainer.style.display = 'list-item';
        if (userInfoContainer) userInfoContainer.style.display = 'none';
    }
}

async function handleLogout() {
    console.log('Logging out...');
    await supabaseClient.auth.signOut();
    // The onAuthStateChange listener will automatically handle the redirect.
}
window.handleLogout = handleLogout; // Make it globally accessible for the button

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const authStatusEl = document.getElementById('auth-status');

    function showAuthFormStatus(message, type = 'error') {
        if (authStatusEl) {
            authStatusEl.textContent = message;
            authStatusEl.className = `form-status ${type} visible`;
            setTimeout(() => {
                if(authStatusEl) authStatusEl.className = 'form-status';
           }, 4000);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showAuthFormStatus('Logging in...', 'sending');
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            
            if (error) {
                showAuthFormStatus(`Login failed: ${error.message}`);
            } else if (data.user) {
                showAuthFormStatus('Login successful! Redirecting...', 'success');
                // The onAuthStateChange listener will handle the actual redirect.
            } else {
                 showAuthFormStatus('Login failed. Please try again.');
            }
        });
    }

    // --- The Main Authentication Logic using onAuthStateChange ---
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        const user = session ? session.user : null;
        updateHeaderUI(user);

        const isDashboardPage = window.location.pathname.includes('/dashboard.html');
        const isLoginPage = window.location.pathname.endsWith('/login.html') || window.location.pathname === '/';

        // If a user is logged in...
        if (user) {
            // ...and they are on the login page, redirect them to the dashboard.
            if (isLoginPage) {
                window.location.replace('/dashboard.html');
            }
        } 
        // If a user is NOT logged in...
        else {
            // ...and they are trying to access the dashboard, redirect them to the login page.
            if (isDashboardPage) {
                window.location.replace('/login.html');
            }
        }
    });
});