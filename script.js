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
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const registrationSection = document.getElementById("registrationSection");
const filterEscolaSelect = document.getElementById("filterEscola");
const filterDisciplinaSelect = document.getElementById("filterDisciplina");
const btnExportar = document.getElementById("btnExportar");
const btnImprimir = document.getElementById("btnImprimir");

// Estado da aplicação: carrega dados salvos ou inicia array vazio
const dadosSalvos = JSON.parse(localStorage.getItem("professores"));
let professores = (dadosSalvos && dadosSalvos.length > 0) ? dadosSalvos : [
    { nome: "MARLENE BARBOSA DUARTE", escola: "CAIC", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ADRIANA APARECIDA VITAL DA SILVA", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ALEXANDRE SILVA PEDROSO", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "BIANCA SANTOS NOBRE", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "DAIANE ROBERTA DE SOUSA", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "DOUGLAS WILLIAN DA SILVA", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "JULIANA MENDES FERREIRA FUKUDA", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "MARTA VIEIRA ALVES", escola: "ESTHER", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "JESILDA BATISTA DA SILVA DOMINGOS", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LEILA APARECIDA MILAN BARBOZA", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LETÍCIA NARA PIRES", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LÚCIA HELENA SAQUETO G. GONÇALVES", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "MARCELA YARA CARNEIRO", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "NAYRA RODRIGUES OLIVERIO CAMPI", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "SUELLEN FRANCINE DA SILVA E SILVA", escola: "ANNA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "DEILANE FRANZONI", escola: "BRAGA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ELISANGELA ALMINDA O. BIBIANO", escola: "BRAGA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "MARIANA ROBERTA F. EVANGELISTA", escola: "BRAGA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "PRISCILA BRONDI ANHEZINI IVAN", escola: "BRAGA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ROSANA APARECIDA DA SILVA", escola: "BRAGA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "TALUANA BARBOSA PEREIRA", escola: "BRAGA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ANDREA LUCIA STOPPA O. BAVIERA", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ARETA FIGUEIREDO ROSA", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "DANIELA PARADA FERREIRA", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ELAINE CRISTINA DE SOUSA GOULART", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "FABIANA MEIRE NAZAR", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "GIOVANA TAIS DE OLIVEIRA BAGIO", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LANA MARA FIOCO DOS SANTOS", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "VERENA DE FÁTIMA CARVALHO", escola: "PADRE", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ADMILDE GABRIEL DE SOUSA", escola: "CÉLIA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ALINE SANTOS DA COSTA", escola: "CÉLIA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "EDNILSA GABRIEL DE SOUSA", escola: "CÉLIA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "JAQUELINE ARANTES RIBEIRO", escola: "CÉLIA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ANA CAROLINA VENTUROSO B. CANDIDO", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ÁUREA APARECIDA SOUZA CARDOSO", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "CRISTIANE AUGUSTA COSTA", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "DANIELA MARA MACEDO SILVA", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ELIZÂNGELA CERCE CONUNCHUC", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "FABIANA CÁSSIA DOS SANTOS", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "FABIANA KARINA DE OLIVEIRA", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "GABRIELA B. BERGAMO VENDRÚSCULO", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "ISABEL CRISTINA MANIERI DANIEL", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "JACKELINE SILVA RODRIGUES", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LARISSA DANIELE DIAS", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LOURDES RAYMUNDINI DA SILVA", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "LUCIANA PAULA LEMES", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "MARTA LUZIA PACHETI", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "NEUSA HELENA DE CASTRO GALANTI", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "PATRÍCIA ALEIXO SILVA DE OLIVEIRA", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "PATRÍCIA CORSINI COSTA", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" },
    { nome: "VIVIANE TOMAZ BANACO", escola: "ALZIRA", disciplina: "EDM", telefone: "(00) 00000-0000" }
];

// Variável global para rastrear se estamos editando e qual índice
let editingIndex = -1; // -1 significa que nenhum professor está sendo editado

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

