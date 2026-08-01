import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Configurações do projeto Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCwWtrJSuwx_wwXRIie2KVq-5USYTQBM2g",
    authDomain: "edmprofessor-1542b.firebaseapp.com",
    projectId: "edmprofessor-1542b",
    storageBucket: "edmprofessor-1542b.firebasestorage.app",
    messagingSenderId: "225511245642",
    appId: "1:225511245642:web:c021e0760fde3d51f6e3b3",
    measurementId: "G-MT07NMRYXJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

try {
    const analytics = getAnalytics(app);
} catch (e) {
    console.warn("Firebase Analytics não pôde ser carregado (possível bloqueador de anúncios).");
}

// Helper para evitar XSS (Cross-Site Scripting)
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Função para exibir notificações amigáveis na tela (Toasts)
window.showNotification = (message, type = 'success') => {
    const area = document.getElementById('notification-area');
    if (!area) return;
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'danger') icon = 'fa-circle-exclamation';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    notification.innerHTML = `<i class="fas ${icon}"></i> <span>${escapeHTML(message)}</span>`;
    area.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3800);
};

// Modal de Confirmação Personalizado (substitui o confirm do navegador)
window.showConfirmDialog = (title, message, options = {}) => {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const msgEl = document.getElementById('confirmMessage');
        const cancelBtn = document.getElementById('confirmCancelBtn');
        const okBtn = document.getElementById('confirmOkBtn');
        const iconEl = document.getElementById('confirmIcon');

        if (!modal) {
            resolve(confirm(message));
            return;
        }

        titleEl.textContent = title || 'Confirmação';
        msgEl.textContent = message || 'Tem certeza?';
        okBtn.className = `btn ${options.okClass || 'btn-danger'}`;
        if (iconEl) iconEl.className = `fas ${options.icon || 'fa-exclamation-triangle'} confirm-icon`;

        modal.style.display = 'block';

        const cleanup = () => {
            modal.style.display = 'none';
            cancelBtn.onclick = null;
            okBtn.onclick = null;
        };

        cancelBtn.onclick = () => {
            cleanup();
            resolve(false);
        };

        okBtn.onclick = () => {
            cleanup();
            resolve(true);
        };
    });
};

// Máscara para Telefone (00) 00000-0000
const applyPhoneMask = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{4})\d+?$/, "$1");
};

// Lógica de Dark Mode com Detecção Automática do Sistema Operacional
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    
    // Obtém o tema salvo ou detecta a preferência do sistema operacional
    const getPreferredTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    };

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    // Aplica o tema inicial (salvo ou preferência do SO)
    applyTheme(getPreferredTheme());

    // Evento de clique para alternar manualmente
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Escuta mudanças de tema do SO em tempo real caso o usuário não tenha definido uma preferência manual
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Lógica de Autenticação
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');

window.handleAuthClick = async () => {
    if (auth.currentUser) {
        const confirmed = await window.showConfirmDialog(
            "Encerrar Sessão",
            "Deseja realmente encerrar a sessão administrativa?",
            { okClass: 'btn-primary', icon: 'fa-right-from-bracket' }
        );
        if (confirmed) signOut(auth);
    } else {
        window.openLoginModal();
    }
};

window.openLoginModal = () => {
    if (loginForm) loginForm.reset();
    if (loginModal) loginModal.style.display = 'block';
};

window.closeLoginModal = () => {
    if (loginModal) loginModal.style.display = 'none';
};

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.closeLoginModal();
            window.showNotification("Bem-vindo! Acesso administrativo liberado.");
        } catch (error) {
            console.error("Erro Técnico Firebase:", error.code);
            window.showNotification(`Falha no login: ${error.code}`, 'danger');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Entrar';
        }
    });
}

