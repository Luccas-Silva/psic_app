/**
 * PsicAPP - Módulo de Agenda Inteligente (Visões Dia & Semana)
 * Suporte a busca de Paciente por Nome e CPF no Modal de Agendamento.
 * Correção de fuso horário (-3h UTC) por componentes locais (Ano, Mês, Dia).
 * Preservação rigorosa do horário do agendamento durante o Drag & Drop na visão semanal.
 * Lembretes rápidos de consulta via WhatsApp e E-mail na visão diária.
 */

let agendaCurrentDate = new Date();
let currentAgendaView = 'day'; // 'day' ou 'week'
window.userNavigatedAgenda = false;

function parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'object' && dateStr instanceof Date) {
        return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate(), 12, 0, 0);
    }
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, 12, 0, 0);
    }
    return new Date();
}

function formatYYYYMMDD(d) {
    const date = (d instanceof Date) ? d : parseLocalDate(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonday(d) {
    const date = parseLocalDate(d);
    const day = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const diff = (day === 0) ? -6 : (1 - day);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff, 12, 0, 0);
}

function updateAgendaDatePicker() {
    const picker = document.getElementById('agendaDatePicker');
    if (picker) {
        picker.value = formatYYYYMMDD(agendaCurrentDate);
    }
}

function renderAgenda() {
    try {
        if (!window.appData) window.appData = { appointments: [], patients: [] };
        if (!window.appData.appointments) window.appData.appointments = [];

        if (!window.userNavigatedAgenda && window.appData.appointments.length > 0) {
            const todayStr = formatYYYYMMDD(new Date());
            const currentViewStr = formatYYYYMMDD(agendaCurrentDate);

            if (currentAgendaView === 'day') {
                const hasAptsInCurrentDay = window.appData.appointments.some(a => a.date === currentViewStr);
                if (!hasAptsInCurrentDay) {
                    const upcoming = window.appData.appointments
                        .filter(a => a.date >= todayStr)
                        .sort((a, b) => a.date.localeCompare(b.date))[0];
                    const target = upcoming || window.appData.appointments.sort((a, b) => a.date.localeCompare(b.date))[0];
                    if (target && target.date) {
                        agendaCurrentDate = parseLocalDate(target.date);
                    }
                }
            } else {
                const mondayDate = getMonday(agendaCurrentDate);
                const sundayDate = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + 6, 12, 0, 0);
                const monStr = formatYYYYMMDD(mondayDate);
                const sunStr = formatYYYYMMDD(sundayDate);

                const hasAptsInWeek = window.appData.appointments.some(a => a.date >= monStr && a.date <= sunStr);
                if (!hasAptsInWeek) {
                    const upcoming = window.appData.appointments
                        .filter(a => a.date >= todayStr)
                        .sort((a, b) => a.date.localeCompare(b.date))[0];
                    const target = upcoming || window.appData.appointments.sort((a, b) => a.date.localeCompare(b.date))[0];
                    if (target && target.date) {
                        agendaCurrentDate = parseLocalDate(target.date);
                    }
                }
            }
        }

        updateAgendaDatePicker();

        if (currentAgendaView === 'day') {
            renderDayView();
        } else {
            renderWeekView();
        }
    } catch (err) {
        console.error("Erro ao renderizar agenda:", err);
    }
}

