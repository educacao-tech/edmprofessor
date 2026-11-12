import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
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

// Helper para mensagens amigáveis de autenticação
function formatAuthErrorMessage(error) {
    if (!error || !error.code) return "Falha na autenticação.";
    switch (error.code) {
        case 'auth/operation-not-allowed':
            return "O provedor Google não está ativado no Firebase Console. Ative o Google em Authentication > Sign-in method.";
        case 'auth/unauthorized-domain':
            return `O domínio '${window.location.hostname || 'este domínio'}' não está autorizado no Firebase Console. Acesse Authentication > Configurações > Domínios autorizados e adicione este endereço (ou acesse via http://localhost).`;
        case 'auth/popup-blocked':
            return "O pop-up de login foi bloqueado pelo navegador. Por favor, permita pop-ups ou tente novamente.";
        case 'auth/account-exists-with-different-credential':
            return "Este e-mail já está associado a outro método de autenticação.";
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return "E-mail ou senha incorretos. Se sua conta é Google, utilize o botão 'Entrar com a Conta Google'.";
        case 'auth/invalid-email':
            return "Endereço de e-mail inválido.";
        case 'auth/weak-password':
            return "A senha deve ter no mínimo 6 caracteres.";
        case 'auth/too-many-requests':
            return "Muitas tentativas sem sucesso. Aguarde um momento e tente novamente.";
        case 'auth/network-request-failed':
            return "Erro de conexão de rede com o Firebase. Verifique sua conexão com a internet.";
        default:
            return `Falha na autenticação (${error.code || error.message || 'desconhecido'}).`;
    }
}

// Helpers para exibição de alertas dentro do modal de login
window.showLoginAlert = (msg, code = '', showRegisterBtn = false) => {
    const alertBox = document.getElementById('login-error-alert');
    const msgEl = document.getElementById('login-error-msg');
    const titleEl = document.getElementById('login-error-title');
    const actionEl = document.getElementById('login-error-action');
    if (!alertBox || !msgEl) return;

    titleEl.textContent = 'Aviso do Firebase';
    msgEl.innerHTML = msg;
    actionEl.innerHTML = '';

    if (code === 'auth/operation-not-allowed') {
        actionEl.innerHTML = '<a href="https://console.firebase.google.com/project/edmprofessor-1542b/authentication/providers" target="_blank" class="btn-console"><i class="fas fa-arrow-up-right-from-square"></i> Ativar no Firebase Console</a>';
    } else if (code === 'auth/unauthorized-domain') {
        const currentHost = window.location.hostname || 'seu domínio';
        actionEl.innerHTML = `<a href="https://console.firebase.google.com/project/edmprofessor-1542b/authentication/settings" target="_blank" class="btn-console"><i class="fas fa-arrow-up-right-from-square"></i> Adicionar '${currentHost}' nos Domínios Autorizados</a>`;
    } else if (showRegisterBtn) {
        actionEl.innerHTML = '<button type="button" class="btn btn-sm btn-primary" onclick="handleCreateAccount()"><i class="fas fa-user-plus"></i> Cadastrar este E-mail e Senha agora</button>';
    }

    alertBox.style.display = 'flex';
};

window.hideLoginAlert = () => {
    const alertBox = document.getElementById('login-error-alert');
    if (alertBox) alertBox.style.display = 'none';
};

window.handleCreateAccount = async () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;

    if (!email || !pass) {
        window.showLoginAlert("Por favor, preencha o e-mail e a senha para cadastrar.");
        return;
    }
    if (pass.length < 6) {
        window.showLoginAlert("O Firebase exige que a senha tenha no mínimo 6 caracteres (letras ou números).");
        return;
    }

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        window.closeLoginModal();
        window.showNotification(`Conta criada e autenticada com sucesso! Bem-vindo(a), ${cred.user.email}!`);
    } catch (error) {
        console.error("Erro ao cadastrar usuário no Firebase:", error);
        window.showLoginAlert(formatAuthErrorMessage(error), error.code);
    }
};

// Tratar retorno de login por redirecionamento
try {
    getRedirectResult(auth).then((result) => {
        if (result && result.user) {
            window.closeLoginModal();
            window.showNotification(`Bem-vindo, ${result.user.displayName || result.user.email || 'Administrador'}!`);
        }
    }).catch((error) => {
        console.error("Erro no retorno de redirecionamento:", error);
        if (error.code !== 'auth/popup-closed-by-user') {
            window.showNotification(formatAuthErrorMessage(error), 'danger');
        }
    });
} catch (e) {
    console.warn("getRedirectResult não pôde ser executado:", e);
}

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

window.togglePasswordVisibility = (inputId, btn) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    input.style.textTransform = 'none'; // Garante que maiúsculas e minúsculas não sejam alteradas
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
};

window.openLoginModal = () => {
    const modal = document.getElementById('loginModal') || loginModal;
    const form = document.getElementById('loginForm') || loginForm;
    if (form) form.reset();
    if (typeof window.hideLoginAlert === 'function') window.hideLoginAlert();

    if (window.location.protocol === 'file:') {
        if (typeof window.showLoginAlert === 'function') {
            window.showLoginAlert("Você está abrindo o arquivo diretamente (file://). O Firebase Authentication requer um servidor local (como http://localhost:5500 via VS Code Live Server) ou o link de publicação do Firebase Hosting.");
        }
    } else if (window.location.hostname === '127.0.0.1') {
        const port = window.location.port ? `:${window.location.port}` : '';
        if (typeof window.showLoginAlert === 'function') {
            window.showLoginAlert(`Aviso: você está acessando via <strong>127.0.0.1${port}</strong>.<br>Para login do Google funcionar sem bloqueio, acesse por <a href="http://localhost${port}${window.location.pathname}" style="color: var(--primary-color); font-weight: bold;">http://localhost${port}${window.location.pathname}</a> ou adicione <strong>127.0.0.1</strong> na aba <em>Configurações > Domínios Autorizados</em> do Firebase Console.`, "auth/unauthorized-domain");
        }
    }

    const passInput = document.getElementById('login-password');
    if (passInput) {
        passInput.type = 'password';
        passInput.style.textTransform = 'none';
    }
    const emailInput = document.getElementById('login-email');
    if (emailInput) emailInput.style.textTransform = 'none';
    const googleHint = document.getElementById('google-email-hint');
    if (googleHint) googleHint.style.display = 'none';
    const toggleIcon = form ? form.querySelector('.btn-toggle-password i') : null;
    if (toggleIcon) toggleIcon.className = 'fas fa-eye';

    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            if (emailInput) emailInput.focus();
        }, 100);
    }
};

// Vincula evento de clique no botão de login da barra superior
const authToggleBtn = document.getElementById('auth-toggle');
if (authToggleBtn) {
    authToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.handleAuthClick();
    });
}

window.closeLoginModal = () => {
    if (loginModal) loginModal.style.display = 'none';
};

// Fechar modal ao clicar fora ou ao teclar Escape
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) window.closeLoginModal();
    });
}
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.style.display === 'block') {
        window.closeLoginModal();
    }
});

if (loginForm) {
    const emailField = document.getElementById('login-email');
    const googleHint = document.getElementById('google-email-hint');
    if (emailField && googleHint) {
        emailField.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (val.includes('@gmail.com') || val.includes('@googlemail.com')) {
                googleHint.style.display = 'flex';
            } else {
                googleHint.style.display = 'none';
            }
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.closeLoginModal();
            window.showNotification("Bem-vindo! Acesso administrativo liberado.");
        } catch (error) {
            console.error("Erro Técnico Firebase:", error.code);
            let msg = formatAuthErrorMessage(error);
            let canRegister = false;
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                if (email.toLowerCase().endsWith('@gmail.com')) {
                    msg = "Não foi possível validar esta senha para este e-mail. Se for sua conta Google pessoal, use o botão <strong>Entrar com a Conta Google</strong> acima! Se deseja usar com senha separada, você pode cadastrá-la abaixo.";
                } else {
                    msg = "Usuário não encontrado ou senha incorreta. Deseja cadastrar esta conta agora?";
                }
                if (pass.length >= 6) {
                    canRegister = true;
                } else {
                    msg += "<br><small style='color: #dc3545;'>Nota: o Firebase exige senhas com no mínimo 6 caracteres.</small>";
                }
            }
            window.showLoginAlert(msg, error.code, canRegister);
            window.showNotification(msg.replace(/<[^>]*>/g, ''), 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Entrar';
        }
    });
}

