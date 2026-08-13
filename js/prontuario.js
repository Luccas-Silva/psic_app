/**
 * PsicAPP - Prontuário Eletrônico & Registro Clínico
 * Suporte completo a busca em tempo real, seleção de paciente, resumo,
 * novos registros/modelos (TCC, Psicanálise, Anamnese, Livre), edição, exclusão e timeline.
 */

let selectedPatientId = null;

function renderProntuario() {
    renderPatientGrid();
    if (selectedPatientId) {
        selectPatientForProntuario(selectedPatientId);
    } else if (window.appData && window.appData.patients && window.appData.patients.length > 0) {
        selectPatientForProntuario(window.appData.patients[0].id);
    } else {
        renderEmptyProntuarioState();
    }
}

function renderPatientGrid() {
    const container = document.getElementById('prontuarioPatientGrid') || document.getElementById('patientGrid');
    if (!container) return;

    const searchInput = document.getElementById('prontuarioSearchInput') || document.getElementById('patientSearchInput');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const patients = (window.appData && window.appData.patients) ? window.appData.patients : [];

    const filtered = patients.filter(p => {
        const name = (p.name || '').toLowerCase();
        const cpf = (p.cpf || '').toLowerCase();
        const prof = (p.profession || '').toLowerCase();
        const notes = (p.notes || '').toLowerCase();
        return name.includes(query) || cpf.includes(query) || prof.includes(query) || notes.includes(query);
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-stone-400 text-xs col-span-full">Nenhum paciente encontrado.</div>';
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const isSelected = p.id === selectedPatientId;
        const activeClass = isSelected ? 'border-gold-500 bg-gold-50/50 shadow-xs ring-1 ring-gold-400' : 'border-pastel-border bg-white hover:border-gold-300';
        const initial = p.name ? p.name.charAt(0).toUpperCase() : 'P';
        const freq = p.consultationFrequency || p.frequency || 'Semanal';
        const phone = p.phone || 'Sem fone';

        html += '<div onclick="selectPatientForProntuario(\'' + p.id + '\')" class="p-3 rounded-xl border ' + activeClass + ' cursor-pointer transition flex items-center justify-between group">' +
            '<div class="flex items-center gap-2.5 min-w-0">' +
                '<div class="w-8 h-8 rounded-xl ' + (isSelected ? 'bg-gold-500 text-white' : 'bg-gold-100 text-gold-800') + ' font-bold flex items-center justify-center text-xs shrink-0">' + initial + '</div>' +
                '<div class="truncate">' +
                    '<p class="font-semibold text-stone-800 text-xs truncate">' + p.name + '</p>' +
                    '<p class="text-[10px] text-stone-500 truncate">' + freq + ' • ' + phone + '</p>' +
                '</div>' +
            '</div>' +
            '<i class="fa-solid fa-chevron-right text-xs ' + (isSelected ? 'text-gold-600' : 'text-stone-300 group-hover:text-gold-500') + ' shrink-0 ml-1"></i>' +
        '</div>';
    });

    container.innerHTML = html;
}

function filterPatientsProntuario() {
    renderPatientGrid();
}

const filterPatientList = filterPatientsProntuario;

function togglePatientSearchCard() {
    const body = document.getElementById('patientSearchBody');
    const txt = document.getElementById('txtTogglePatientCard');
    const icon = document.getElementById('iconTogglePatientCard');

    if (!body) return;

    if (body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        if (txt) txt.innerText = 'Recolher Lista';
        if (icon) icon.className = 'fa-solid fa-chevron-up';
    } else {
        body.classList.add('hidden');
        if (txt) txt.innerText = 'Expandir Lista';
        if (icon) icon.className = 'fa-solid fa-chevron-down';
    }
}

function calculateAge(birthDateStr) {
    if (!birthDateStr) return '--';
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return '--';
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
}

function selectPatientForProntuario(patientId) {
    selectedPatientId = patientId;
    renderPatientGrid();

    const patient = window.appData && window.appData.patients ? window.appData.patients.find(p => p.id === patientId) : null;
    if (!patient) return;

    renderPatientSummaryCard(patient);
    cancelEditEvolution();
    renderEvolutionTimeline(patientId);
}

