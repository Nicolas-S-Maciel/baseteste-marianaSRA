# Projeto-Mariana
Um sistema de registro de alunos atrasados.

## O que foi feito

1. Front-end integrado ao Spring Boot:

- Os arquivos do site foram organizados dentro de Proto/back/src/main/resources/static/.

- Agora, ao iniciar o Spring Boot, ele entrega o site completo em http://localhost:8080/ e a API no mesmo domínio.

2. Endpoints e Banco de Dados implementados:

- Criada a entidade JPA Registro e o repositório RegistroRepository.
- Atualizado o PresencaController:
  -- POST /api/frequencia/registrar: salva os dados (nome, cpf, tipo, data, horario) e responde com a mensagem de síntese de voz (mensagemVoz) que o navegador lê.
  -- GET /api/frequencia/registrar: retorna os registros armazenados para abastecer o relatorio.html.
- Atualizado o config.js para usar rota relativa (/api/frequencia/registrar), eliminando qualquer possibilidade de erro de CORS.

3. Banco de Dados Flexível e Porta Dinâmica:

- Em application.properties, configuramos server.port=${PORT:8080} (essencial para a nuvem injetar a porta automaticamente).
- Configuramos persistência com fallback automático: se o MySQL não estiver rodando localmente, o Spring Boot salva em ./data/mariano_db sem travar a inicialização.

## Resultado dos Testes Locais:

Subimos a aplicação em segundo plano e realizamos os testes automatizados:

- GET http://localhost:8080/ ➔ Status 200 OK (carregou o site e a tela de boas-vindas do SENAI).
- POST /api/frequencia/registrar ➔ Status 200 OK ("mensagemVoz": "Atraso registrado com sucesso para Carlos Silva.").
- GET /api/frequencia/registrar ➔ Status 200 OK (retornou o registro persistido).
- O processo de teste foi finalizado e a porta 8080 está liberada.

## Como testar agora no seu computador:

Você pode simplesmente rodar a classe MarianaApplication.java no VS Code (ou executar .\mvnw spring-boot:run dentro de Proto/back) e abrir no navegador: 👉 http://localhost:8080

## Front-end (Thymeleaf + Tailwind)

As telas ficam em `Proto/back` e são servidas pelo próprio Spring Boot:

- `src/main/resources/templates/`: páginas Thymeleaf (`index.html` em `/`, `relatorio.html` em `/relatorio`) e o fragmento `fragments/layout.html` (head, cabeçalho e rodapé).
- `src/main/resources/static/js/`: scripts que consomem a API real (`/api/frequencia/registrar`).
- `src/main/frontend/styles.css`: entrada do Tailwind (cores do SENAI definidas em `@theme`).
- `src/main/resources/static/css/app.css`: CSS gerado. Fica no repositório para o projeto rodar só com o `mvnw`, sem precisar de Node.

Para editar o visual (precisa de Node 18+), dentro de `Proto/back`:

```bash
npm install      # uma vez
npm run dev      # recompila o app.css a cada alteração nos templates/JS
npm run build    # gera o app.css minificado antes de commitar
```

Os protótipos originais em HTML/CSS puro continuam em `Proto/` e `Proto/front/` como referência.
