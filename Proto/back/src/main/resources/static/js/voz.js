/* Modo de acessibilidade com voz (Web Speech API) e tela de boas-vindas */
const Voz = (() => {
    let ativo = false;

    function falar(texto, aoTerminar) {
        if (!ativo || !texto || !("speechSynthesis" in window)) {
            aoTerminar?.();
            return;
        }
        window.speechSynthesis.cancel();
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = "pt-BR";
        fala.rate = 1.1;
        if (aoTerminar) fala.onend = aoTerminar;
        window.speechSynthesis.speak(fala);
    }

    function textoDoCampo(elemento) {
        if (elemento.id === "tipo") {
            return "Selecione o tipo de registro. Use as setas para cima e para baixo para mudar.";
        }
        const rotulo = elemento.labels?.[0]?.textContent.replace(":", "").trim();
        const texto = elemento.getAttribute("aria-label") || rotulo || elemento.innerText.trim() || elemento.name;
        return elemento.tagName === "INPUT" ? `Campo ${texto}. Pode começar a escrever.` : texto;
    }

    // Lê o campo em foco ao navegar com TAB
    function lerCamposAoFocar() {
        document.querySelectorAll("main input, main select, main button, header a").forEach((elemento) => {
            elemento.addEventListener("focus", () => falar(textoDoCampo(elemento)));
        });
    }

    function iniciarBoasVindas({ aoFechar } = {}) {
        const tela = document.querySelector("#tela-boas-vindas");
        const btnSemAcessibilidade = document.querySelector("#btn-sem-acessibilidade");
        if (!tela) return;

        const fechar = () => {
            tela.hidden = true;
            document.removeEventListener("keydown", aoPressionarTecla);
        };

        function aoPressionarTecla(event) {
            if (event.code !== "Space") return;
            event.preventDefault();
            ativo = true;
            fechar();
            falar("Modo de acessibilidade ativado. Utilize a tecla TAB para navegar pelos campos e Enter para selecionar.", aoFechar);
        }

        document.addEventListener("keydown", aoPressionarTecla);
        btnSemAcessibilidade?.addEventListener("click", () => {
            fechar();
            aoFechar?.();
        });
    }

    return {
        falar,
        iniciarBoasVindas,
        lerCamposAoFocar,
        get ativo() { return ativo; }
    };
})();