function renderPatientSummaryCard(p) {
    const container = document.getElementById('patientSummaryCard');
    if (!container) return;

    const age = calculateAge(p.birthDate);
    const valueNum = parseFloat(p.value !== undefined ? p.value : (p.price || 220));
    const valueFormatted = isNaN(valueNum) ? '220,00' : valueNum.toFixed(2).replace('.', ',');
    const initial = p.name ? p.name.charAt(0).toUpperCase() : 'P';
    const statusText = p.status || 'Ativo';
    const statusClass = statusText === 'Inativo' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800';

    let html = '<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">' +
        '<div class="flex items-center gap-3.5">' +
            '<div class="w-12 h-12 rounded-2xl bg-gold-100 border border-gold-300 text-gold-800 font-extrabold text-lg flex items-center justify-center shadow-xs">' + initial + '</div>' +
            '<div>' +
                '<div class="flex items-center gap-2">' +
                    '<h2 class="text-base font-bold text-stone-800">' + p.name + '</h2>' +
                    '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ' + statusClass + '">' + statusText + '</span>' +
                '</div>' +
                '<p class="text-xs text-stone-500 mt-0.5">' +
                    '<span class="font-medium text-stone-700">' + (p.profession || 'Profissão não informada') + '</span> • ' +
                    '<span>' + age + ' anos</span> • ' +
                    '<span>CPF: ' + (p.cpf || 'Não informado') + '</span>' +
                '</p>' +
            '</div>' +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-2">' +
            '<button onclick="openEditPatientModal(\'' + p.id + '\')" class="px-3.5 py-1.5 text-xs font-semibold text-gold-800 bg-gold-50 border border-gold-200 hover:bg-gold-100 rounded-xl transition cursor-pointer flex items-center gap-1.5">' +
                '<i class="fa-solid fa-user-pen"></i><span>Editar Cadastro</span>' +
            '</button>' +
            '<button onclick="confirmDeletePatient(\'' + p.id + '\')" class="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition cursor-pointer flex items-center gap-1.5">' +
                '<i class="fa-solid fa-trash-can"></i><span>Excluir Paciente</span>' +
            '</button>' +
        '</div>' +
    '</div>' +
    '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">' +
        '<div class="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">' +
            '<span class="block text-[10px] text-stone-400 font-bold uppercase">Telefone / Whats</span>' +
            '<span class="font-semibold text-stone-800">' + (p.phone || 'Não informado') + '</span>' +
        '</div>' +
        '<div class="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">' +
            '<span class="block text-[10px] text-stone-400 font-bold uppercase">Frequência</span>' +
            '<span class="font-semibold text-stone-800">' + (p.consultationFrequency || p.frequency || 'Semanal') + '</span>' +
        '</div>' +
        '<div class="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">' +
            '<span class="block text-[10px] text-stone-400 font-bold uppercase">Valor Sessão</span>' +
            '<span class="font-bold text-emerald-700">R$ ' + valueFormatted + '</span>' +
        '</div>' +
        '<div class="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">' +
            '<span class="block text-[10px] text-stone-400 font-bold uppercase">E-mail</span>' +
            '<span class="font-semibold text-stone-800 truncate block">' + (p.email || 'Não informado') + '</span>' +
        '</div>' +
    '</div>';

    if (p.notes) {
        html += '<div class="mt-3 p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900">' +
            '<span class="font-bold text-[10px] uppercase text-amber-700 block mb-0.5"><i class="fa-solid fa-note-sticky mr-1"></i> Demanda Inicial / Anotações:</span>' +
            '<p>' + p.notes + '</p>' +
        '</div>';
    }

    container.innerHTML = html;
}