window.loginSocial = async (providerName) => {
    let provider;
    if (providerName === 'google') {
        provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        provider.addScope('email');
        provider.addScope('profile');
    } else if (providerName === 'github') {
        provider = new GithubAuthProvider();
    } else {
        return;
    }

    const clickedBtns = document.querySelectorAll(`button[onclick*="'${providerName}'"]`);
    clickedBtns.forEach(b => {
        b.disabled = true;
        b.dataset.prevHtml = b.innerHTML;
        b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
    });

    try {
        let result;
        try {
            result = await signInWithPopup(auth, provider);
        } catch (popupErr) {
            if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
                console.warn("Popup bloqueado, utilizando redirecionamento seguro...", popupErr);
                window.showNotification("Redirecionando para login seguro com o Google...", "info");
                await signInWithRedirect(auth, provider);
                return;
            }
            throw popupErr;
        }

        window.closeLoginModal();
        window.showNotification(`Bem-vindo, ${result.user.displayName || result.user.email || 'Administrador'}!`);
    } catch (error) {
        console.error("Erro no login social:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        const msg = formatAuthErrorMessage(error);
        window.showLoginAlert(msg, error.code);
        window.showNotification(msg.replace(/<[^>]*>/g, ''), 'danger');
    } finally {
        clickedBtns.forEach(b => {
            b.disabled = false;
            if (b.dataset.prevHtml) b.innerHTML = b.dataset.prevHtml;
        });
    }
};

let avaliacoesMap = new Map();
let unsubscribeAvaliacoes = null;

function subscribeAvaliacoes() {
    if (unsubscribeAvaliacoes) {
        unsubscribeAvaliacoes();
        unsubscribeAvaliacoes = null;
    }
    if (!auth.currentUser) {
        avaliacoesMap.clear();
        updateAvaliacoesCounterUI();
        renderTable();
        return;
    }

    try {
        unsubscribeAvaliacoes = onSnapshot(collection(db, "avaliacoes_2026"), (snapshot) => {
            avaliacoesMap.clear();
            snapshot.docs.forEach(d => {
                const data = d.data();
                const normName = normalizeString(data.professor || '');
                const email = (data.email || '').toLowerCase().trim();
                if (normName) avaliacoesMap.set(normName, { id: d.id, ...data });
                if (email) avaliacoesMap.set(email, { id: d.id, ...data });
            });
            updateAvaliacoesCounterUI();
            renderTable();
        }, (err) => {
            console.warn("Aviso ao carregar avaliações no painel:", err);
        });
    } catch (e) {
        console.warn("Erro ao registrar snapshot de avaliações:", e);
    }
}

function updateAvaliacoesCounterUI() {
    const pill = document.getElementById('kpi-avaliacoes-pill');
    if (!pill) return;
    if (!auth.currentUser || !jsonData.professores || jsonData.professores.length === 0) {
        pill.style.display = 'none';
        return;
    }

    let completed = 0;
    jsonData.professores.forEach(p => {
        const pNorm = normalizeString(p.nome || '');
        const pEmail = (p.email || '').toLowerCase().trim();
        if (avaliacoesMap.has(pNorm) || (pEmail && avaliacoesMap.has(pEmail))) {
            completed++;
        }
    });

    const total = jsonData.professores.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    pill.style.display = 'inline-flex';
    pill.innerHTML = `<i class="fas fa-clipboard-check" style="color: #10b981;"></i> Avaliações: <strong>${completed} de ${total}</strong> (${pct}%)`;
}

onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-toggle');
    if (user) {
        document.body.classList.add('is-admin');
        if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
    } else {
        document.body.classList.remove('is-admin');
        if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
    subscribeAvaliacoes();
    renderTable();
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

let jsonData = { professores: [], escolas: [], disciplinas: [], anos: [], encontros: [] };
let presencaKey = '';
let presencaDateFormatted = '';
let activeEncontroKey = 'all';
window._isEncontrosModalOpen = false;

function extractEncontrosFromProfessores(professores) {
    if (!professores || professores.length === 0) return [];
    const keysFound = new Set();
    professores.forEach(prof => {
        Object.keys(prof).forEach(k => {
            if (k.startsWith('presenca_')) keysFound.add(k);
        });
    });
    const list = Array.from(keysFound).map(k => {
        const datePart = k.replace('presenca_', '');
        const parts = datePart.split('_');
        let dataFormatada = datePart;
        let dataIso = '';
        if (parts.length === 3) {
            const [y, m, d] = parts;
            dataFormatada = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
            dataIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return {
            id: datePart,
            key: k,
            data: dataIso,
            dataFormatada: dataFormatada,
            nome: `Encontro ${dataFormatada}`
        };
    });
    list.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
    return list;
}

function syncEncontrosState() {
    let meetings = Array.isArray(jsonData.encontros) ? [...jsonData.encontros] : [];
    if (meetings.length === 0 && jsonData.professores && jsonData.professores.length > 0) {
        meetings = extractEncontrosFromProfessores(jsonData.professores);
    }
    meetings = meetings.map(m => {
        const key = m.key || `presenca_${(m.data || m.id).replace(/-/g, '_')}`;
        let df = m.dataFormatada;
        if (!df && m.data) {
            const [y, mm, dd] = m.data.split('-');
            df = `${dd}/${mm}/${y}`;
        }
        return {
            id: m.id || m.data || key.replace('presenca_', ''),
            key: key,
            data: m.data || '',
            dataFormatada: df || m.id,
            nome: m.nome || `Encontro ${df || m.id}`
        };
    });
    jsonData.encontros = meetings;

    if (meetings.length > 0) {
        const primary = meetings[meetings.length - 1];
        presencaKey = primary.key;
        presencaDateFormatted = primary.dataFormatada;
    }
    updateEncontrosSelectUI();
}

function getActiveEncontrosList() {
    if (!jsonData.encontros || jsonData.encontros.length === 0) {
        return [{
            id: 'default',
            key: presencaKey || 'presenca_2026_05_06',
            dataFormatada: presencaDateFormatted || '06/05/2026',
            nome: 'Encontro Oficial'
        }];
    }
    if (activeEncontroKey && activeEncontroKey !== 'all') {
        const found = jsonData.encontros.find(e => e.key === activeEncontroKey || e.id === activeEncontroKey);
        return found ? [found] : jsonData.encontros;
    }
    return jsonData.encontros;
}

function updateEncontrosSelectUI() {
    const sel = document.getElementById('select-encontro-ativo');
    if (!sel) return;
    const currentVal = sel.value || activeEncontroKey || 'all';
    let html = '<option value="all">📅 Todos os Encontros (Lado a Lado)</option>';
    (jsonData.encontros || []).forEach(enc => {
        html += `<option value="${escapeHTML(enc.key)}">📅 ${escapeHTML(enc.dataFormatada)} - ${escapeHTML(enc.nome)}</option>`;
    });
    sel.innerHTML = html;
    if (jsonData.encontros.some(e => e.key === currentVal) || currentVal === 'all') {
        sel.value = currentVal;
    } else {
        sel.value = 'all';
    }
    activeEncontroKey = sel.value;
}

window.handleEncontroChange = (val) => {
    activeEncontroKey = val;
    renderTable();
};

window.openEncontrosModal = () => {
    window._isEncontrosModalOpen = true;
    const modal = document.getElementById('encontrosModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        renderEncontrosList();
    }
};

window.closeEncontrosModal = () => {
    window._isEncontrosModalOpen = false;
    const modal = document.getElementById('encontrosModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
};

function renderEncontrosList() {
    const listEl = document.getElementById('encontrosList');
    if (!listEl) return;
    const encontros = jsonData.encontros || [];
    if (encontros.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 18px 0;">Nenhum encontro cadastrado ainda. Adicione uma data acima.</div>';
        return;
    }

    const totalProfs = (jsonData.professores || []).length;
    let html = '';
    encontros.forEach(enc => {
        const presCount = (jsonData.professores || []).filter(p => Boolean(p[enc.key])).length;
        const pct = totalProfs > 0 ? Math.round((presCount / totalProfs) * 100) : 0;
        const isActive = activeEncontroKey === enc.key;
        
        html += `
        <div class="metadata-item-row ${isActive ? 'is-active-encontro' : ''}" style="display:flex; justify-content:space-between; align-items:center; padding: 10px 14px; border-bottom: 1px solid var(--border-color); gap: 10px;">
            <div style="flex:1; min-width: 0;">
                <div style="font-weight: 700; color: var(--text-color); display:flex; align-items:center; gap: 8px;">
                    <i class="fas fa-calendar-day" style="color: #2563eb;"></i> ${escapeHTML(enc.dataFormatada)}
                    ${isActive ? '<span class="metadata-badge-active"><i class="fas fa-check-circle"></i> Selecionado</span>' : ''}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
                    ${escapeHTML(enc.nome)} • <strong style="color: #059669;">${presCount}/${totalProfs} presentes (${pct}%)</strong>
                </div>
            </div>
            <div style="display:flex; gap: 6px; align-items:center;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="setEncontroAtivo('${escapeHTML(enc.key)}')" title="Filtrar tabela por este encontro" style="font-size:0.75rem; padding: 4px 8px;">
                    <i class="fas fa-filter"></i> ${isActive ? 'Ativo' : 'Filtrar'}
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteEncontro('${escapeHTML(enc.id)}')" title="Remover este encontro" style="font-size:0.75rem; padding: 4px 8px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;
    });
    listEl.innerHTML = html;
}

window.setEncontroAtivo = (key) => {
    activeEncontroKey = key;
    updateEncontrosSelectUI();
    renderTable();
    renderEncontrosList();
};

window.handleNovoEncontroSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!auth.currentUser) {
        window.showNotification("Apenas administradores autenticados podem adicionar encontros.", "danger");
        return;
    }
    const dataInput = document.getElementById('encontroDataInput');
    const nomeInput = document.getElementById('encontroNomeInput');
    const rawData = dataInput ? dataInput.value.trim() : '';
    if (!rawData) {
        window.showNotification("Por favor, informe a data do encontro formativo.", "warning");
        return;
    }
    const [y, m, d] = rawData.split('-');
    const dataFormatada = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    const id = rawData.replace(/-/g, '_');
    const key = `presenca_${id}`;
    const nome = (nomeInput && nomeInput.value.trim()) ? nomeInput.value.trim() : `Encontro Formativo ${dataFormatada}`;

    const existing = (jsonData.encontros || []).find(e => e.id === id || e.key === key);
    if (existing) {
        window.showNotification("Já existe um encontro cadastrado para esta data.", "warning");
        return;
    }

    const updated = [...(jsonData.encontros || []), {
        id: id,
        key: key,
        data: rawData,
        dataFormatada: dataFormatada,
        nome: nome
    }];

    try {
        await setDoc(doc(db, "configuracoes", "geral"), {
            encontros: updated
        }, { merge: true });
        
        jsonData.encontros = updated;
        activeEncontroKey = key;
        syncEncontrosState();
        renderTable();
        renderEncontrosList();
        if (dataInput) dataInput.value = '';
        if (nomeInput) nomeInput.value = '';
        window.showNotification(`Encontro ${dataFormatada} adicionado com sucesso!`, "success");
    } catch (err) {
        console.error("Erro ao salvar encontro:", err);
        window.showNotification(`Erro ao cadastrar encontro: ${err.message}`, "danger");
    }
};

window.deleteEncontro = async (meetingId) => {
    if (!auth.currentUser) {
        window.showNotification("Apenas administradores autenticados podem remover encontros.", "danger");
        return;
    }
    const target = (jsonData.encontros || []).find(e => e.id === meetingId);
    if (!target) return;
    
    if (!confirm(`Tem certeza de que deseja remover o encontro de ${target.dataFormatada}? (Os registros de presença dos professores permanecerão no histórico)`)) {
        return;
    }

    const updated = (jsonData.encontros || []).filter(e => e.id !== meetingId);
    try {
        await setDoc(doc(db, "configuracoes", "geral"), {
            encontros: updated
        }, { merge: true });
        
        jsonData.encontros = updated;
        if (activeEncontroKey === target.key) activeEncontroKey = 'all';
        syncEncontrosState();
        renderTable();
        renderEncontrosList();
        window.showNotification(`Encontro ${target.dataFormatada} removido.`, "info");
    } catch (err) {
        console.error("Erro ao remover encontro:", err);
        window.showNotification(`Erro ao remover: ${err.message}`, "danger");
    }
};

function extractPresenceInfo(professores) {
    syncEncontrosState();
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

    onSnapshot(doc(db, "configuracoes", "geral"), async (configSnap) => {
        if (configSnap.exists()) {
            const configData = configSnap.data();
            jsonData.escolas = configData.escolas || [];
            jsonData.disciplinas = configData.disciplinas || [];
            jsonData.anos = configData.anos || [];
            jsonData.encontros = configData.encontros || [];
            syncEncontrosState();

            // Se escolas ou disciplinas ainda não foram preenchidas no documento, carrega a partir dos professores
            if (jsonData.escolas.length === 0 && jsonData.professores && jsonData.professores.length > 0) {
                jsonData.escolas = [...new Set(jsonData.professores.map(p => p.escola).filter(Boolean))].sort();
            }
            if (jsonData.disciplinas.length === 0 && jsonData.professores && jsonData.professores.length > 0) {
                jsonData.disciplinas = [...new Set(jsonData.professores.map(p => p.disciplina).filter(Boolean))].sort();
            }

            initFilters();
            renderTable();
            if (window._isMetadataModalOpen && typeof window.renderMetadataList === 'function') {
                window.renderMetadataList();
            }
            if (window._isEncontrosModalOpen && typeof renderEncontrosList === 'function') {
                renderEncontrosList();
            }
        } else {
            const defaultEscolas = ["ALZIRA", "ANNA", "BRAGA", "CAIC", "CÉLIA", "ESTHER", "PADRE", "OUTRA"];
            const defaultDisciplinas = ["EDM"];
            const defaultAnos = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º"];

            jsonData.escolas = defaultEscolas;
            jsonData.disciplinas = defaultDisciplinas;
            jsonData.anos = defaultAnos;
            initFilters();
            renderTable();

            if (auth.currentUser) {
                try {
                    await setDoc(doc(db, "configuracoes", "geral"), {
                        escolas: defaultEscolas,
                        disciplinas: defaultDisciplinas,
                        anos: defaultAnos
                    }, { merge: true });
                } catch(e) {}
            }
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
    if (!auth.currentUser) {
        window.showNotification("Acesso restrito para administradores.", "warning");
        return;
    }
    if (professorForm) professorForm.reset();
    const overlay = document.getElementById('modalSuccessOverlay');
    if (overlay) overlay.style.display = 'none';
    
    const profIdInput = document.getElementById('prof-id');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalSubmitText = document.getElementById('modalSubmitText');

    if (profIdInput) profIdInput.value = profId || '';
    const modalIcon = document.querySelector('#professorModal .modal-icon-badge i');
    if (modalTitle) {
        modalTitle.innerHTML = profId 
            ? 'Editar Professor <span class="badge-modal-edit"><i class="fas fa-pencil"></i> Edição</span>' 
            : 'Novo Professor';
    }
    if (modalSubtitle) modalSubtitle.textContent = profId ? 'Atualize os dados e atribuição do docente' : 'Preencha os dados cadastrais do docente';
    if (modalSubmitText) modalSubmitText.textContent = profId ? 'Salvar Alterações' : 'Cadastrar';
    if (modalIcon) {
        modalIcon.className = profId ? 'fas fa-user-pen' : 'fas fa-chalkboard-user';
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
            const emailField = document.getElementById('prof-email');
            if (emailField) emailField.value = prof.email || '';
        }
    } else {
        const emailField = document.getElementById('prof-email');
        if (emailField) emailField.value = '';
    }

    if (professorModal) {
        professorModal.style.display = 'block';
        setTimeout(() => {
            const nomeInput = document.getElementById('prof-nome');
            if (nomeInput) nomeInput.focus();
        }, 100);
    }
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

// Fechar modal de professor ao clicar fora ou ao teclar Escape
if (professorModal) {
    professorModal.addEventListener('click', (e) => {
        if (e.target === professorModal) window.closeProfessorModal();
    });
}
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && professorModal && professorModal.style.display === 'block') {
        window.closeProfessorModal();
    }
});

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
            nome: document.getElementById('prof-nome').value.trim(),
            escola: document.getElementById('prof-escola').value,
            disciplina: document.getElementById('prof-disciplina').value,
            ano: document.getElementById('prof-ano').value.trim(),
            turma: document.getElementById('prof-turma').value.trim(),
            turno: document.getElementById('prof-turno').value,
            telefone: document.getElementById('prof-telefone').value.trim(),
            email: (document.getElementById('prof-email')?.value || '').trim().toLowerCase(),
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

window.togglePresenca = async (id, currentStatus, targetKey = null) => {
    if (!auth.currentUser) {
        window.showNotification("Acesso negado. Faça login para alterar a presença.", 'danger');
        return;
    }

    try {
        const keyToUse = targetKey || presencaKey || 'presenca_2026_05_06';
        const docRef = doc(db, "professores", id);
        const newStatus = !currentStatus;
        
        await updateDoc(docRef, {
            [keyToUse]: newStatus,
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
    if (selectedYears.length > 0) params.set('ano', selectedYears.join(','));
    
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
               (selectedDisciplina === '' || p.disciplina === selectedDisciplina) &&
               (selectedYears.length === 0 || selectedYears.includes(p.ano));
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

    const activeEncontros = getActiveEncontrosList();
    const pdfHead = ['Nome', 'Escola', 'Disciplina', 'Ano', 'Turma', 'Turno', 'Telefone', 'E-mail'];
    if (auth.currentUser && activeEncontros.length > 0) {
        activeEncontros.forEach(enc => {
            pdfHead.push(`Presença (${enc.dataFormatada})`);
        });
    }

    const tableData = filtered.map(p => {
        const row = [p.nome, p.escola, p.disciplina, p.ano, p.turma, p.turno, p.telefone || '-', p.email || '-'];
        if (auth.currentUser && activeEncontros.length > 0) {
            activeEncontros.forEach(enc => {
                row.push(p[enc.key] ? 'PRESENTE' : 'AUSENTE');
            });
        }
        return row;
    });

    doc.autoTable({
        startY: 35,
        head: [pdfHead],
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

// --- Gestão Completa de Cadastro de Escolas e Disciplinas ---
let currentMetadataTab = 'escolas';
window._isMetadataModalOpen = false;

window.openMetadataModal = (tab = 'escolas') => {
    if (!auth.currentUser) {
        window.showNotification("Acesso restrito para administradores.", "warning");
        return;
    }
    const modal = document.getElementById('metadataModal');
    if (!modal) return;
    
    window._isMetadataModalOpen = true;
    modal.style.display = 'block';
    window.switchMetadataTab(tab);
};

window.closeMetadataModal = () => {
    const modal = document.getElementById('metadataModal');
    if (modal) modal.style.display = 'none';
    window._isMetadataModalOpen = false;
};

window.switchMetadataTab = (tab = 'escolas') => {
    currentMetadataTab = tab;
    const isEscola = tab === 'escolas';

    const tabBtnEscolas = document.getElementById('tab-btn-escolas');
    const tabBtnDisciplinas = document.getElementById('tab-btn-disciplinas');
    const titleEl = document.getElementById('metadataModalTitle');
    const subtitleEl = document.getElementById('metadataModalSubtitle');
    const iconBadge = document.getElementById('metadataIconBadge');
    const inputEl = document.getElementById('metadataNewInput');

    if (tabBtnEscolas) tabBtnEscolas.classList.toggle('active', isEscola);
    if (tabBtnDisciplinas) tabBtnDisciplinas.classList.toggle('active', !isEscola);

    if (titleEl) titleEl.textContent = isEscola ? 'Gestão de Escolas' : 'Gestão de Disciplinas';
    if (subtitleEl) subtitleEl.textContent = isEscola 
        ? 'Cadastre, renomeie e organize as escolas da rede municipal' 
        : 'Cadastre, renomeie e organize os componentes curriculares';

    if (iconBadge) {
        iconBadge.innerHTML = isEscola ? '<i class="fas fa-school"></i>' : '<i class="fas fa-book-open"></i>';
    }

    if (inputEl) {
        inputEl.placeholder = isEscola ? 'NOME DA NOVA ESCOLA (EX: CAIC)' : 'NOME DA DISCIPLINA (EX: ROBÓTICA)';
        inputEl.value = '';
        inputEl.focus();
    }

    window.renderMetadataList();
};

window.renderMetadataList = () => {
    const listEl = document.getElementById('metadataList');
    const badgeEscolas = document.getElementById('count-badge-escolas');
    const badgeDisciplinas = document.getElementById('count-badge-disciplinas');

    const escolas = jsonData.escolas || [];
    const disciplinas = jsonData.disciplinas || [];

    if (badgeEscolas) badgeEscolas.textContent = escolas.length;
    if (badgeDisciplinas) badgeDisciplinas.textContent = disciplinas.length;

    if (!listEl) return;

    const isEscola = currentMetadataTab === 'escolas';
    const items = isEscola ? escolas : disciplinas;
    const fieldKey = isEscola ? 'escola' : 'disciplina';

    if (items.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; padding: 30px; color: var(--text-secondary); font-size: 0.88rem;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.5;"></i>
                <p style="margin: 0;">Nenhum item cadastrado nesta categoria.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = items.map(item => {
        const linkedCount = (jsonData.professores || []).filter(p => {
            const val = (p[fieldKey] || '').toUpperCase().trim();
            return val === item.toUpperCase().trim() || val.includes(item.toUpperCase().trim());
        }).length;

        const countBadge = linkedCount > 0
            ? `<span class="metadata-badge-count"><i class="fas fa-chalkboard-user"></i> ${linkedCount} docente${linkedCount > 1 ? 's' : ''} vinculado${linkedCount > 1 ? 's' : ''}</span>`
            : `<span class="metadata-badge-count zero"><i class="fas fa-user-slash"></i> 0 vinculados</span>`;

        const safeItem = String(item).replace(/'/g, "\\'");
        const safeDisplay = String(item).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);

        return `
            <div class="metadata-item-row">
                <div class="metadata-item-info">
                    <span class="metadata-item-name">
                        <i class="fas ${isEscola ? 'fa-school' : 'fa-book-bookmark'}" style="color: var(--primary-color); opacity: 0.85;"></i>
                        ${safeDisplay}
                    </span>
                    <span class="metadata-item-meta">
                        ${countBadge}
                    </span>
                </div>
                <div class="metadata-item-actions">
                    <button type="button" class="btn-metadata-action" onclick="editMetadataItem('${safeItem}')" title="Renomear / Editar">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                    <button type="button" class="btn-metadata-action danger" onclick="deleteMetadataItem('${safeItem}')" title="Excluir">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.handleMetadataAdd = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
        window.showNotification("Acesso restrito para administradores.", "warning");
        return;
    }

    const input = document.getElementById('metadataNewInput');
    if (!input) return;
    const val = input.value.trim().toUpperCase();
    if (!val) return;

    const type = currentMetadataTab; // 'escolas' ou 'disciplinas'
    const label = type === 'escolas' ? 'Escola' : 'Disciplina';
    const currentList = jsonData[type] || [];

    if (currentList.some(item => item.toUpperCase() === val)) {
        window.showNotification(`${label} '${val}' já está cadastrada.`, 'danger');
        input.focus();
        return;
    }

    const updatedList = [...currentList, val].sort();

    try {
        const updateObj = {};
        updateObj[type] = updatedList;
        await setDoc(doc(db, "configuracoes", "geral"), updateObj, { merge: true });
        jsonData[type] = updatedList;
        initFilters();
        window.renderMetadataList();
        input.value = '';
        input.focus();
        window.showNotification(`${label} '${val}' cadastrada com sucesso!`);
    } catch (err) {
        console.error("Erro ao adicionar:", err);
        window.showNotification("Erro ao cadastrar: " + err.message, "danger");
    }
};

window.editMetadataItem = async (oldName) => {
    if (!auth.currentUser) {
        window.showNotification("Acesso restrito para administradores.", "warning");
        return;
    }

    const type = currentMetadataTab;
    const label = type === 'escolas' ? 'Escola' : 'Disciplina';
    const fieldKey = type === 'escolas' ? 'escola' : 'disciplina';

    const newName = prompt(`Digite o novo nome para ${label.toLowerCase()} '${oldName}':`, oldName);
    if (!newName) return;
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed || trimmed === oldName.toUpperCase()) return;

    const currentList = jsonData[type] || [];
    if (currentList.some(item => item.toUpperCase() === trimmed && item.toUpperCase() !== oldName.toUpperCase())) {
        window.showNotification(`Já existe outra ${label.toLowerCase()} cadastrada com o nome '${trimmed}'.`, 'danger');
        return;
    }

    const linkedProfs = (jsonData.professores || []).filter(p => (p[fieldKey] || '').toUpperCase().trim() === oldName.toUpperCase().trim());

    try {
        const updatedList = currentList.map(item => item.toUpperCase() === oldName.toUpperCase() ? trimmed : item).sort();
        const updateObj = {};
        updateObj[type] = updatedList;

        await setDoc(doc(db, "configuracoes", "geral"), updateObj, { merge: true });
        jsonData[type] = updatedList;

        if (linkedProfs.length > 0) {
            let updatedCount = 0;
            for (let prof of linkedProfs) {
                if (prof.id) {
                    const profUpdate = {};
                    profUpdate[fieldKey] = trimmed;
                    await updateDoc(doc(db, "professores", prof.id), profUpdate);
                    prof[fieldKey] = trimmed;
                    updatedCount++;
                }
            }
            window.showNotification(`${label} renomeada para '${trimmed}' e atualizada em ${updatedCount} professor(es)!`);
        } else {
            window.showNotification(`${label} renomeada com sucesso para '${trimmed}'!`);
        }

        initFilters();
        renderTable();
        window.renderMetadataList();
    } catch (err) {
        console.error("Erro ao renomear:", err);
        window.showNotification("Erro ao renomear: " + err.message, "danger");
    }
};

window.deleteMetadataItem = async (name) => {
    if (!auth.currentUser) {
        window.showNotification("Acesso restrito para administradores.", "warning");
        return;
    }

    const type = currentMetadataTab;
    const label = type === 'escolas' ? 'Escola' : 'Disciplina';
    const fieldKey = type === 'escolas' ? 'escola' : 'disciplina';

    const linkedCount = (jsonData.professores || []).filter(p => (p[fieldKey] || '').toUpperCase().trim() === name.toUpperCase().trim()).length;

    let confirmMsg = `Deseja realmente remover a ${label.toLowerCase()} '${name}'?`;
    if (linkedCount > 0) {
        confirmMsg = `Atenção: Existem ${linkedCount} professor(es) vinculados à ${label.toLowerCase()} '${name}'.\n\nSe você excluir, os docentes existentes manterão este valor, mas '${name}' não aparecerá mais para novas seleções.\n\nDeseja continuar?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
        const currentList = jsonData[type] || [];
        const updatedList = currentList.filter(item => item.toUpperCase() !== name.toUpperCase());
        const updateObj = {};
        updateObj[type] = updatedList;

        await setDoc(doc(db, "configuracoes", "geral"), updateObj, { merge: true });
        jsonData[type] = updatedList;

        initFilters();
        renderTable();
        window.renderMetadataList();
        window.showNotification(`${label} '${name}' excluída com sucesso!`);
    } catch (err) {
        console.error("Erro ao excluir:", err);
        window.showNotification("Erro ao excluir: " + err.message, "danger");
    }
};

// Mantém compatibilidade com chamadas antigas de manageMetadata
window.manageMetadata = (type) => window.openMetadataModal(type);

const professoresListDiv = document.getElementById('professores-list');
const searchInput = document.getElementById('search-input');
const schoolFilter = document.getElementById('school-filter');
const disciplineFilter = document.getElementById('discipline-filter');
const paginationDiv = document.getElementById('pagination');
const btnClearFilters = document.getElementById('btn-clear-filters');
const resultsCountSpan = document.getElementById('results-count');

let selectedYears = [];

window.toggleYearDropdown = (e) => {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('year-dropdown-menu');
    const btn = document.getElementById('year-filter-btn');
    if (!dropdown || !btn) return;
    const isOpen = dropdown.classList.contains('show');
    
    document.querySelectorAll('.multiselect-dropdown.show').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.multiselect-btn.active').forEach(b => b.classList.remove('active'));

    if (!isOpen) {
        dropdown.classList.add('show');
        btn.classList.add('active');
    }
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.multiselect-dropdown.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.multiselect-btn.active').forEach(b => b.classList.remove('active'));
    }
});

window.handleYearSelectAll = (selectAllCb) => {
    const checkboxes = document.querySelectorAll('.year-checkbox');
    if (selectAllCb.checked) {
        checkboxes.forEach(cb => cb.checked = false);
        selectedYears = [];
    }
    updateYearFilterButtonLabel();
    debouncedRenderTable();
};

window.handleYearCheckboxChange = () => {
    const checkboxes = document.querySelectorAll('.year-checkbox');
    const selectAllCb = document.getElementById('year-select-all');
    
    selectedYears = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    if (selectAllCb) {
        selectAllCb.checked = (selectedYears.length === 0);
    }
    
    updateYearFilterButtonLabel();
    debouncedRenderTable();
};

function updateYearFilterButtonLabel() {
    const labelSpan = document.getElementById('year-filter-label');
    if (!labelSpan) return;
    if (selectedYears.length === 0) {
        labelSpan.textContent = "Todos os Anos";
    } else if (selectedYears.length === 1) {
        labelSpan.textContent = `Ano: ${selectedYears[0]}`;
    } else {
        labelSpan.textContent = `Anos (${selectedYears.length}): ${selectedYears.join(', ')}`;
    }
}

let sortConfig = {
    key: 'nome',
    direction: 'asc'
};

let currentPage = 1;

function getDynamicRowsPerPage(totalItems) {
    if (currentViewMode === 'cards') return 12;

    const container = document.getElementById('professores-list');
    if (!container) return 20;

    const containerHeight = container.clientHeight;
    if (containerHeight <= 0) return 20;

    const thead = container.querySelector('thead');
    const theadHeight = thead && thead.offsetHeight > 0 ? thead.offsetHeight : 28;
    const availableHeight = containerHeight - theadHeight - 2;

    const sampleRow = container.querySelector('tbody tr');
    const rowHeight = sampleRow && sampleRow.offsetHeight > 0 ? sampleRow.offsetHeight : 26;

    if (availableHeight <= 0 || rowHeight <= 0) return 18;

    const fitCount = Math.floor(availableHeight / rowHeight);

    // Se todos os professores couberem na tela atual, mostra todos na mesma página sem precisar paginar!
    if (totalItems && totalItems <= fitCount) {
        return totalItems;
    }

    return Math.max(fitCount, 5);
}


let currentViewMode = localStorage.getItem('viewMode') || 'table';

function updateToggleButtonsUI() {
    const btnTable = document.getElementById('btn-view-table');
    const btnCards = document.getElementById('btn-view-cards');
    if (btnTable) btnTable.classList.toggle('active', currentViewMode === 'table');
    if (btnCards) btnCards.classList.toggle('active', currentViewMode === 'cards');
}

window.setViewMode = (mode) => {
    currentViewMode = mode;
    localStorage.setItem('viewMode', mode);
    updateToggleButtonsUI();
    renderTable();
};

function getInitials(name) {
    if (!name) return 'P';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

    const years = [...new Set(jsonData.professores.map(p => p.ano).filter(Boolean))].sort();

    schools.forEach(school => {
        schoolFilter.add(new Option(school, school));
    });
    schoolFilter.value = currentSchool;

    disciplines.forEach(discipline => {
        disciplineFilter.add(new Option(discipline, discipline));
    });
    disciplineFilter.value = currentDiscipline;

    const dropdownMenu = document.getElementById('year-dropdown-menu');
    if (dropdownMenu) {
        let html = `
            <label class="multiselect-option">
                <input type="checkbox" id="year-select-all" ${selectedYears.length === 0 ? 'checked' : ''} onchange="handleYearSelectAll(this)">
                <span><strong>(TODOS OS ANOS)</strong></span>
            </label>
            <div class="multiselect-divider"></div>
        `;

        years.forEach(year => {
            const isChecked = selectedYears.includes(year);
            html += `
                <label class="multiselect-option">
                    <input type="checkbox" class="year-checkbox" value="${escapeHTML(year)}" ${isChecked ? 'checked' : ''} onchange="handleYearCheckboxChange()">
                    <span>${escapeHTML(year)}</span>
                </label>
            `;
        });
        dropdownMenu.innerHTML = html;
        updateYearFilterButtonLabel();
    }
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
    const currentRows = getDynamicRowsPerPage(totalItems);
    const totalPages = Math.ceil(totalItems / currentRows);
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
        const matchesYear = selectedYears.length === 0 || selectedYears.includes(professor.ano);

        let matchesAval = true;
        const filterAval = document.getElementById('filter-avaliacao')?.value || '';
        if (auth.currentUser && filterAval) {
            const pNorm = normalizeString(professor.nome || '');
            const pEmail = (professor.email || '').toLowerCase().trim();
            const hasAval = avaliacoesMap.has(pNorm) || (pEmail && avaliacoesMap.has(pEmail));
            if (filterAval === 'concluida' && !hasAval) matchesAval = false;
            if (filterAval === 'pendente' && hasAval) matchesAval = false;
        }

        return matchesSearch && matchesSchool && matchesDiscipline && matchesYear && matchesAval;
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
        if (auth.currentUser && presencaKey && totalWithPresenca > 0) {
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
        const currentRows = getDynamicRowsPerPage(filteredProfessores.length);
        const totalPages = Math.ceil(filteredProfessores.length / currentRows);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = 1;
        }
        const start = (currentPage - 1) * currentRows;
        const end = start + currentRows;
        const paginatedItems = filteredProfessores.slice(start, end);

        if (paginatedItems.length > 0) {
            updateToggleButtonsUI();

            if (currentViewMode === 'cards') {
                professoresListDiv.className = 'cards-container-wrapper';
                let cardsHTML = '<div class="cards-grid">';
                
                paginatedItems.forEach(professor => {
                    const initials = getInitials(professor.nome);
                    const telFormatted = professor.telefone ? escapeHTML(professor.telefone) : 'N/A';
                    const telClean = professor.telefone ? professor.telefone.replace(/\D/g, '') : '';
                    const telLink = telClean 
                        ? (telClean.length >= 10 
                            ? `<a href="https://wa.me/55${telClean}" target="_blank" class="phone-link" title="WhatsApp"><i class="fab fa-whatsapp"></i> ${telFormatted}</a>` 
                            : `<a href="tel:${telClean}" class="phone-link"><i class="fas fa-phone-alt"></i> ${telFormatted}</a>`) 
                        : 'N/A';

                    const emailLink = professor.email 
                        ? `<a href="mailto:${escapeHTML(professor.email)}" class="phone-link" title="E-mail"><i class="fas fa-envelope"></i> ${escapeHTML(professor.email)}</a>` 
                        : 'N/A';

                    let presencaBadgeHTML = '';
                    const activeEncontros = getActiveEncontrosList();
                    if (auth.currentUser && activeEncontros.length > 0) {
                        presencaBadgeHTML = activeEncontros.map(enc => {
                            const isPresent = Boolean(professor[enc.key]);
                            const presencaClass = isPresent ? 'badge-presente' : 'badge-ausente';
                            const presencaText = isPresent ? 'Presente' : 'Ausente';
                            const dotClass = isPresent ? 'dot-presente' : 'dot-ausente';
                            return `<span class="badge ${presencaClass}" style="margin: 2px;" onclick="togglePresenca('${professor.id}', ${isPresent}, '${enc.key}')" title="${escapeHTML(enc.nome)}: Clique para alternar"><span class="status-dot ${dotClass}"></span> ${escapeHTML(enc.dataFormatada)}: ${escapeHTML(presencaText)}</span>`;
                        }).join(' ');
                    }

                    let avalBadgeHTML = '';
                    if (auth.currentUser) {
                        const profNorm = normalizeString(professor.nome || '');
                        const profEmail = (professor.email || '').toLowerCase().trim();
                        const aval = avaliacoesMap.get(profNorm) || (profEmail ? avaliacoesMap.get(profEmail) : null);
                        avalBadgeHTML = aval 
                            ? `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #047857; font-size: 0.74rem; border: 1px solid rgba(16, 185, 129, 0.3);"><i class="fas fa-check-circle"></i> Avaliação: Concluída</span>`
                            : `<span class="badge" style="background: rgba(245, 158, 11, 0.12); color: #b45309; font-size: 0.74rem; border: 1px solid rgba(245, 158, 11, 0.25);"><i class="fas fa-clock"></i> Avaliação: Pendente</span>`;
                    }

                    let adminActionsHTML = '';
                    if (auth.currentUser) {
                        adminActionsHTML = `
                            <div class="card-actions admin-only">
                                <button class="action-btn" onclick="openProfessorModal('${professor.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete" onclick="deleteProfessor('${professor.id}', '${escapeHTML(professor.nome)}')" title="Excluir"><i class="fas fa-trash"></i></button>
                            </div>
                        `;
                    }

                    cardsHTML += `
                        <div class="prof-card">
                            <div class="prof-card-header">
                                <div class="prof-card-avatar">${initials}</div>
                                <div class="prof-card-title-group">
                                    <h3 class="prof-card-name">${escapeHTML(professor.nome)}</h3>
                                    <span class="prof-card-disc">${escapeHTML(professor.disciplina)}</span>
                                </div>
                                ${adminActionsHTML}
                            </div>
                            <div class="prof-card-body">
                                <div class="prof-card-detail-item">
                                    <i class="fas fa-school"></i> <span>${escapeHTML(professor.escola)}</span>
                                </div>
                                <div class="prof-card-detail-item">
                                    <i class="fas fa-graduation-cap"></i> <span>Ano: ${escapeHTML(professor.ano)} | Turma: ${escapeHTML(professor.turma)}</span>
                                </div>
                                <div class="prof-card-detail-item">
                                    <i class="fas fa-clock"></i> ${getTurnoBadge(professor.turno)}
                                </div>
                                <div class="prof-card-detail-item">
                                    <i class="fas fa-phone"></i> <span>${telLink}</span>
                                </div>
                                ${professor.email ? `
                                <div class="prof-card-detail-item">
                                    <i class="fas fa-envelope"></i> <span>${emailLink}</span>
                                </div>` : ''}
                            </div>
                            ${(presencaBadgeHTML || avalBadgeHTML) ? `<div class="prof-card-footer" style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;"><span style="font-size: 0.8em; font-weight: 600; color: var(--text-secondary);">Status:</span> ${presencaBadgeHTML} ${avalBadgeHTML}</div>` : ''}
                        </div>`;
                });
                
                cardsHTML += '</div>';
                professoresListDiv.innerHTML = cardsHTML;
            } else {
                professoresListDiv.className = 'table-responsive';
                const headers = [
                    { label: 'Nome', key: 'nome' },
                    { label: 'Escola', key: 'escola' },
                    { label: 'Disciplina', key: 'disciplina' },
                    { label: 'Ano', key: 'ano' },
                    { label: 'Turma', key: 'turma' },
                    { label: 'Turno', key: 'turno' },
                    { label: 'Telefone', key: 'telefone' },
                    { label: 'E-mail', key: 'email' }
                ];
                const activeEncontrosList = getActiveEncontrosList();
                if (auth.currentUser && activeEncontrosList.length > 0) {
                    activeEncontrosList.forEach(enc => {
                        headers.push({ label: `Presença (${enc.dataFormatada})`, key: enc.key });
                    });
                }
                if (auth.currentUser) {
                    headers.push({ label: 'Avaliação 2026', key: 'avaliacao_status' });
                }
                if (auth.currentUser) {
                    headers.push({ label: 'Ações', key: 'actions' });
                }

                let tableHTML = '<table>';
                tableHTML += '<thead><tr>';
                headers.forEach(h => {
                    let icon = (h.key !== 'actions' && h.key !== 'avaliacao_status') ? '<i class="fas fa-sort" style="opacity: 0.2; margin-left: 5px;"></i>' : '';
                    if (sortConfig.key === h.key) {
                        icon = sortConfig.direction === 'asc' 
                            ? ' <i class="fas fa-sort-up" style="margin-left: 5px;"></i>' 
                            : ' <i class="fas fa-sort-down" style="margin-left: 5px;"></i>';
                    }
                    let adminClass = (h.key === 'actions' || h.key === 'avaliacao_status') ? 'admin-only' : '';
                    let style = (h.key === 'actions' || h.key === 'avaliacao_status') ? 'style="cursor: default;"' : '';
                    let centerClass = ['ano', 'turma', 'turno', 'actions', 'avaliacao_status', presencaKey].includes(h.key) ? 'text-center' : '';
                    tableHTML += `<th onclick="${h.key !== 'actions' && h.key !== 'avaliacao_status' ? `setSort('${h.key}')` : ''}" class="col-${h.key} ${adminClass} ${centerClass}" ${style}>${h.label}${icon}</th>`;
                });
                tableHTML += '</tr></thead><tbody>';

                paginatedItems.forEach(professor => {
                    const telClean = (professor.telefone || '').replace(/\D/g, '');
                    const telDisplay = professor.telefone 
                        ? (telClean.length >= 10 
                            ? `<a href="https://wa.me/55${telClean}" target="_blank" class="table-phone-link" title="Abrir no WhatsApp"><i class="fab fa-whatsapp"></i> ${escapeHTML(professor.telefone)}</a>` 
                            : `<span class="table-phone"><i class="fas fa-phone-alt"></i> ${escapeHTML(professor.telefone)}</span>`)
                        : '<span class="text-muted">-</span>';

                    const emailCell = professor.email 
                        ? `<a href="mailto:${escapeHTML(professor.email)}" class="email-table-link" title="Enviar e-mail para ${escapeHTML(professor.nome)}"><i class="fas fa-envelope"></i> ${escapeHTML(professor.email)}</a>` 
                        : '<span class="text-muted">-</span>';

                    tableHTML += '<tr>';
                    tableHTML += `<td class="col-nome"><strong>${escapeHTML(professor.nome)}</strong></td>`;
                    tableHTML += `<td class="col-escola">${escapeHTML(professor.escola)}</td>`;
                    tableHTML += `<td class="col-disciplina">${escapeHTML(professor.disciplina)}</td>`;
                    tableHTML += `<td class="col-ano text-center">${escapeHTML(professor.ano)}</td>`;
                    tableHTML += `<td class="col-turma text-center">${escapeHTML(professor.turma)}</td>`;
                    tableHTML += `<td class="col-turno text-center">${getTurnoBadge(professor.turno)}</td>`;
                    tableHTML += `<td class="col-telefone">${telDisplay}</td>`;
                    tableHTML += `<td class="col-email">${emailCell}</td>`;

                    if (auth.currentUser && activeEncontrosList.length > 0) {
                        activeEncontrosList.forEach(enc => {
                            const isPresent = Boolean(professor[enc.key]);
                            const presencaClass = isPresent ? 'badge-presente' : 'badge-ausente';
                            const presencaText = isPresent ? 'Presente' : 'Ausente';
                            const dotClass = isPresent ? 'dot-presente' : 'dot-ausente';
                            const clickHandler = `onclick="togglePresenca('${professor.id}', ${isPresent}, '${enc.key}')"`;
                            const tooltip = `title="Clique para alternar presença de ${escapeHTML(enc.dataFormatada)}"`;
                            tableHTML += `<td class="col-presenca text-center"><span class="badge ${presencaClass}" ${clickHandler} ${tooltip}><span class="status-dot ${dotClass}"></span> ${escapeHTML(presencaText)}</span></td>`;
                        });
                    }

                    if (auth.currentUser) {
                        const profNorm = normalizeString(professor.nome || '');
                        const profEmail = (professor.email || '').toLowerCase().trim();
                        const aval = avaliacoesMap.get(profNorm) || (profEmail ? avaliacoesMap.get(profEmail) : null);
                        if (aval) {
                            const d = aval.createdAt ? new Date(aval.createdAt).toLocaleDateString('pt-BR') : '';
                            tableHTML += `<td class="text-center col-avaliacao-status admin-only"><span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #047857; border: 1px solid rgba(16, 185, 129, 0.3);" title="Entregue em ${d} - Protocolo ${escapeHTML(aval.protocolo || '')}"><i class="fas fa-check-circle"></i> Concluída</span></td>`;
                        } else {
                            tableHTML += `<td class="text-center col-avaliacao-status admin-only"><span class="badge" style="background: rgba(245, 158, 11, 0.12); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.25);" title="Avaliação 2026 pendente"><i class="fas fa-clock"></i> Pendente</span></td>`;
                        }
                    }

                    if (auth.currentUser) {
                        tableHTML += `<td class="col-acoes admin-only text-center">
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
                            </div>
                        </td>`;
                    }
                    tableHTML += '</tr>';
                });
                tableHTML += '</tbody></table>';
                professoresListDiv.innerHTML = tableHTML;
            }
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
        const filterAvaliacaoEl = document.getElementById('filter-avaliacao');
        if (filterAvaliacaoEl) filterAvaliacaoEl.value = '';
        selectedYears = [];
        const selectAllCb = document.getElementById('year-select-all');
        if (selectAllCb) selectAllCb.checked = true;
        document.querySelectorAll('.year-checkbox').forEach(cb => cb.checked = false);
        updateYearFilterButtonLabel();
        resetAndRender();
    });
}

