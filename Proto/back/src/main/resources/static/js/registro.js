/* Tela de registro: envia para POST /api/frequencia/registrar (PresencaController) */
const API_URL = document.querySelector('meta[name="api-url"]').content;

const form = document.querySelector("#formulario-registro");
const nomeInput = document.querySelector("#nome");
const cpfInput = document.querySelector("#cpf");
const tipoInput = document.querySelector("#tipo");
const btnEnviar = document.querySelector("#btn-enviar");
const feedback = document.querySelector("#feedback-registro");

// CPF -> nome, montado a partir de GET /api/frequencia/registrar para autocompletar
const alunosConhecidos = new Map();

async function carregarAlunosConhecidos() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) return;
        const registros = await resposta.json();
        // A API devolve do mais recente para o mais antigo; mantém o nome mais recente
        registros.forEach((registro) => {
            if (registro.cpf && !alunosConhecidos.has(registro.cpf)) {
                alunosConhecidos.set(registro.cpf, registro.nome);
            }
        });
    } catch (error) {
        // Sem autocompletar quando a API não responde; o registro continua funcionando
    }
}

function formatarCpf(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    return digitos
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validarCpf(cpf) {
    const digitos = cpf.replace(/\D/g, "");
    if (digitos.length !== 11 || /^(\d)\1{10}$/.test(digitos)) return false;

    const calcularDigito = (base, pesoInicial) => {
        const soma = [...base].reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    return calcularDigito(digitos.slice(0, 9), 10) === Number(digitos[9])
        && calcularDigito(digitos.slice(0, 10), 11) === Number(digitos[10]);
}

function dataLocal(date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function exibirFeedback(mensagem, tipo) {
    feedback.textContent = mensagem;
    feedback.className = `feedback feedback--${tipo}`;
    feedback.hidden = false;
    Voz.falar(mensagem);
}

function autocompletar(campoOrigem) {
    if (campoOrigem === "cpf") {
        const nome = alunosConhecidos.get(cpfInput.value);
        if (nome && !nomeInput.value.trim()) {
            nomeInput.value = nome;
            Voz.falar(`Nome autocompletado com: ${nome}`);
        }
        return;
    }

    const nomeAtual = nomeInput.value.trim().toLowerCase();
    if (!nomeAtual || cpfInput.value) return;
    for (const [cpf, nome] of alunosConhecidos) {
        if (nome.toLowerCase() === nomeAtual) {
            cpfInput.value = cpf;
            Voz.falar("CPF autocompletado.");
            return;
        }
    }
}

nomeInput.addEventListener("blur", () => autocompletar("nome"));

cpfInput.addEventListener("input", (event) => {
    event.target.setCustomValidity("");
    feedback.hidden = true;
    event.target.value = formatarCpf(event.target.value);
    if (event.target.value.length === 14) autocompletar("cpf");
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = nomeInput.value.trim();
    const cpf = cpfInput.value.trim();
    const tipo = tipoInput.value;

    if (!nome) {
        nomeInput.focus();
        exibirFeedback("Informe o nome completo.", "erro");
        return;
    }

    if (!validarCpf(cpf)) {
        cpfInput.setCustomValidity("Digite um CPF válido.");
        cpfInput.reportValidity();
        exibirFeedback("Verifique o CPF informado e tente novamente.", "erro");
        return;
    }
    cpfInput.setCustomValidity("");

    const agora = new Date();
    const registro = {
        nome,
        cpf,
        tipo,
        data: dataLocal(agora),
        horario: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    btnEnviar.disabled = true;
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registro)
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.status !== "sucesso") {
            exibirFeedback(dados.mensagemVoz || "O registro foi recusado pelo servidor. Revise os dados.", "erro");
            return;
        }

        alunosConhecidos.set(cpf, nome);
        form.reset();
        exibirFeedback(dados.mensagemVoz || `${tipo} registrado com sucesso.`, "sucesso");
    } catch (error) {
        exibirFeedback("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    } finally {
        btnEnviar.disabled = false;
    }
});

Voz.lerCamposAoFocar();
Voz.iniciarBoasVindas({ aoFechar: () => nomeInput.focus() });
carregarAlunosConhecidos();
