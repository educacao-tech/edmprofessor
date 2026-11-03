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

onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-toggle');
    if (user) {
        document.body.classList.add('is-admin');
        if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
    } else {
        document.body.classList.remove('is-admin');
        if (authBtn) authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
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

        if (cruzamentoState.rawPresencas && cruzamentoState.rawPresencas.length > 0) {
            computeCruzamentoData();
            if (cruzamentoState.activeTab === 'cruzamento') {
                renderCruzamentoUI();
            }
        } else {
            syncCruzamentoData(false);
        }
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
            jsonData.anos = configData.anos || [];
            initFilters();
            renderTable();
        } else {
            jsonData.escolas = [];
            jsonData.disciplinas = [];
            jsonData.anos = [];
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

    const pdfHead = ['Nome', 'Escola', 'Disciplina', 'Ano', 'Turma', 'Turno', 'Telefone', 'E-mail'];
    if (auth.currentUser && presencaKey) {
        pdfHead.push('Presença');
    }

    const tableData = filtered.map(p => {
        const row = [p.nome, p.escola, p.disciplina, p.ano, p.turma, p.turno, p.telefone || '-', p.email || '-'];
        if (auth.currentUser && presencaKey) {
            row.push(p[presencaKey] ? 'PRESENTE' : 'AUSENTE');
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

window.manageMetadata = async (type) => {
    let label = 'Disciplina';
    if (type === 'escolas') label = 'Escola';
    if (type === 'anos') label = 'Ano';

    let newValue = prompt(`Digite o nome do(a) novo(a) ${label}:`);
    
    if (!newValue || newValue.trim() === "") return;
    newValue = newValue.trim().toUpperCase();

    const currentList = jsonData[type] || [];
    if (currentList.includes(newValue)) {
        window.showNotification(`${label} já existe na lista.`, 'danger');
        return;
    }

    const updatedList = [...currentList, newValue].sort();
    const updateObj = {};
    updateObj[type] = updatedList;

    try {
        await updateDoc(doc(db, "configuracoes", "geral"), updateObj);
        jsonData[type] = updatedList;
        initFilters();
        window.showNotification(`${label} adicionado(a) com sucesso!`);
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
const rowsPerPage = 15;

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
        const matchesYear = selectedYears.length === 0 || selectedYears.includes(professor.ano);

        return matchesSearch && matchesSchool && matchesDiscipline && matchesYear;
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
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
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
                    if (auth.currentUser && presencaKey && professor[presencaKey] !== undefined) {
                        const isPresent = professor[presencaKey];
                        const presencaClass = isPresent ? 'badge-presente' : 'badge-ausente';
                        const presencaText = isPresent ? 'Presente' : 'Ausente';
                        const dotClass = isPresent ? 'dot-presente' : 'dot-ausente';
                        presencaBadgeHTML = `<span class="badge ${presencaClass}" onclick="togglePresenca('${professor.id}', ${isPresent})" title="Clique para alternar presença"><span class="status-dot ${dotClass}"></span> ${escapeHTML(presencaText)}</span>`;
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
                            ${presencaBadgeHTML ? `<div class="prof-card-footer"><span style="font-size: 0.8em; font-weight: 600; color: var(--text-secondary);">Frequência:</span> ${presencaBadgeHTML}</div>` : ''}
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
                if (auth.currentUser && presencaKey && presencaDateFormatted) {
                    headers.push({ label: `Presença (${presencaDateFormatted})`, key: presencaKey });
                }
                if (auth.currentUser) {
                    headers.push({ label: 'Ações', key: 'actions' });
                }

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
                    let centerClass = ['ano', 'turma', 'turno', 'actions', presencaKey].includes(h.key) ? 'text-center' : '';
                    tableHTML += `<th onclick="setSort('${h.key}')" class="col-${h.key} ${adminClass} ${centerClass}" ${style}>${h.label}${icon}</th>`;
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

                    if (auth.currentUser && presencaKey && professor[presencaKey] !== undefined) {
                        const isPresent = professor[presencaKey];
                        const presencaClass = isPresent ? 'badge-presente' : 'badge-ausente';
                        const presencaText = isPresent ? 'Presente' : 'Ausente';
                        const dotClass = isPresent ? 'dot-presente' : 'dot-ausente';
                        
                        const clickHandler = `onclick="togglePresenca('${professor.id}', ${isPresent})"`;
                        const tooltip = 'title="Clique para alternar presença"';
                        
                        tableHTML += `<td class="col-presenca text-center"><span class="badge ${presencaClass}" ${clickHandler} ${tooltip}><span class="status-dot ${dotClass}"></span> ${escapeHTML(presencaText)}</span></td>`;
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
    if (params.has('ano')) {
        const rawYears = params.get('ano').toUpperCase().split(',');
        selectedYears = rawYears.map(y => y.trim()).filter(Boolean);
    }
    if (params.toString()) debouncedRenderTable();
});

// ==========================================================================
// ABA DE CRUZAMENTO DE INFORMAÇÕES & AUDITORIA DE FALTAS
// ==========================================================================

const DEFAULT_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQng9IxPZEAbQsrdWBqfNi5FMTdXOKAzySIgw8zMtHk0LeiD2A9BRc71m7GSnWyCD7IHGMDVCNR9mqY/pub?output=csv";

const ALL_STANDARDIZED_SCHOOLS = [
    "ALZIRA ACRA",
    "ANNA BONAGURA",
    "BRAGA MORATO",
    "CAIC",
    "CÉLIA BUENO",
    "ESTHER VIANNA",
    "PADRE BENITO"
];

const cruzamentoState = {
    activeTab: 'professores',
    sheetUrl: localStorage.getItem('cruzamento_sheet_url') || DEFAULT_SHEET_CSV_URL,
    rawPresencas: [],
    cruzamentoList: [],
    lastSyncTime: null,
    isSyncing: false,
    selectedStatus: 'faltas',
    selectedSchool: '',
    searchTerm: '',
    currentPage: 1,
    rowsPerPage: 15,
    viewMode: localStorage.getItem('cruzViewMode') || 'table',
    sortConfig: { key: 'nome', direction: 'asc' }
};

// Funções de Normalização
function normalizeText(text) {
    if (!text) return '';
    return text.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .toUpperCase()
        .trim()
        .replace(/\s+/g, ' ');
}

function normalizeSchoolName(school) {
    if (!school) return '';
    const norm = normalizeText(school);
    if (norm.includes('ALZIRA')) return 'ALZIRA ACRA';
    if (norm.includes('ANNA') || norm.includes('BONAGURA')) return 'ANNA BONAGURA';
    if (norm.includes('BRAGA') || norm.includes('MORATO')) return 'BRAGA MORATO';
    if (norm.includes('CAIC')) return 'CAIC';
    if (norm.includes('CELIA') || norm.includes('BUENO')) return 'CÉLIA BUENO';
    if (norm.includes('ESTHER') || norm.includes('VIANNA')) return 'ESTHER VIANNA';
    if (norm.includes('PADRE') || norm.includes('BENITO')) return 'PADRE BENITO';
    return school.trim().toUpperCase();
}

// Alternar Abas Principais
window.switchMainTab = (tabName) => {
    cruzamentoState.activeTab = tabName;
    
    const tabProfBtn = document.getElementById('tab-btn-professores');
    const tabCruzBtn = document.getElementById('tab-btn-cruzamento');
    const viewProf = document.getElementById('view-tab-professores');
    const viewCruz = document.getElementById('view-tab-cruzamento');

    if (tabName === 'professores') {
        if (tabProfBtn) tabProfBtn.classList.add('active');
        if (tabCruzBtn) tabCruzBtn.classList.remove('active');
        if (viewProf) viewProf.style.display = 'flex';
        if (viewCruz) viewCruz.style.display = 'none';
        renderTable();
    } else {
        if (tabProfBtn) tabProfBtn.classList.remove('active');
        if (tabCruzBtn) tabCruzBtn.classList.add('active');
        if (viewProf) viewProf.style.display = 'none';
        if (viewCruz) viewCruz.style.display = 'flex';
        
        if (cruzamentoState.rawPresencas.length === 0) {
            syncCruzamentoData(false);
        } else {
            computeCruzamentoData();
            renderCruzamentoUI();
        }
    }
};

// Parser CSV Robusto
function parseCSV(text) {
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

// Sincronização com Google Sheets CSV
window.syncCruzamentoData = async (showFeedback = true) => {
    if (cruzamentoState.isSyncing) return;
    cruzamentoState.isSyncing = true;

    const pulseDot = document.getElementById('cruzamentoPulseDot');
    const statusTitle = document.getElementById('cruzamentoStatusTitle');
    const statusDesc = document.getElementById('cruzamentoStatusDesc');

    if (pulseDot) pulseDot.className = 'status-pulse-dot warning';
    if (statusTitle) statusTitle.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando com Google Planilhas...';
    if (statusDesc) statusDesc.textContent = 'Baixando respostas do formulário em tempo real';

    try {
        const url = cruzamentoState.sheetUrl || DEFAULT_SHEET_CSV_URL;
        const separator = url.includes('?') ? '&' : '?';
        const fetchUrl = `${url}${separator}_t=${Date.now()}`;

        const res = await fetch(fetchUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Falha de conexão: Status ${res.status}`);

        const text = await res.text();
        const rows = parseCSV(text);

        if (rows.length <= 1) {
            throw new Error("Planilha vazia ou sem linhas de dados");
        }

        // Detectar colunas da planilha
        const headerRow = rows[0].map(h => normalizeText(h));
        let idxTime = headerRow.findIndex(h => h.includes('CARIMBO') || h.includes('DATA') || h.includes('HORA'));
        let idxEmail = headerRow.findIndex(h => h.includes('EMAIL') || h.includes('CORREIO'));
        let idxEscola = headerRow.findIndex(h => h.includes('ESCOLA') || h.includes('UNIDADE'));
        let idxNome = headerRow.findIndex(h => h.includes('NOME') || h.includes('PROFESSOR'));

        if (idxTime === -1) idxTime = 0;
        if (idxEmail === -1) idxEmail = 1;
        if (idxEscola === -1) idxEscola = 2;
        if (idxNome === -1) idxNome = 3;

        const presencas = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const nome = row[idxNome] || '';
            if (!nome.trim()) continue;

            presencas.push({
                timestamp: row[idxTime] || '',
                email: row[idxEmail] || '',
                escolaRaw: row[idxEscola] || '',
                escola: normalizeSchoolName(row[idxEscola] || ''),
                nome: nome.trim()
            });
        }

        cruzamentoState.rawPresencas = presencas;
        cruzamentoState.lastSyncTime = new Date();

        computeCruzamentoData();
        renderCruzamentoUI();

        updateSheetUrlUI();

        const timeStr = cruzamentoState.lastSyncTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (pulseDot) pulseDot.className = 'status-pulse-dot';
        if (statusTitle) statusTitle.textContent = `Conectado ao Google Planilhas (${presencas.length} presenças registradas)`;
        if (statusDesc) statusDesc.textContent = `Última sincronização em tempo real às ${timeStr}`;

        if (showFeedback) {
            window.showNotification(`Cruzamento atualizado! ${presencas.length} registros de presença processados.`, 'success');
        }
    } catch (err) {
        console.error("Erro na sincronização do cruzamento:", err);
        const badge = document.getElementById('sheetUrlStatusBadge');
        if (badge) {
            badge.innerHTML = `<i class="fas fa-triangle-exclamation text-danger"></i> Erro de Conexão`;
        }
        if (pulseDot) pulseDot.className = 'status-pulse-dot danger';
        if (statusTitle) statusTitle.textContent = 'Erro ao conectar à Planilha Google';
        if (statusDesc) statusDesc.textContent = 'Verifique se a planilha foi publicada como CSV na Web (Arquivo > Publicar na Web)';

        if (showFeedback) {
            window.showNotification("Não foi possível carregar a planilha. Verifique a URL.", 'danger');
        }
    } finally {
        cruzamentoState.isSyncing = false;
    }
};

// Algoritmo de Cruzamento Inteligente (Multi-Pass Match)
function computeCruzamentoData() {
    const cadastrados = jsonData.professores || [];
    const presencas = cruzamentoState.rawPresencas || [];

    const matchedCadastrados = new Map(); // cadIndex -> formRecord
    const matchedPresencas = new Set();  // formIndex

    const stopWords = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E', 'SILVA', 'SOUZA', 'SOUSA']);

    // Pass 1: Correspondência Exata de Nome
    presencas.forEach((p, pIdx) => {
        if (matchedPresencas.has(pIdx)) return;
        const pNorm = normalizeText(p.nome);
        const pEscNorm = normalizeSchoolName(p.escolaRaw);

        cadastrados.forEach((c, cIdx) => {
            if (matchedCadastrados.has(cIdx)) return;
            const cNorm = normalizeText(c.nome);
            const cEscNorm = normalizeSchoolName(c.escola);

            if (pNorm === cNorm && (pEscNorm === cEscNorm || !pEscNorm || !cEscNorm)) {
                matchedCadastrados.set(cIdx, p);
                matchedPresencas.add(pIdx);
            }
        });
    });

    // Pass 2: Correspondência com Iniciais / Abreviações e Primeiro/Último Nome
    presencas.forEach((p, pIdx) => {
        if (matchedPresencas.has(pIdx)) return;
        const pNorm = normalizeText(p.nome);
        const pEscNorm = normalizeSchoolName(p.escolaRaw);
        const pWords = pNorm.split(' ').filter(w => !stopWords.has(w));
        const pParts = pNorm.split(' ');

        let bestMatchIdx = -1;
        let bestScore = 0;

        cadastrados.forEach((c, cIdx) => {
            if (matchedCadastrados.has(cIdx)) return;
            const cNorm = normalizeText(c.nome);
            const cEscNorm = normalizeSchoolName(c.escola);

            // Se escolas forem conhecidas e diferentes, não faz match
            if (pEscNorm && cEscNorm && pEscNorm !== cEscNorm) return;

            const cWords = cNorm.split(' ').filter(w => !stopWords.has(w));
            const cParts = cNorm.split(' ');

            // Match por primeiro e último nome
            if (pParts.length >= 2 && cParts.length >= 2) {
                if (pParts[0] === cParts[0] && pParts[pParts.length - 1] === cParts[cParts.length - 1]) {
                    bestMatchIdx = cIdx;
                    bestScore = 100;
                    return;
                }
            }

            // Match por contagem de palavras significativas
            const intersection = pWords.filter(w => cWords.includes(w)).length;
            if (intersection >= 2 && intersection > bestScore) {
                bestScore = intersection;
                bestMatchIdx = cIdx;
            }
        });

        if (bestMatchIdx !== -1) {
            matchedCadastrados.set(bestMatchIdx, p);
            matchedPresencas.add(pIdx);
        }
    });

    // Montar Lista Consolidada do Cruzamento
    const results = [];

    // 1. Docentes Cadastrados (Presentes ou Faltas)
    cadastrados.forEach((c, idx) => {
        const formRecord = matchedCadastrados.get(idx);
        const standardizedSchool = normalizeSchoolName(c.escola);

        if (formRecord) {
            results.push({
                id: c.id || `cad_${idx}`,
                status: 'presente',
                nome: c.nome,
                escola: standardizedSchool,
                escolaOriginal: c.escola,
                disciplina: c.disciplina || 'EDM',
                ano: c.ano || 'N/A',
                turma: c.turma || 'N/A',
                turno: c.turno || 'N/A',
                telefone: c.telefone || '',
                formTimestamp: formRecord.timestamp,
                formEmail: formRecord.email,
                formNome: formRecord.nome,
                formEscola: formRecord.escola,
                isCadastrado: true
            });
        } else {
            results.push({
                id: c.id || `cad_${idx}`,
                status: 'falta',
                nome: c.nome,
                escola: standardizedSchool,
                escolaOriginal: c.escola,
                disciplina: c.disciplina || 'EDM',
                ano: c.ano || 'N/A',
                turma: c.turma || 'N/A',
                turno: c.turno || 'N/A',
                telefone: c.telefone || '',
                formTimestamp: null,
                formEmail: null,
                formNome: null,
                formEscola: null,
                isCadastrado: true
            });
        }
    });

    // 2. Registros Avulsos / Extras na Planilha (Não encontrados no cadastro oficial)
    presencas.forEach((p, idx) => {
        if (!matchedPresencas.has(idx)) {
            const standardizedSchool = normalizeSchoolName(p.escolaRaw);
            results.push({
                id: `extra_${idx}`,
                status: 'extra',
                nome: p.nome,
                escola: standardizedSchool || 'NÃO IDENTIFICADA',
                escolaOriginal: p.escolaRaw,
                disciplina: 'EDM (Avulso)',
                ano: 'N/A',
                turma: 'N/A',
                turno: 'N/A',
                telefone: '',
                formTimestamp: p.timestamp,
                formEmail: p.email,
                formNome: p.nome,
                formEscola: p.escola,
                isCadastrado: false
            });
        }
    });

    cruzamentoState.cruzamentoList = results;

    // Atualizar badge de alertas na aba
    const totalFaltas = results.filter(r => r.status === 'falta').length;
    const tabBadge = document.getElementById('tab-faltas-badge');
    if (tabBadge) {
        tabBadge.textContent = totalFaltas;
        tabBadge.style.display = totalFaltas > 0 ? 'inline-block' : 'none';
    }
}

// Renderização Completa da Interface do Cruzamento
function renderCruzamentoUI() {
    const allRecords = cruzamentoState.cruzamentoList;
    const totalCadastrados = (jsonData.professores || []).length;
    const totalPresentes = allRecords.filter(r => r.status === 'presente').length;
    const totalFaltas = allRecords.filter(r => r.status === 'falta').length;
    const totalExtras = allRecords.filter(r => r.status === 'extra').length;
    const pctPresente = totalCadastrados > 0 ? Math.round((totalPresentes / totalCadastrados) * 100) : 0;
    const pctFalta = totalCadastrados > 0 ? Math.round((totalFaltas / totalCadastrados) * 100) : 0;

    // Atualizar KPIs
    const elTotal = document.getElementById('kpi-cadastrados-total');
    const elPres = document.getElementById('kpi-presentes-total');
    const elPresPct = document.getElementById('kpi-presentes-pct');
    const elFaltas = document.getElementById('kpi-faltas-total');
    const elFaltasPct = document.getElementById('kpi-faltas-pct');
    const elExtras = document.getElementById('kpi-extras-total');

    if (elTotal) elTotal.textContent = totalCadastrados;
    if (elPres) elPres.textContent = totalPresentes;
    if (elPresPct) elPresPct.textContent = `${pctPresente}% de comparecimento`;
    if (elFaltas) elFaltas.textContent = totalFaltas;
    if (elFaltasPct) elFaltasPct.textContent = `${pctFalta}% de ausência (${totalFaltas} docentes)`;
    if (elExtras) elExtras.textContent = totalExtras;

    // Popular Dropdown de Escolas do Cruzamento se estiver vazio
    const cruzSchoolSelect = document.getElementById('cruzamento-school-filter');
    if (cruzSchoolSelect && cruzSchoolSelect.options.length <= 1) {
        cruzSchoolSelect.innerHTML = '<option value="">Todas as Escolas</option>';
        ALL_STANDARDIZED_SCHOOLS.forEach(s => {
            cruzSchoolSelect.add(new Option(s, s));
        });
    }

    // Renderizar Pílulas de Escolas com Contagem Individual
    const pillsContainer = document.getElementById('cruzamentoSchoolsPills');
    if (pillsContainer) {
        const schoolFaltasMap = {};
        const schoolPresMap = {};
        ALL_STANDARDIZED_SCHOOLS.forEach(s => {
            schoolFaltasMap[s] = 0;
            schoolPresMap[s] = 0;
        });

        allRecords.forEach(r => {
            const sName = r.escola;
            if (r.status === 'falta' && schoolFaltasMap[sName] !== undefined) {
                schoolFaltasMap[sName]++;
            } else if (r.status === 'presente' && schoolPresMap[sName] !== undefined) {
                schoolPresMap[sName]++;
            }
        });

        let pillsHTML = `
            <div class="cruz-school-pill ${!cruzamentoState.selectedSchool ? 'active' : ''}" onclick="filterCruzamentoBySchool('')">
                <span>🏫 Todas</span>
                <span class="${totalFaltas > 0 ? 'pill-falta-badge' : 'pill-ok-badge'}">${totalFaltas > 0 ? totalFaltas + ' faltas' : '100%'}</span>
            </div>
        `;

        ALL_STANDARDIZED_SCHOOLS.forEach(school => {
            const fCount = schoolFaltasMap[school] || 0;
            const pCount = schoolPresMap[school] || 0;
            const isActive = cruzamentoState.selectedSchool === school;
            const badgeClass = fCount > 0 ? 'pill-falta-badge' : 'pill-ok-badge';
            const badgeText = fCount > 0 ? `${fCount} falta${fCount > 1 ? 's' : ''}` : `${pCount} pres.`;

            pillsHTML += `
                <div class="cruz-school-pill ${isActive ? 'active' : ''}" onclick="filterCruzamentoBySchool('${escapeHTML(school)}')">
                    <span>${escapeHTML(school)}</span>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
            `;
        });

        pillsContainer.innerHTML = pillsHTML;
    }

    renderCruzamentoTable();
}

// Filtro Rápido por Pílula de Escola
window.filterCruzamentoBySchool = (school) => {
    cruzamentoState.selectedSchool = school;
    const select = document.getElementById('cruzamento-school-filter');
    if (select) select.value = school;
    cruzamentoState.currentPage = 1;
    renderCruzamentoUI();
};

window.clearCruzamentoFilters = () => {
    cruzamentoState.searchTerm = '';
    cruzamentoState.selectedStatus = 'todos';
    cruzamentoState.selectedSchool = '';
    cruzamentoState.currentPage = 1;

    const sInput = document.getElementById('cruzamento-search');
    const sStatus = document.getElementById('cruzamento-status-filter');
    const sSchool = document.getElementById('cruzamento-school-filter');

    if (sInput) sInput.value = '';
    if (sStatus) sStatus.value = 'todos';
    if (sSchool) sSchool.value = '';

    renderCruzamentoUI();
};

window.setCruzamentoViewMode = (mode) => {
    cruzamentoState.viewMode = mode;
    localStorage.setItem('cruzViewMode', mode);
    
    const btnTable = document.getElementById('btn-cruz-view-table');
    const btnCards = document.getElementById('btn-cruz-view-cards');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');
    if (btnCards) btnCards.classList.toggle('active', mode === 'cards');
    
    renderCruzamentoTable();
};

window.setCruzamentoSort = (key) => {
    if (cruzamentoState.sortConfig.key === key) {
        cruzamentoState.sortConfig.direction = cruzamentoState.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        cruzamentoState.sortConfig.key = key;
        cruzamentoState.sortConfig.direction = 'asc';
    }
    renderCruzamentoTable();
};

function renderCruzamentoPagination(totalItems) {
    const paginationEl = document.getElementById('cruzamento-pagination');
    if (!paginationEl) return;
    const totalPages = Math.ceil(totalItems / cruzamentoState.rowsPerPage);
    paginationEl.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = cruzamentoState.currentPage === 1;
    prevBtn.onclick = () => { cruzamentoState.currentPage--; renderCruzamentoTable(); };
    paginationEl.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === cruzamentoState.currentPage) btn.classList.add('active');
        btn.onclick = () => { cruzamentoState.currentPage = i; renderCruzamentoTable(); };
        paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próximo';
    nextBtn.disabled = cruzamentoState.currentPage === totalPages;
    nextBtn.onclick = () => { cruzamentoState.currentPage++; renderCruzamentoTable(); };
    paginationEl.appendChild(nextBtn);
}

function renderCruzamentoTable() {
    const container = document.getElementById('cruzamento-list');
    const countSpan = document.getElementById('cruzamento-results-count');
    if (!container) return;

    const search = cruzamentoState.searchTerm.toLowerCase();
    const statusFilter = cruzamentoState.selectedStatus;
    const schoolFilter = cruzamentoState.selectedSchool;

    const filtered = cruzamentoState.cruzamentoList.filter(item => {
        const safeVal = (v) => (v || '').toString().toLowerCase();
        const matchesSearch = (
            safeVal(item.nome).includes(search) ||
            safeVal(item.escola).includes(search) ||
            safeVal(item.formEmail).includes(search) ||
            safeVal(item.formNome).includes(search) ||
            safeVal(item.disciplina).includes(search)
        );

        let matchesStatus = true;
        if (statusFilter === 'faltas') matchesStatus = (item.status === 'falta');
        else if (statusFilter === 'presentes') matchesStatus = (item.status === 'presente');
        else if (statusFilter === 'extras') matchesStatus = (item.status === 'extra');

        const matchesSchool = !schoolFilter || item.escola === schoolFilter;

        return matchesSearch && matchesStatus && matchesSchool;
    });

    if (countSpan) {
        countSpan.innerHTML = `Mostrando <strong>${filtered.length}</strong> registro(s) no cruzamento filtrado`;
    }

    // Ordenação
    filtered.sort((a, b) => {
        let valA = a[cruzamentoState.sortConfig.key] || '';
        let valB = b[cruzamentoState.sortConfig.key] || '';

        if (cruzamentoState.sortConfig.key === 'status') {
            const order = { 'falta': 1, 'extra': 2, 'presente': 3 };
            valA = order[a.status] || 9;
            valB = order[b.status] || 9;
        }

        if (valA < valB) return cruzamentoState.sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return cruzamentoState.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-results-message"><i class="fas fa-filter-circle-xmark"></i> Nenhum registro corresponde aos filtros selecionados no cruzamento.</p>';
        renderCruzamentoPagination(0);
        return;
    }

    const start = (cruzamentoState.currentPage - 1) * cruzamentoState.rowsPerPage;
    const end = start + cruzamentoState.rowsPerPage;
    const paginated = filtered.slice(start, end);

    if (cruzamentoState.viewMode === 'cards') {
        container.className = 'cards-container-wrapper';
        let html = '<div class="cards-grid">';

        paginated.forEach(item => {
            const initials = getInitials(item.nome);
            let badgeHTML = '';

            if (item.status === 'falta') {
                badgeHTML = `<span class="badge badge-falta"><i class="fas fa-circle-xmark"></i> FALTA</span>`;
            } else if (item.status === 'presente') {
                badgeHTML = `<span class="badge badge-presente-live"><i class="fas fa-circle-check"></i> PRESENTE</span>`;
            } else {
                badgeHTML = `<span class="badge badge-extra"><i class="fas fa-user-plus"></i> AVULSO</span>`;
            }

            let formInfoHTML = '';
            if (item.formTimestamp) {
                formInfoHTML = `
                    <div class="prof-card-detail-item" style="border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 6px;">
                        <i class="fas fa-clipboard-check text-primary"></i> 
                        <div class="form-sheet-tag">
                            <span class="form-timestamp"><i class="far fa-clock"></i> ${escapeHTML(item.formTimestamp)}</span>
                            <span class="form-email"><i class="far fa-envelope"></i> ${escapeHTML(item.formEmail || 'N/A')}</span>
                        </div>
                    </div>
                `;
            } else {
                formInfoHTML = `
                    <div class="prof-card-detail-item" style="color: var(--text-secondary); font-style: italic; border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 6px;">
                        <i class="fas fa-ban text-danger"></i> <span>Sem registro no Google Forms</span>
                    </div>
                `;
            }

            html += `
                <div class="prof-card ${item.status === 'falta' ? 'card-falta' : ''}">
                    <div class="prof-card-header">
                        <div class="prof-avatar">${initials}</div>
                        <div class="prof-card-title">
                            <h3>${escapeHTML(item.nome)}</h3>
                            <span class="prof-card-sub">${escapeHTML(item.escola)}</span>
                        </div>
                        <div>${badgeHTML}</div>
                    </div>
                    <div class="prof-card-body">
                        <div class="prof-card-detail-item">
                            <i class="fas fa-graduation-cap"></i> <span>Ano: ${escapeHTML(item.ano)} | Turma: ${escapeHTML(item.turma)}</span>
                        </div>
                        <div class="prof-card-detail-item">
                            <i class="fas fa-clock"></i> ${getTurnoBadge(item.turno)}
                        </div>
                        ${formInfoHTML}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    } else {
        container.className = 'table-responsive';
        const headers = [
            { label: 'Status', key: 'status' },
            { label: 'Professor(a)', key: 'nome' },
            { label: 'Escola', key: 'escola' },
            { label: 'Turma / Turno', key: 'turno' },
            { label: 'Registro no Formulário (Data/Hora & E-mail)', key: 'formTimestamp' }
        ];

        let html = '<table><thead><tr>';
        headers.forEach(h => {
            let icon = '<i class="fas fa-sort" style="opacity: 0.2; margin-left: 5px;"></i>';
            if (cruzamentoState.sortConfig.key === h.key) {
                icon = cruzamentoState.sortConfig.direction === 'asc' 
                    ? ' <i class="fas fa-sort-up" style="margin-left: 5px;"></i>' 
                    : ' <i class="fas fa-sort-down" style="margin-left: 5px;"></i>';
            }
            html += `<th onclick="setCruzamentoSort('${h.key}')">${h.label}${icon}</th>`;
        });
        html += '</tr></thead><tbody>';

        paginated.forEach(item => {
            let badgeHTML = '';
            let rowStyle = '';

            if (item.status === 'falta') {
                badgeHTML = `<span class="badge badge-falta"><i class="fas fa-circle-xmark"></i> FALTA</span>`;
                rowStyle = 'style="background-color: rgba(239, 68, 68, 0.03);"';
            } else if (item.status === 'presente') {
                badgeHTML = `<span class="badge badge-presente-live"><i class="fas fa-circle-check"></i> PRESENTE</span>`;
            } else {
                badgeHTML = `<span class="badge badge-extra"><i class="fas fa-user-plus"></i> AVULSO</span>`;
                rowStyle = 'style="background-color: rgba(168, 85, 247, 0.03);"';
            }

            let formCellHTML = '';
            if (item.formTimestamp) {
                formCellHTML = `
                    <div class="form-sheet-tag">
                        <span class="form-timestamp"><i class="fas fa-calendar-check" style="color: #10b981; margin-right: 4px;"></i> ${escapeHTML(item.formTimestamp)}</span>
                        <span class="form-email"><i class="far fa-envelope" style="margin-right: 4px;"></i> ${escapeHTML(item.formEmail || 'N/A')}</span>
                    </div>
                `;
            } else {
                formCellHTML = `<span style="color: var(--text-secondary); font-size: 0.8rem; font-style: italic;"><i class="fas fa-minus" style="margin-right: 4px;"></i> Não compareceu</span>`;
            }

            html += `
                <tr ${rowStyle}>
                    <td>${badgeHTML}</td>
                    <td><strong>${escapeHTML(item.nome)}</strong> ${item.status === 'extra' ? '<small class="tag-turno tag-noite" style="font-size:0.65rem;">Não cadastrado</small>' : ''}</td>
                    <td>${escapeHTML(item.escola)}</td>
                    <td>Ano: ${escapeHTML(item.ano)} (${escapeHTML(item.turma)}) • ${getTurnoBadge(item.turno)}</td>
                    <td>${formCellHTML}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    renderCruzamentoPagination(filtered.length);
}

// Funções de Controle Direto da URL da Planilha
function updateSheetUrlUI() {
    const input = document.getElementById('cruzamento-sheet-input');
    const badge = document.getElementById('sheetUrlStatusBadge');
    if (input) {
        input.value = cruzamentoState.sheetUrl || DEFAULT_SHEET_CSV_URL;
    }
    if (badge) {
        const count = cruzamentoState.rawPresencas ? cruzamentoState.rawPresencas.length : 0;
        if (count > 0) {
            badge.innerHTML = `<i class="fas fa-circle-check text-success"></i> ${count} registros conectados`;
        } else {
            badge.innerHTML = `<i class="fas fa-link text-primary"></i> Pronto para carregar`;
        }
    }
}

window.applySheetUrlFromInput = () => {
    const input = document.getElementById('cruzamento-sheet-input');
    if (!input || !input.value.trim()) {
        window.showNotification("Por favor, cole a URL da planilha.", 'warning');
        return;
    }

    const newUrl = input.value.trim();
    cruzamentoState.sheetUrl = newUrl;
    localStorage.setItem('cruzamento_sheet_url', newUrl);
    window.showNotification("URL da planilha atualizada! Carregando dados...");
    syncCruzamentoData(true);
};

window.resetDefaultSheetInput = () => {
    const input = document.getElementById('cruzamento-sheet-input');
    cruzamentoState.sheetUrl = DEFAULT_SHEET_CSV_URL;
    localStorage.setItem('cruzamento_sheet_url', DEFAULT_SHEET_CSV_URL);
    if (input) input.value = DEFAULT_SHEET_CSV_URL;
    window.showNotification("URL padrão da formação restaurada! Carregando dados...");
    syncCruzamentoData(true);
};

window.openCurrentSheetInBrowser = () => {
    const url = cruzamentoState.sheetUrl || DEFAULT_SHEET_CSV_URL;
    window.open(url, '_blank');
};

// Configuração do Link da Planilha (Modal)
window.openConfigSheetModal = () => {
    const modal = document.getElementById('configSheetModal');
    const input = document.getElementById('sheet-csv-url');
    if (input) input.value = cruzamentoState.sheetUrl || DEFAULT_SHEET_CSV_URL;
    if (modal) modal.style.display = 'block';
};

window.closeConfigSheetModal = () => {
    const modal = document.getElementById('configSheetModal');
    if (modal) modal.style.display = 'none';
};

window.restoreDefaultSheetUrl = () => {
    const input = document.getElementById('sheet-csv-url');
    if (input) input.value = DEFAULT_SHEET_CSV_URL;
};

window.handleSaveSheetConfig = (e) => {
    e.preventDefault();
    const input = document.getElementById('sheet-csv-url');
    if (!input || !input.value.trim()) return;

    cruzamentoState.sheetUrl = input.value.trim();
    localStorage.setItem('cruzamento_sheet_url', cruzamentoState.sheetUrl);
    updateSheetUrlUI();
    window.closeConfigSheetModal();
    window.showNotification("URL da planilha atualizada! Sincronizando dados...");
    syncCruzamentoData(true);
};

// Gravar Presenças no Firestore (Admin)
window.salvarPresencasNoFirestore = async () => {
    if (!auth.currentUser) {
        window.showNotification("Acesso restrito. Faça login como administrador para gravar dados no banco.", 'danger');
        return;
    }

    const faltasCount = cruzamentoState.cruzamentoList.filter(r => r.status === 'falta').length;
    const presCount = cruzamentoState.cruzamentoList.filter(r => r.status === 'presente').length;

    const confirmed = await window.showConfirmDialog(
        "Gravar Presenças no Banco",
        `Deseja registrar no Firestore as presenças da chamada atual? (${presCount} presentes e ${faltasCount} faltas)`,
        { okClass: 'btn-primary', icon: 'fa-cloud-arrow-up' }
    );

    if (!confirmed) return;

    const btn = document.getElementById('btnSalvarPresencasFirestore');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gravando...';
    }

    try {
        // Detectar data da chamada a partir do primeiro registro
        let formDateKey = 'presenca_chamada_recente';
        const sampleRecord = cruzamentoState.rawPresencas.find(p => p.timestamp);
        if (sampleRecord && sampleRecord.timestamp) {
            const dateParts = sampleRecord.timestamp.split(' ')[0].split('/');
            if (dateParts.length === 3) {
                formDateKey = `presenca_${dateParts[2]}_${dateParts[1]}_${dateParts[0]}`;
            }
        }

        let updatedCount = 0;
        for (const item of cruzamentoState.cruzamentoList) {
            if (item.isCadastrado && item.id && !item.id.startsWith('cad_')) {
                const docRef = doc(db, "professores", item.id);
                const isPresent = (item.status === 'presente');
                await updateDoc(docRef, {
                    [formDateKey]: isPresent,
                    ultima_alteracao: new Date().toISOString()
                });
                updatedCount++;
            }
        }

        window.showNotification(`Sucesso! ${updatedCount} docentes foram atualizados no Firestore sob a chave "${formDateKey}".`, 'success');
    } catch (err) {
        console.error("Erro ao gravar no Firestore:", err);
        window.showNotification(`Erro ao gravar no banco: ${err.message}`, 'danger');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
};

// Exportar PDF do Cruzamento
window.exportCruzamentoPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';

    const selectedSchool = cruzamentoState.selectedSchool;
    const allRecords = cruzamentoState.cruzamentoList;
    const filtered = allRecords.filter(r => !selectedSchool || r.escola === selectedSchool);

    const totalCad = filtered.filter(r => r.isCadastrado).length;
    const totalPres = filtered.filter(r => r.status === 'presente').length;
    const totalFaltas = filtered.filter(r => r.status === 'falta').length;
    const pct = totalCad > 0 ? Math.round((totalPres / totalCad) * 100) : 0;

    doc.setFontSize(16);
    doc.text('Relatório de Frequência & Cruzamento Docente (EDM)', 14, 18);
    doc.setFontSize(10);
    doc.text(`Escola: ${selectedSchool || 'Consolidado (Todas as Escolas)'}`, 14, 24);
    doc.text(`Total Cadastrados: ${totalCad}  |  Presentes: ${totalPres} (${pct}%)  |  Faltas: ${totalFaltas}`, 14, 29);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 34);

    const tableHead = ['Status', 'Professor(a)', 'Escola', 'Ano/Turma', 'Horário Registro (Forms)', 'E-mail'];
    const tableData = filtered.map(r => {
        let statusStr = 'PRESENTE';
        if (r.status === 'falta') statusStr = 'FALTA';
        else if (r.status === 'extra') statusStr = 'AVULSO';

        return [
            statusStr,
            r.nome,
            r.escola,
            `${r.ano} (${r.turma})`,
            r.formTimestamp || 'Não compareceu',
            r.formEmail || '-'
        ];
    });

    doc.autoTable({
        startY: 38,
        head: [tableHead],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 86, 179], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        styles: { fontSize: 8, cellPadding: 3 },
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 0) {
                if (data.cell.raw === 'FALTA') {
                    data.cell.styles.textColor = [220, 38, 38];
                    data.cell.styles.fontStyle = 'bold';
                } else if (data.cell.raw === 'PRESENTE') {
                    data.cell.styles.textColor = [5, 150, 105];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [147, 51, 234];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        didDrawPage: function(data) {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Sistema EDM Professor - Auditoria de Frequência", data.settings.margin.left, doc.internal.pageSize.height - 10);
            let pageStr = "Página " + doc.internal.getCurrentPageInfo().pageNumber;
            if (typeof doc.putTotalPages === 'function') pageStr += " de " + totalPagesExp;
            doc.text(pageStr, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
        }
    });

    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    doc.save(`cruzamento_faltas_${(selectedSchool || 'todas').toLowerCase().replace(/\s+/g, '_')}.pdf`);
    window.showNotification("Relatório de Faltas gerado em PDF!");
};

// Exportar CSV do Cruzamento
window.exportCruzamentoCSV = () => {
    const records = cruzamentoState.cruzamentoList;
    if (records.length === 0) {
        window.showNotification("Nenhum dado disponível para exportar.", 'warning');
        return;
    }

    let csvContent = "\uFEFFStatus;Professor;Escola;Disciplina;Ano;Turma;Turno;Carimbo_Forms;Email_Forms\n";
    records.forEach(r => {
        const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        const row = [
            escapeCsv(r.status.toUpperCase()),
            escapeCsv(r.nome),
            escapeCsv(r.escola),
            escapeCsv(r.disciplina),
            escapeCsv(r.ano),
            escapeCsv(r.turma),
            escapeCsv(r.turno),
            escapeCsv(r.formTimestamp || ''),
            escapeCsv(r.formEmail || '')
        ];
        csvContent += row.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cruzamento_frequencia_edm_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.showNotification("Arquivo CSV baixado com sucesso!");
};

// Modal WhatsApp
window.openWhatsAppModal = () => {
    const modal = document.getElementById('whatsAppModal');
    const select = document.getElementById('whatsapp-school-select');
    if (select && select.options.length <= 1) {
        select.innerHTML = '<option value="">Todas as Escolas (Consolidado)</option>';
        ALL_STANDARDIZED_SCHOOLS.forEach(s => select.add(new Option(s, s)));
    }
    if (select) select.value = cruzamentoState.selectedSchool || '';
    updateWhatsAppPreview();
    if (modal) modal.style.display = 'block';
};

window.closeWhatsAppModal = () => {
    const modal = document.getElementById('whatsAppModal');
    if (modal) modal.style.display = 'none';
};

window.updateWhatsAppPreview = () => {
    const select = document.getElementById('whatsapp-school-select');
    const textarea = document.getElementById('whatsapp-message-text');
    if (!textarea) return;

    const schoolFilter = select ? select.value : '';
    const records = cruzamentoState.cruzamentoList.filter(r => !schoolFilter || r.escola === schoolFilter);

    const faltas = records.filter(r => r.status === 'falta');
    const presentes = records.filter(r => r.status === 'presente');
    const extras = records.filter(r => r.status === 'extra');
    const totalCad = records.filter(r => r.isCadastrado).length;
    const pct = totalCad > 0 ? Math.round((presentes.length / totalCad) * 100) : 0;

    let msg = `📋 *RELATÓRIO DE FREQUÊNCIA - ENCONTRO EDM*\n`;
    msg += `🏫 *Escola:* ${schoolFilter || 'Consolidado Geral (Todas as Escolas)'}\n`;
    msg += `👥 *Docentes Cadastrados:* ${totalCad}\n`;
    msg += `✅ *Presentes:* ${presentes.length} (${pct}%)\n`;
    msg += `❌ *Faltas:* ${faltas.length}\n`;
    if (extras.length > 0) msg += `➕ *Registros Avulsos:* ${extras.length}\n`;
    msg += `⏱️ *Emissão:* ${new Date().toLocaleString('pt-BR')}\n\n`;

    if (!schoolFilter) {
        msg += `📌 *RESUMO POR ESCOLA:*\n`;
        ALL_STANDARDIZED_SCHOOLS.forEach(s => {
            const sFaltas = records.filter(r => r.escola === s && r.status === 'falta').length;
            const sPres = records.filter(r => r.escola === s && r.status === 'presente').length;
            if (sFaltas > 0) {
                msg += `• *${s}:* ${sPres} presentes | ❌ ${sFaltas} falta(s)\n`;
            } else {
                msg += `• *${s}:* ${sPres} presentes | ✅ 100%\n`;
            }
        });
        msg += `\n`;
    }

    if (faltas.length > 0) {
        msg += `❌ *RELAÇÃO DE FALTAS (${faltas.length}):*\n`;
        faltas.sort((a, b) => a.escola.localeCompare(b.escola) || a.nome.localeCompare(b.nome));
        faltas.forEach((f, i) => {
            msg += `${i + 1}. *${f.nome}* - ${f.escola} (${f.ano || 'N/A'})\n`;
        });
        msg += `\n`;
    } else {
        msg += `🎉 *Nenhuma falta registrada! 100% de presença.*\n\n`;
    }

    if (extras.length > 0) {
        msg += `➕ *REGISTROS AVULSOS / NÃO CADASTRADOS (${extras.length}):*\n`;
        extras.forEach((e, i) => {
            msg += `${i + 1}. ${e.nome} - ${e.escola} (${e.formTimestamp})\n`;
        });
        msg += `\n`;
    }

    msg += `_Sistema de Gestão Docente EDM Professor 2026_`;
    textarea.value = msg;
};

window.copyWhatsAppMessage = () => {
    const textarea = document.getElementById('whatsapp-message-text');
    if (!textarea) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
        window.showNotification("Mensagem copiada para a área de transferência!");
    });
};

window.sendWhatsAppDirect = () => {
    const textarea = document.getElementById('whatsapp-message-text');
    if (!textarea) return;
    const textEncoded = encodeURIComponent(textarea.value);
    window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
};

// Event Listeners dos Filtros do Cruzamento
const cruzSearchInput = document.getElementById('cruzamento-search');
const cruzStatusSelect = document.getElementById('cruzamento-status-filter');
const cruzSchoolSelect = document.getElementById('cruzamento-school-filter');

if (cruzSearchInput) {
    cruzSearchInput.addEventListener('input', (e) => {
        cruzamentoState.searchTerm = e.target.value;
        cruzamentoState.currentPage = 1;
        renderCruzamentoTable();
    });
}

if (cruzStatusSelect) {
    cruzStatusSelect.addEventListener('change', (e) => {
        cruzamentoState.selectedStatus = e.target.value;
        cruzamentoState.currentPage = 1;
        renderCruzamentoTable();
    });
}

if (cruzSchoolSelect) {
    cruzSchoolSelect.addEventListener('change', (e) => {
        cruzamentoState.selectedSchool = e.target.value;
        cruzamentoState.currentPage = 1;
        renderCruzamentoUI();
    });
}

const cruzSheetInput = document.getElementById('cruzamento-sheet-input');
if (cruzSheetInput) {
    cruzSheetInput.value = cruzamentoState.sheetUrl || DEFAULT_SHEET_CSV_URL;
    cruzSheetInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            window.applySheetUrlFromInput();
        }
    });
}

// Iniciar carregamento dos dados
loadData();
updateSheetUrlUI();



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
