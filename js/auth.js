/**
 * PsicAPP - Controle de Autenticação e Bloqueio por PIN
 */

const AUTH_PIN_KEY = 'psicapp_pin';
const DEFAULT_PIN = '1234';

function getStoredPin() {
    return (
        (typeof appData !== 'undefined' && appData?.therapist?.pin) ||
        (typeof appData !== 'undefined' && appData?.doctor?.pin) ||
        (typeof appData !== 'undefined' && appData?.pin) ||
        localStorage.getItem(AUTH_PIN_KEY) ||
        DEFAULT_PIN
    );
}

function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    
    // Suporta 'pinInput' (id oficial do HTML) e 'loginPinInput'
    const pinInput = document.getElementById('pinInput') || document.getElementById('loginPinInput');
    if (!pinInput) return;

    const enteredPin = pinInput.value.trim();
    const correctPin = getStoredPin();

    if (enteredPin === correctPin) {
        // Oculta tela de login
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) loginScreen.classList.add('hidden');

        // Exibe layout principal do app ('appLayout' do HTML)
        const appLayout = document.getElementById('appLayout') || document.getElementById('mainContent');
        if (appLayout) appLayout.classList.remove('hidden');

        pinInput.value = '';

        if (typeof showToast === 'function') {
            showToast('Sessão iniciada com sucesso!', 'success');
        }

        if (typeof navigateTo === 'function') {
            navigateTo('dashboard');
        }
    } else {
        alert('PIN incorreto. Digite a senha padrão: 1234');
        pinInput.value = '';
        pinInput.focus();
    }
}

function lockSystem() {
    const appLayout = document.getElementById('appLayout') || document.getElementById('mainContent');
    if (appLayout) appLayout.classList.add('hidden');

    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.classList.remove('hidden');

    const pinInput = document.getElementById('pinInput') || document.getElementById('loginPinInput');
    if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
    }

    if (typeof showToast === 'function') {
        showToast('Consultório bloqueado por segurança.', 'info');
    }
}

// Aliases para garantir compatibilidade com chamadas no HTML/JS
const logout = lockSystem;

document.addEventListener('DOMContentLoaded', () => {
    const pinInput = document.getElementById('pinInput') || document.getElementById('loginPinInput');
    if (pinInput) pinInput.focus();
});
