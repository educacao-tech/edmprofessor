// script.js

// Seleciona o formulário e a tabela
const form = document.querySelector("form");
const table = document.querySelector("table");
const tableBody = table ? table.querySelector("tbody") : null;
const submitButton = form ? form.querySelector('button[type="submit"]') : null; // Pega a referência do botão de submit
const cancelBtn = document.getElementById("cancelBtn");
const telefoneInput = document.getElementById("telefone");
const searchInput = document.getElementById("searchInput");
const contadorElement = document.getElementById("contador");
const nomeInput = document.getElementById("nome");
const escolaInput = document.getElementById("escola");
const disciplinaInput = document.getElementById("disciplina");
const anoInput = document.getElementById("ano");
const turmaInput = document.getElementById("turma");
const turnoInput = document.getElementById("turno");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const btnAbrirEscolas = document.getElementById("btnAbrirEscolas");
const btnAbrirDisciplinas = document.getElementById("btnAbrirDisciplinas");
const schoolModalSection = document.getElementById("schoolModalSection");
const disciplineModalSection = document.getElementById("disciplineModalSection");
const closeSchoolModalBtn = document.getElementById("closeSchoolModalBtn");
const closeDisciplineModalBtn = document.getElementById("closeDisciplineModalBtn");
const schoolForm = document.getElementById("schoolForm");
const disciplineForm = document.getElementById("disciplineForm");
const listaEscolasCadastradas = document.getElementById("listaEscolasCadastradas");
const listaDisciplinasCadastradas = document.getElementById("listaDisciplinasCadastradas");
const registrationSection = document.getElementById("registrationSection");
const closeModalBtn = document.getElementById("closeModalBtn");
const filterEscolaSelect = document.getElementById("filterEscola");
const filterDisciplinaSelect = document.getElementById("filterDisciplina");
const filterAnoSelect = document.getElementById("filterAno");
const filterTurmaSelect = document.getElementById("filterTurma");
const filterTurnoSelect = document.getElementById("filterTurno");
const btnExportar = document.getElementById("btnExportar");
const btnImprimir = document.getElementById("btnImprimir");
const btnDetailedReport = document.getElementById("btnDetailedReport");
const btnToggleChart = document.getElementById("btnToggleChart");
const btnChangePassword = document.getElementById("btnChangePassword"); // Novo botão para alterar senha
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const headerSentinel = document.getElementById("header-sentinel");
const btnBackup = document.getElementById("btnBackup");
const btnRestaurar = document.getElementById("btnRestaurar");
const deleteBtnModal = document.getElementById("deleteBtnModal");
const confirmModalSection = document.getElementById("confirmModalSection");
const btnConfirmOk = document.getElementById("btnConfirmOk");
const btnConfirmCancel = document.getElementById("btnConfirmCancel");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const editModeIndicator = document.getElementById("editModeIndicator");
const btnTheme = document.getElementById("btnTheme");
const btnBackToTop = document.getElementById("btnBackToTop");

// Estado da aplicação: carrega dados salvos ou inicia array vazio
let dadosSalvos = JSON.parse(localStorage.getItem("professores"));

// MIGRACAO AUTOMÁTICA: Detecta dados no formato antigo (ex: "5º B" no campo turma)
// e separa automaticamente em 'ano' e 'turma' para manter a consistência do banco.
if (dadosSalvos && dadosSalvos.length > 0) {
    let houveMigracao = false;
    dadosSalvos = dadosSalvos.map(prof => {
        // Se a turma contém "º" (indicando o ano) e o campo ano está vazio ou N/A
        if (prof.turma && prof.turma.includes("º") && (!prof.ano || prof.ano === "N/A")) {
            const partes = prof.turma.trim().split(/\s+/);
            if (partes.length >= 2) {
                houveMigracao = true;
                return { ...prof, ano: partes[0], turma: partes[1] };
            }
        }
        return prof;
    });
    if (houveMigracao) {
        localStorage.setItem("professores", JSON.stringify(dadosSalvos));
    }
}