const resetAndRender = () => {
    currentPage = 1;
    renderTable();
};

if (searchInput) searchInput.addEventListener('input', debouncedRenderTable);

const uppercaseFields = ['search-input', 'prof-ano', 'prof-turma'];
uppercaseFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
    }
});

const profNomeInput = document.getElementById('prof-nome');
if (profNomeInput) {
    profNomeInput.addEventListener('input', (e) => {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s']/g, '').toUpperCase();
        if (start !== null && end !== null) {
            e.target.setSelectionRange(start, end);
        }
    });
}

if (schoolFilter) schoolFilter.addEventListener('change', debouncedRenderTable);
if (disciplineFilter) disciplineFilter.addEventListener('change', debouncedRenderTable);
const filterAvaliacaoEl = document.getElementById('filter-avaliacao');
if (filterAvaliacaoEl) filterAvaliacaoEl.addEventListener('change', debouncedRenderTable);

window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search') && searchInput) searchInput.value = params.get('search').toUpperCase();
    if (params.has('escola') && schoolFilter) schoolFilter.value = params.get('escola').toUpperCase();
    if (params.has('disciplina') && disciplineFilter) disciplineFilter.value = params.get('disciplina').toUpperCase();
    if (params.has('ano')) {
        const rawYears = params.get('ano').toUpperCase().split(',');
        selectedYears = rawYears.map(y => y.trim()).filter(Boolean);
    }
    if (params.toString()) debouncedRenderTable();
});