window.loginSocial = async (providerName) => {
    let provider;
    if (providerName === 'google') {
        provider = new GoogleAuthProvider();
    } else if (providerName === 'github') {
        provider = new GithubAuthProvider();
    }

    try {
        const result = await signInWithPopup(auth, provider);
        window.closeLoginModal();
        window.showNotification(`Bem-vindo, ${result.user.displayName || 'Administrador'}!`);
    } catch (error) {
        console.error("Erro no login social:", error);
        let msg = "Falha na autenticação.";
        if (error.code === 'auth/account-exists-with-different-credential') {
            msg = "Um usuário já existe com este e-mail usando outro provedor.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        window.showNotification(msg, 'danger');
    }
};

onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-toggle');
    if (user) {
        document.body.classList.add('is-admin');
        if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
    } else {
        document.body.classList.remove('is-admin');
        if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
    if (jsonData.professores.length > 0) renderTable();
});

// Funções para controle do seletor de ações (Dropdown)
window.closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
};

window.toggleActions = (id, event) => {
    event.stopPropagation();
    const dropdown = document.getElementById(`dropdown-${id}`);
    const isShowing = dropdown ? dropdown.classList.contains('show') : false;
    window.closeAllDropdowns();
    if (dropdown && !isShowing) dropdown.classList.add('show');
};

window.addEventListener('click', () => window.closeAllDropdowns());

let jsonData = { professores: [], escolas: [], disciplinas: [] };
let presencaKey = '';
let presencaDateFormatted = '';

function extractPresenceInfo(professores) {
    if (!professores || professores.length === 0) return;
    
    const foundKey = professores.reduce((acc, prof) => {
        if (acc) return acc;
        return Object.keys(prof).find(k => k.startsWith('presenca_'));
    }, null);

    if (foundKey) {
        presencaKey = foundKey;
        const datePart = foundKey.replace('presenca_', ''); 
        const [year, month, day] = datePart.split('_');
        presencaDateFormatted = `${day}/${month}/${year}`;
    }
}

function renderSkeleton() {
    if (!professoresListDiv) return;
    let skeletonHTML = '<div class="skeleton-wrapper">';
    for (let i = 0; i < 6; i++) {
        skeletonHTML += '<div class="skeleton-row"></div>';
    }
    skeletonHTML += '</div>';
    professoresListDiv.innerHTML = skeletonHTML;
}

function loadData() {
    renderSkeleton();
    
    onSnapshot(collection(db, "professores"), (snapshot) => {
        if (snapshot.empty) {
            if (professoresListDiv) {
                professoresListDiv.innerHTML = '<p class="no-results-message"><i class="fas fa-database"></i> O banco de dados está vazio. Execute o script de migração.</p>';
            }
            jsonData.professores = [];
            renderTable();
            return;
        }

        jsonData.professores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        extractPresenceInfo(jsonData.professores);
        renderTable();
    }, (error) => {
        console.error("Erro no Real-time de Professores:", error);
        window.showNotification(`Erro de Permissão ou Conexão: ${error.message}`, 'danger');
        if (professoresListDiv) {
            professoresListDiv.innerHTML = `<p class="no-results-message"><i class="fas fa-shield-alt"></i> Erro de Permissão: Verifique as Regras do Firestore.<br><small>${escapeHTML(error.message)}</small></p>`;
        }
    });

    onSnapshot(doc(db, "configuracoes", "geral"), (configSnap) => {
        if (configSnap.exists()) {
            const configData = configSnap.data();
            jsonData.escolas = configData.escolas || [];
            jsonData.disciplinas = configData.disciplinas || [];
            initFilters();
            renderTable();
        } else {
            jsonData.escolas = [];
            jsonData.disciplinas = [];
            initFilters();
            renderTable();
        }
    }, (error) => {
        console.error("Erro no Real-time de Configurações:", error);
        window.showNotification(`Erro ao carregar configurações: ${error.message}`, 'danger');
    });
}

// --- Funções CRUD ---
const professorModal = document.getElementById('professorModal');
const professorForm = document.getElementById('professorForm');