// Alteração: Garante que se houver uma lista salva (mesmo que vazia), ela seja respeitada.
let professores = dadosSalvos || [
    { nome: "ANA CAROLINA VENTUROSO BÉRGAMO CÂNDIDO", escola: "ALZIRA", disciplina: "EDM", ano: "4º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ÁUREA APARECIDA SOUZA CARDOSO", escola: "ALZIRA", disciplina: "EDM", ano: "1º", turma: "E", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "CRISTIANE AUGUSTA COSTA", escola: "ALZIRA", disciplina: "EDM", ano: "3º", turma: "E", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ELIZÂNGELA CERCE CONUNCHUC", escola: "ALZIRA", disciplina: "EDM", ano: "1º", turma: "C", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "FABIANA CÁSSIA DOS SANTOS", escola: "ALZIRA", disciplina: "EDM", ano: "2º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "FABIANA KARINA DE OLIVEIRA", escola: "ALZIRA", disciplina: "EDM", ano: "2º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "GABRIELA BOLOGNA BÉRGAMO VENDRUSCOLO", escola: "ALZIRA", disciplina: "EDM", ano: "1º", turma: "D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ISABEL CRISTINA MANIERI DANIEL", escola: "ALZIRA", disciplina: "EDM", ano: "1º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "JACKELINE SILVA RODRIGUES", escola: "ALZIRA", disciplina: "EDM", ano: "N/A", turma: "N/A", turno: "N/A", telefone: "(00) 00000-0000" },
    { nome: "LARISSA DANIELE DIAS", escola: "ALZIRA", disciplina: "EDM", ano: "N/A", turma: "N/A", turno: "N/A", telefone: "(00) 00000-0000" },
    { nome: "LOURDES RAYMUNDINI DA SILVA", escola: "ALZIRA", disciplina: "EDM", ano: "2º", turma: "D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LUCIANA PAULA LEMES", escola: "ALZIRA", disciplina: "EDM", ano: "3º", turma: "C", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARTA LUZIA PACHETI", escola: "ALZIRA", disciplina: "EDM", ano: "5º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "NEUSA HELENA DE CASTRO GALANTI", escola: "ALZIRA", disciplina: "EDM", ano: "4º", turma: "E", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "PATRÍCIA ALEIXO SILVA de OLIVEIRA", escola: "ALZIRA", disciplina: "EDM", ano: "N/A", turma: "N/A", turno: "N/A", telefone: "(00) 00000-0000" },
    { nome: "PATRÍCIA CORSINI COSTA", escola: "ALZIRA", disciplina: "EDM", ano: "3º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "VIVIANE TOMAZ BANACO", escola: "ALZIRA", disciplina: "EDM", ano: "4º", turma: "D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "JESILDA BATISTA DA SILVA DOMINGOS", escola: "ANNA", disciplina: "EDM", ano: "2º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LEILA APARECIDA MILAN BARBOZA", escola: "ANNA", disciplina: "EDM", ano: "1º", turma: "D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LETÍCIA NARA PIRES", escola: "ANNA", disciplina: "EDM", ano: "N/A", turma: "N/A", turno: "N/A", telefone: "(00) 00000-0000" },
    { nome: "LÚCIA HELENA SAQUETO G. GONÇALVES", escola: "ANNA", disciplina: "EDM", ano: "3º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "MARCELA YARA V. L. RAYMUNDO A. CARNEIRO", escola: "ANNA", disciplina: "EDM", ano: "5º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "NAYRA RODRIGUES OLIVÉRIO CAMPI", escola: "ANNA", disciplina: "EDM", ano: "3º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "SUELLEN FRANCINE DA SILVA e SILVA", escola: "ANNA", disciplina: "EDM", ano: "1º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DEILANE FRANZONI", escola: "BRAGA", disciplina: "EDM", ano: "1º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ELISÂNGELA ALMINDA OLIVEIRA BIBIANO", escola: "BRAGA", disciplina: "EDM", ano: "3º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARIANA R. DE FARIA EVANGELISTA", escola: "BRAGA", disciplina: "EDM", ano: "4º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "PRISCILA BRONDI ANHEZINI IVAN", escola: "BRAGA", disciplina: "EDM", ano: "1º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ROSANA APARECIDA DA SILVA", escola: "BRAGA", disciplina: "EDM", ano: "4º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "TALUANA BARBOSA PEREIRA", escola: "BRAGA", disciplina: "EDM", ano: "2º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARLENE APARECIDA BARBOSA DUARTE", escola: "CAIC", disciplina: "EDM", ano: "N/A", turma: "N/A", turno: "INTEGRAL", telefone: "(00) 00000-0000" },
    { nome: "ADMILDE GABRIEL DE SOUSA", escola: "CÉLIA", disciplina: "EDM", ano: "5º", turma: "B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ALINE SANTOS DA COSTA", escola: "CÉLIA", disciplina: "EDM", ano: "5º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "EDNILSA GABRIEL DE SOUSA", escola: "CÉLIA", disciplina: "EDM", ano: "1º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "JAQUELINE ARANTES RIBEIRO", escola: "CÉLIA", disciplina: "EDM", ano: "1º", turma: "B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ADRIANA APARECIDA VITAL DA SILVA", escola: "ESTHER", disciplina: "EDM", ano: "5º", turma: "B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ALEXANDRE SILVA PEDROSO", escola: "ESTHER", disciplina: "EDM", ano: "3º", turma: "A", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DAIANE ROBERTA DE SOUSA", escola: "ESTHER", disciplina: "EDM", ano: "1º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DOUGLAS WILLIAM DA SILVA", escola: "ESTHER", disciplina: "EDM", ano: "4º", turma: "B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "JULIANA MENDES FERREIRA FUKUDA", escola: "ESTHER", disciplina: "EDM", ano: "1º", turma: "A", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "MARTA VIEIRA ALVES", escola: "ESTHER", disciplina: "EDM", ano: "2º", turma: "B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "MICHELLE CRISTINA SILVA", escola: "ESTHER", disciplina: "EDM", ano: "2º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ANDRÉA LÚCIA STOPPA DE O. BAVIERA", escola: "PADRE", disciplina: "EDM", ano: "5º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ARETA FIGUEIREDO ROSA", escola: "PADRE", disciplina: "EDM", ano: "2º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DANIELA PARADA FERREIRA", escola: "PADRE", disciplina: "EDM", ano: "3º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ELAINE CRISTINA DE SOUSA GOULART", escola: "PADRE", disciplina: "EDM", ano: "5º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "FABIANA MEIRE NAZAR", escola: "PADRE", disciplina: "EDM", ano: "4º", turma: "B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "GIOVANA TAIS DE OLIVEIRA BAGIO", escola: "PADRE", disciplina: "EDM", ano: "4º", turma: "C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LANA MARA FIOCO DOS SANTOS", escola: "PADRE", disciplina: "EDM", ano: "4º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARIA HELOÍSA DE ARAÚJO CRUZ", escola: "PADRE", disciplina: "EDM", ano: "1º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "VERENA DE FÁTIMA CARVALHO", escola: "PADRE", disciplina: "EDM", ano: "2º", turma: "A", turno: "MANHÃ", telefone: "(00) 00000-0000" }
];

// Estado das Escolas: carrega do localStorage ou inicia com as escolas padrão dos professores
let escolas = JSON.parse(localStorage.getItem("escolas")) || 
              [...new Set(professores.map(p => p.escola))].sort();

// Estado das Disciplinas
let disciplinas = JSON.parse(localStorage.getItem("disciplinas")) || 
                 ["EDM"];

// Variável global para rastrear se estamos editando e qual índice
let editingIndex = -1; // -1 significa que nenhum professor está sendo editado

// Definição dinâmica das colunas
let columnOrder = [
    { id: 'nome', label: 'Nome', searchable: true, visible: true },
    { id: 'escola', label: 'Escola', searchable: true, visible: true },
    { id: 'disciplina', label: 'Disciplina', searchable: false, visible: true },
    { id: 'ano', label: 'Ano', searchable: true, visible: true },
    { id: 'turma', label: 'Turma', searchable: true, visible: true },
    { id: 'turno', label: 'Turno', searchable: true, visible: true },
    { id: 'telefone', label: 'Telefone', searchable: false, visible: true }
];

// Variável para persistir a seleção (Nome + Escola) mesmo após filtrar ou ordenar
let selectedProfessorKey = null;

// Variável global para armazenar a linha da tabela atualmente selecionada
let selectedRowElement = null;

// Estado de Ordenação: controla qual coluna e qual direção
let currentSort = { column: 'nome', direction: 'asc' };

// Controle de autenticação temporária (reseta automaticamente ao recarregar a página)
let usuarioAutenticado = false;

// Verifica se os elementos essenciais foram encontrados
if (!form) {
    console.error("Erro: Formulário não encontrado.");
}
if (!table) {
    console.error("Erro: Tabela não encontrada.");
}
if (!tableBody && table) {
    console.warn("Aviso: <tbody> não encontrado.");
}
if (!submitButton && form) {
    console.warn("Aviso: Botão de submit não encontrado no formulário.");
}

// Função auxiliar para remover acentos (Global)
const removerAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Função para destacar o termo de busca no texto original preservando a formatação
function highlightText(text, termoBuscaNorm) {
    if (!termoBuscaNorm) return text;
    const textNorm = removerAcentos(text).toUpperCase();
    let result = "";
    let lastIndex = 0;
    let index = textNorm.indexOf(termoBuscaNorm);

    while (index !== -1) {
        result += text.substring(lastIndex, index);
        result += `<span class="highlight">${text.substring(index, index + termoBuscaNorm.length)}</span>`;
        lastIndex = index + termoBuscaNorm.length;
        index = textNorm.indexOf(termoBuscaNorm, lastIndex);
    }
    result += text.substring(lastIndex);
    return result;
}

// Função Genérica para renderizar listas de metadados (Escolas/Disciplinas)
function renderMetadataList(list, container, typeLabel, onEdit, onDelete) {
    if (!container) return;
    container.innerHTML = "";
    
    [...list].sort().forEach((item, index) => {
        const originalIndex = list.indexOf(item);
        const qtdProfessores = professores.filter(p => p[typeLabel] === item).length;
        const li = document.createElement("li");
        li.className = `${typeLabel}-item`;
        li.innerHTML = `
            <span>${item} (${qtdProfessores})</span>
            <div style="display: flex; gap: 5px;">
                <button class="btn-edit" style="padding: 5px 10px; font-size: 0.7rem;">Editar</button>
                <button class="btn-delete" style="padding: 5px 10px; font-size: 0.7rem;">Excluir</button>
            </div>
        `;
        li.querySelector(".btn-edit").onclick = () => onEdit(originalIndex);
        li.querySelector(".btn-delete").onclick = () => {
            if (!verificarAutenticacao(`Para excluir "${item}"`)) return;
            
            if (qtdProfessores > 0) {
                alert(`Não é possível excluir pois existem ${qtdProfessores} professor(es) vinculado(s).`);
                return;
            }
            onDelete(originalIndex);
        };
        container.appendChild(li);
    });
}

function renderSchoolList() {
    renderMetadataList(escolas, listaEscolasCadastradas, 'escola', editSchool, (idx) => {
        escolas.splice(idx, 1);
        saveSchools();
    });
}

function renderDisciplineList() {
    renderMetadataList(disciplinas, listaDisciplinasCadastradas, 'disciplina', editDiscipline, async (idx) => {
        const confirmed = await showConfirm(
            "Excluir Disciplina",
            `Deseja realmente excluir a disciplina "${disciplinas[idx]}"?`,
            "Excluir",
            "Cancelar"
        );
        if (confirmed) {
            disciplinas.splice(idx, 1);
            saveDisciplines();
        }
    });
}

// Função para editar o nome de uma escola e atualizar os professores vinculados
function editSchool(index) {
    if (!verificarAutenticacao(`Para editar a escola "${escolas[index]}"`)) return;

    const oldName = escolas[index];
    let newName = prompt("Editar nome da escola:", oldName);
    
    if (newName === null) return;
    newName = newName.trim().toUpperCase();
    
    if (newName === "" || newName === oldName) return;
    
    if (escolas.includes(newName)) {
        alert("Esta escola já está cadastrada.");
        return;
    }

    // Atualiza a lista de escolas
    escolas[index] = newName;
    
    // Atualiza todos os professores vinculados a esta escola
    professores = professores.map(prof => 
        prof.escola === oldName ? { ...prof, escola: newName } : prof
    );

    // Salva as alterações de ambos (escolas e professores)
    localStorage.setItem("escolas", JSON.stringify(escolas));
    saveAndRender(); // Salva professores, ordena, popula filtros e renderiza tabela
    renderSchoolList(); // Atualiza a lista visual no modal
    alert("Escola e registros de professores atualizados com sucesso!");
}

// Função para editar o nome de uma disciplina e atualizar os professores vinculados
function editDiscipline(index) {
    if (!verificarAutenticacao(`Para editar a disciplina "${disciplinas[index]}"`)) return;

    const oldName = disciplinas[index];
    let newName = prompt("Editar nome da disciplina:", oldName);
    
    if (newName === null) return;
    newName = newName.trim().toUpperCase();
    
    if (newName === "" || newName === oldName) return;
    
    if (disciplinas.includes(newName)) {
        alert("Esta disciplina já está cadastrada.");
        return;
    }

    // Atualiza a lista de disciplinas
    disciplinas[index] = newName;
    
    // Atualiza todos os professores vinculados a esta disciplina
    professores = professores.map(prof => 
        prof.disciplina === oldName ? { ...prof, disciplina: newName } : prof
    );

    // Salva as alterações
    localStorage.setItem("disciplinas", JSON.stringify(disciplinas));
    saveAndRender();
    renderDisciplineList();
    alert("Disciplina e registros de professores atualizados com sucesso!");
}

// Salva escolas e atualiza componentes
function saveSchools() {
    localStorage.setItem("escolas", JSON.stringify(escolas));
    renderSchoolList();
    populateFilters();
}

// Salva disciplinas e atualiza componentes
function saveDisciplines() {
    localStorage.setItem("disciplinas", JSON.stringify(disciplinas));
    renderDisciplineList();
    populateFilters();
}

// Evento de cadastro de nova escola
if (schoolForm) {
    schoolForm.onsubmit = (e) => {
        e.preventDefault();
        
        const expectedPassword = getSecurityPassword();
        if (expectedPassword === null) return;

        const senhaDigitada = prompt("Para cadastrar uma nova escola, digite a senha:");
        if (senhaDigitada === null) return;
        
        if (senhaDigitada === expectedPassword) {
            const nomeNovaEscola = document.getElementById("novaEscola").value.trim().toUpperCase();
            if (escolas.includes(nomeNovaEscola)) {
                alert("Esta escola já está cadastrada.");
                return;
            }
            escolas.push(nomeNovaEscola);
            saveSchools();
            schoolForm.reset();
        } else {
            alert("Senha incorreta! O cadastro foi cancelado.");
        }
    };
}

// Evento de cadastro de nova disciplina
if (disciplineForm) {
    disciplineForm.onsubmit = (e) => {
        e.preventDefault();

        const expectedPassword = getSecurityPassword();
        if (expectedPassword === null) return;

        const senhaDigitada = prompt("Para cadastrar uma nova disciplina, digite a senha:");
        if (senhaDigitada === null) return;

        if (senhaDigitada === expectedPassword) {
            const nomeNovaDisciplina = document.getElementById("novaDisciplina").value.trim().toUpperCase();
            if (disciplinas.includes(nomeNovaDisciplina)) {
                alert("Esta disciplina já está cadastrada.");
                return;
            }
            disciplinas.push(nomeNovaDisciplina);
            saveDisciplines();
            disciplineForm.reset();
        } else {
            alert("Senha incorreta! O cadastro foi cancelado.");
        }
    };
}

// Função para popular os dropdowns de filtro
// Função utilitária para preencher selects
function fillSelect(selectElement, options, defaultText = "TODAS", isPlaceholder = false) {
    if (!selectElement) return;
    const currentVal = selectElement.value;
    
    selectElement.innerHTML = isPlaceholder 
        ? `<option value="" disabled selected>${defaultText}</option>`
        : `<option value="">${defaultText}</option>`;

    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        selectElement.appendChild(option);
    });

    // Mantém o valor se ele ainda for válido
    if (options.includes(currentVal)) {
        selectElement.value = currentVal;
    }
}