// Iniciar carregamento dos dados
loadData();

// ==========================================================================
// SINCRONIZAÇÃO AUTOMÁTICA DE E-MAILS DA LISTA DE PRESENÇA OFICIAL
// Fonte: https://educacao-tech.github.io/lista_presenca/
// ==========================================================================

const PRESENCA_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQng9IxPZEAbQsrdWBqfNi5FMTdXOKAzySIgw8zMtHk0LeiD2A9BRc71m7GSnWyCD7IHGMDVCNR9mqY/pub?output=csv";

function normalizeString(str) {
    if (!str) return '';
    return str.toString()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .toUpperCase()
        .trim()
        .replace(/\s+/g, ' ');
}

// Mapeamentos específicos para normalizar variações de nomes conhecidas
const EMAIL_OVERRIDES = {
    [normalizeString("LÚCIA HELENA SAQUETO G. GONÇALVES")]: "heleninhasgg@gmail.com",
    [normalizeString("MARCELA YARA V. L. RAYMUNDO A. CARNEIRO")]: "marcelaray@educacao.batatais.sp.gov.br",
    [normalizeString("ELIZÂNGELA CERCE CONUNCHUC")]: "elizcerce@gmail.com",
    [normalizeString("ALEXANDRE SILVA PEDROSO")]: "alexandre.pedroso.evb@educacao.batatais.sp.gov.br",
    [normalizeString("ISABEL CRISTINA MANIERI DANIEL")]: "isabelmanierid@gmail.com",
    [normalizeString("ANA CAROLINA VENTUROSO BÉRGAMO CÂNDIDO")]: "anacarolinaventuroso@gmail.com",
    [normalizeString("PATRÍCIA ALEIXO SILVA de OLIVEIRA")]: "patriciaaleixos@gmail.com",
    [normalizeString("PATRÍCIA CORSINI COSTA")]: "pacorsini@gmail.com",
    [normalizeString("SUELLEN FRANCINE DA SILVA e SILVA")]: "suellenfssilva@gmail.com",
    [normalizeString("MARIANA R. DE FARIA EVANGELISTA")]: "marianaroberta.1998@gmail.com"
};