window.openProfessorModal = (profId = null) => {
    if (professorForm) professorForm.reset();
    const overlay = document.getElementById('modalSuccessOverlay');
    if (overlay) overlay.style.display = 'none';
    
    const profIdInput = document.getElementById('prof-id');
    const modalTitle = document.getElementById('modalTitle');
    if (profIdInput) profIdInput.value = profId || '';
    if (modalTitle) modalTitle.textContent = profId ? 'Editar Professor' : 'Novo Professor';
    
    if (professorForm) {
        const submitBtn = professorForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.innerHTML = profId ? '<i class="fas fa-save"></i> Atualizar' : '<i class="fas fa-plus"></i> Cadastrar';
    }

    const schoolSelect = document.getElementById('prof-escola');
    const discSelect = document.getElementById('prof-disciplina');
    
    if (schoolSelect) {
        schoolSelect.innerHTML = '<option value="" disabled selected>Selecione a Escola</option>' + 
            jsonData.escolas.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    
    if (discSelect) {
        discSelect.innerHTML = '<option value="" disabled selected>Selecione a Disciplina</option>' + 
            jsonData.disciplinas.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    if (profId) {
        const prof = jsonData.professores.find(p => p.id === profId);
        if (prof) {
            document.getElementById('prof-nome').value = prof.nome || '';
            document.getElementById('prof-escola').value = prof.escola || '';
            document.getElementById('prof-disciplina').value = prof.disciplina || '';
            document.getElementById('prof-ano').value = prof.ano || '';
            document.getElementById('prof-turma').value = prof.turma || '';
            document.getElementById('prof-turno').value = prof.turno || 'MANHÃ';
            document.getElementById('prof-telefone').value = prof.telefone || '';
            document.getElementById('prof-link-chamada').value = prof.link_chamada || '';
        }
    }
    if (professorModal) professorModal.style.display = 'block';
};

const profTelInput = document.getElementById('prof-telefone');
if (profTelInput) {
    profTelInput.addEventListener('input', (e) => {
        e.target.value = applyPhoneMask(e.target.value);
    });
}

window.closeProfessorModal = () => {
    if (professorModal) professorModal.style.display = 'none';
};

if (professorForm) {
    professorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn ? submitBtn.innerHTML : '';
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        }

        const id = document.getElementById('prof-id').value;
        
        const profData = {
            nome: document.getElementById('prof-nome').value,
            escola: document.getElementById('prof-escola').value,
            disciplina: document.getElementById('prof-disciplina').value,
            ano: document.getElementById('prof-ano').value,
            turma: document.getElementById('prof-turma').value,
            turno: document.getElementById('prof-turno').value,
            telefone: document.getElementById('prof-telefone').value,
            link_chamada: document.getElementById('prof-link-chamada').value,
            ultima_alteracao: new Date().toISOString()
        };

        try {
            if (id) {
                await updateDoc(doc(db, "professores", id), profData);
            } else {
                if (presencaKey) profData[presencaKey] = false;
                await addDoc(collection(db, "professores"), profData);
            }
            
            const overlay = document.getElementById('modalSuccessOverlay');
            const successMsg = document.getElementById('modalSuccessMessage');
            if (successMsg) successMsg.textContent = id ? "Professor atualizado!" : "Professor cadastrado!";
            if (overlay) overlay.style.display = 'flex';
            
            setTimeout(() => {
                window.closeProfessorModal();
            }, 1500);
        } catch (error) {
            window.showNotification("Erro ao salvar: " + error.message, 'danger');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.innerHTML = originalContent;
            }
        }
    });
}

window.deleteProfessor = async (id, nome) => {
    const confirmed = await window.showConfirmDialog(
        "Excluir Professor",
        `Tem certeza que deseja excluir o(a) professor(a) "${nome}"? Esta ação não pode ser desfeita.`,
        { okClass: 'btn-danger', icon: 'fa-trash-alt' }
    );
    if (confirmed) {
        try {
            await deleteDoc(doc(db, "professores", id));
            window.showNotification(`Professor(a) ${nome} removido(a) com sucesso.`, 'success');
        } catch (error) {
            window.showNotification("Erro ao excluir: " + error.message, 'danger');
        }
    }
};