function populateFilters() {
    const sortedEscolas = [...escolas].sort();
    const sortedDisciplinas = [...disciplinas].sort();
    
    // Dropdowns de Filtro (Barra de ferramentas)
    fillSelect(filterEscolaSelect, sortedEscolas);
    fillSelect(filterDisciplinaSelect, sortedDisciplinas);
    fillSelect(filterAnoSelect, [...new Set(professores.map(p => p.ano).filter(Boolean))].sort());
    fillSelect(filterTurmaSelect, [...new Set(professores.map(p => p.turma).filter(Boolean))].sort());
    fillSelect(filterTurnoSelect, [...new Set(professores.map(p => p.turno).filter(Boolean))].sort());

    // Dropdowns do Formulário de Cadastro
    fillSelect(escolaInput, sortedEscolas, "Selecione a Escola", true);
    fillSelect(disciplinaInput, sortedDisciplinas, "Selecione a Disciplina", true);
    
    // Fallback específico para Disciplina EDM
    if (!disciplinaInput.value && sortedDisciplinas.includes("EDM")) {
        disciplinaInput.value = "EDM";
    }
}

// Função utilitária para gerenciar modais
function toggleModal(modalElement, show = true) {
    if (!modalElement) return;
    if (show) {
        modalElement.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    } else {
        modalElement.classList.add("hidden");
        document.body.style.overflow = "";
        if (modalElement === registrationSection) resetForm();
    }
}