// Parser CSV Robusto
function parseCSVHelper(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentRow.push(currentCell.trim());
            if (currentRow.some(c => c !== '')) rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c !== '')) rows.push(currentRow);
    }
    return rows;
}

window.syncEmailsFromPresenca = async () => {
    if (!auth.currentUser) {
        window.showNotification("Faça login administrativo para sincronizar e-mails.", "warning");
        return;
    }

    const btn = document.getElementById('btn-sync-emails');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
    }

    window.showNotification("Buscando e-mails da lista de presença oficial...", "info");

    try {
        const separator = PRESENCA_CSV_URL.includes('?') ? '&' : '?';
        const res = await fetch(`${PRESENCA_CSV_URL}${separator}_t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Falha ao obter planilha: status ${res.status}`);
        const csvText = await res.text();

        const rows = parseCSVHelper(csvText);
        const csvEmailMap = new Map();
        const schoolKeywords = ['ALZIRA', 'ANNA', 'BRAGA', 'CAIC', 'CELIA', 'ESTHER', 'PADRE'];

        rows.forEach((row, i) => {
            if (i === 0 || !row || row.length < 2) return;
            let email = '';
            row.forEach(cell => {
                if (cell && cell.includes('@')) email = cell.trim().toLowerCase();
            });

            const textCells = row.map(c => (c || '').trim()).filter(c => c && c !== email && !(c.includes('/') && c.includes(':')));
            let name = '';
            if (textCells.length >= 2) {
                const norm0 = normalizeString(textCells[0]);
                const norm1 = normalizeString(textCells[1]);
                if (schoolKeywords.some(s => norm0.includes(s))) {
                    name = textCells[1];
                } else {
                    name = textCells[0];
                }
            } else if (textCells.length === 1) {
                name = textCells[0];
            }

            if (name && email) {
                csvEmailMap.set(normalizeString(name), email);
            }
        });

        let updatedCount = 0;
        const updatePromises = [];

        jsonData.professores.forEach(prof => {
            const normName = normalizeString(prof.nome);
            let targetEmail = EMAIL_OVERRIDES[normName] || csvEmailMap.get(normName);

            if (!targetEmail) {
                for (const [csvNorm, email] of csvEmailMap.entries()) {
                    if (csvNorm.length > 5 && (normName.includes(csvNorm) || csvNorm.includes(normName))) {
                        targetEmail = email;
                        break;
                    }
                }
            }

            if (targetEmail && prof.email !== targetEmail) {
                updatedCount++;
                prof.email = targetEmail;
                if (prof.id) {
                    updatePromises.push(updateDoc(doc(db, "professores", prof.id), {
                        email: targetEmail,
                        ultima_alteracao: new Date().toISOString()
                    }));
                }
            }
        });

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            renderTable();
            window.showNotification(`Sucesso! ${updatedCount} e-mail(s) de professores foram sincronizados e salvos no Firestore.`, 'success');
        } else {
            window.showNotification("Todos os professores já estão com os e-mails atualizados da lista de presença!", 'info');
        }
    } catch (err) {
        console.error("Erro ao sincronizar e-mails:", err);
        window.showNotification("Erro na sincronização: " + err.message, 'danger');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml;
        }
    }
};

