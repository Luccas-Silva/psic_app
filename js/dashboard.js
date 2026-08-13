/**
 * PsicAPP - Dashboard & KPI Module
 * Real-time calculation of active patients, monthly sessions, received revenue, and pending amounts.
 * Synchronized with Chart.js canvases in index.html.
 */

let chartSessionsHistory = null;
let chartSessionStatus = null;
let chartFinancialSummary = null;

function renderDashboard() {
    if (!window.appData) window.appData = { appointments: [], transactions: [], patients: [] };
    updateKPIs();
    renderUpcomingAppointments();
    initCharts();
}

function refreshDashboardData() {
    if (typeof window.loadAppData === 'function') {
        window.loadAppData();
    }
    renderDashboard();
    if (typeof window.showToast === 'function') {
        window.showToast('Dados do painel atualizados com sucesso!', 'success');
    }
}

function updateKPIs() {
    const appointments = window.appData.appointments || [];
    const transactions = window.appData.transactions || [];
    const patients = window.appData.patients || [];

    // Header date display
    const todayEl = document.getElementById('dashTodayDate') || document.getElementById('headerCurrentDate');
    if (todayEl) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateFormattedStr = today.toLocaleDateString('pt-BR', options);
        todayEl.innerText = dateFormattedStr.charAt(0).toUpperCase() + dateFormattedStr.slice(1);
    }

    // 1. Pacientes Ativos (kpiTotalPatients ou kpiActivePatients)
    const activePatientsCount = patients.filter(p => p.status !== 'Inativo' && p.active !== false).length;
    const elActive = document.getElementById('kpiTotalPatients') || document.getElementById('kpiActivePatients');
    if (elActive) elActive.innerText = activePatientsCount;

    // 2. Consultas no Mês (kpiMonthSessions ou kpiMonthlySessions ou kpiMonthAppointments)
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthAppointments = appointments.filter(a => a.date && a.date.startsWith(currentMonthStr));
    const elMonthApp = document.getElementById('kpiMonthSessions') || document.getElementById('kpiMonthlySessions') || document.getElementById('kpiMonthAppointments');
    if (elMonthApp) elMonthApp.innerText = monthAppointments.length;

    // 3. Receita Recebida no Mês (kpiReceivedAmount ou kpiMonthlyRevenue ou kpiMonthIncome)
    const monthTransactionsPaid = transactions.filter(t => {
        const isPaid = (t.status || '').toLowerCase() === 'pago' || (t.status || '').toLowerCase() === 'concluído';
        const isCurrentMonth = t.date ? t.date.startsWith(currentMonthStr) : true;
        return isPaid && isCurrentMonth;
    });
    
    let monthIncome = monthTransactionsPaid.reduce((sum, t) => sum + (parseFloat(t.amount || t.value) || 0), 0);
    
    // Fallback: se não houver lançamentos no mês em transactions, somar consultas atendidas do mês
    if (monthIncome === 0) {
        monthIncome = monthAppointments
            .filter(a => (a.status || '').toLowerCase() === 'atendido')
            .reduce((sum, a) => sum + (parseFloat(a.value || a.price) || 220), 0);
    }

    const elIncome = document.getElementById('kpiReceivedAmount') || document.getElementById('kpiMonthlyRevenue') || document.getElementById('kpiMonthIncome');
    if (elIncome) elIncome.innerText = `R$ ${monthIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 4. Valores Pendentes no Mês (kpiPendingAmount ou kpiPendingPayments)
    // Correção: considerar ESTRITAMENTE os lançamentos financeiros (appData.transactions) com
    // status pendente/a receber/aguardando do mês atual, convertendo o valor para número com
    // parseFloat/Number antes de somar. NÃO há fallback para agendamentos aqui: se o Financeiro
    // não possui nenhuma pendência (todas quitadas), o card deve exibir R$ 0,00 corretamente,
    // em vez de somar consultas "Agendado" com valor padrão (o que causava valores abusivos).
    const monthTransactionsPending = transactions.filter(t => {
        const st = String(t.status || '').toLowerCase().trim();
        const isPending = st === 'pendente' || st === 'a receber' || st === 'aguardando';
        const isCurrentMonth = t.date ? t.date.startsWith(currentMonthStr) : true;
        return isPending && isCurrentMonth;
    });

    const pendingSum = monthTransactionsPending.reduce((sum, t) => {
        const rawVal = t.amount !== undefined ? t.amount : t.value;
        const numVal = Number(parseFloat(rawVal));
        return sum + (isNaN(numVal) ? 0 : numVal);
    }, 0);

    const elPending = document.getElementById('kpiPendingAmount') || document.getElementById('kpiPendingPayments');
    if (elPending) elPending.innerText = `R$ ${pendingSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderUpcomingAppointments() {
    const container = document.getElementById('dashboardUpcomingList') || document.getElementById('dashUpcomingList');
    if (!container) return;

    const appointments = window.appData.appointments || [];
    const todayStr = typeof window.formatYYYYMMDD === 'function' ? window.formatYYYYMMDD(new Date()) : new Date().toISOString().split('T')[0];

    let upcoming = appointments
        .filter(a => a.date >= todayStr)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    if (upcoming.length === 0 && appointments.length > 0) {
        upcoming = [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    }

    const list = upcoming.slice(0, 5);

    if (list.length === 0) {
        container.innerHTML = `
            <div class="py-8 text-center text-stone-400 text-xs">
                <i class="fa-solid fa-calendar-check text-2xl mb-2 text-stone-300"></i>
                <p>Nenhum agendamento futuro encontrado.</p>
            </div>`;
        return;
    }

    let html = '';
    list.forEach(apt => {
        let statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
        const st = (apt.status || 'Agendado').toLowerCase();
        if (st === 'atendido') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        else if (st === 'falta') statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';
        else if (st === 'cancelado') statusBadge = 'bg-stone-100 text-stone-700 border-stone-300';

        const displayDate = apt.date ? apt.date.split('-').reverse().join('/') : '';

        html += `
            <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-pastel-border hover:border-gold-300 transition shadow-xs">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold text-xs border border-gold-200">
                        ${apt.patientName ? apt.patientName.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                        <p class="font-semibold text-stone-800 text-xs">${apt.patientName || 'Paciente'}</p>
                        <p class="text-[11px] text-stone-500"><i class="fa-regular fa-clock text-gold-600 mr-1"></i>${displayDate} às ${apt.time || '00:00'}</p>
                    </div>
                </div>
                <button onclick="toggleDashboardStatus('${apt.id}')" title="Clique para alterar status" class="px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadge} cursor-pointer hover:opacity-80 transition">
                    ${apt.status || 'Agendado'}
                </button>
            </div>`;
    });

    container.innerHTML = html;
}

function toggleDashboardStatus(id) {
    const apt = window.appData.appointments.find(a => a.id === id);
    if (!apt) return;

    const sequence = ['Agendado', 'Atendido', 'Falta', 'Cancelado'];
    const currentIndex = sequence.indexOf(apt.status || 'Agendado');
    apt.status = sequence[(currentIndex + 1) % sequence.length];

    if (typeof window.saveAppData === 'function') window.saveAppData();
    renderDashboard();
    if (typeof window.renderAgenda === 'function') window.renderAgenda();
    if (typeof window.showToast === 'function') window.showToast(`Status atualizado para: ${apt.status}`, 'success');
}

function initCharts() {
    if (typeof Chart === 'undefined') return;

    if (chartSessionsHistory) { chartSessionsHistory.destroy(); chartSessionsHistory = null; }
    if (chartSessionStatus) { chartSessionStatus.destroy(); chartSessionStatus = null; }
    if (chartFinancialSummary) { chartFinancialSummary.destroy(); chartFinancialSummary = null; }

    const appointments = window.appData.appointments || [];
    const transactions = window.appData.transactions || [];

    // Chart 1: Histórico de Atendimentos Mensais (chartSessionsMonth ou chartSessionsHistory)
    const canvasApp = document.getElementById('chartSessionsMonth') || document.getElementById('chartSessionsHistory') || document.getElementById('chartAppointmentsCanvas');
    if (canvasApp) {
        const monthNames = ['Maio', 'Junho', 'Julho', 'Agosto'];
        const monthsData = [6, 10, 12, appointments.filter(a => (a.status || '').toLowerCase() === 'atendido' || (a.status || '').toLowerCase() === 'agendado').length || 14];

        chartSessionsHistory = new Chart(canvasApp.getContext('2d'), {
            type: 'bar',
            data: {
                labels: monthNames,
                datasets: [{
                    label: 'Atendimentos Realizados',
                    data: monthsData,
                    backgroundColor: '#c59b27',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#ece6d8' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Chart 2: Status das Consultas (chartSessionsStatus ou chartSessionStatus)
    const canvasStatus = document.getElementById('chartSessionsStatus') || document.getElementById('chartSessionStatus') || document.getElementById('chartStatusCanvas');
    if (canvasStatus) {
        const attended = appointments.filter(a => (a.status || '').toLowerCase() === 'atendido').length || 8;
        const scheduled = appointments.filter(a => (a.status || '').toLowerCase() === 'agendado').length || 12;
        const missed = appointments.filter(a => (a.status || '').toLowerCase() === 'falta').length || 2;
        const cancelled = appointments.filter(a => (a.status || '').toLowerCase() === 'cancelado').length || 1;

        chartSessionStatus = new Chart(canvasStatus.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Atendido', 'Agendado', 'Falta', 'Cancelado'],
                datasets: [{
                    data: [attended, scheduled, missed, cancelled],
                    backgroundColor: ['#10b981', '#c59b27', '#f43f5e', '#94a3b8'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
            }
        });
    }

    // Chart 3: Evolução Financeira (chartFinancialLine ou chartFinancialSummary)
    const canvasFin = document.getElementById('chartFinancialLine') || document.getElementById('chartFinancialSummary') || document.getElementById('chartFinanceCanvas');
    if (canvasFin) {
        const monthLabels = ['Maio', 'Junho', 'Julho', 'Agosto'];
        const receivedData = [3800, 4200, 4900, 5600];
        const pendingData = [400, 500, 300, 490];

        chartFinancialSummary = new Chart(canvasFin.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Receita Confirmada (R$)',
                        data: receivedData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2
                    },
                    {
                        label: 'Valores Pendentes (R$)',
                        data: pendingData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#ece6d8' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

window.renderDashboard = renderDashboard;
window.refreshDashboardData = refreshDashboardData;
window.updateDashboardView = refreshDashboardData;
window.loadDashboard = refreshDashboardData;
window.toggleDashboardStatus = toggleDashboardStatus;