// Função para exibição de confirmação moderna utilizando Promises
function showConfirm(title, message, confirmText = "Confirmar", cancelText = "Cancelar") {
    return new Promise((resolve) => {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        btnConfirmOk.textContent = confirmText;
        btnConfirmCancel.textContent = cancelText;

        toggleModal(confirmModalSection, true);

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            btnConfirmOk.removeEventListener("click", onConfirm);
            btnConfirmCancel.removeEventListener("click", onCancel);
            toggleModal(confirmModalSection, false);
        };

        btnConfirmOk.addEventListener("click", onConfirm);
        btnConfirmCancel.addEventListener("click", onCancel);
    });
}

// Função para mover colunas no array
function moveColumn(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < columnOrder.length) {
        const temp = columnOrder[index];
        columnOrder[index] = columnOrder[newIndex];
        columnOrder[newIndex] = temp;
        renderTable();
    }
}

// Função para renderizar a lista de seleção de colunas
function renderColumnToggleList() {
    if (!listaColunasVisiveis) return;
    listaColunasVisiveis.innerHTML = "";

    columnOrder.forEach((col, index) => {
        const li = document.createElement("li");
        li.className = "column-item";
        li.innerHTML = `
            <input type="checkbox" id="chkCol-${col.id}" ${col.visible ? 'checked' : ''}>
            <label for="chkCol-${col.id}" style="margin: 0; cursor: pointer; flex-grow: 1;">${col.label}</label>
        `;
        
        li.onclick = (e) => {
            if (e.target.tagName !== 'INPUT') {
                const chk = li.querySelector('input');
                chk.checked = !chk.checked;
            }
            columnOrder[index].visible = li.querySelector('input').checked;
            renderTable();
        };
        listaColunasVisiveis.appendChild(li);
    });
}

