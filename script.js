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
const turmaInput = document.getElementById("turma");
const turnoInput = document.getElementById("turno");
const btnAbrirCadastro = document.getElementById("btnAbrirCadastro");
const registrationSection = document.getElementById("registrationSection");
const closeModalBtn = document.getElementById("closeModalBtn");
const filterEscolaSelect = document.getElementById("filterEscola");
const filterDisciplinaSelect = document.getElementById("filterDisciplina");
const filterTurmaSelect = document.getElementById("filterTurma");
const filterTurnoSelect = document.getElementById("filterTurno");
const btnExportar = document.getElementById("btnExportar");
const btnImprimir = document.getElementById("btnImprimir");
const btnDetailedReport = document.getElementById("btnDetailedReport");
const btnToggleChart = document.getElementById("btnToggleChart");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const headerSentinel = document.getElementById("header-sentinel");

// Estado da aplicação: carrega dados salvos ou inicia array vazio
const dadosSalvos = JSON.parse(localStorage.getItem("professores"));
let professores = (dadosSalvos && dadosSalvos.length > 0) ? dadosSalvos : [
    { nome: "ANA CAROLINA VENTUROSO BÉRGAMO CÂNDIDO", escola: "ALZIRA", disciplina: "EDM", turma: "4º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ÁUREA APARECIDA SOUZA CARDOSO", escola: "ALZIRA", disciplina: "EDM", turma: "1º E", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "CRISTIANE AUGUSTA COSTA", escola: "ALZIRA", disciplina: "EDM", turma: "3º E", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ELIZÂNGELA CERCE CONUNCHUC", escola: "ALZIRA", disciplina: "EDM", turma: "1º C", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "FABIANA CÁSSIA DOS SANTOS", escola: "ALZIRA", disciplina: "EDM", turma: "2º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "FABIANA KARINA DE OLIVEIRA", escola: "ALZIRA", disciplina: "EDM", turma: "2º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "GABRIELA BOLOGNA BÉRGAMO VENDRUSCOLO", escola: "ALZIRA", disciplina: "EDM", turma: "1º D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ISABEL CRISTINA MANIERI DANIEL", escola: "ALZIRA", disciplina: "EDM", turma: "1º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "LOURDES RAYMUNDINI DA SILVA", escola: "ALZIRA", disciplina: "EDM", turma: "2º D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LUCIANA PAULA LEMES", escola: "ALZIRA", disciplina: "EDM", turma: "3º C", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARTA LUZIA PACHETI", escola: "ALZIRA", disciplina: "EDM", turma: "5º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "NEUSA HELENA DE CASTRO GALANTI", escola: "ALZIRA", disciplina: "EDM", turma: "4º E", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "PATRÍCIA CORSINI COSTA", escola: "ALZIRA", disciplina: "EDM", turma: "3º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "VIVIANE TOMAZ BANACO", escola: "ALZIRA", disciplina: "EDM", turma: "4º D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "JESILDA BATISTA DA SILVA DOMINGOS", escola: "ANNA", disciplina: "EDM", turma: "2º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LEILA APARECIDA MILAN BARBOZA", escola: "ANNA", disciplina: "EDM", turma: "1º D", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LETÍCIA NARA PIRES", escola: "ANNA", disciplina: "EDM", turma: "N/A", turno: "N/A", telefone: "(00) 00000-0000" },
    { nome: "LÚCIA HELENA SAQUETO G. GONÇALVES", escola: "ANNA", disciplina: "EDM", turma: "3º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "MARCELA YARA V. L. RAYMUNDO A. CARNEIRO", escola: "ANNA", disciplina: "EDM", turma: "5º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "NAYRA RODRIGUES OLIVÉRIO CAMPI", escola: "ANNA", disciplina: "EDM", turma: "3º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "SUELLEN FRANCINE DA SILVA e SILVA", escola: "ANNA", disciplina: "EDM", turma: "1º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DEILANE FRANZONI", escola: "BRAGA", disciplina: "EDM", turma: "1º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ELISÂNGELA ALMINDA OLIVEIRA BIBIANO", escola: "BRAGA", disciplina: "EDM", turma: "3º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARIANA R. DE FARIA EVANGELISTA", escola: "BRAGA", disciplina: "EDM", turma: "4º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "PRISCILA BRONDI ANHEZINI IVAN", escola: "BRAGA", disciplina: "EDM", turma: "1º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ROSANA APARECIDA DA SILVA", escola: "BRAGA", disciplina: "EDM", turma: "4º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "TALUANA BARBOSA PEREIRA", escola: "BRAGA", disciplina: "EDM", turma: "2º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARLENE APARECIDA BARBOSA DUARTE", escola: "CAIC", disciplina: "EDM", turma: "N/A", turno: "INTEGRAL", telefone: "(00) 00000-0000" },
    { nome: "ADMILDE GABRIEL DE SOUSA", escola: "CÉLIA", disciplina: "EDM", turma: "5º B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ALINE SANTOS DA COSTA", escola: "CÉLIA", disciplina: "EDM", turma: "5º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "EDNILSA GABRIEL DE SOUSA", escola: "CÉLIA", disciplina: "EDM", turma: "1º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "JAQUELINE ARANTES RIBEIRO", escola: "CÉLIA", disciplina: "EDM", turma: "1º B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ADRIANA APARECIDA VITAL DA SILVA", escola: "ESTHER", disciplina: "EDM", turma: "5º B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ALEXANDRE SILVA PEDROSO", escola: "ESTHER", disciplina: "EDM", turma: "3º A", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DAIANE ROBERTA DE SOUSA", escola: "ESTHER", disciplina: "EDM", turma: "1º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DOUGLAS WILLIAM DA SILVA", escola: "ESTHER", disciplina: "EDM", turma: "4º B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "JULIANA MENDES FERREIRA FUKUDA", escola: "ESTHER", disciplina: "EDM", turma: "1º A", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "MARTA VIEIRA ALVES", escola: "ESTHER", disciplina: "EDM", turma: "2º B", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "MICHELLE CRISTINA SILVA", escola: "ESTHER", disciplina: "EDM", turma: "2º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ANDRÉA LÚCIA STOPPA DE O. BAVIERA", escola: "PADRE", disciplina: "EDM", turma: "5º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "ARETA FIGUEIREDO ROSA", escola: "PADRE", disciplina: "EDM", turma: "2º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "DANIELA PARADA FERREIRA", escola: "PADRE", disciplina: "EDM", turma: "3º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "ELAINE CRISTINA DE SOUSA GOULART", escola: "PADRE", disciplina: "EDM", turma: "5º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "FABIANA MEIRE NAZAR", escola: "PADRE", disciplina: "EDM", turma: "4º B", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "GIOVANA TAIS DE OLIVEIRA BAGIO", escola: "PADRE", disciplina: "EDM", turma: "4º C", turno: "TARDE", telefone: "(00) 00000-0000" },
    { nome: "LANA MARA FIOCO DOS SANTOS", escola: "PADRE", disciplina: "EDM", turma: "4º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "MARIA HELOÍSA DE ARAÚJO CRUZ", escola: "PADRE", disciplina: "EDM", turma: "1º A", turno: "MANHÃ", telefone: "(00) 00000-0000" },
    { nome: "VERENA DE FÁTIMA CARVALHO", escola: "PADRE", disciplina: "EDM", turma: "2º A", turno: "MANHÃ", telefone: "(00) 00000-0000" }
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
    if (!filterEscolaSelect || !filterDisciplinaSelect || !filterTurmaSelect || !filterTurnoSelect) return;

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

    // Coleta turmas únicas e ordena
    const turmas = [...new Set(professores.map(p => p.turma).filter(Boolean))].sort();
    filterTurmaSelect.innerHTML = '<option value="">TODAS</option>';
    turmas.forEach(turma => {
        const option = document.createElement("option");
        option.value = turma;
        option.textContent = turma;
        filterTurmaSelect.appendChild(option);
    });

    // Coleta turnos únicos e ordena
    const turnos = [...new Set(professores.map(p => p.turno).filter(Boolean))].sort();
    filterTurnoSelect.innerHTML = '<option value="">TODAS</option>';
    turnos.forEach(turno => {
        const option = document.createElement("option");
        option.value = turno;
        option.textContent = turno;
        filterTurnoSelect.appendChild(option);
    });
}

// Função para ordenar a lista por nome
function ordenarProfessores() {
    professores.sort((a, b) => removerAcentos(a.nome).localeCompare(removerAcentos(b.nome)));
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
    const selectedTurma = filterTurmaSelect ? filterTurmaSelect.value : "";
    const selectedTurno = filterTurnoSelect ? filterTurnoSelect.value : "";

    // Filtra a lista preservando o índice original para ações de edit/delete
    const listaExibida = professores
        .map((prof, originalIndex) => ({ ...prof, originalIndex }))
        .filter(prof => 
            removerAcentos(prof.nome).includes(termoBusca) || 
            removerAcentos(prof.escola).includes(termoBusca) ||
            removerAcentos(prof.turma || "").includes(termoBusca) ||
            removerAcentos(prof.turno || "").includes(termoBusca)
        );
    
    // Aplica os filtros de dropdown
    const listaFiltradaPorDropdown = listaExibida.filter(prof => 
        (selectedEscola === "" || prof.escola === selectedEscola) &&
        (selectedDisciplina === "" || prof.disciplina === selectedDisciplina) &&
        (selectedTurma === "" || prof.turma === selectedTurma) &&
        (selectedTurno === "" || prof.turno === selectedTurno)
    );

    // Atualiza o contador
    if (contadorElement) {
        contadorElement.textContent = `Professores encontrados: ${listaFiltradaPorDropdown.length}`;
    }

    // Atualiza o gráfico com a lista filtrada
    updateChart(listaFiltradaPorDropdown);

    listaFiltradaPorDropdown.forEach((prof) => {
        const newRow = tableBody.insertRow();

        newRow.insertCell(0).textContent = prof.nome;
        newRow.insertCell(1).textContent = prof.escola;
        newRow.insertCell(2).textContent = prof.disciplina;
        newRow.insertCell(3).textContent = prof.turma || "";
        newRow.insertCell(4).textContent = prof.turno || "";
        newRow.insertCell(5).textContent = prof.telefone;

        // Coluna de Ações (Excluir)
        const actionsCell = newRow.insertCell(6);

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

    // Remove classes de erro de todos os campos
    [nomeInput, escolaInput, disciplinaInput, turmaInput, turnoInput, telefoneInput].forEach(input => {
        if (input) input.classList.remove("invalid");
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
    document.getElementById("turma").value = professorToEdit.turma || "";
    document.getElementById("turno").value = professorToEdit.turno || "";
    document.getElementById("telefone").value = professorToEdit.telefone;

    if (registrationSection) {
        registrationSection.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Trava o scroll da página
        setTimeout(() => document.getElementById("nome").focus(), 100);
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

// Remove a borda vermelha assim que o usuário começa a digitar
[nomeInput, escolaInput, disciplinaInput, turmaInput, turnoInput, telefoneInput].forEach(input => {
    if (input) {
        input.addEventListener("input", () => input.classList.remove("invalid"));
    }
});

// Controle do Menu de Cadastro
if (btnAbrirCadastro && registrationSection) {
    btnAbrirCadastro.onclick = () => {
        const isHidden = registrationSection.classList.toggle("hidden");
        if (!isHidden) {
            setTimeout(() => document.getElementById("nome").focus(), 100);
            document.body.style.overflow = "hidden"; // Trava o scroll ao abrir
        }
        if (isHidden) resetForm();
    };
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
});

// Event listeners para os novos filtros
if (filterEscolaSelect) {
    filterEscolaSelect.addEventListener("change", () => renderTable());
}
if (filterDisciplinaSelect) {
    filterDisciplinaSelect.addEventListener("change", () => renderTable());
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

// Função para Limpar Filtros
if (btnLimparFiltros) {
    btnLimparFiltros.onclick = () => {
        if (searchInput) searchInput.value = "";
        if (filterEscolaSelect) filterEscolaSelect.value = "";
        if (filterDisciplinaSelect) filterDisciplinaSelect.value = "";
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
        // Replicar a lógica de filtragem da renderTable para a exportação
        const termoBusca = searchInput ? removerAcentos(searchInput.value.toUpperCase()) : "";
        const selectedEscola = filterEscolaSelect ? filterEscolaSelect.value : "";
        const selectedDisciplina = filterDisciplinaSelect ? filterDisciplinaSelect.value : "";
        const selectedTurma = filterTurmaSelect ? filterTurmaSelect.value : "";
        const selectedTurno = filterTurnoSelect ? filterTurnoSelect.value : "";

        const listaFiltradaPorBusca = professores.filter(prof =>
            removerAcentos(prof.nome).includes(termoBusca) || 
            removerAcentos(prof.escola).includes(termoBusca) ||
            removerAcentos(prof.turma || "").includes(termoBusca) ||
            removerAcentos(prof.turno || "").includes(termoBusca)
        );
        const listaParaExportar = listaFiltradaPorBusca.filter(prof => 
            (selectedEscola === "" || prof.escola === selectedEscola) &&
            (selectedDisciplina === "" || prof.disciplina === selectedDisciplina) &&
            (selectedTurma === "" || prof.turma === selectedTurma) &&
            (selectedTurno === "" || prof.turno === selectedTurno)
        );

        if (listaParaExportar.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        // Criar conteúdo CSV
        let csvContent = "\uFEFFNome;Escola;Disciplina;Turma;Turno;Telefone\n";
        
        listaParaExportar.forEach(prof => {
            csvContent += `"${prof.nome}";"${prof.escola}";"${prof.disciplina}";"${prof.turma || ''}";"${prof.turno || ''}";"${prof.telefone}"\n`;
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
        // Re-aplica todos os filtros para obter a lista exata para o relatório
        const termoBusca = searchInput ? removerAcentos(searchInput.value.toUpperCase()) : "";
        const selectedEscola = filterEscolaSelect ? filterEscolaSelect.value : "";
        const selectedDisciplina = filterDisciplinaSelect ? filterDisciplinaSelect.value : "";
        const selectedTurma = filterTurmaSelect ? filterTurmaSelect.value : "";
        const selectedTurno = filterTurnoSelect ? filterTurnoSelect.value : "";

        const listaParaRelatorio = professores.filter(prof => {
            const profNome = removerAcentos(prof.nome);
            const profEscola = removerAcentos(prof.escola);
            const profTurma = removerAcentos(prof.turma || "");
            const profTurno = removerAcentos(prof.turno || "");

            const matchesSearch = profNome.includes(termoBusca) ||
                                  profEscola.includes(termoBusca) ||
                                  profTurma.includes(termoBusca) ||
                                  profTurno.includes(termoBusca);

            const matchesDropdowns = (selectedEscola === "" || prof.escola === selectedEscola) &&
                                     (selectedDisciplina === "" || prof.disciplina === selectedDisciplina) &&
                                     (selectedTurma === "" || prof.turma === selectedTurma) &&
                                     (selectedTurno === "" || prof.turno === selectedTurno);
            
            return matchesSearch && matchesDropdowns;
        });

        if (listaParaRelatorio.length === 0) {
            alert("Não há professores para gerar o relatório com os filtros atuais.");
            return;
        }

        // Agrupa por Escola e depois por Turma
        const groupedData = listaParaRelatorio.reduce((acc, prof) => {
            if (!acc[prof.escola]) {
                acc[prof.escola] = {};
            }
            if (!acc[prof.escola][prof.turma]) {
                acc[prof.escola][prof.turma] = [];
            }
            acc[prof.escola][prof.turma].push(prof);
            return acc;
        }, {});

        let reportHtml = `
            <html>
            <head>
                <title>Relatório Detalhado de Professores</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #333; }
                    h2 { color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; }
                    h3 { color: #3498db; margin-left: 15px; margin-top: 15px; }
                    table { width: 100%; border-collapse: collapse; margin-left: 30px; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Relatório Detalhado de Professores</h1>
        `;

        for (const escola in groupedData) {
            reportHtml += `<h2>Escola: ${escola} (${Object.values(groupedData[escola]).flat().length} professores)</h2>`;
            for (const turma in groupedData[escola]) {
                reportHtml += `<h3>Turma: ${turma} (${groupedData[escola][turma].length} professores)</h3>`;
                reportHtml += `
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Disciplina</th>
                                <th>Turno</th>
                                <th>Telefone</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                groupedData[escola][turma].forEach(prof => {
                    reportHtml += `
                        <tr>
                            <td>${prof.nome}</td>
                            <td>${prof.disciplina}</td>
                            <td>${prof.turno}</td>
                            <td>${prof.telefone}</td>
                        </tr>
                    `;
                });
                reportHtml += `
                        </tbody>
                    </table>
                `;
            }
        }

        reportHtml += `
            </body>
            </html>
        `;

        const newWindow = window.open("", "_blank");
        newWindow.document.write(reportHtml);
        newWindow.document.close(); // Importante para alguns navegadores
        newWindow.print();
        // newWindow.close(); // Opcional: fechar após o diálogo de impressão ser dispensado
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
        const turma = document.getElementById("turma").value.trim().toUpperCase();
        const turno = document.getElementById("turno").value.trim().toUpperCase();
        const telefone = document.getElementById("telefone").value.trim();

        // Mapeia campos para validação visual
        const campos = [
            { el: nomeInput, val: nome },
            { el: escolaInput, val: escola },
            { el: disciplinaInput, val: disciplina },
            { el: turmaInput, val: turma },
            { el: turnoInput, val: turno },
            { el: telefoneInput, val: telefone }
        ];

        let formValido = true;
        campos.forEach(campo => {
            if (!campo.val) {
                campo.el.classList.add("invalid");
                formValido = false;
            } else {
                campo.el.classList.remove("invalid");
            }
        });

        if (!formValido) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // RegEx para validar telefone com a máscara (ex: (11) 99999-9999)
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

        if (!phoneRegex.test(telefone)) {
            telefoneInput.classList.add("invalid");
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
            professores[editingIndex] = { nome, escola, disciplina, turma, turno, telefone };
            editingIndex = -1; // Reseta o estado de edição
            if (submitButton) {
                submitButton.textContent = "Adicionar Professor"; // Reseta o texto do botão
            }
        } else {
            // Adiciona um novo professor
            professores.push({ nome, escola, disciplina, turma, turno, telefone });
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
        rootMargin: "-71px 0px 0px 0px" // Dispara quando passa pelo limite do menu fixo (70px + 1px)
    });
    observer.observe(headerSentinel);
}

// Renderização inicial
ordenarProfessores(); // Ordena a lista inicial
populateFilters();    // Popula os filtros com as escolas/disciplinas existentes
renderTable();        // Renderiza a tabela e atualiza o gráfico

// Define o texto inicial do botão de alternar gráfico com base na visibilidade real
if (btnToggleChart && statsSection) {
    btnToggleChart.textContent = statsSection.classList.contains("hidden") ? "Mostrar Gráfico" : "Ocultar Gráfico";
}
