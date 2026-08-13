/**
 * PsicAPP - Controle Financeiro & Lançamentos
 * Módulo de Controle Financeiro, KPIs, Pesquisa Avançada (Nome/CPF) e Recibos PDF.
 */

function cleanCpf(str) {
    return String(str || '').replace(/\D/g, '');
}

function updateFinancialKPIs(transactions) {
    const allTx = transactions || (window.appData ? window.appData.transactions : []) || [];

    let totalFaturamento = 0;
    let totalPago = 0;
    let totalPendente = 0;
    let totalRecibos = 0;

    allTx.forEach(t => {
        const val = parseFloat(t.amount !== undefined ? t.amount : (t.value || 0)) || 0;
        const st = String(t.status || 'pago').toLowerCase().trim();

        totalFaturamento += val;

        if (st === 'pago' || st === 'concluído' || st === 'recebido') {
            totalPago += val;
            totalRecibos++;
        } else if (st === 'pendente' || st === 'a receber' || st === 'aguardando') {
            totalPendente += val;
        }
    });

    const elTotal = document.getElementById('finKpiTotal');
    if (elTotal) {
        elTotal.innerText = `R$ ${totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const elPago = document.getElementById('finKpiPago');
    if (elPago) {
        elPago.innerText = `R$ ${totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const elPendente = document.getElementById('finKpiPendente');
    if (elPendente) {
        elPendente.innerText = `R$ ${totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const elRecibos = document.getElementById('finKpiRecibosCount');
    if (elRecibos) {
        elRecibos.innerText = totalRecibos;
    }
}

function renderFinanceiro() {
    renderFinancialTable();
}

function renderFinancialTable() {
    const tbody = document.getElementById('financialTableBody');
    if (!tbody) return;

    const queryInput = document.getElementById('finSearchInput') || document.getElementById('financialSearchInput');
    const rawQuery = (queryInput ? queryInput.value : '').trim();
    const query = rawQuery.toLowerCase();
    const queryCleanCpf = cleanCpf(rawQuery);

    const patientFilterSelect = document.getElementById('finPatientFilter');
    const selectedPatientId = patientFilterSelect ? patientFilterSelect.value : 'ALL';

    const statusFilterSelect = document.getElementById('finStatusFilter') || document.getElementById('financialStatusFilter');
    const filterStatus = statusFilterSelect ? statusFilterSelect.value : 'ALL';

    let transactions = (window.appData && window.appData.transactions) ? [...window.appData.transactions] : [];
    const patients = (window.appData && window.appData.patients) ? window.appData.patients : [];

    // Atualiza KPIs com a lista geral
    updateFinancialKPIs(transactions);

    // 1. Filtro por Paciente
    if (selectedPatientId && selectedPatientId !== 'ALL') {
        transactions = transactions.filter(t => t.patientId === selectedPatientId);
    }

    // 2. Filtro por Status
    if (filterStatus && filterStatus !== 'ALL' && filterStatus !== 'todos') {
        const targetStatus = filterStatus.toLowerCase();
        transactions = transactions.filter(t => {
            const st = String(t.status || '').toLowerCase();
            if (targetStatus === 'pago') return st === 'pago' || st === 'concluído';
            if (targetStatus === 'pendente') return st === 'pendente' || st === 'a receber';
            return st === targetStatus;
        });
    }

    // 3. Filtro Textual por Nome e CPF
    if (query) {
        transactions = transactions.filter(t => {
            const patientObj = patients.find(p => p.id === t.patientId) || {};
            const pName = String(t.patientName || patientObj.name || '').toLowerCase();
            const pCpfRaw = String(t.cpf || patientObj.cpf || '');
            const pCpfClean = cleanCpf(pCpfRaw);
            const desc = String(t.description || t.desc || '').toLowerCase();

            const matchesName = pName.includes(query);
            const matchesDesc = desc.includes(query);
            const matchesCpfRaw = pCpfRaw.toLowerCase().includes(query);
            const matchesCpfClean = queryCleanCpf.length > 0 && pCpfClean.includes(queryCleanCpf);

            return matchesName || matchesDesc || matchesCpfRaw || matchesCpfClean;
        });
    }

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-slate-400 text-xs">
                    <i class="fas fa-receipt text-2xl text-slate-300 mb-2 block"></i>
                    Nenhum lançamento financeiro encontrado com os filtros aplicados.
                </td>
            </tr>`;
        return;
    }

    let html = '';
    transactions.sort((a, b) => (b.date || '').localeCompare(a.date || '')).forEach(t => {
        const patientObj = patients.find(p => p.id === t.patientId) || {};
        const cpfDisplay = t.cpf || patientObj.cpf || 'Não informado';
        const st = String(t.status || 'pago').toLowerCase();
        const isPaid = st === 'pago' || st === 'concluído';

        const badgeClass = isPaid 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
            : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';

        const displayStatusText = isPaid ? 'Pago' : 'Pendente';
        const displayDate = t.date ? t.date.split('-').reverse().join('/') : '--/--/----';
        const amountNum = parseFloat(t.amount !== undefined ? t.amount : (t.value || 0)) || 0;

        html += `
            <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3 text-slate-500 font-medium">${displayDate}</td>
                <td class="p-3">
                    <div class="font-bold text-slate-800">${t.patientName || patientObj.name || 'Paciente Geral'}</div>
                    <div class="text-[10px] text-slate-400">CPF: ${cpfDisplay}</div>
                </td>
                <td class="p-3 text-slate-600 font-medium">${t.description || t.desc || 'Sessão de Psicoterapia'}</td>
                <td class="p-3 font-extrabold text-slate-800">R$ ${amountNum.toFixed(2).replace('.', ',')}</td>
                <td class="p-3 text-center">
                    <button onclick="toggleTransactionStatus('${t.id}')" class="px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer border transition-all ${badgeClass}" title="Clique para alternar status">
                        <i class="fas ${isPaid ? 'fa-check-circle' : 'fa-clock'} mr-1"></i>${displayStatusText}
                    </button>
                </td>
                <td class="p-3 text-right space-x-1">
                    <button onclick="openReceiptModal('${t.id}')" class="px-2.5 py-1 text-gold-700 bg-gold-50 hover:bg-gold-100 rounded-xl font-bold transition border border-gold-200 cursor-pointer" title="Emitir Recibo">
                        <i class="fas fa-file-invoice mr-1"></i>Recibo
                    </button>
                    <button onclick="deleteTransaction('${t.id}')" class="px-2 py-1 text-slate-400 hover:text-rose-600 rounded-xl font-semibold transition cursor-pointer" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
}

function filterFinancialTable() {
    renderFinancialTable();
}

function toggleTransactionStatus(id) {
    if (!window.appData || !window.appData.transactions) return;
    const t = window.appData.transactions.find(item => item.id === id);
    if (!t) return;

    const currentSt = String(t.status || 'pago').toLowerCase();
    t.status = (currentSt === 'pago' || currentSt === 'concluído') ? 'pendente' : 'pago';

    if (typeof window.saveAppData === 'function') window.saveAppData();
    renderFinanceiro();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    if (typeof window.showToast === 'function') {
        const displaySt = t.status === 'pago' ? 'Pago' : 'Pendente';
        window.showToast(`Status do lançamento alterado para: ${displaySt}`, 'info');
    }
}

function deleteTransaction(id) {
    if (!confirm('Tem certeza que deseja excluir este lançamento financeiro?')) return;

    if (window.appData && window.appData.transactions) {
        window.appData.transactions = window.appData.transactions.filter(item => item.id !== id);
    }

    if (typeof window.saveAppData === 'function') window.saveAppData();
    renderFinanceiro();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    if (typeof window.showToast === 'function') window.showToast('Lançamento financeiro excluído.', 'success');
}

// Modal de Novo Lançamento
function openNewTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (!modal) return;

    const select = document.getElementById('txModalPatient') || document.getElementById('transPatientSelect');
    if (select) {
        let html = '<option value="">Selecione um paciente...</option>';
        const patients = (window.appData && window.appData.patients) ? window.appData.patients : [];
        patients.forEach(p => {
            const cpfStr = p.cpf ? ` - CPF: ${p.cpf}` : '';
            html += `<option value="${p.id}" data-name="${p.name}">${p.name}${cpfStr}</option>`;
        });
        select.innerHTML = html;
    }

    const dateInput = document.getElementById('txModalDate') || document.getElementById('transDateInput');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const amountInput = document.getElementById('txModalAmount') || document.getElementById('transAmountInput');
    if (amountInput) amountInput.value = '220';

    const descInput = document.getElementById('txModalDesc') || document.getElementById('transDescInput');
    if (descInput) descInput.value = 'Sessão de Psicoterapia Individual';

    const statusInput = document.getElementById('txModalStatus') || document.getElementById('transStatusSelect');
    if (statusInput) statusInput.value = 'pago';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeTransactionModal() {
    const modal = document.getElementById('transactionModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleTransactionSubmit(e) {
    if (e) e.preventDefault();

    const patientSelect = document.getElementById('txModalPatient') || document.getElementById('transPatientSelect');
    const patientId = patientSelect ? patientSelect.value : '';

    const date = (document.getElementById('txModalDate') || document.getElementById('transDateInput'))?.value || new Date().toISOString().split('T')[0];
    const amount = parseFloat((document.getElementById('txModalAmount') || document.getElementById('transAmountInput'))?.value || 0);
    const desc = (document.getElementById('txModalDesc') || document.getElementById('transDescInput'))?.value || 'Sessão de Psicoterapia Individual';
    const status = (document.getElementById('txModalStatus') || document.getElementById('transStatusSelect'))?.value || 'pago';

    if (!amount || amount <= 0) {
        if (typeof window.showToast === 'function') window.showToast('Informe um valor válido para o lançamento.', 'error');
        return;
    }

    const patientObj = (window.appData && window.appData.patients) ? window.appData.patients.find(p => p.id === patientId) : null;
    const patientName = patientObj ? patientObj.name : 'Paciente Geral';
    const patientCpf = patientObj ? patientObj.cpf : '';

    const newTransaction = {
        id: 'T' + String(Date.now()).slice(-6),
        patientId: patientId || '',
        patientName: patientName,
        cpf: patientCpf,
        date: date,
        description: desc,
        category: 'Sessão Individual',
        amount: amount,
        value: amount,
        status: status.toLowerCase(),
        paymentMethod: 'Pix'
    };

    if (!window.appData.transactions) window.appData.transactions = [];
    window.appData.transactions.push(newTransaction);

    if (typeof window.saveAppData === 'function') window.saveAppData();
    closeTransactionModal();
    renderFinanceiro();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    if (typeof window.showToast === 'function') window.showToast('Novo lançamento financeiro salvo com sucesso!', 'success');
}

const handleSaveTransaction = handleTransactionSubmit;

// Emissão de Recibo PDF / Impressão
function openReceiptModal(transactionId) {
    if (!window.appData || !window.appData.transactions) return;
    const t = window.appData.transactions.find(item => item.id === transactionId);
    if (!t) return;

    const therapist = window.appData.therapist || window.appData.doctor || {};
    const patient = (window.appData.patients || []).find(p => p.id === t.patientId) || {};

    const displayDate = t.date ? t.date.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
    const amountVal = parseFloat(t.amount !== undefined ? t.amount : (t.value || 0)) || 0;
    const amountFormatted = amountVal.toFixed(2).replace('.', ',');

    const nameEl = document.getElementById('rcptPatientName') || document.getElementById('receiptPatientName');
    if (nameEl) nameEl.innerText = t.patientName || patient.name || 'Paciente';

    const cpfEl = document.getElementById('rcptPatientCPF') || document.getElementById('receiptPatientCpf');
    if (cpfEl) cpfEl.innerText = t.cpf || patient.cpf || 'Não informado';

    const amountEl = document.getElementById('rcptAmount') || document.getElementById('receiptValText');
    if (amountEl) amountEl.innerText = `R$ ${amountFormatted}`;

    const descEl = document.getElementById('rcptDesc');
    if (descEl) descEl.innerText = t.description || t.desc || 'Sessão de Psicoterapia Individual';

    const dateEl = document.getElementById('rcptDate') || document.getElementById('receiptDate');
    if (dateEl) dateEl.innerText = displayDate;

    // Dados da Profissional
    const thNameEl = document.getElementById('rcptTherapistName');
    if (thNameEl) thNameEl.innerText = therapist.name || 'Dra. Anndreane Maliqui';

    const thCrpEl = document.getElementById('rcptTherapistCRP');
    if (thCrpEl) thCrpEl.innerText = therapist.crp || 'CRP 06/123456';

    const thCpfEl = document.getElementById('rcptTherapistCPF');
    if (thCpfEl) thCpfEl.innerText = therapist.cpf ? `CPF: ${therapist.cpf}` : 'CPF: 123.456.789-00';

    const thAddrEl = document.getElementById('rcptTherapistAddress');
    if (thAddrEl) thAddrEl.innerText = therapist.address || 'Santana - São Paulo/SP';

    const modal = document.getElementById('receiptModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function printReceipt() {
    window.print();
}

window.renderFinanceiro = renderFinanceiro;
window.renderFinancialTable = renderFinancialTable;
window.filterFinancialTable = filterFinancialTable;
window.toggleTransactionStatus = toggleTransactionStatus;
window.deleteTransaction = deleteTransaction;
window.openNewTransactionModal = openNewTransactionModal;
window.closeTransactionModal = closeTransactionModal;
window.handleTransactionSubmit = handleTransactionSubmit;
window.handleSaveTransaction = handleSaveTransaction;
window.openReceiptModal = openReceiptModal;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;