// Função para gerar o cabeçalho dinamicamente
function renderHeaders() {
    const thead = document.getElementById("tableHeader");
    if (!thead) return;
    thead.innerHTML = "";
    const tr = document.createElement("tr");

    columnOrder.forEach((col, index) => {
        if (!col.visible) return;
        const th = document.createElement("th");
        // O th agora contém o texto centralizado e os controles absolutos por cima
        th.innerHTML = `
            <span class="th-label">${col.label}</span>
            <div class="column-controls">
                <button class="btn-move" title="Mover para esquerda" onclick="event.stopPropagation(); moveColumn(${index}, -1)">❮</button>
                <button class="btn-move" title="Mover para direita" onclick="event.stopPropagation(); moveColumn(${index}, 1)">❯</button>
            </div>
        `;
        
        if (currentSort.column === col.id) {
            th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
        th.onclick = () => handleSort(col.id);
        tr.appendChild(th);
    });
    thead.appendChild(tr);
}

// Função para ordenar a lista por nome
function ordenarProfessores() {
    const { column, direction } = currentSort;
    const factor = direction === 'asc' ? 1 : -1;

    professores.sort((a, b) => {
        const valA = removerAcentos(String(a[column] || "")).toUpperCase();
        const valB = removerAcentos(String(b[column] || "")).toUpperCase();
        
        // localeCompare com numeric: true trata corretamente casos como "1º" e "10º"
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * factor;
    });
}

// Função para obter a senha de segurança. Se não existir, solicita ao usuário para definir uma.
function getSecurityPassword() {
    let securityPassword = localStorage.getItem("adminDeletionPassword");
    if (!securityPassword) {
        let newPassword = prompt("Nenhuma senha de segurança definida. Por favor, defina uma senha para ações administrativas (cadastrar, editar, excluir):");
        if (newPassword === null) { // Usuário clicou em cancelar
            alert("Ação cancelada. Nenhuma senha foi definida.");
            return null;
        }
        if (newPassword.trim() === "") { // Usuário digitou uma senha vazia
            alert("A senha não pode ser vazia. Ação cancelada.");
            return null;
        }
        localStorage.setItem("adminDeletionPassword", newPassword);
        securityPassword = newPassword;
        alert("Senha de segurança definida com sucesso!");
    }
    return securityPassword;
}

// Função para verificar se o usuário já autenticou nesta sessão
function verificarAutenticacao(contextoMensagem) {
    if (usuarioAutenticado) {
        return true;
    }

    const expectedPassword = getSecurityPassword();
    if (expectedPassword === null) return false;

    const senhaDigitada = prompt(`${contextoMensagem}, digite a senha de segurança:`);
    
    if (senhaDigitada === expectedPassword) {
        usuarioAutenticado = true;
        return true;
    } else if (senhaDigitada !== null) {
        alert("Senha incorreta!");
    }
    return false;
}

// Função para alterar a senha de segurança
function changeSecurityPassword() {
    const currentPassword = localStorage.getItem("adminDeletionPassword");

    if (!currentPassword) {
        alert("Nenhuma senha de segurança foi definida ainda. Por favor, defina uma ao tentar editar ou excluir um professor.");
        return;
    }
    
    const oldPasswordAttempt = prompt("Digite sua senha atual:");
    if (oldPasswordAttempt === null) return;
    if (oldPasswordAttempt !== currentPassword) {
        alert("Senha incorreta!");
        return;
    }

    let newPassword = prompt("Digite a nova senha:");
    if (newPassword && newPassword.trim() !== "") {
        localStorage.setItem("adminDeletionPassword", newPassword);
        usuarioAutenticado = false; // Obriga a reautenticar com a nova senha
        alert("Senha alterada com sucesso!");
    } else {
        alert("Alteração cancelada ou senha inválida.");
    }
}

// Função centralizada para obter os dados filtrados com base na busca e dropdowns
function getFilteredData() {
    const termoBusca = searchInput ? removerAcentos(searchInput.value).toUpperCase() : "";
    const selectedEscola = filterEscolaSelect ? filterEscolaSelect.value : "";
    const selectedDisciplina = filterDisciplinaSelect ? filterDisciplinaSelect.value : "";
    const selectedAno = filterAnoSelect ? filterAnoSelect.value : "";
    const selectedTurma = filterTurmaSelect ? filterTurmaSelect.value : "";
    const selectedTurno = filterTurnoSelect ? filterTurnoSelect.value : "";

    return professores
        .map((prof, originalIndex) => ({ ...prof, originalIndex }))
        .filter(prof => {
            // Normaliza os campos para comparação (Maiúsculas e Sem Acentos)
            const nomeNorm = removerAcentos(prof.nome || "").toUpperCase();
            const escolaNorm = removerAcentos(prof.escola || "").toUpperCase();
            const anoNorm = removerAcentos(prof.ano || "").toUpperCase();
            const turmaNorm = removerAcentos(prof.turma || "").toUpperCase();
            const turnoNorm = removerAcentos(prof.turno || "").toUpperCase();

            const matchesSearch = 
                nomeNorm.includes(termoBusca) || 
                escolaNorm.includes(termoBusca) ||
                anoNorm.includes(termoBusca) ||
                turmaNorm.includes(termoBusca) ||
                turnoNorm.includes(termoBusca);

            const matchesDropdowns = 
                (selectedEscola === "" || prof.escola === selectedEscola) &&
                (selectedDisciplina === "" || prof.disciplina === selectedDisciplina) &&
                (selectedAno === "" || prof.ano === selectedAno) &&
                (selectedTurma === "" || prof.turma === selectedTurma) &&
                (selectedTurno === "" || prof.turno === selectedTurno);

            return matchesSearch && matchesDropdowns;
        });
}

// Função para atualizar o gráfico de distribuição
function updateChart(lista) {
    const statsSection = document.getElementById("statsSection");
    const chartContainer = document.getElementById("chartContainer");
    if (!statsSection || !chartContainer) return;

    if (lista.length === 0) {
        statsSection.classList.add("hidden");
        if (btnToggleChart) btnToggleChart.textContent = "Mostrar Gráfico";
        return;
    }

    // Se o gráfico estiver oculto (estado inicial ou via botão), respeitamos esse estado e não o forçamos a abrir
    if (statsSection.classList.contains("hidden")) {
        if (btnToggleChart) btnToggleChart.textContent = "Mostrar Gráfico";
        return;
    }

    if (btnToggleChart) btnToggleChart.textContent = "Ocultar Gráfico";

    // Conta professores por escola
    const contagem = lista.reduce((acc, prof) => {
        acc[prof.escola] = (acc[prof.escola] || 0) + 1;
        return acc;
    }, {});

    const total = lista.length;
    chartContainer.innerHTML = "";

    // Ordena escolas por quantidade e cria as barras
    Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .forEach(([escola, qtd]) => {
            const porcentagem = (qtd / total) * 100;
            const row = document.createElement("div");
            row.className = "chart-row";
            row.innerHTML = `
                <div class="chart-label" title="${escola}">${escola}</div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" style="width: ${porcentagem}%"></div>
                </div>
                <div class="chart-count">${qtd}</div>
            `;
            chartContainer.appendChild(row);
        });
}

// Função para criar os controles de paginação
// Função para renderizar a tabela com base no array de professores
function renderTable() {
    if (!tableBody) return;
    
    renderHeaders(); // Desenha o cabeçalho baseado na ordem atual
    tableBody.innerHTML = "";
    selectedRowElement = null; // Limpa a referência da linha selecionada ao re-renderizar a tabela
    const fragment = document.createDocumentFragment();

    const listaFiltrada = getFilteredData();
    const termoBusca = searchInput ? removerAcentos(searchInput.value).toUpperCase() : "";

    if (contadorElement) {
        contadorElement.textContent = `Professores encontrados: ${listaFiltrada.length}`;
        // Reinicia a animação de pulsação
        contadorElement.classList.remove("pulse-animation");
        void contadorElement.offsetWidth; // Força reflow para permitir reiniciar a animação CSS
        contadorElement.classList.add("pulse-animation");
    }

    updateChart(listaFiltrada);

    listaFiltrada.forEach((prof, index) => {
        const newRow = document.createElement("tr");
        
        // Restaura o destaque visual se este professor for o que estava selecionado
        const profKey = `${prof.nome}|${prof.escola}`;
        if (profKey === selectedProfessorKey) {
            newRow.classList.add("selected-row");
            selectedRowElement = newRow;
        }

        newRow.classList.add("animated-row");
        newRow.style.animationDelay = `${Math.min(index * 0.02, 0.4)}s`;

        // Preenche as células baseadas na ordem das colunas
        let cellIdx = 0;
        columnOrder.forEach((col) => {
            if (!col.visible) return;
            const cell = newRow.insertCell(cellIdx++);
            const value = prof[col.id] || "";
            if (col.searchable) {
                cell.innerHTML = highlightText(value, termoBusca);
            } else {
                cell.textContent = value;
            }
        });

        newRow.onclick = () => {
            // Armazena a chave única para persistência
            selectedProfessorKey = `${prof.nome}|${prof.escola}`;

            // Remove o destaque da linha anteriormente selecionada, se houver
            if (selectedRowElement) {
                selectedRowElement.classList.remove("selected-row");
            }
            // Adiciona o destaque à linha clicada e armazena sua referência
            newRow.classList.add("selected-row");
            selectedRowElement = newRow;
            if (verificarAutenticacao(`Para editar o(a) professor(a) ${prof.nome}`)) {
                editProfessor(prof.originalIndex);
            }
        };
        fragment.appendChild(newRow);
    });
    tableBody.appendChild(fragment);

    // Rola automaticamente para a linha selecionada se ela estiver presente na tabela
    if (selectedRowElement) {
        // O setTimeout de 100ms garante que a animação de entrada (fadeInRow) 
        // e a renderização do DOM foram concluídas antes de rolar.
        setTimeout(() => {
            selectedRowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Adiciona o efeito de piscar
            selectedRowElement.classList.add("pulse-row");
            // Remove a classe após a animação (0.6s * 3 = 1.8s) para permitir nova execução
            setTimeout(() => selectedRowElement.classList.remove("pulse-row"), 1800);
        }, 100);
    }
}

// Salva no localStorage e atualiza a tela
function saveAndRender() {
    ordenarProfessores();
    populateFilters(); // Atualiza as opções de filtro caso uma nova escola/disciplina seja adicionada
    localStorage.setItem("professores", JSON.stringify(professores));
    renderTable();
}

function removeProfessor(index) {
    professores.splice(index, 1);
    resetForm(); // Limpa o estado de edição para evitar conflitos de índice
    saveAndRender();
}

// Função para resetar o estado do formulário
function resetForm() {
    form.reset();
    editingIndex = -1;
    selectedProfessorKey = null;
    
    // Remove o destaque da linha selecionada ao resetar o formulário
    if (selectedRowElement) {
        selectedRowElement.classList.remove("selected-row");
        selectedRowElement = null;
    }

    // Garante que a disciplina volte para o padrão EDM após o reset
    if (disciplinaInput) disciplinaInput.value = "EDM";
    if (turnoInput) turnoInput.value = "MANHÃ";

    if (submitButton) submitButton.textContent = "Adicionar Professor";
    if (cancelBtn) cancelBtn.classList.add("hidden");
    if (deleteBtnModal) deleteBtnModal.classList.add("hidden");
    if (editModeIndicator) editModeIndicator.classList.add("hidden");
    if (registrationSection) registrationSection.classList.add("hidden");

    // Remove classes de erro e sucesso de todos os campos
    [nomeInput, escolaInput, disciplinaInput, anoInput, turmaInput, turnoInput, telefoneInput].forEach(input => {
        if (input) {
            input.classList.remove("invalid");
            input.classList.remove("valid");
        }
    });

    document.body.style.overflow = ""; // Restaura o scroll da página
}

// Função para lidar com a edição de um professor
function editProfessor(index) {
    editingIndex = index;
    const professorToEdit = professores[index];

    document.getElementById("nome").value = professorToEdit.nome;
    document.getElementById("escola").value = professorToEdit.escola;
    document.getElementById("disciplina").value = professorToEdit.disciplina;
    document.getElementById("ano").value = professorToEdit.ano || "";
    document.getElementById("turma").value = professorToEdit.turma || "";
    document.getElementById("turno").value = professorToEdit.turno || "";
    document.getElementById("telefone").value = professorToEdit.telefone || ""; // Fallback para campo vazio

    if (registrationSection) {
        registrationSection.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Trava o scroll da página
        setTimeout(() => document.getElementById("nome").focus(), 100);
        if (editModeIndicator) editModeIndicator.classList.remove("hidden");

        // Dispara a validação visual ao carregar os dados para edição
        [nomeInput, escolaInput, disciplinaInput, anoInput, turmaInput, turnoInput, telefoneInput].forEach(input => {
            if (input) input.dispatchEvent(new Event('input'));
        });
    }

    if (submitButton) {
        submitButton.textContent = "Atualizar Professor";
    }
    if (cancelBtn) {
        cancelBtn.classList.remove("hidden");
    }
    if (deleteBtnModal) {
        deleteBtnModal.classList.remove("hidden");
    }
}

// Aplicar máscara de telefone enquanto digita
if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, "($1");
        }
        e.target.value = value;
    });
}