function setAgendaView(view) {
    if (view === 'dia' || view === 'day') {
        currentAgendaView = 'day';
    } else if (view === 'semana' || view === 'week') {
        currentAgendaView = 'week';
    }

    const btnDay = document.getElementById('btnViewDay');
    const btnWeek = document.getElementById('btnViewWeek');
    const containerDay = document.getElementById('agendaDayView');
    const containerWeek = document.getElementById('agendaWeekView');

    if (currentAgendaView === 'day') {
        if (btnDay) {
            btnDay.className = "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all bg-white text-gold-800 shadow-xs border border-gold-200 cursor-pointer";
        }
        if (btnWeek) {
            btnWeek.className = "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all text-slate-600 hover:text-slate-800 cursor-pointer";
        }
        if (containerDay) containerDay.classList.remove('hidden');
        if (containerWeek) containerWeek.classList.add('hidden');
    } else {
        if (btnWeek) {
            btnWeek.className = "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all bg-white text-gold-800 shadow-xs border border-gold-200 cursor-pointer";
        }
        if (btnDay) {
            btnDay.className = "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all text-slate-600 hover:text-slate-800 cursor-pointer";
        }
        if (containerWeek) containerWeek.classList.remove('hidden');
        if (containerDay) containerDay.classList.add('hidden');
    }

    renderAgenda();
}

const switchAgendaView = setAgendaView;

function navigateAgenda(offset) {
    window.userNavigatedAgenda = true;
    if (typeof offset === 'number') {
        if (currentAgendaView === 'day') {
            agendaCurrentDate.setDate(agendaCurrentDate.getDate() + offset);
        } else {
            agendaCurrentDate.setDate(agendaCurrentDate.getDate() + (offset * 7));
        }
    }
    renderAgenda();
}

const navigateAgendaDate = navigateAgenda;
const changeAgendaDate = navigateAgenda;

function navigateAgendaToday() {
    window.userNavigatedAgenda = true;
    agendaCurrentDate = new Date();
    renderAgenda();
}

const resetAgendaToToday = navigateAgendaToday;
const setAgendaDateToday = navigateAgendaToday;

function onAgendaDatePick(val) {
    if (!val) return;
    window.userNavigatedAgenda = true;
    agendaCurrentDate = parseLocalDate(val);
    renderAgenda();
}