window.togglePresenca = async (id, currentStatus) => {
    if (!auth.currentUser) {
        window.showNotification("Acesso negado. Faça login para alterar a presença.", 'danger');
        return;
    }

    try {
        const docRef = doc(db, "professores", id);
        const newStatus = !currentStatus;
        
        await updateDoc(docRef, {
            [presencaKey]: newStatus,
            ultima_alteracao: new Date().toISOString()
        });
    } catch (error) {
        console.error("Erro ao atualizar presença:", error);
        window.showNotification("Erro ao atualizar presença.", 'danger');
    }
};

window.copyShareLink = () => {
    const params = new URLSearchParams();
    if (searchInput && searchInput.value) params.set('search', searchInput.value);
    if (schoolFilter && schoolFilter.value) params.set('escola', schoolFilter.value);
    if (disciplineFilter && disciplineFilter.value) params.set('disciplina', disciplineFilter.value);
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        window.showNotification("Link da visualização copiado para o clipboard!");
    });
};

window.exportToPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedSchool = schoolFilter ? schoolFilter.value : '';
    const selectedDisciplina = disciplineFilter ? disciplineFilter.value : '';

    const filtered = jsonData.professores.filter(p => {
        const safeVal = (v) => (v || "").toString().toLowerCase();
        return (safeVal(p.nome).includes(searchTerm) ||
                safeVal(p.escola).includes(searchTerm) ||
                safeVal(p.disciplina).includes(searchTerm) ||
                safeVal(p.ano).includes(searchTerm) ||
                safeVal(p.turma).includes(searchTerm) ||
                safeVal(p.turno).includes(searchTerm)) &&
               (selectedSchool === '' || p.escola === selectedSchool) &&
               (selectedDisciplina === '' || p.disciplina === selectedDisciplina);
    });

    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gYCFQocGmaEqAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAASSURBVFjHY2AYBaNgFAyDAwAAAzAAAR873eAAAAAASUVORK5CYII=';

    try {
        doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
    } catch (e) {
        console.error("Erro ao carregar logotipo:", e);
    }

    doc.setFontSize(16);
    doc.text('Relatório de Presença - Professores', 38, 18);
    doc.setFontSize(10);
    doc.text(`Data da Chamada: ${presencaDateFormatted || 'N/A'}`, 38, 24);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 38, 29);

    const tableData = filtered.map(p => [
        p.nome, p.escola, p.disciplina, p.ano, p.turma, p.turno, 
        p[presencaKey] ? 'PRESENTE' : 'AUSENTE'
    ]);

    doc.autoTable({
        startY: 35,
        head: [['Nome', 'Escola', 'Disciplina', 'Ano', 'Turma', 'Turno', 'Presença']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
            fillColor: [0, 86, 179],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: { 
            fillColor: [248, 249, 250]
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [223, 230, 233],
            lineWidth: 0.1
        },
        didDrawPage: function (data) {
            doc.setFontSize(8);
            doc.setTextColor(150);

            const footerText = "Sistema EDM Professor - Relatório de Frequência Acadêmica";
            doc.text(footerText, data.settings.margin.left, doc.internal.pageSize.height - 10);

            let pageStr = "Página " + doc.internal.getCurrentPageInfo().pageNumber;
            if (typeof doc.putTotalPages === 'function') {
                pageStr += " de " + totalPagesExp;
            }
            doc.text(pageStr, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
        }
    });

    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    const fileName = `presenca_${(presencaDateFormatted || 'lista').replace(/\//g, '_')}.pdf`;
    doc.save(fileName);
    window.showNotification("PDF gerado com sucesso!");
};

window.manageMetadata = async (type) => {
    const label = type === 'escolas' ? 'Escola' : 'Disciplina';
    let newValue = prompt(`Digite o nome da nova ${label}:`);
    
    if (!newValue || newValue.trim() === "") return;
    newValue = newValue.trim().toUpperCase();

    if (jsonData[type].includes(newValue)) {
        window.showNotification(`${label} já existe na lista.`, 'danger');
        return;
    }

    const updatedList = [...jsonData[type], newValue].sort();
    const updateObj = {};
    updateObj[type] = updatedList;

    try {
        await updateDoc(doc(db, "configuracoes", "geral"), updateObj);
        jsonData[type] = updatedList;
        initFilters();
        window.showNotification(`${type === 'escolas' ? 'Escola' : 'Disciplina'} adicionada com sucesso!`);
    } catch (error) {
        window.showNotification("Erro ao atualizar lista: " + error.message, 'danger');
    }
};

const professoresListDiv = document.getElementById('professores-list');
const searchInput = document.getElementById('search-input');
const schoolFilter = document.getElementById('school-filter');
const disciplineFilter = document.getElementById('discipline-filter');
const paginationDiv = document.getElementById('pagination');
const btnClearFilters = document.getElementById('btn-clear-filters');
const resultsCountSpan = document.getElementById('results-count');

let sortConfig = {
    key: 'nome',
    direction: 'asc'
};

let currentPage = 1;
const rowsPerPage = 15;

function initFilters() {
    if (!schoolFilter || !disciplineFilter) return;

    const currentSchool = schoolFilter.value;
    const currentDiscipline = disciplineFilter.value;

    schoolFilter.innerHTML = '<option value="">Todas as Escolas</option>';
    disciplineFilter.innerHTML = '<option value="">Todas as Disciplinas</option>';

    const schools = (jsonData.escolas && jsonData.escolas.length > 0) 
        ? jsonData.escolas 
        : [...new Set(jsonData.professores.map(p => p.escola))].sort();
        
    const disciplines = (jsonData.disciplinas && jsonData.disciplinas.length > 0)
        ? jsonData.disciplinas
        : [...new Set(jsonData.professores.map(p => p.disciplina))].sort();

    schools.forEach(school => {
        schoolFilter.add(new Option(school, school));
    });
    schoolFilter.value = currentSchool;

    disciplines.forEach(discipline => {
        disciplineFilter.add(new Option(discipline, discipline));
    });
    disciplineFilter.value = currentDiscipline;
}

window.setSort = (key) => {
    if (key === 'actions') return;
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.key = key;
        sortConfig.direction = 'asc';
    }
    renderTable();
};

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => { currentPage = 1; func.apply(context, args); }, delay);
    };
}
const debouncedRenderTable = debounce(renderTable, 300);