function renderEvolutionTimeline(patientId) {
    const container = document.getElementById('evolutionTimeline') || document.getElementById('evolutionTimelineContainer');
    if (!container) return;

    const evolutions = (window.appData && window.appData.evolutions ? window.appData.evolutions : [])
        .filter(e => e.patientId === patientId)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (evolutions.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-stone-400 text-xs bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 space-y-2">' +
            '<i class="fa-solid fa-folder-open text-3xl text-stone-300"></i>' +
            '<p class="font-bold text-stone-600">Nenhuma evolução clínica registrada para este paciente.</p>' +
            '<p class="text-[11px] text-stone-400">Preencha o formulário acima para registrar a primeira evolução do atendimento.</p>' +
        '</div>';
        return;
    }

    let html = '';
    evolutions.forEach((evo, idx) => {
        const displayDate = evo.date ? evo.date.split('-').reverse().join('/') : '';
        const sessionNum = evo.sessionNumber || (evolutions.length - idx);

        html += '<div class="p-4 bg-white rounded-2xl border border-pastel-border shadow-xs relative hover:border-gold-300 transition space-y-2.5">' +
            '<div class="flex items-center justify-between pb-2 border-b border-stone-100 flex-wrap gap-2">' +
                '<div class="flex items-center gap-2 flex-wrap">' +
                    '<span class="px-2.5 py-0.5 rounded-md bg-gold-100 text-gold-800 font-bold text-[11px] border border-gold-200">Sessão #' + sessionNum + '</span>' +
                    '<span class="text-xs text-stone-600 font-semibold"><i class="fa-regular fa-calendar-alt text-gold-600 mr-1"></i>' + displayDate + '</span>' +
                    '<span class="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase">' + (evo.model || 'TCC') + '</span>' +
                    '<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">' + (evo.mood || 'Tranquilo / Calmo') + '</span>' +
                '</div>' +
                '<div class="flex items-center gap-1">' +
                    '<button onclick="editEvolution(\'' + evo.id + '\')" class="p-1.5 text-stone-400 hover:text-gold-700 text-xs rounded-lg hover:bg-gold-50 transition cursor-pointer" title="Editar Registro"><i class="fa-solid fa-pen-to-square"></i></button>' +
                    '<button onclick="deleteEvolution(\'' + evo.id + '\')" class="p-1.5 text-stone-400 hover:text-rose-600 text-xs rounded-lg hover:bg-rose-50 transition cursor-pointer" title="Excluir Registro"><i class="fa-solid fa-trash-can"></i></button>' +
                '</div>' +
            '</div>' +
            '<div class="text-xs text-stone-700 leading-relaxed whitespace-pre-line font-medium bg-stone-50/40 p-3 rounded-xl border border-stone-100">' + (evo.content || 'Sem anotações.') + '</div>' +
        '</div>';
    });

    container.innerHTML = html;
}

function changeEvoTemplate() {
    const modelSelect = document.getElementById('evoModelSelect');
    const textarea = document.getElementById('evoContentTextarea');
    if (!modelSelect || !textarea) return;

    const val = modelSelect.value;
    
    if (textarea.value.trim() !== '') {
        if (!confirm('Deseja substituir o texto atual pelo modelo selecionado?')) return;
    }

    if (val === 'TCC') {
        textarea.value = "Gatilho / Situação: \nPensamento Automático: \nEmoção / Reação Comportamental: \nReestruturação Cognitiva & Conduta: ";
    } else if (val === 'Psicanálise') {
        textarea.value = "Associação Livre: \nTransferência / Resistência: \nFoco Analítico / Interpretação: ";
    } else if (val === 'Anamnese') {
        textarea.value = "Queixa Principal: \nHistórico Familiar / Pessoal: \nSintomatologia Atual: \nPlano Terapêutico: ";
    } else if (val === 'Livre') {
        textarea.value = "";
    }
}

const applyEvolutionModel = changeEvoTemplate;