function getStatusBadgeClass(status) {
    const st = (status || 'Agendado').toLowerCase();
    if (st === 'atendido') {
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (st === 'falta') {
        return 'bg-rose-100 text-rose-800 border-rose-300';
    } else if (st === 'cancelado') {
        return 'bg-stone-100 text-stone-700 border-stone-300';
    } else {
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
}

/**
 * Busca o paciente correspondente a um agendamento em appData.patients.
 * Usado pelos lembretes de WhatsApp/E-mail na visão diária da Agenda.
 */
function getPatientForAppointment(apt) {
    if (!apt || !window.appData || !window.appData.patients) return null;
    return window.appData.patients.find(p => p.id === apt.patientId) || null;
}

/**
 * Envia um lembrete de consulta via WhatsApp (API wa.me) para o paciente do agendamento.
 * Busca o telefone cadastrado em appData.patients e abre a conversa em nova aba.
 */
function sendWhatsAppReminder(aptId) {
    const apt = window.appData && window.appData.appointments ? window.appData.appointments.find(a => a.id === aptId) : null;
    if (!apt) return;

    const patient = getPatientForAppointment(apt);
    const rawPhone = (patient && patient.phone) || apt.phone || '';
    const digitsOnly = String(rawPhone).replace(/\D/g, '');

    if (!digitsOnly) {
        if (typeof window.showToast === 'function') window.showToast('Telefone do paciente não cadastrado.', 'error');
        return;
    }

    // Garante o DDI 55 (Brasil) sem duplicar caso o número já esteja com o código do país
    const phoneWithDDI = digitsOnly.startsWith('55') ? digitsOnly : `55${digitsOnly}`;

    const displayDate = apt.date ? apt.date.split('-').reverse().join('/') : '';
    const patientFirstName = (apt.patientName || (patient ? patient.name : 'Paciente') || 'Paciente').split(' ')[0];
    const message = `Olá ${patientFirstName}, lembramos da sua consulta agendada para o dia ${displayDate} às ${apt.time || ''}. Confirma sua presença?`;

    const url = `https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

/**
 * Envia um lembrete de consulta via E-mail (mailto) para o paciente do agendamento.
 * Busca o e-mail cadastrado em appData.patients e abre o cliente de e-mail padrão.
 */
function sendEmailReminder(aptId) {
    const apt = window.appData && window.appData.appointments ? window.appData.appointments.find(a => a.id === aptId) : null;
    if (!apt) return;

    const patient = getPatientForAppointment(apt);
    const email = (patient && patient.email) || apt.email || '';

    if (!email) {
        if (typeof window.showToast === 'function') window.showToast('E-mail do paciente não cadastrado.', 'error');
        return;
    }

    const displayDate = apt.date ? apt.date.split('-').reverse().join('/') : '';
    const patientName = apt.patientName || (patient ? patient.name : 'Paciente') || 'Paciente';
    const subject = 'Lembrete de Consulta';
    const body = `Olá ${patientName},\n\nLembramos da sua consulta agendada para o dia ${displayDate} às ${apt.time || ''}.\nPor favor, confirme sua presença.\n\nAtenciosamente,\nEquipe do Consultório.`;

    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
}

function renderDayView() {
    const dayGrid = document.getElementById('dayGridContainer');
    const titleElem = document.getElementById('agendaPeriodTitle') || document.getElementById('agendaDateTitle');

    if (!dayGrid) return;

    const formattedDate = formatYYYYMMDD(agendaCurrentDate);
    const dateObj = parseLocalDate(formattedDate);

    if (titleElem) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateFormattedStr = dateObj.toLocaleDateString('pt-BR', options);
        titleElem.textContent = dateFormattedStr.charAt(0).toUpperCase() + dateFormattedStr.slice(1);
    }

    const dayAppointments = (window.appData.appointments || [])
        .filter(a => a.date === formattedDate)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

    dayAppointments.forEach(apt => {
        if (apt.time && !hours.includes(apt.time)) {
            hours.push(apt.time);
        }
    });
    hours.sort();

    let html = '';

    hours.forEach(hour => {
        const apt = dayAppointments.find(a => a.time === hour);

        if (apt) {
            const badgeClass = getStatusBadgeClass(apt.status);
            const modalidade = apt.service || apt.type || 'Psicoterapia Individual';
            const frequencia = apt.frequency || 'Semanal';

            html += `
    <div class="flex items-center p-3 rounded-xl border border-stone-200 bg-white shadow-xs transition hover:border-gold-400 group" draggable="true" ondragstart="handleAgendaDragStart(event, '${apt.id}')" ondragover="handleAgendaDragOver(event)" ondrop="handleAgendaDrop(event, '${formattedDate}', '${hour}')">
      <div class="w-20 font-bold text-stone-700 text-xs">${hour}</div>
      <div class="flex-1 min-w-0 px-2">
        <div class="font-semibold text-stone-800 text-xs truncate">${apt.patientName || 'Paciente'}</div>
        <div class="text-[11px] text-stone-500">${modalidade} • ${frequencia}</div>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="sendWhatsAppReminder('${apt.id}')" title="Enviar lembrete via WhatsApp" class="p-1.5 text-stone-400 hover:text-emerald-600 transition">
          <i class="fa-brands fa-whatsapp text-xs"></i>
        </button>
        <button onclick="sendEmailReminder('${apt.id}')" title="Enviar lembrete via E-mail" class="p-1.5 text-stone-400 hover:text-blue-600 transition">
          <i class="fa-solid fa-envelope text-xs"></i>
        </button>
        <button onclick="toggleAppointmentStatus('${apt.id}')" class="px-2.5 py-1 text-[11px] font-semibold rounded-full border ${badgeClass} transition hover:scale-105">
          ${apt.status || 'Agendado'}
        </button>
        <button onclick="editAppointmentModal('${apt.id}')" class="p-1.5 text-stone-400 hover:text-gold-600 transition">
          <i class="fa-solid fa-pen-to-square text-xs"></i>
        </button>
        <button onclick="deleteAppointment('${apt.id}')" class="p-1.5 text-stone-400 hover:text-rose-600 transition">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>
    </div>`;
        } else {
            html += `
    <div class="flex items-center p-3 rounded-xl border border-dashed border-stone-200 bg-stone-50/50 hover:bg-white hover:border-gold-300 transition" ondragover="handleAgendaDragOver(event)" ondrop="handleAgendaDrop(event, '${formattedDate}', '${hour}')">
      <div class="w-20 font-bold text-stone-400 text-xs">${hour}</div>
      <div class="flex-1 text-xs text-stone-400 italic">Horário Livre</div>
      <button onclick="openNewAppointmentModal('${formattedDate}', '${hour}')" class="px-3 py-1 text-xs font-medium text-gold-700 bg-gold-50 rounded-lg border border-gold-200 hover:bg-gold-100 transition">
        <i class="fa-solid fa-plus mr-1"></i> Agendar
      </button>
    </div>`;
        }
    });

    dayGrid.innerHTML = html;
}

function renderWeekView() {
    const weekGrid = document.getElementById('weekGridContainer');
    const titleElem = document.getElementById('agendaPeriodTitle') || document.getElementById('agendaDateTitle');

    if (!weekGrid) return;

    const mondayDate = getMonday(agendaCurrentDate);
    const sundayDate = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + 6, 12, 0, 0);

    if (titleElem) {
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const mMonth = monthNames[mondayDate.getMonth()];
        const sMonth = monthNames[sundayDate.getMonth()];
        let periodStr = `Semana de ${mondayDate.getDate()} de ${mMonth} a ${sundayDate.getDate()} de ${sMonth} de ${sundayDate.getFullYear()}`;
        if (mondayDate.getMonth() === sundayDate.getMonth()) {
            periodStr = `Semana de ${mondayDate.getDate()} a ${sundayDate.getDate()} de ${mMonth} de ${sundayDate.getFullYear()}`;
        }
        titleElem.textContent = periodStr;
    }

    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    let html = '';

    for (let i = 0; i < 7; i++) {
        const currDay = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i, 12, 0, 0);
        const currDayStr = formatYYYYMMDD(currDay);

        const dayApts = (window.appData.appointments || [])
            .filter(a => a.date === currDayStr)
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        const isToday = formatYYYYMMDD(new Date()) === currDayStr;

        html += `
    <div class="bg-stone-50/80 rounded-2xl border ${isToday ? 'border-gold-400 ring-2 ring-gold-100' : 'border-pastel-border'} p-3 flex flex-col min-h-[380px]" ondragover="handleAgendaDragOver(event)" ondrop="handleAgendaDrop(event, '${currDayStr}', '09:00')">
      <div class="text-center pb-2 mb-2 border-b border-stone-200">
        <span class="block text-[10px] font-semibold text-stone-500 uppercase">${daysOfWeek[i]}</span>
        <span class="block text-base font-bold ${isToday ? 'text-gold-700' : 'text-stone-800'}">${currDay.getDate()}</span>
      </div>
      <div class="flex-1 space-y-2 overflow-y-auto custom-scrollbar">`;

        if (dayApts.length === 0) {
            html += `
        <div class="text-center py-8 text-[11px] text-stone-400 italic">Livre</div>`;
        } else {
            dayApts.forEach(apt => {
                const badgeClass = getStatusBadgeClass(apt.status);
                const modalidade = apt.service || apt.type || 'Psicoterapia Individual';

                html += `
        <div class="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs hover:border-gold-400 transition cursor-move group" draggable="true" ondragstart="handleAgendaDragStart(event, '${apt.id}')">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-stone-700">${apt.time || '00:00'}</span>
            <button onclick="toggleAppointmentStatus('${apt.id}')" class="px-1.5 py-0.5 text-[9px] font-semibold rounded-full border ${badgeClass}">
              ${apt.status || 'Agendado'}
            </button>
          </div>
          <div class="text-xs font-semibold text-stone-800 truncate">${apt.patientName || 'Paciente'}</div>
          <div class="text-[10px] text-stone-500 truncate">${modalidade}</div>
        </div>`;
            });
        }

        html += `
      </div>
      <button onclick="openNewAppointmentModal('${currDayStr}', '09:00')" class="w-full mt-2 py-1.5 text-xs text-gold-700 bg-white rounded-xl border border-gold-200 hover:bg-gold-50 transition font-medium">
        + Agendar
      </button>
    </div>`;
    }

    weekGrid.innerHTML = html;
}

let draggedAptId = null;

function handleAgendaDragStart(e, aptId) {
    draggedAptId = aptId;
    if (e && e.dataTransfer) {
        e.dataTransfer.setData('text/plain', aptId);
    }
}

function handleAgendaDragOver(e) {
    if (e) e.preventDefault();
}

function handleAgendaDrop(e, targetDate, targetTime) {
    if (e) e.preventDefault();
    if (!draggedAptId) {
        if (e && e.dataTransfer) {
            draggedAptId = e.dataTransfer.getData('text/plain');
        }
    }
    if (!draggedAptId) return;

    const aptIndex = window.appData.appointments.findIndex(a => a.id === draggedAptId);
    if (aptIndex === -1) return;

    const draggedApt = window.appData.appointments[aptIndex];

    let finalTime = draggedApt.time || targetTime || '09:00';
    if (currentAgendaView === 'day' && targetTime && targetTime !== '09:00') {
        finalTime = targetTime;
    }

    const targetAptIndex = window.appData.appointments.findIndex(
        a => a.date === targetDate && a.time === finalTime && a.id !== draggedAptId
    );

    if (targetAptIndex !== -1) {
        const targetApt = window.appData.appointments[targetAptIndex];
        const tempDate = draggedApt.date;
        const tempTime = draggedApt.time;

        draggedApt.date = targetDate;
        draggedApt.time = finalTime;

        targetApt.date = tempDate;
        targetApt.time = tempTime;

        if (typeof showToast === 'function') {
            showToast(`Troca realizada entre ${draggedApt.patientName} e ${targetApt.patientName}!`, 'info');
        }
    } else {
        draggedApt.date = targetDate;
        draggedApt.time = finalTime;
        if (typeof showToast === 'function') {
            showToast(`Consulta de ${draggedApt.patientName} movida para ${finalTime}!`, 'success');
        }
    }

    if (typeof saveAppData === 'function') saveAppData();
    else if (typeof saveDatabase === 'function') saveDatabase();

    renderAgenda();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    draggedAptId = null;
}

function toggleAppointmentStatus(id) {
    const apt = window.appData.appointments.find(a => a.id === id);
    if (!apt) return;

    const states = ['Agendado', 'Atendido', 'Falta', 'Cancelado'];
    const nextIndex = (states.indexOf(apt.status || 'Agendado') + 1) % states.length;
    apt.status = states[nextIndex];

    if (typeof saveAppData === 'function') saveAppData();
    else if (typeof saveDatabase === 'function') saveDatabase();

    renderAgenda();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    if (typeof showToast === 'function') showToast(`Status: ${apt.status}`, 'info');
}

function deleteAppointment(id) {
    if (!confirm('Deseja realmente cancelar/excluir este agendamento?')) return;

    window.appData.appointments = window.appData.appointments.filter(a => a.id !== id);

    if (typeof saveAppData === 'function') saveAppData();
    else if (typeof saveDatabase === 'function') saveDatabase();

    renderAgenda();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    if (typeof showToast === 'function') showToast('Agendamento removido!', 'info');
}

function populatePatientSelectInModal(selectedId = '') {
    const select = document.getElementById('appModalPatient') || document.getElementById('aptPatientSelect');
    if (!select) return;

    let html = '<option value="">Selecione um paciente...</option>';
    if (window.appData && window.appData.patients && window.appData.patients.length > 0) {
        window.appData.patients.forEach(p => {
            const isSel = p.id === selectedId ? 'selected' : '';
            const cpfStr = p.cpf ? ` - CPF: ${p.cpf}` : '';
            const freqStr = p.consultationFrequency || p.frequency || 'Semanal';
            html += `<option value="${p.id}" ${isSel}>${p.name}${cpfStr} (${freqStr})</option>`;
        });
    }
    select.innerHTML = html;
}

function openNewAppointmentModal(dateStr, timeStr) {
    const modal = document.getElementById('appointmentModal');
    if (!modal) return;

    populatePatientSelectInModal();

    const titleEl = document.getElementById('appModalTitle') || document.getElementById('aptModalTitle');
    if (titleEl) titleEl.innerHTML = `<i class="fas fa-calendar-plus text-gold-600"></i> Agendar Consulta`;

    const idInput = document.getElementById('appModalId') || document.getElementById('aptModalId');
    if (idInput) idInput.value = '';

    const dateInput = document.getElementById('appModalDate') || document.getElementById('aptDateInput');
    const timeInput = document.getElementById('appModalTime') || document.getElementById('aptTimeSelect');
    const freqInput = document.getElementById('appModalFrequency') || document.getElementById('aptFrequencySelect');
    const priceInput = document.getElementById('appModalPrice') || document.getElementById('aptPriceInput');
    const statusInput = document.getElementById('appModalStatus') || document.getElementById('aptStatusSelect');

    if (dateInput) dateInput.value = dateStr || formatYYYYMMDD(agendaCurrentDate);
    if (timeInput) timeInput.value = timeStr || '09:00';
    if (freqInput) freqInput.value = 'Avulso';
    if (priceInput) priceInput.value = '220';
    if (statusInput) statusInput.value = 'Agendado';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function editAppointmentModal(id) {
    const apt = window.appData.appointments.find(a => a.id === id);
    if (!apt) return;

    const modal = document.getElementById('appointmentModal');
    if (!modal) return;

    populatePatientSelectInModal(apt.patientId);

    const titleEl = document.getElementById('appModalTitle') || document.getElementById('aptModalTitle');
    if (titleEl) titleEl.innerHTML = `<i class="fas fa-pen-to-square text-gold-600"></i> Editar Consulta`;

    const idInput = document.getElementById('appModalId') || document.getElementById('aptModalId');
    if (idInput) idInput.value = apt.id;

    const patientSelect = document.getElementById('appModalPatient') || document.getElementById('aptPatientSelect');
    if (patientSelect) patientSelect.value = apt.patientId || '';

    const dateInput = document.getElementById('appModalDate') || document.getElementById('aptDateInput');
    const timeInput = document.getElementById('appModalTime') || document.getElementById('aptTimeSelect');
    const freqInput = document.getElementById('appModalFrequency') || document.getElementById('aptFrequencySelect');
    const priceInput = document.getElementById('appModalPrice') || document.getElementById('aptPriceInput');
    const statusInput = document.getElementById('appModalStatus') || document.getElementById('aptStatusSelect');

    if (dateInput) dateInput.value = apt.date || '';
    if (timeInput) timeInput.value = apt.time || '09:00';
    if (freqInput) freqInput.value = apt.frequency || 'Avulso';
    if (priceInput) priceInput.value = apt.value !== undefined ? apt.value : 220;
    if (statusInput) statusInput.value = apt.status || 'Agendado';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleAppointmentSubmit(e) {
    if (e) e.preventDefault();

    const idInput = document.getElementById('appModalId') || document.getElementById('aptModalId');
    const editingId = idInput ? idInput.value : '';

    const patientId = (document.getElementById('appModalPatient') || document.getElementById('aptPatientSelect'))?.value;
    const date = (document.getElementById('appModalDate') || document.getElementById('aptDateInput'))?.value;
    const time = (document.getElementById('appModalTime') || document.getElementById('aptTimeSelect'))?.value;
    const frequency = (document.getElementById('appModalFrequency') || document.getElementById('aptFrequencySelect'))?.value || 'Avulso';
    const price = parseFloat((document.getElementById('appModalPrice') || document.getElementById('aptPriceInput'))?.value || 220);
    const status = (document.getElementById('appModalStatus') || document.getElementById('aptStatusSelect'))?.value || 'Agendado';

    if (!patientId || !date || !time) {
        if (typeof showToast === 'function') showToast('Preencha os campos obrigatórios!', 'error');
        return;
    }

    const patient = window.appData.patients.find(p => p.id === patientId);
    const patientName = patient ? patient.name : 'Paciente';

    if (editingId) {
        const apt = window.appData.appointments.find(a => a.id === editingId);
        if (apt) {
            apt.patientId = patientId;
            apt.patientName = patientName;
            apt.date = date;
            apt.time = time;
            apt.frequency = frequency;
            apt.value = price;
            apt.status = status;
            if (typeof showToast === 'function') showToast('Consulta atualizada com sucesso!', 'success');
        }
    } else {
        let createdCount = 0;
        let conflictCount = 0;

        const baseDate = parseLocalDate(date);
        const stepDays = frequency === 'Semanal' ? 7 : (frequency === 'Quinzenal' ? 14 : (frequency === 'Mensal' ? 30 : 0));
        const iterations = (frequency === 'Avulso' || stepDays === 0) ? 1 : Math.floor(90 / stepDays);

        for (let i = 0; i < iterations; i++) {
            const currDateObj = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + (i * stepDays), 12, 0, 0);
            const currDateStr = formatYYYYMMDD(currDateObj);

            const conflict = window.appData.appointments.some(a => a.date === currDateStr && a.time === time);
            if (conflict) {
                conflictCount++;
            } else {
                window.appData.appointments.push({
                    id: 'APT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                    patientId,
                    patientName,
                    date: currDateStr,
                    time,
                    service: 'Psicoterapia Individual',
                    type: 'Presencial',
                    value: price,
                    frequency,
                    status
                });
                createdCount++;
            }
        }

        if (typeof showToast === 'function') {
            if (conflictCount > 0) {
                showToast(`${createdCount} sessões criadas. ${conflictCount} conflitos ignorados.`, 'info');
            } else {
                showToast('Consulta agendada com sucesso!', 'success');
            }
        }
    }

    if (typeof saveAppData === 'function') saveAppData();
    else if (typeof saveDatabase === 'function') saveDatabase();

    closeAppointmentModal();
    renderAgenda();
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
}

window.renderAgenda = renderAgenda;
window.setAgendaView = setAgendaView;
window.switchAgendaView = setAgendaView;
window.navigateAgenda = navigateAgenda;
window.navigateAgendaDate = navigateAgenda;
window.changeAgendaDate = navigateAgenda;
window.navigateAgendaToday = navigateAgendaToday;
window.resetAgendaToToday = navigateAgendaToday;
window.setAgendaDateToday = navigateAgendaToday;
window.onAgendaDatePick = onAgendaDatePick;
window.populatePatientSelectInModal = populatePatientSelectInModal;
window.openNewAppointmentModal = openNewAppointmentModal;
window.editAppointmentModal = editAppointmentModal;
window.closeAppointmentModal = closeAppointmentModal;
window.handleAppointmentSubmit = handleAppointmentSubmit;
window.deleteAppointment = deleteAppointment;
window.toggleAppointmentStatus = toggleAppointmentStatus;
window.handleAgendaDragStart = handleAgendaDragStart;
window.handleAgendaDragOver = handleAgendaDragOver;
window.handleAgendaDrop = handleAgendaDrop;
window.parseLocalDate = parseLocalDate;
window.formatYYYYMMDD = formatYYYYMMDD;
window.getMonday = getMonday;
window.getPatientForAppointment = getPatientForAppointment;
window.sendWhatsAppReminder = sendWhatsAppReminder;
window.sendEmailReminder = sendEmailReminder;