function renderPagination(totalItems) {
    if (!paginationDiv) return;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    paginationDiv.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderTable(); };
    paginationDiv.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => { currentPage = i; renderTable(); };
        paginationDiv.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próximo';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderTable(); };
    paginationDiv.appendChild(nextBtn);
}

const getTurnoBadge = (turno) => {
    if (!turno) return '<span class="tag-turno">N/A</span>';
    const upper = turno.toUpperCase().trim();
    let icon = 'fa-sun';
    let tagClass = 'tag-manha';
    if (upper === 'TARDE') { icon = 'fa-cloud-sun'; tagClass = 'tag-tarde'; }
    else if (upper === 'NOITE') { icon = 'fa-moon'; tagClass = 'tag-noite'; }
    else if (upper === 'INTEGRAL') { icon = 'fa-clock'; tagClass = 'tag-integral'; }
    return `<span class="tag-turno ${tagClass}"><i class="fas ${icon}"></i> ${escapeHTML(upper)}</span>`;
};

function renderTable() {
    if (!professoresListDiv) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedSchool = schoolFilter ? schoolFilter.value : '';
    const selectedDisciplina = disciplineFilter ? disciplineFilter.value : '';

    const filteredProfessores = jsonData.professores.filter(professor => {
        const safeVal = (val) => (val || "").toString().toLowerCase();
        
        const matchesSearch = (
            safeVal(professor.nome).includes(searchTerm) ||
            safeVal(professor.escola).includes(searchTerm) ||
            safeVal(professor.disciplina).includes(searchTerm) ||
            safeVal(professor.ano).includes(searchTerm) ||
            safeVal(professor.turma).includes(searchTerm) ||
            safeVal(professor.turno).includes(searchTerm)
        );

        const matchesSchool = selectedSchool === '' || professor.escola === selectedSchool;
        const matchesDiscipline = selectedDisciplina === '' || professor.disciplina === selectedDisciplina;

        return matchesSearch && matchesSchool && matchesDiscipline;
    });

    // Cálculo do indicador de presença visual
    let totalWithPresenca = 0;
    let totalPresentes = 0;
    filteredProfessores.forEach(p => {
        if (presencaKey && p[presencaKey] !== undefined) {
            totalWithPresenca++;
            if (p[presencaKey]) totalPresentes++;
        }
    });
    const presencePct = totalWithPresenca > 0 ? Math.round((totalPresentes / totalWithPresenca) * 100) : 0;

    if (resultsCountSpan) {
        let presenceBarHTML = '';
        if (presencaKey && totalWithPresenca > 0) {
            presenceBarHTML = `<div class="presence-progress-container" title="${totalPresentes} de ${totalWithPresenca} presentes (${presencePct}%)">
                <span style="margin-left: 12px; margin-right: 4px;">Presença: <strong>${presencePct}%</strong></span>
                <div class="presence-bar-bg"><div class="presence-bar-fill" style="width: ${presencePct}%"></div></div>
            </div>`;
        }
        resultsCountSpan.style.display = 'inline-flex';
        resultsCountSpan.style.alignItems = 'center';
        resultsCountSpan.innerHTML = `<span>Mostrando ${filteredProfessores.length} professor(es)</span> ${presenceBarHTML}`;
    }

    filteredProfessores.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (filteredProfessores.length > 0) {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedItems = filteredProfessores.slice(start, end);

        if (paginatedItems.length > 0) {
            const headers = [
                { label: 'Nome', key: 'nome' },
                { label: 'Escola', key: 'escola' },
                { label: 'Disciplina', key: 'disciplina' },
                { label: 'Ano', key: 'ano' },
                { label: 'Turma', key: 'turma' },
                { label: 'Turno', key: 'turno' },
                { label: 'Telefone', key: 'telefone' },
                { label: 'Link', key: 'link_chamada' }
            ];
            if (presencaKey && presencaDateFormatted) {
                headers.push({ label: `Presença (${presencaDateFormatted})`, key: presencaKey });
            }
            headers.push({ label: 'Ações', key: 'actions' });

            let tableHTML = '<table>';
            tableHTML += '<thead><tr>';
            headers.forEach(h => {
                let icon = (h.key !== 'actions') ? '<i class="fas fa-sort" style="opacity: 0.2; margin-left: 5px;"></i>' : '';
                if (sortConfig.key === h.key) {
                    icon = sortConfig.direction === 'asc' 
                        ? ' <i class="fas fa-sort-up" style="margin-left: 5px;"></i>' 
                        : ' <i class="fas fa-sort-down" style="margin-left: 5px;"></i>';
                }
                let adminClass = h.key === 'actions' ? 'admin-only' : '';
                let style = h.key === 'actions' ? 'style="cursor: default;"' : '';
                tableHTML += `<th onclick="setSort('${h.key}')" class="${adminClass}" ${style}>${h.label}${icon}</th>`;
            });
            tableHTML += '</tr></thead><tbody>';

            paginatedItems.forEach(professor => {
                tableHTML += '<tr>';
                tableHTML += `<td><strong>${escapeHTML(professor.nome)}</strong></td>`;
                tableHTML += `<td>${escapeHTML(professor.escola)}</td>`;
                tableHTML += `<td>${escapeHTML(professor.disciplina)}</td>`;
                tableHTML += `<td>${escapeHTML(professor.ano)}</td>`;
                tableHTML += `<td>${escapeHTML(professor.turma)}</td>`;
                tableHTML += `<td>${getTurnoBadge(professor.turno)}</td>`;
                tableHTML += `<td>${escapeHTML(professor.telefone)}</td>`;
                
                const linkHtml = professor.link_chamada 
                    ? `<a href="${escapeHTML(professor.link_chamada)}" target="_blank" class="link-call" title="Abrir Chamada Online"><i class="fas fa-video"></i></a>` 
                    : '<span style="color: #ccc; font-size: 0.8em;">N/A</span>';
                tableHTML += `<td style="text-align: center;">${linkHtml}</td>`;

                if (presencaKey && professor[presencaKey] !== undefined) {
                    const isPresent = professor[presencaKey];
                    const presencaClass = isPresent ? 'badge-presente' : 'badge-ausente';
                    const presencaText = isPresent ? 'Presente' : 'Ausente';
                    const dotClass = isPresent ? 'dot-presente' : 'dot-ausente';
                    
                    const clickHandler = auth.currentUser ? `onclick="togglePresenca('${professor.id}', ${isPresent})"` : '';
                    const tooltip = auth.currentUser ? 'title="Clique para alternar presença"' : '';
                    
                    tableHTML += `<td><span class="badge ${presencaClass}" ${clickHandler} ${tooltip}><span class="status-dot ${dotClass}"></span> ${escapeHTML(presencaText)}</span></td>`;
                }
                tableHTML += `<td class="admin-only">
                    <div class="action-btns">
                        <button class="action-btn" onclick="openProfessorModal('${professor.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProfessor('${professor.id}', '${escapeHTML(professor.nome)}')" title="Excluir"><i class="fas fa-trash"></i></button>
                    <div class="dropdown">
                        <button class="action-btn" onclick="toggleActions('${professor.id}', event)" title="Ações">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div id="dropdown-${professor.id}" class="dropdown-content">
                            <button onclick="openProfessorModal('${professor.id}')"><i class="fas fa-edit"></i> Editar</button>
                            <button class="delete" onclick="deleteProfessor('${professor.id}', '${escapeHTML(professor.nome)}')"><i class="fas fa-trash"></i> Excluir</button>
                        </div>
                    </div>
                </td>`;
                tableHTML += '</tr>';
            });
            tableHTML += '</tbody></table>';
            professoresListDiv.innerHTML = tableHTML;
        }
    } else {
        professoresListDiv.innerHTML = '<p class="no-results-message"><i class="fas fa-exclamation-circle"></i> Nenhum professor encontrado com os critérios de busca e filtro.</p>';
    }

    renderPagination(filteredProfessores.length);
}

if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (schoolFilter) schoolFilter.value = '';
        if (disciplineFilter) disciplineFilter.value = '';
        resetAndRender();
    });
}

const resetAndRender = () => {
    currentPage = 1;
    renderTable();
};

if (searchInput) searchInput.addEventListener('input', debouncedRenderTable);

const uppercaseFields = ['search-input', 'prof-nome', 'prof-ano', 'prof-turma'];
uppercaseFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
    }
});

if (schoolFilter) schoolFilter.addEventListener('change', debouncedRenderTable);
if (disciplineFilter) disciplineFilter.addEventListener('change', debouncedRenderTable);

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search') && searchInput) searchInput.value = params.get('search').toUpperCase();
    if (params.has('escola') && schoolFilter) schoolFilter.value = params.get('escola').toUpperCase();
    if (params.has('disciplina') && disciplineFilter) disciplineFilter.value = params.get('disciplina').toUpperCase();
    if (params.toString()) debouncedRenderTable();
});

// Iniciar carregamento dos dados
loadData();