function handleSaveEvolution(e) {
    if (e) e.preventDefault();

    if (!selectedPatientId) {
        if (typeof window.showToast === 'function') window.showToast('Selecione um paciente para salvar a evolução.', 'error');
        return;
    }

    const editingId = document.getElementById('editingEvoId') ? document.getElementById('editingEvoId').value : '';
    const date = (document.getElementById('evoDateInput') ? document.getElementById('evoDateInput').value : '') || new Date().toISOString().split('T')[0];
    const model = (document.getElementById('evoModelSelect') ? document.getElementById('evoModelSelect').value : '') || 'TCC';
    const moodEl = document.getElementById('evoMoodInput') || document.getElementById('evoMoodSelect');
    const mood = moodEl ? moodEl.value : 'Tranquilo / Calmo';
    const content = (document.getElementById('evoContentTextarea') ? document.getElementById('evoContentTextarea').value : '') || '';

    if (!content.trim()) {
        if (typeof window.showToast === 'function') window.showToast('Preencha o registro da sessão.', 'error');
        return;
    }

    if (editingId) {
        const evo = window.appData && window.appData.evolutions ? window.appData.evolutions.find(item => item.id === editingId) : null;
        if (evo) {
            evo.date = date;
            evo.model = model;
            evo.mood = mood;
            evo.content = content;
            if (typeof window.showToast === 'function') window.showToast('Evolução clínica atualizada com sucesso!', 'success');
        }
    } else {
        const patientEvos = window.appData && window.appData.evolutions ? window.appData.evolutions.filter(item => item.patientId === selectedPatientId) : [];
        const nextSessionNum = patientEvos.length + 1;
        const patObj = window.appData && window.appData.patients ? window.appData.patients.find(p => p.id === selectedPatientId) : null;

        const newEvo = {
            id: 'EVO-' + Date.now(),
            patientId: selectedPatientId,
            patientName: patObj ? patObj.name : 'Paciente',
            date: date,
            sessionNumber: nextSessionNum,
            model: model,
            mood: mood,
            content: content
        };

        if (!window.appData.evolutions) window.appData.evolutions = [];
        window.appData.evolutions.push(newEvo);
        if (typeof window.showToast === 'function') window.showToast('Evolução clínica salva com sucesso!', 'success');
    }

    if (typeof window.saveAppData === 'function') window.saveAppData();
    cancelEditEvolution();
    renderEvolutionTimeline(selectedPatientId);
}

const saveClinicalEvolution = handleSaveEvolution;

function editEvolution(evoId) {
    const evo = window.appData && window.appData.evolutions ? window.appData.evolutions.find(item => item.id === evoId) : null;
    if (!evo) return;

    const editingInput = document.getElementById('editingEvoId');
    if (editingInput) editingInput.value = evo.id;

    const dateInput = document.getElementById('evoDateInput');
    if (dateInput) dateInput.value = evo.date || new Date().toISOString().split('T')[0];

    const modelSelect = document.getElementById('evoModelSelect');
    if (modelSelect) modelSelect.value = evo.model || 'TCC';

    const moodSelect = document.getElementById('evoMoodInput') || document.getElementById('evoMoodSelect');
    if (moodSelect) moodSelect.value = evo.mood || 'Tranquilo / Calmo';

    const textarea = document.getElementById('evoContentTextarea');
    if (textarea) textarea.value = evo.content || '';

    const titleEl = document.getElementById('evoFormTitle');
    if (titleEl) titleEl.innerText = 'Editar Evolução Clínica (#Sessão ' + (evo.sessionNumber || '') + ')';

    const btnSaveText = document.getElementById('btnSaveEvoText');
    if (btnSaveText) btnSaveText.innerText = 'Atualizar Evolução';

    const btnCancel = document.getElementById('btnCancelEditEvo');
    if (btnCancel) btnCancel.classList.remove('hidden');

    const formCard = document.getElementById('evolutionFormCard');
    if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
        const ta = document.getElementById('evoContentTextarea');
        if (ta) ta.focus();
    }, 300);

    if (typeof window.showToast === 'function') window.showToast('Modo de edição de evolução ativado.', 'info');
}

function cancelEditEvolution() {
    const editingInput = document.getElementById('editingEvoId');
    if (editingInput) editingInput.value = '';

    const dateInput = document.getElementById('evoDateInput');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const textarea = document.getElementById('evoContentTextarea');
    if (textarea) textarea.value = '';

    const titleEl = document.getElementById('evoFormTitle');
    if (titleEl) titleEl.innerText = 'Nova Evolução Clínica';

    const btnSaveText = document.getElementById('btnSaveEvoText');
    if (btnSaveText) btnSaveText.innerText = 'Salvar Evolução';

    const btnCancel = document.getElementById('btnCancelEditEvo');
    if (btnCancel) btnCancel.classList.add('hidden');
}

const resetEvolutionForm = cancelEditEvolution;