// Limpeza automática de espaços duplos no campo Nome enquanto o usuário digita
if (nomeInput) {
    nomeInput.addEventListener("input", (e) => {
        const input = e.target;
        const selectionStart = input.selectionStart;
        const originalValue = input.value;
        const cleanValue = originalValue.replace(/\s{2,}/g, " ");

        if (originalValue !== cleanValue) {
            input.value = cleanValue;
            // Reposiciona o cursor corretamente após a remoção do espaço extra
            const newPosition = selectionStart - (originalValue.length - cleanValue.length);
            input.setSelectionRange(newPosition, newPosition);
        }
    });
}

// Validação em tempo real para feedback visual (Ícone de Check)
[nomeInput, escolaInput, disciplinaInput, anoInput, turmaInput, turnoInput, telefoneInput].forEach(input => {
    if (input) {
        const validate = () => {
            let isValid = false;
            const val = input.value.trim();
            
            if (input === telefoneInput) {
                const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
                isValid = phoneRegex.test(val);
            } else if (input === nomeInput) {
                const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
                isValid = val.length >= 3 && nameRegex.test(val);
            } else if (input.tagName === "SELECT") {
                isValid = input.value !== "" && input.value !== null;
            } else {
                isValid = val !== "";
            }

            if (isValid) {
                input.classList.add("valid");
                input.classList.remove("invalid");
            } else {
                input.classList.remove("valid");
            }
        };

        input.addEventListener("input", validate);
        input.addEventListener("change", validate);
    }
});

// Controle do Menu de Cadastro
if (btnAbrirCadastro && registrationSection) {
    btnAbrirCadastro.onclick = () => {
        const isHidden = registrationSection.classList.toggle("hidden");
        if (!isHidden) {
            setTimeout(() => document.getElementById("nome").focus(), 100);
            if (editModeIndicator) editModeIndicator.classList.remove("hidden");
            document.body.style.overflow = "hidden"; // Trava o scroll ao abrir
        }
        if (isHidden) resetForm();
    };
}

// Controle do Modal de Escolas
if (btnAbrirEscolas && schoolModalSection) {
    btnAbrirEscolas.onclick = () => {
        schoolModalSection.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        renderSchoolList();
    };
}

if (closeSchoolModalBtn) {
    closeSchoolModalBtn.onclick = () => {
        schoolModalSection.classList.add("hidden");
        document.body.style.overflow = "";
    };
}

if (schoolModalSection) {
    schoolModalSection.addEventListener("click", (e) => {
        if (e.target === schoolModalSection) {
            schoolModalSection.classList.add("hidden");
            document.body.style.overflow = "";
        }
    });
}

// Controle do Modal de Disciplinas
if (btnAbrirDisciplinas && disciplineModalSection) {
    btnAbrirDisciplinas.onclick = () => {
        disciplineModalSection.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        renderDisciplineList();
    };
}

if (closeDisciplineModalBtn) {
    closeDisciplineModalBtn.onclick = () => {
        disciplineModalSection.classList.add("hidden");
        document.body.style.overflow = "";
    };
}

if (disciplineModalSection) {
    disciplineModalSection.addEventListener("click", (e) => {
        if (e.target === disciplineModalSection) {
            disciplineModalSection.classList.add("hidden");
            document.body.style.overflow = "";
        }
    });
}

// Controle do Modal de Colunas
if (btnAbrirColunas && columnModalSection) {
    btnAbrirColunas.onclick = () => {
        columnModalSection.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        renderColumnToggleList();
    };
}

if (closeColumnModalBtn) {
    closeColumnModalBtn.onclick = () => {
        columnModalSection.classList.add("hidden");
        document.body.style.overflow = "";
    };
}

if (columnModalSection) {
    columnModalSection.addEventListener("click", (e) => {
        if (e.target === columnModalSection) {
            columnModalSection.classList.add("hidden");
            document.body.style.overflow = "";
        }
    });
}

// Evento do botão (X) para fechar o modal
if (closeModalBtn) {
    closeModalBtn.onclick = () => resetForm();
}

// Fechar modal ao clicar no fundo escurecido
if (registrationSection) {
    registrationSection.addEventListener("click", (e) => {
        if (e.target === registrationSection) {
            resetForm();
        }
    });
}

// Atalho de teclado para fechar o modal com a tecla 'Esc'
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && registrationSection && !registrationSection.classList.contains("hidden")) {
        resetForm();
    }
    if (e.key === "Escape" && schoolModalSection && !schoolModalSection.classList.contains("hidden")) {
        schoolModalSection.classList.add("hidden");
        document.body.style.overflow = "";
    }
    if (e.key === "Escape" && disciplineModalSection && !disciplineModalSection.classList.contains("hidden")) {
        disciplineModalSection.classList.add("hidden");
        document.body.style.overflow = "";
    }
    if (e.key === "Escape" && confirmModalSection && !confirmModalSection.classList.contains("hidden")) {
        btnConfirmCancel.click(); // Simula o cancelamento
    }
    if (e.key === "Escape" && columnModalSection && !columnModalSection.classList.contains("hidden")) {
        columnModalSection.classList.add("hidden");
        document.body.style.overflow = "";
    }
});

// Event listeners para os novos filtros
if (filterEscolaSelect) {
    filterEscolaSelect.addEventListener("change", () => renderTable());
}
if (filterDisciplinaSelect) {
    filterDisciplinaSelect.addEventListener("change", () => renderTable());
}
if (filterAnoSelect) {
    filterAnoSelect.addEventListener("change", () => renderTable());
}
if (filterTurmaSelect) {
    filterTurmaSelect.addEventListener("change", () => renderTable());
}
if (filterTurnoSelect) {
    filterTurnoSelect.addEventListener("change", () => renderTable());
}

// Evento de busca
if (searchInput) {
    searchInput.addEventListener("input", () => renderTable());
}

// Função auxiliar para tratar a ordenação (chamada pelos headers dinâmicos)
function handleSort(columnId) {
    if (currentSort.column === columnId) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnId;
        currentSort.direction = 'asc';
    }
    saveAndRender();
}

