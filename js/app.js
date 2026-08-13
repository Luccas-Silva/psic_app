/**
 * PsicAPP - App Controller, SPA Routing & Toast System
 * Handles sidebar collapse/expand on desktop and toggle on mobile.
 */

let currentTab = 'dashboard';

function navigateTo(tabId) {
    if (!tabId) return;
    
    // Oculta todas as seções de abas (.tab-content do HTML)
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));

    // Mostra a seção ativa
    const activeSection = document.getElementById('tab-' + tabId) || 
                          document.getElementById(tabId + 'Section') || 
                          document.getElementById(tabId + 'Container');
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    // Atualiza links do menu lateral
    const navLinks = document.querySelectorAll('.sidebar-item') || document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.id === `nav-${tabId}`) {
            link.classList.add('bg-gold-50', 'text-gold-800', 'border', 'border-gold-200');
            link.classList.remove('text-slate-600', 'hover:bg-slate-50');
        } else {
            link.classList.remove('bg-gold-50', 'text-gold-800', 'border', 'border-gold-200');
            link.classList.add('text-slate-600');
        }
    });

    currentTab = tabId;

    // Dispara a renderização dos módulos
    if (tabId === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
    if (tabId === 'agenda' && typeof renderAgenda === 'function') renderAgenda();
    if (tabId === 'prontuario' && typeof renderProntuario === 'function') renderProntuario();
    if (tabId === 'financeiro' && typeof renderFinanceiro === 'function') renderFinanceiro();
    if (tabId === 'backup' && typeof renderBackupView === 'function') renderBackupView();

    // Fecha sidebar no mobile ao clicar em uma opção
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('mainSidebar') || document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
        }
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('mainSidebar') || document.getElementById('sidebar');
    const wrapper = document.getElementById('mainWrapper');
    if (!sidebar) return;

    if (window.innerWidth >= 768) {
        const isCollapsed = sidebar.classList.contains('collapsed') || sidebar.classList.contains('w-[72px]');
        
        if (isCollapsed) {
            // Expandir Sidebar
            sidebar.classList.remove('collapsed', 'w-[72px]');
            sidebar.classList.add('w-60');
            if (wrapper) {
                wrapper.classList.remove('sidebar-collapsed');
                wrapper.classList.add('sidebar-expanded');
            }
            document.querySelectorAll('.nav-text').forEach(el => el.classList.remove('hidden'));
            localStorage.setItem('psicapp_sidebar_collapsed', 'false');
        } else {
            // Recolher Sidebar
            sidebar.classList.add('collapsed', 'w-[72px]');
            sidebar.classList.remove('w-60');
            if (wrapper) {
                wrapper.classList.remove('sidebar-expanded');
                wrapper.classList.add('sidebar-collapsed');
            }
            document.querySelectorAll('.nav-text').forEach(el => el.classList.add('hidden'));
            localStorage.setItem('psicapp_sidebar_collapsed', 'true');
        }
    } else {
        // Mobile toggle
        sidebar.classList.toggle('-translate-x-full');
    }
}

function initSidebarState() {
    if (window.innerWidth >= 768 && localStorage.getItem('psicapp_sidebar_collapsed') === 'true') {
        const sidebar = document.getElementById('mainSidebar') || document.getElementById('sidebar');
        const wrapper = document.getElementById('mainWrapper');
        if (sidebar) {
            sidebar.classList.add('collapsed', 'w-[72px]');
            sidebar.classList.remove('w-60');
            document.querySelectorAll('.nav-text').forEach(el => el.classList.add('hidden'));
        }
        if (wrapper) {
            wrapper.classList.remove('sidebar-expanded');
            wrapper.classList.add('sidebar-collapsed');
        }
    }
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[280px] pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-2 py-2.5 px-3.5 rounded-xl shadow-lg text-xs font-semibold transition-all duration-300 transform translate-y-2 opacity-0 text-white`;

    let icon = 'fa-info-circle';
    let bgColor = 'bg-stone-800';

    if (type === 'success') {
        bgColor = 'bg-emerald-600';
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        bgColor = 'bg-rose-600';
        icon = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        bgColor = 'bg-amber-600';
        icon = 'fa-amber-600';
    }

    toast.classList.add(bgColor);
    toast.innerHTML = `<i class="fas ${icon} text-sm"></i><span class="truncate">${message}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

document.addEventListener('DOMContentLoaded', () => {
    initSidebarState();
    if (typeof loadAppData === 'function') loadAppData();
    if (typeof populatePatientSelects === 'function') populatePatientSelects();
    if (typeof renderDashboard === 'function') renderDashboard();
});

window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.showToast = showToast;
