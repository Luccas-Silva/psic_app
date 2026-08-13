/**
 * data.js - Camada de Repositório e Gestão do Estado Global (PsicAPP)
 * Gerencia a persistência no LocalStorage e desacopla a leitura para permitir
 * uma transição simples para Banco de Dados / API REST no futuro.
 */

// Estado Global da Aplicação
window.appData = {
    therapist: {
        name: "Dra. Anndreane Maliqui",
        crp: "06/123456",
        email: "anndreane.psico@email.com",
        phone: "(11) 98765-4321",
        address: "Santana - São Paulo/SP",
        cpf: "123.456.789-00",
        pin: "1234"
    },
    patients: [],
    appointments: [],
    evolutions: [],
    transactions: []
};

// Garantir alias recíproco appData.doctor <-> appData.therapist
try {
    Object.defineProperty(window.appData, 'doctor', {
        get: function() { return this.therapist; },
        set: function(val) { this.therapist = val; },
        configurable: true,
        enumerable: true
    });
} catch(e) {}

// Chave do LocalStorage
const STORAGE_KEY = 'psicapp_data_v2';

/**
 * Salva o estado global atual no LocalStorage
 */
window.saveAppData = window.saveDatabase = function() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.appData));
    } catch (e) {
        console.error("Erro ao salvar dados no LocalStorage:", e);
    }
};

/**
 * Carrega dados iniciais do LocalStorage ou do Seed Data
 */
window.loadAppData = window.loadDatabase = function() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('psicapp_data') || localStorage.getItem('psiapp_data_v2');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
                window.appData.therapist = parsed.therapist || parsed.doctor || window.appData.therapist;
                window.appData.patients = parsed.patients || [];
                window.appData.appointments = parsed.appointments || [];
                window.appData.evolutions = parsed.evolutions || parsed.records || parsed.prontuarios || [];
                
                // Normaliza lançamentos financeiros
                window.appData.transactions = (parsed.transactions || parsed.finance || []).map(t => {
                    return {
                        ...t,
                        amount: t.amount !== undefined ? t.amount : (t.value !== undefined ? t.value : 0),
                        desc: t.desc || t.description || 'Sessão de Psicoterapia',
                        status: (t.status || 'pago').toLowerCase()
                    };
                });

                // Se possui pacientes carregados, valida e finaliza
                if (window.appData.patients.length > 0) return;
            }
        }
    } catch (e) {
        console.warn("Nenhum LocalStorage anterior encontrado, carregando dados padrão...", e);
    }

    // Se não há dados válidos, carrega a camada Repositório/Seed
    window.loadInitialData();
};

/**
 * Abstração de Carregamento Inicial (Seed/Mock Data)
 */
window.loadInitialData = function() {
    if (window.SEED_DATA) {
        const seed = typeof window.SEED_DATA === 'function' ? window.SEED_DATA() : window.SEED_DATA;
        window.appData.therapist = seed.therapist || seed.doctor || window.appData.therapist;
        window.appData.patients = seed.patients || [];
        window.appData.appointments = seed.appointments || [];
        window.appData.evolutions = seed.evolutions || [];
        window.appData.transactions = seed.transactions || [];
        window.saveAppData();
    }
};

/**
 * Restaura o Banco de Dados para os Valores Padrão de Fábrica
 */
window.resetToDefaultData = function() {
    if (confirm("Deseja restaurar os dados iniciais do sistema? Suas alterações serão substituídas pelos dados de demonstração.")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('psicapp_data');
        localStorage.removeItem('psiapp_data_v2');
        window.loadInitialData();
        
        if (typeof window.showToast === 'function') {
            window.showToast("Banco de dados restaurado para os dados padrão!", "success");
        }

        if (typeof window.populatePatientSelects === 'function') {
            window.populatePatientSelects();
        }

        if (typeof window.navigateTo === 'function') {
            window.navigateTo('dashboard');
        }
    }
};

/**
 * Popula dinamicamente todos os elementos <select> de pacientes no sistema
 */
window.populatePatientSelects = function() {
    if (!window.appData || !window.appData.patients) return;

    const patients = window.appData.patients;

    // Select no Modal de Agendamento
    const appModalPatient = document.getElementById('appModalPatient');
    if (appModalPatient) {
        appModalPatient.innerHTML = `<option value="">Selecione um paciente...</option>` +
            patients.map(p => `<option value="${p.id}">${p.name} (${p.consultationFrequency || 'Semanal'})</option>`).join('');
    }

    // Select no Modal de Transação Financeira
    const txModalPatient = document.getElementById('txModalPatient');
    if (txModalPatient) {
        txModalPatient.innerHTML = `<option value="">Selecione um paciente...</option>` +
            patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    // Select no Filtro de Financeiro
    const finPatientFilter = document.getElementById('finPatientFilter');
    if (finPatientFilter) {
        const currentVal = finPatientFilter.value || 'ALL';
        finPatientFilter.innerHTML = `<option value="ALL">Todos os Pacientes</option>` +
            patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        finPatientFilter.value = currentVal;
    }
};

// Inicialização automática do repositório ao carregar o script
window.loadAppData();