// Função para Limpar Filtros
if (btnLimparFiltros) {
    btnLimparFiltros.onclick = () => {
        if (searchInput) searchInput.value = "";
        if (filterEscolaSelect) filterEscolaSelect.value = "";
        if (filterDisciplinaSelect) filterDisciplinaSelect.value = "";
        if (filterAnoSelect) filterAnoSelect.value = "";
        if (filterTurmaSelect) filterTurmaSelect.value = "";
        if (filterTurnoSelect) filterTurnoSelect.value = "";
        renderTable();
    };
}

// Função para mostrar/ocultar o gráfico
if (btnToggleChart && statsSection) {
    btnToggleChart.onclick = () => {
        statsSection.classList.toggle("hidden");
        if (statsSection.classList.contains("hidden")) {
            btnToggleChart.textContent = "Mostrar Gráfico";
        } else {
            btnToggleChart.textContent = "Ocultar Gráfico";
            // Se o gráfico for mostrado, garanta que ele esteja atualizado com os dados atuais
            renderTable(); 
        }
    };
}

// Função para Exportar CSV
if (btnExportar) {
    btnExportar.onclick = () => {
        const listaParaExportar = getFilteredData();

        if (listaParaExportar.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        // Criar conteúdo CSV
        let csvContent = "\uFEFFNome;Escola;Disciplina;Ano;Turma;Turno;Telefone\n";
        
        listaParaExportar.forEach(prof => {
            csvContent += `"${prof.nome}";"${prof.escola}";"${prof.disciplina}";"${prof.ano || ''}";"${prof.turma || ''}";"${prof.turno || ''}";"${prof.telefone}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_professores_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

// Função para gerar o relatório detalhado agrupado por Escola e Turma
if (btnDetailedReport) {
    btnDetailedReport.onclick = () => {
        const listaParaRelatorio = getFilteredData();

        if (listaParaRelatorio.length === 0) {
            alert("Não há professores para gerar o relatório com os filtros atuais.");
            return;
        }

        // Agrupa apenas por Escola
        const groupedData = listaParaRelatorio.reduce((acc, prof) => {
            if (!acc[prof.escola]) {
                acc[prof.escola] = [];
            }
            acc[prof.escola].push(prof);
            return acc;
        }, {});

        let reportHtml = `
            <html>
            <head>
                <title>Relatório Detalhado de Professores</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                .report-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 2px solid #4CAF50;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .report-logos { display: flex; align-items: center; gap: 10px; flex: 1; }
                .report-logos img { height: 40px; }
                .report-header h1 { flex: 2; text-align: center; margin: 0; font-size: 1.5rem; color: #333; }
                    h2 { color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
            <div class="report-header">
                <div class="report-logos">
                    <img src="https://raw.githubusercontent.com/educacao-tech/edmprofessor/main/batatais.png" alt="Batatais">
                    <img src="https://raw.githubusercontent.com/educacao-tech/edmprofessor/main/secretaria.png" alt="Secretaria">
                    <img src="https://raw.githubusercontent.com/educacao-tech/edmprofessor/main/edm.png" alt="EDM">
                </div>
                <h1>Lista de Presença Presencial</h1>
            </div>
        `;

        // Ordena as escolas alfabeticamente para o relatório
        const escolasOrdenadas = Object.keys(groupedData).sort((a, b) => a.localeCompare(b));

        escolasOrdenadas.forEach(escola => {
            const totalEscola = groupedData[escola].length;
            reportHtml += `<h2>Escola: ${escola} (${totalEscola} professores)</h2>`;
            reportHtml += `
                <table>
                    <thead>
                        <tr>
                            <th>Nome do Professor</th>
                            <th>Assinatura</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            // Ordena os professores por nome dentro da escola
            groupedData[escola].sort((a, b) => a.nome.localeCompare(b.nome)).forEach(prof => {
                reportHtml += `
                    <tr>
                        <td>${prof.nome}</td>
                        <td><div style="width: 300px; height: 20px; border-bottom: 1px solid #000;"></div></td>
                    </tr>
                `;
            });

            reportHtml += `
                    </tbody>
                </table>
            `;
        });

        reportHtml += `
            </body>
            </html>
        `;

        const newWindow = window.open("", "_blank");
        newWindow.document.write(reportHtml);
        newWindow.document.close();
        
        // Aguarda as imagens carregarem antes de abrir a impressão
        newWindow.onload = () => {
            newWindow.print();
        };
        // newWindow.close(); // Opcional: fechar após o diálogo de impressão ser dispensado
    };
}

// Função para Backup JSON (Segurança de Dados)
if (btnBackup) {
    btnBackup.onclick = () => {
        const fullBackup = {
            professores: professores,
            escolas: escolas,
            disciplinas: disciplinas
        };
        const dataStr = JSON.stringify(fullBackup, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup_professores_${new Date().toISOString().slice(0,10)}.json`;
        link.click();

        // Salva e exibe a data do último backup
        const now = new Date();
        const backupDateStr = now.toLocaleDateString() + " às " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem("lastBackupDate", backupDateStr);
        updateLastBackupDisplay();
    };
}

// Função para atualizar a exibição da data do último backup no rodapé
function updateLastBackupDisplay() {
    const lastBackup = localStorage.getItem("lastBackupDate");
    const display = document.getElementById("lastBackupDisplay");
    if (display) {
        display.textContent = lastBackup ? `Último backup: ${lastBackup}` : "Último backup: Nunca";
    }
}

// Função para Restaurar Backup
if (btnRestaurar) {
    btnRestaurar.onclick = () => {
        const input = document.createElement("input");
        input.type = "file";
        // Adiciona um listener para garantir que o input seja removido do DOM
        input.addEventListener('change', () => {
            if (input.parentNode) input.parentNode.removeChild(input);
        });

        input.accept = ".json";
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async readerEvent => {
                try {
                    const content = JSON.parse(readerEvent.target.result);
                    // Verifica se o backup é do novo formato (objeto) ou antigo (array)
                    const dataToRestore = Array.isArray(content) ? content : content.professores;
                    
                    if (Array.isArray(dataToRestore)) {
                        const confirmed = await showConfirm(
                            "Restaurar Backup",
                            "Isso substituirá todos os dados atuais por este backup. Esta ação não pode ser desfeita. Continuar?",
                            "Restaurar",
                            "Cancelar"
                        );
                        if (confirmed) {
                            professores = dataToRestore;
                            if (content.escolas) escolas = content.escolas;
                            if (content.disciplinas) disciplinas = content.disciplinas;
                            
                            saveSchools();
                            saveDisciplines();
                            saveAndRender();
                            alert("Dados restaurados com sucesso!");
                        }
                    }
                } catch (err) {
                    alert("Arquivo de backup inválido.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
}

// Evento para o botão de alterar senha
if (btnChangePassword) {
    btnChangePassword.onclick = changeSecurityPassword;
}

// Função para Imprimir
if (btnImprimir) {
    btnImprimir.onclick = () => window.print();
}

// Evento do botão cancelar
if (cancelBtn) {
    cancelBtn.onclick = () => resetForm();
}

// Evento do botão excluir dentro do modal
if (deleteBtnModal) {
    deleteBtnModal.onclick = async () => {
        const nome = document.getElementById("nome").value;
        if (editingIndex !== -1) {
            const confirmed = await showConfirm(
                "Excluir Professor",
                `Deseja realmente excluir o(a) professor(a) ${nome}? Esta ação não pode ser desfeita.`,
                "Excluir",
                "Manter"
            );
            if (confirmed) {
                removeProfessor(editingIndex);
            }
        }
    };
}
if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // impede o recarregamento da página

        if (!verificarAutenticacao("Para salvar os dados do professor")) return;

        // Pega os valores dos campos
        const nome = document.getElementById("nome").value.trim().toUpperCase();
        const escola = document.getElementById("escola").value.trim().toUpperCase();
        const disciplina = document.getElementById("disciplina").value.trim().toUpperCase();
        const ano = document.getElementById("ano").value.trim().toUpperCase();
        const turma = document.getElementById("turma").value.trim().toUpperCase();
        const turno = document.getElementById("turno").value.trim().toUpperCase();
        const telefone = document.getElementById("telefone").value.trim();

        // Mapeia campos para validação visual
        const campos = [
            { el: nomeInput, val: nome },
            { el: escolaInput, val: escola },
            { el: disciplinaInput, val: disciplina },
            { el: anoInput, val: ano },
            { el: turmaInput, val: turma },
            { el: turnoInput, val: turno }
        ];

        let formValido = true;
        campos.forEach(campo => {
            if (!campo.val) {
                campo.el.classList.add("invalid");
                campo.el.classList.add("shake");
                setTimeout(() => campo.el.classList.remove("shake"), 400);
                formValido = false;
            } else {
                campo.el.classList.remove("invalid");
            }
        });

        if (!formValido) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // RegEx para validar nome (apenas letras e espaços)
        const nameRegex = /^[A-ZÀ-Ÿ\s]+$/;
        if (nome.length < 3 || !nameRegex.test(nome)) {
            nomeInput.classList.add("invalid");
            nomeInput.classList.add("shake");
            setTimeout(() => nomeInput.classList.remove("shake"), 400);
            alert("O campo Nome deve conter pelo menos 3 letras e apenas caracteres alfabéticos.");
            return;
        }

        // RegEx para validar telefone com a máscara (ex: (11) 99999-9999)
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

        if (telefone === "" || !phoneRegex.test(telefone)) {
            telefoneInput.classList.add("invalid");
            telefoneInput.classList.add("shake");
            setTimeout(() => telefoneInput.classList.remove("shake"), 400);
            alert("O campo Telefone é obrigatório e deve seguir o padrão (00) 00000-0000.");
            return;
        }

        // Verificação de duplicados (Nome + Escola)
        const nomeSemAcento = removerAcentos(nome);
        const escolaSemAcento = removerAcentos(escola);

        const jaExiste = professores.some((prof, index) => 
            removerAcentos(prof.nome) === nomeSemAcento && 
            removerAcentos(prof.escola) === escolaSemAcento &&
            index !== editingIndex // Ignora o próprio professor se estiver em modo de edição
        );

        if (jaExiste) {
            alert(`O(A) professor(a) "${nome}" já está cadastrado(a) na escola "${escola}".`);
            nomeInput.classList.add("invalid");
            nomeInput.classList.add("shake");
            setTimeout(() => nomeInput.classList.remove("shake"), 400);
            return;
        }

        if (editingIndex !== -1) {
            // Atualiza o professor existente
            professores[editingIndex] = { nome, escola, disciplina, ano, turma, turno, telefone };
            editingIndex = -1; // Reseta o estado de edição
            if (submitButton) {
                submitButton.textContent = "Adicionar Professor"; // Reseta o texto do botão
            }
        } else {
            // Adiciona um novo professor
            professores.push({ nome, escola, disciplina, ano, turma, turno, telefone });
        }
        saveAndRender();
        resetForm();
    });
}

// Observer para adicionar sombra no cabeçalho da tabela ao scrollar
if (headerSentinel && table) {
    const observer = new IntersectionObserver(([entry]) => {
        // Se o sentinela não estiver visível na área de intersecção, o header está stuck
        table.classList.toggle("stuck-header", !entry.isIntersecting);
    }, {
        rootMargin: "-113px 0px 0px 0px" // Ajustado para a média entre o estado normal e compacto
    });
    observer.observe(headerSentinel);
}

// Renderização inicial
ordenarProfessores(); // Ordena a lista inicial
populateFilters();    // Popula os filtros com as escolas/disciplinas existentes
renderTable();        // Renderiza a tabela e atualiza o gráfico
updateLastBackupDisplay(); // Inicializa a exibição do último backup no rodapé

// Define o texto inicial do botão de alternar gráfico com base na visibilidade real
if (btnToggleChart && statsSection) {
    btnToggleChart.textContent = statsSection.classList.contains("hidden") ? "Mostrar Gráfico" : "Ocultar Gráfico";
}

// Lógica de Tema Escuro
const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (btnTheme) btnTheme.innerHTML = '<span class="theme-icon">☀️</span> Tema';
} else {
    if (btnTheme) btnTheme.innerHTML = '<span class="theme-icon">🌙</span> Tema';
}

if (btnTheme) {
    btnTheme.onclick = () => {
        let theme = document.documentElement.getAttribute("data-theme");
        let newTheme = theme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        const icon = newTheme === "dark" ? "☀️" : "🌙";
        btnTheme.innerHTML = `<span class="theme-icon rotate-animation">${icon}</span> Tema`;
    };
}

// Lógica de Rolagem (Scroll): Compactar barra e Botão Voltar ao Topo
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // Compactar barra de ferramentas após 50px de rolagem
    document.body.classList.toggle("scrolled-compact", scrollY > 50);

    // Mostrar/Ocultar botão voltar ao topo
    if (btnBackToTop) {
        btnBackToTop.classList.toggle("visible", scrollY > 300);
    }
});

if (btnBackToTop) {
    btnBackToTop.onclick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
}

// Lógica do Efeito de Onda (Ripple Effect)
document.addEventListener("click", function (e) {
    const button = e.target.closest("button");
    
    // Ignora se não for um botão ou se o botão estiver desativado
    if (!button || button.disabled) return;

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    // Calcula a cor da onda baseada no brilho do fundo do botão
    const style = window.getComputedStyle(button);
    const bgColor = style.backgroundColor;
    const rgb = bgColor.match(/\d+/g);
    let rippleColor = "rgba(255, 255, 255, 0.4)"; // Onda clara padrão

    if (rgb) {
        const [r, g, b] = rgb.map(Number);
        // Fórmula YIQ para determinar brilho: (R*299 + G*587 + B*114) / 1000
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness > 180) { // Se o fundo for muito claro
            rippleColor = "rgba(0, 0, 0, 0.2)"; // Onda escura sutil
        }
    }

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.style.backgroundColor = rippleColor;
    circle.classList.add("ripple-effect");

    // Remove ripples antigos antes de adicionar um novo
    const oldRipple = button.querySelector(".ripple-effect");
    if (oldRipple) oldRipple.remove();

    button.appendChild(circle);

    // Remove o elemento após a animação terminar
    setTimeout(() => circle.remove(), 600);
});
