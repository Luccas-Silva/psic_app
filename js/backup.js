/**
 * PsicAPP - Backup, Exportação e Restauração de Dados
 */

function renderBackupView() {
    renderTherapistProfile();
}

function renderTherapistProfile() {
    const t = appData.therapist || {};

    const nameInput = document.getElementById('profNameInput') || document.getElementById('cfgTherapistName');
    if (nameInput) nameInput.value = t.name || 'Dra. Anndreane Maliqui';

    const crpInput = document.getElementById('profCrpInput') || document.getElementById('cfgTherapistCRP');
    if (crpInput) crpInput.value = t.crp || 'CRP 06/123456';

    const phoneInput = document.getElementById('profPhoneInput') || document.getElementById('cfgTherapistPhone');
    if (phoneInput) phoneInput.value = t.phone || '(11) 98765-4321';

    const addressInput = document.getElementById('profAddressInput') || document.getElementById('cfgTherapistAddress');
    if (addressInput) addressInput.value = t.address || 'Santana - São Paulo/SP';

    const pinInput = document.getElementById('profPinInput');
    if (pinInput) pinInput.value = t.pin || localStorage.getItem('psicapp_pin') || '1234';
}

function handleSaveProfile(e) {
    if (e) e.preventDefault();

    if (!appData.therapist) appData.therapist = {};

    const name = document.getElementById('profNameInput')?.value || 'Dra. Anndreane Maliqui';
    const crp = document.getElementById('profCrpInput')?.value || 'CRP 06/123456';
    const phone = document.getElementById('profPhoneInput')?.value || '(11) 98765-4321';
    const address = document.getElementById('profAddressInput')?.value || 'Santana - São Paulo/SP';
    const pin = document.getElementById('profPinInput')?.value || '1234';

    appData.therapist.name = name;
    appData.therapist.crp = crp;
    appData.therapist.phone = phone;
    appData.therapist.address = address;
    appData.therapist.pin = pin;

    localStorage.setItem('psicapp_pin', pin);

    saveAppData();
    showToast('Dados da profissional atualizados com sucesso!', 'success');
}

const saveTherapistConfig = handleSaveProfile;

// Exportar Backup em arquivo JSON
function exportFullSystemBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `psicapp_backup_${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup exportado com sucesso!', 'success');
}

// Importar e Restaurar Banco de Dados via Arquivo JSON
function importFullSystemBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            if (!importedData || typeof importedData !== 'object') {
                throw new Error('Arquivo JSON inválido.');
            }

            appData = {
                patients: importedData.patients || [],
                appointments: importedData.appointments || [],
                evolutions: importedData.evolutions || importedData.records || importedData.prontuarios || [],
                transactions: importedData.transactions || importedData.finance || [],
                therapist: importedData.therapist || importedData.doctor || {
                    name: 'Dra. Anndreane Maliqui',
                    crp: 'CRP 06/123456',
                    phone: '(11) 98765-4321',
                    address: 'Santana - São Paulo/SP',
                    pin: '1234'
                }
            };

            saveAppData();

            if (window.renderDashboard) renderDashboard();
            if (window.renderAgenda) renderAgenda();
            if (window.renderProntuario) renderProntuario();
            if (window.renderFinanceiro) renderFinanceiro();

            showToast('Banco de dados restaurado com sucesso!', 'success');
        } catch (err) {
            console.error('Erro na restauração:', err);
            showToast('Erro ao ler arquivo de backup. Verifique o formato JSON.', 'error');
        }
    };
    reader.readAsText(file);
}

// Restaurar Dados Padrão (Seed)
function resetToInitialSeedData() {
    if (!confirm('Deseja restaurar os dados de demonstração originais? Os dados atuais serão substituídos.')) return;

    if (window.PSICAPP_SEED_DATA) {
        appData = JSON.parse(JSON.stringify(window.PSICAPP_SEED_DATA));
        saveAppData();

        if (window.renderDashboard) renderDashboard();
        if (window.renderAgenda) renderAgenda();
        if (window.renderProntuario) renderProntuario();
        if (window.renderFinanceiro) renderFinanceiro();

        showToast('Dados de demonstração restaurados com sucesso!', 'success');
    } else {
        showToast('Seed de dados não encontrado.', 'error');
    }
}

const resetToDefaultSeedData = resetToInitialSeedData;

window.renderBackupView = renderBackupView;
window.handleSaveProfile = handleSaveProfile;
window.saveTherapistConfig = saveTherapistConfig;
window.exportFullSystemBackup = exportFullSystemBackup;
window.importFullSystemBackup = importFullSystemBackup;
window.resetToInitialSeedData = resetToInitialSeedData;
window.resetToDefaultSeedData = resetToDefaultSeedData;