// Função para popular os dropdowns de filtro
function populateFilters() {
    if (!filterEscolaSelect || !filterDisciplinaSelect) return;

    // Coleta escolas únicas e ordena
    const escolas = [...new Set(professores.map(p => p.escola))].sort();
    filterEscolaSelect.innerHTML = '<option value="">TODAS</option>'; // Opção padrão
    escolas.forEach(escola => {
        const option = document.createElement("option");
        option.value = escola;
        option.textContent = escola;
        filterEscolaSelect.appendChild(option);
    });

    // Coleta disciplinas únicas e ordena
    const disciplinas = [...new Set(professores.map(p => p.disciplina))].sort();
    filterDisciplinaSelect.innerHTML = '<option value="">TODAS</option>'; // Opção padrão
    disciplinas.forEach(disciplina => {
        const option = document.createElement("option");
        option.value = disciplina;
        option.textContent = disciplina;
        filterDisciplinaSelect.appendChild(option);
    });
}

// Função para ordenar a lista por nome
function ordenarProfessores() {
    professores.sort((a, b) => removerAcentos(a.nome).localeCompare(removerAcentos(b.nome)));
}

// Função para renderizar a tabela com base no array de professores
function renderTable() {
    if (!tableBody) return;

    // Limpa o conteúdo atual para re-renderizar
    tableBody.innerHTML = "";

    // Pega o termo de busca ignorando acentos
    const termoBusca = searchInput ? removerAcentos(searchInput.value.toUpperCase()) : "";

    // Pega os valores selecionados nos filtros de escola e disciplina
    const selectedEscola = filterEscolaSelect ? filterEscolaSelect.value : "";
    const selectedDisciplina = filterDisciplinaSelect ? filterDisciplinaSelect.value : "";

    // Filtra a lista preservando o índice original para ações de edit/delete
    const listaExibida = professores
        .map((prof, originalIndex) => ({ ...prof, originalIndex }))
        .filter(prof => 
            removerAcentos(prof.nome).includes(termoBusca) || 
            removerAcentos(prof.escola).includes(termoBusca) // Busca por nome ou escola
        );
    
    // Aplica os filtros de dropdown
    const listaFiltradaPorDropdown = listaExibida.filter(prof => 
        (selectedEscola === "" || prof.escola === selectedEscola) &&
        (selectedDisciplina === "" || prof.disciplina === selectedDisciplina)
    );

    // Atualiza o contador
    if (contadorElement) {
        contadorElement.textContent = `Professores encontrados: ${listaFiltradaPorDropdown.length}`;
    }

    listaFiltradaPorDropdown.forEach((prof) => {
        const newRow = tableBody.insertRow();

        newRow.insertCell(0).textContent = prof.nome;
        newRow.insertCell(1).textContent = prof.escola;
        newRow.insertCell(2).textContent = prof.disciplina;
        newRow.insertCell(3).textContent = prof.telefone;

        // Coluna de Ações (Excluir)
        const actionsCell = newRow.insertCell(4);

        // Botão de Edição
        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.classList.add("btn-edit"); // Usa a nova classe definida no CSS
        editBtn.onclick = () => editProfessor(prof.originalIndex);
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Excluir";
        deleteBtn.classList.add("btn-delete"); // Usa a classe definida no CSS
        deleteBtn.onclick = () => {
            if (confirm(`Tem certeza que deseja remover o(a) professor(a) ${prof.nome}?`)) {
                removeProfessor(prof.originalIndex);
            }
        };
        actionsCell.appendChild(deleteBtn);
    });
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
    saveAndRender();
}

// Função para resetar o estado do formulário
function resetForm() {
    form.reset();
    editingIndex = -1;
    if (submitButton) submitButton.textContent = "Adicionar Professor";
    if (cancelBtn) cancelBtn.style.display = "none";
    if (registrationSection) registrationSection.classList.add("hidden");
}