// Recalcula a quantidade de linhas que cabem na tela fixa ao redimensionar
window.addEventListener('resize', debounce(() => {
    if (typeof renderTable === 'function' && document.getElementById('professores-list')) {
        renderTable();
    }
}, 150));


// ==========================================
// CONTROLE DE DENSIDADE E MODO EXPANDIDO
// ==========================================
let currentDensity = localStorage.getItem('tableDensity') || 'compact';
let isExpanded = localStorage.getItem('tableExpanded') === 'true';

window.updateDensityUI = () => {
    const btnCompact = document.getElementById('btn-density-compact');
    const btnComfort = document.getElementById('btn-density-comfort');
    if (btnCompact) btnCompact.classList.toggle('active', currentDensity === 'compact');
    if (btnComfort) btnComfort.classList.toggle('active', currentDensity === 'comfort');

    const container = document.querySelector('.container') || document.body;
    container.classList.toggle('density-comfort', currentDensity === 'comfort');
    container.classList.toggle('density-compact', currentDensity === 'compact');
    document.body.classList.toggle('density-comfort', currentDensity === 'comfort');
    document.body.classList.toggle('density-compact', currentDensity === 'compact');
};

window.setDensity = (density) => {
    currentDensity = density;
    localStorage.setItem('tableDensity', density);
    window.updateDensityUI();
    if (typeof renderTable === 'function') renderTable();
};

window.updateExpandUI = () => {
    const container = document.querySelector('.container');
    const btnExpand = document.getElementById('btn-toggle-expand');
    const filters = document.querySelector('.filters');

    if (container) container.classList.toggle('is-expanded', isExpanded);
    if (filters) filters.style.display = isExpanded ? 'none' : 'flex';

    if (btnExpand) {
        btnExpand.classList.toggle('active', isExpanded);
        btnExpand.innerHTML = isExpanded 
            ? '<i class="fas fa-compress"></i> Filtros' 
            : '<i class="fas fa-expand"></i> Expandir';
        btnExpand.title = isExpanded 
            ? 'Exibir filtros da tabela' 
            : 'Recolher filtros para modo tela cheia';
    }
};

window.toggleExpandMode = () => {
    isExpanded = !isExpanded;
    localStorage.setItem('tableExpanded', isExpanded);
    window.updateExpandUI();
    if (typeof renderTable === 'function') renderTable();
};

// Inicialização imediata de interface
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.updateDensityUI();
        window.updateExpandUI();
    });
} else {
    window.updateDensityUI();
    window.updateExpandUI();
}
