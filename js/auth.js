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
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error('Logout error:', error.message);
        alert(`Logout failed: ${error.message}`);
    } else {
        console.log('Logged out successfully');
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
}
window.handleLogout = handleLogout;

async function checkAuthStateAndRedirect(protectedPage = false) {
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        if (protectedPage && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }

    if (session) {
        const onLoginPage = window.location.pathname.endsWith('login.html');
        if (onLoginPage) {
            window.location.href = 'dashboard.html';
        }
    } else {
        if (protectedPage && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
    return session;
}
window.checkAuthStateAndRedirect = checkAuthStateAndRedirect;


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
            } else {
                 showAuthFormStatus('Login failed. Please try again.');
            }
        });
    }

    const isDashboardPage = window.location.pathname.includes('dashboard.html');
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateHeaderUI(session ? session.user : null);
        checkAuthStateAndRedirect(isDashboardPage);
    });

    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event, 'Session:', session);
        const user = session ? session.user : null;
        updateHeaderUI(user);

        const onLoginPage = window.location.pathname.endsWith('login.html');
        const onDashboardPage = window.location.pathname.includes('dashboard.html');

        if (event === 'SIGNED_IN') {
            if (user && onLoginPage) {
                window.location.href = 'dashboard.html';
            }
        } else if (event === 'SIGNED_OUT') {
            if (onDashboardPage) {
                window.location.href = 'login.html';
            }
        }
    });
});