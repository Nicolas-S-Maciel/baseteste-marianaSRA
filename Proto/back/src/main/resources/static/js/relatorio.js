/* Relatório: lê GET /api/frequencia/registrar (PresencaController) */
const API_URL = document.querySelector('meta[name="api-url"]').content;
// Regra do protótipo: cada registro (atraso/saída) desconta 2% da frequência
const PERDA_POR_REGISTRO = 2;
const LIMITE_ALERTA = 3;

const totalRegistros = document.querySelector("#total-registros");
const registrosHoje = document.querySelector("#registros-hoje");
const percentualHoje = document.querySelector("#percentual-hoje");
const listaRegistros = document.querySelector("#lista-registros");
const estadoVazio = document.querySelector("#estado-vazio");
const erroCarregamento = document.querySelector("#erro-carregamento");
const seletorAluno = document.querySelector("#seletor-aluno");
const seletorPeriodo = document.querySelector("#seletor-periodo");
const alunoSelecionado = document.querySelector("#aluno-selecionado");
const cpfSelecionado = document.querySelector("#cpf-selecionado");
const frequenciaAluno = document.querySelector("#frequencia-aluno");
const btnImprimir = document.querySelector("#btn-imprimir");

let registros = [];

async function carregarRegistros() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        const dados = await resposta.json();
        registros = Array.isArray(dados) ? dados : [];
        erroCarregamento.hidden = true;
    } catch (error) {
        erroCarregamento.hidden = false;
    }
    atualizarRelatorio();
}

function dataAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

function formatarData(data) {
    const [ano, mes, dia] = String(data).split("-");
    return dia ? `${dia}/${mes}/${ano}` : String(data);
}

function criarCelula(texto) {
    const celula = document.createElement("td");
    celula.className = "border-b border-line px-3.5 py-[17px]";
    celula.textContent = texto;
    return celula;
}

function atualizarResumo(registrosDoPeriodo) {
    const hoje = registrosDoPeriodo.filter((registro) => registro.data === dataAtual()).length;
    const percentual = registrosDoPeriodo.length ? Math.round((hoje / registrosDoPeriodo.length) * 100) : 0;

    totalRegistros.textContent = registrosDoPeriodo.length;
    registrosHoje.textContent = hoje;
    percentualHoje.textContent = `${percentual}%`;
}

function atualizarSeletorAluno(registrosDoPeriodo) {
    const alunos = [...new Map(registrosDoPeriodo.map((registro) => [registro.cpf, registro.nome])).entries()]
        .map(([cpf, nome]) => ({ cpf, nome }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const cpfAnterior = seletorAluno.value;

    seletorAluno.replaceChildren(...(alunos.length
        ? alunos.map((aluno) => new Option(`${aluno.nome} - ${aluno.cpf}`, aluno.cpf))
        : [new Option("Nenhum aluno registrado", "")]));
    seletorAluno.value = alunos.some((aluno) => aluno.cpf === cpfAnterior) ? cpfAnterior : alunos[0]?.cpf || "";

    return alunos.find((aluno) => aluno.cpf === seletorAluno.value);
}

function atualizarRelatorio() {
    const periodo = seletorPeriodo.value;
    const registrosDoPeriodo = periodo
        ? registros.filter((registro) => registro.data?.startsWith(periodo))
        : registros;

    atualizarResumo(registrosDoPeriodo);
    const aluno = atualizarSeletorAluno(registrosDoPeriodo);
    const registrosDoAluno = aluno ? registrosDoPeriodo.filter((registro) => registro.cpf === aluno.cpf) : [];

    const frequencia = Math.max(0, 100 - registrosDoAluno.length * PERDA_POR_REGISTRO);
    frequenciaAluno.textContent = `${frequencia}%`;
    frequenciaAluno.classList.toggle("text-senai-red", registrosDoAluno.length >= LIMITE_ALERTA);

    alunoSelecionado.textContent = aluno?.nome || "Nenhum aluno selecionado";
    cpfSelecionado.textContent = aluno?.cpf || "Registre um aluno para consultar o histórico.";

    // A API já devolve ordenado do mais recente para o mais antigo
    listaRegistros.replaceChildren(...registrosDoAluno.map((registro) => {
        const linha = document.createElement("tr");
        linha.append(
            criarCelula(formatarData(registro.data)),
            criarCelula(registro.horario),
            criarCelula(registro.tipo || "Atraso")
        );
        return linha;
    }));
    estadoVazio.hidden = registrosDoAluno.length > 0;
}

seletorAluno.addEventListener("change", atualizarRelatorio);
seletorPeriodo.addEventListener("change", atualizarRelatorio);
btnImprimir.addEventListener("click", async () => {
    await carregarRegistros();
    window.print();
});

seletorPeriodo.value = dataAtual().slice(0, 7);
carregarRegistros();