// Função para lidar com a edição de um professor
function editProfessor(index) {
    editingIndex = index;
    const professorToEdit = professores[index];

    document.getElementById("nome").value = professorToEdit.nome;
    document.getElementById("escola").value = professorToEdit.escola;
    document.getElementById("disciplina").value = professorToEdit.disciplina;
    document.getElementById("telefone").value = professorToEdit.telefone;

    if (registrationSection) {
        registrationSection.classList.remove("hidden");
    }

    if (submitButton) {
        submitButton.textContent = "Atualizar Professor";
    }
    if (cancelBtn) {
        cancelBtn.style.display = "inline-block";
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

// Controle do Menu de Cadastro
if (btnAbrirCadastro && registrationSection) {
    btnAbrirCadastro.onclick = () => {
        const isHidden = registrationSection.classList.toggle("hidden");
        if (!isHidden) document.getElementById("nome").focus();
        if (isHidden) resetForm();
    };
}

// Event listeners para os novos filtros
if (filterEscolaSelect) {
    filterEscolaSelect.addEventListener("change", () => renderTable());
}
if (filterDisciplinaSelect) {
    filterDisciplinaSelect.addEventListener("change", () => renderTable());
}

// Evento de busca
if (searchInput) {
    searchInput.addEventListener("input", () => renderTable());
}

// Função para Exportar CSV
if (btnExportar) {
    btnExportar.onclick = () => {
        // Replicar a lógica de filtragem da renderTable para a exportação
        const termoBusca = searchInput ? removerAcentos(searchInput.value.toUpperCase()) : "";
        const selectedEscola = filterEscolaSelect ? filterEscolaSelect.value : "";
        const selectedDisciplina = filterDisciplinaSelect ? filterDisciplinaSelect.value : "";

        const listaFiltradaPorBusca = professores.filter(prof => 
            removerAcentos(prof.nome).includes(termoBusca) || 
            removerAcentos(prof.escola).includes(termoBusca)
        );
        const listaParaExportar = listaFiltradaPorBusca.filter(prof => 
            (selectedEscola === "" || prof.escola === selectedEscola) &&
            (selectedDisciplina === "" || prof.disciplina === selectedDisciplina)
        );

        if (listaParaExportar.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        // Criar conteúdo CSV (com BOM para suporte a acentos no Excel)
        let csvContent = "\uFEFFNome;Escola;Disciplina;Telefone\n";
        
        listaParaExportar.forEach(prof => {
            csvContent += `"${prof.nome}";"${prof.escola}";"${prof.disciplina}";"${prof.telefone}"\n`;
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

// Função para Imprimir
if (btnImprimir) {
    btnImprimir.onclick = () => window.print();
}

// Evento do botão cancelar
if (cancelBtn) {
    cancelBtn.onclick = () => resetForm();
}

// Captura o evento de envio do formulário
if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // impede o recarregamento da página

        // Pega os valores dos campos
        const nome = document.getElementById("nome").value.trim().toUpperCase();
        const escola = document.getElementById("escola").value.trim().toUpperCase();
        const disciplina = document.getElementById("disciplina").value.trim().toUpperCase();
        const telefone = document.getElementById("telefone").value.trim();

        // RegEx para validar telefone com a máscara (ex: (11) 99999-9999)
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

        // Validação básica dos campos
        if (!nome || !escola || !disciplina || !telefone) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        if (!phoneRegex.test(telefone)) {
            alert("Por favor, insira um telefone válido com o DDD (ex: (11) 99999-9999).");
            return;
        }

        // Verificação de nomes duplicados
        const nomeSemAcento = removerAcentos(nome);

        const jaExiste = professores.some((prof, index) => 
            removerAcentos(prof.nome) === nomeSemAcento && index !== editingIndex
        );

        if (jaExiste) {
            alert(`O(A) professor(a) "${nome}" já está cadastrado(a).`);
            return;
        }

        if (editingIndex !== -1) {
            // Atualiza o professor existente
            professores[editingIndex] = { nome, escola, disciplina, telefone };
            editingIndex = -1; // Reseta o estado de edição
            if (submitButton) {
                submitButton.textContent = "Adicionar Professor"; // Reseta o texto do botão
            }
        } else {
            // Adiciona um novo professor
            professores.push({ nome, escola, disciplina, telefone });
        }
        saveAndRender();
        resetForm();
    });
}

// Renderização inicial
ordenarProfessores(); // Ordena a lista inicial
populateFilters();    // Popula os filtros com as escolas/disciplinas existentes
renderTable();        // Renderiza a tabela