function deleteEvolution(evoId) {
    if (!confirm('Tem certeza que deseja excluir este registro de evolução clínica?')) return;

    if (window.appData && window.appData.evolutions) {
        window.appData.evolutions = window.appData.evolutions.filter(e => e.id !== evoId);
    }
    if (typeof window.saveAppData === 'function') window.saveAppData();
    renderEvolutionTimeline(selectedPatientId);
    if (typeof window.showToast === 'function') window.showToast('Registro de evolução excluído.', 'success');
}

function openEditPatientModal(patientId) {
    openPatientModal(patientId);
}

function openPatientModal(patientId) {
    const modal = document.getElementById('patientModal');
    if (!modal) return;

    const idInput = document.getElementById('patientFormId') || document.getElementById('patientModalId');
    const nameInput = document.getElementById('patientName') || document.getElementById('patientModalName');
    const cpfInput = document.getElementById('patientCpf') || document.getElementById('patientModalCpf');
    const phoneInput = document.getElementById('patientPhone') || document.getElementById('patientModalPhone');
    const emailInput = document.getElementById('patientEmail');
    const birthInput = document.getElementById('patientBirthDate') || document.getElementById('patientModalBirth');
    const profInput = document.getElementById('patientProfession');
    const freqInput = document.getElementById('patientFrequency') || document.getElementById('patientModalFrequency');
    const valueInput = document.getElementById('patientValue') || document.getElementById('patientModalPrice');
    const notesInput = document.getElementById('patientNotes');

    if (patientId && window.appData && window.appData.patients) {
        const p = window.appData.patients.find(item => item.id === patientId);
        if (p) {
            if (idInput) idInput.value = p.id;
            if (nameInput) nameInput.value = p.name || '';
            if (cpfInput) cpfInput.value = p.cpf || '';
            if (phoneInput) phoneInput.value = p.phone || '';
            if (emailInput) emailInput.value = p.email || '';
            if (birthInput) birthInput.value = p.birthDate || '';
            if (profInput) profInput.value = p.profession || '';
            if (freqInput) freqInput.value = p.consultationFrequency || p.frequency || 'Semanal';
            if (valueInput) valueInput.value = p.value !== undefined ? p.value : (p.price || 220);
            if (notesInput) notesInput.value = p.notes || '';
        }
    } else {
        if (idInput) idInput.value = '';
        if (nameInput) nameInput.value = '';
        if (cpfInput) cpfInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (emailInput) emailInput.value = '';
        if (birthInput) birthInput.value = '';
        if (profInput) profInput.value = '';
        if (freqInput) freqInput.value = 'Semanal';
        if (valueInput) valueInput.value = 220;
        if (notesInput) notesInput.value = '';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closePatientModal() {
    const modal = document.getElementById('patientModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function savePatient(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('patientFormId') || document.getElementById('patientModalId');
    const editingId = idInput ? idInput.value : '';

    const nameEl = document.getElementById('patientName') || document.getElementById('patientModalName');
    const name = nameEl ? nameEl.value : '';
    const cpfEl = document.getElementById('patientCpf') || document.getElementById('patientModalCpf');
    const cpf = cpfEl ? cpfEl.value : '';
    const phoneEl = document.getElementById('patientPhone') || document.getElementById('patientModalPhone');
    const phone = phoneEl ? phoneEl.value : '';
    const emailEl = document.getElementById('patientEmail');
    const email = emailEl ? emailEl.value : '';
    const birthEl = document.getElementById('patientBirthDate') || document.getElementById('patientModalBirth');
    const birthDate = birthEl ? birthEl.value : '';
    const profEl = document.getElementById('patientProfession');
    const profession = profEl ? profEl.value : '';
    const freqEl = document.getElementById('patientFrequency') || document.getElementById('patientModalFrequency');
    const frequency = freqEl ? freqEl.value : 'Semanal';
    const valEl = document.getElementById('patientValue') || document.getElementById('patientModalPrice');
    const value = parseFloat(valEl ? valEl.value : 220);
    const notesEl = document.getElementById('patientNotes');
    const notes = notesEl ? notesEl.value : '';

    if (!name.trim()) {
        if (typeof window.showToast === 'function') window.showToast('Nome do paciente é obrigatório.', 'error');
        return;
    }

    if (editingId && window.appData && window.appData.patients) {
        const p = window.appData.patients.find(item => item.id === editingId);
        if (p) {
            p.name = name;
            p.cpf = cpf;
            p.phone = phone;
            p.email = email;
            p.birthDate = birthDate;
            p.profession = profession;
            p.consultationFrequency = frequency;
            p.frequency = frequency;
            p.value = value;
            p.price = value;
            p.notes = notes;
            if (typeof window.showToast === 'function') window.showToast('Cadastro do paciente atualizado!', 'success');
        }
    } else {
        if (!window.appData.patients) window.appData.patients = [];
        const newPatient = {
            id: 'P00' + (window.appData.patients.length + 1),
            name: name,
            cpf: cpf,
            phone: phone,
            email: email,
            birthDate: birthDate,
            profession: profession,
            consultationFrequency: frequency,
            frequency: frequency,
            value: value,
            price: value,
            notes: notes,
            status: 'Ativo',
            active: true,
            createdAt: new Date().toISOString().split('T')[0]
        };
        window.appData.patients.push(newPatient);
        selectedPatientId = newPatient.id;
        if (typeof window.showToast === 'function') window.showToast('Novo paciente cadastrado!', 'success');
    }

    if (typeof window.saveAppData === 'function') window.saveAppData();
    if (typeof window.populatePatientSelects === 'function') window.populatePatientSelects();

    closePatientModal();
    renderProntuario();
}

function confirmDeletePatient(patientId) {
    const idToDelete = patientId || selectedPatientId;
    if (!idToDelete) return;

    const p = window.appData && window.appData.patients ? window.appData.patients.find(item => item.id === idToDelete) : null;
    if (!p) return;

    if (!confirm('Tem certeza que deseja excluir o paciente "' + p.name + '" e todos os seus registros?')) return;

    if (window.appData) {
        if (window.appData.patients) window.appData.patients = window.appData.patients.filter(item => item.id !== idToDelete);
        if (window.appData.evolutions) window.appData.evolutions = window.appData.evolutions.filter(item => item.patientId !== idToDelete);
        if (window.appData.appointments) window.appData.appointments = window.appData.appointments.filter(item => item.patientId !== idToDelete);
    }

    selectedPatientId = (window.appData && window.appData.patients && window.appData.patients.length > 0) ? window.appData.patients[0].id : null;

    if (typeof window.saveAppData === 'function') window.saveAppData();
    if (typeof window.populatePatientSelects === 'function') window.populatePatientSelects();

    renderProntuario();
    if (typeof window.showToast === 'function') window.showToast('Paciente e histórico excluídos com sucesso.', 'success');
}

function renderEmptyProntuarioState() {
    const container = document.getElementById('evolutionTimeline') || document.getElementById('evolutionTimelineContainer');
    if (container) {
        container.innerHTML = '<div class="p-8 text-center text-stone-400 text-xs bg-white rounded-2xl border border-pastel-border space-y-3">' +
            '<i class="fa-solid fa-user-plus text-3xl text-stone-300"></i>' +
            '<p class="font-bold text-stone-700">Nenhum paciente cadastrado no sistema.</p>' +
            '<button onclick="openPatientModal()" class="px-4 py-2 gold-gradient text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition">' +
                '+ Cadastrar Primeiro Paciente' +
            '</button>' +
        '</div>';
    }
}

window.renderProntuario = renderProntuario;
window.filterPatientsProntuario = filterPatientsProntuario;
window.filterPatientList = filterPatientsProntuario;
window.togglePatientSearchCard = togglePatientSearchCard;
window.selectPatientForProntuario = selectPatientForProntuario;
window.handleSaveEvolution = handleSaveEvolution;
window.saveClinicalEvolution = handleSaveEvolution;
window.editEvolution = editEvolution;
window.deleteEvolution = deleteEvolution;
window.cancelEditEvolution = cancelEditEvolution;
window.resetEvolutionForm = cancelEditEvolution;
window.changeEvoTemplate = changeEvoTemplate;
window.applyEvolutionModel = changeEvoTemplate;
window.openPatientModal = openPatientModal;
window.openEditPatientModal = openEditPatientModal;
window.closePatientModal = closePatientModal;
window.savePatient = savePatient;
window.confirmDeletePatient = confirmDeletePatient;
