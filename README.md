📚 Sistema de Gerenciamento de Biblioteca

Aplicação web para cadastro de livros, desenvolvida na disciplina de Fundamentos da Engenharia de Software como exercício de desenvolvimento ágil e prática de XP (Atividade 03).

O projeto implementa apenas a história de usuário prioritária do backlog, a US01 — Cadastrar Livros, e a entrega de ponta a ponta: análise, código, testes e documentação.

Sobre o projeto

O objetivo é permitir que um bibliotecário registre livros no sistema informando título, autor, ISBN e ano de publicação. O sistema valida os dados, impede ISBN repetido e guarda os livros no navegador, de modo que os cadastros continuam lá depois de recarregar a página.

COMO bibliotecário, EU QUERO cadastrar livros informando título, autor, ISBN e ano de publicação, PARA QUE os livros possam ser registrados e organizados no sistema.

Item	Detalhe
User Story	US01 — Cadastrar Livros
Prioridade	Prioritária
Peso (planning poker)	3, complexidade média
Tecnologias	HTML, CSS e JavaScript (módulos ES), sem frameworks nem dependências
Armazenamento	localStorage do navegador
Testes	Test runner nativo do Node.js (node --test)
Como o projeto foi construído

O trabalho seguiu a divisão de papéis da Atividade 03, em que cada etapa alimenta a próxima:

Dev 1 — Análise e Projeto: a user story foi estimada no planning poker e detalhada em requisitos funcionais, regras de negócio, estrutura da classe Livro, fluxo de cadastro e critérios de aceitação. Tudo isso está em docs/ANALISE.md.
Dev 2 — Implementação: o código foi escrito a partir dessa análise. Cada regra de negócio (RN01 a RN05) tem um ponto claro no código.
Dev 3 — Testes: os critérios de aceitação (CA01 a CA05) viraram testes automatizados.

A rastreabilidade entre requisitos, regras e critérios está na documentação de análise, o que permite ir de uma exigência até o teste que a verifica.

Como a aplicação funciona
Visão geral
Formulárioindex.html
app.jslê os campos
LivrovalidarDados ecadastrarLivro
LivroRepositoryexisteIsbn e salvar
localStoragebiblioteca:livros
Mensagem de sucesso ouerro
Passo a passo de um cadastro
O bibliotecário preenche título, autor, ISBN e ano e clica em Cadastrar.
O app.js monta um objeto Livro com os valores do formulário.
O Livro valida os dados. Se houver erro, a página mostra a mensagem em vermelho e nada é salvo.
Se os dados estão válidos, o repositório verifica se o ISBN já existe.
Se o ISBN é novo, o livro recebe um id automático e é gravado no localStorage.
A página mostra "Livro cadastrado com sucesso." em verde e limpa o formulário.
Regras aplicadas
Situação	Resultado
Algum campo vazio	Rejeita e informa quais campos faltam (título, autor, ISBN, ano, nessa ordem)
Ano zero, negativo ou decimal	Rejeita: "O ano de publicação deve ser um número inteiro positivo."
ISBN já cadastrado	Rejeita: "Já existe um livro cadastrado com este ISBN."
ISBN com hífen ou espaço	Comparado sem eles: 978-85-359-1484-9 é igual a 9788535914849
Falha ao gravar no navegador	Informa o erro e não cadastra
Dados válidos	Salva, gera id único e confirma
Persistência

Os livros ficam no localStorage, na chave biblioteca:livros, em formato JSON:

json
[
  {
    "id": 1,
    "titulo": "Dom Casmurro",
    "autor": "Machado de Assis",
    "isbn": "978-85-359-1484-9",
    "anoPublicacao": 1899
  }
]

O id é sempre o maior id salvo mais 1, então não se repete mesmo após recarregar a página. Se o conteúdo do storage estiver corrompido, o sistema o trata como lista vazia em vez de quebrar.

Estrutura do repositório
├── index.html                  # formulário de cadastro
├── css/style.css               # estilos
├── js/
│   ├── app.js                  # interface: liga o formulário às classes
│   ├── Livro.js                # classe Livro, validações e mensagens
│   └── LivroRepository.js      # armazenamento no localStorage
├── tests/
│   ├── Livro.test.js           # validações, ISBN duplicado, critérios de aceitação
│   └── LivroRepository.test.js # persistência (simula recarregar a página)
├── docs/ANALISE.md             # análise completa da US01
└── package.json

A separação é simples: app.js cuida só da tela, Livro concentra as regras de negócio e LivroRepository é o único que conhece o localStorage. Por isso é possível trocar a forma de armazenar (por exemplo, por um banco de dados) sem mexer nas validações.

Como executar

O projeto usa módulos ES, então não funciona abrindo o index.html direto no navegador (file://). Sirva a pasta com um servidor local:

bash
# Python
python -m http.server 8080

# ou Node
npx serve .

Depois acesse http://localhost:8080.

Para ver os dados salvos, cadastre um livro, abra o F12, vá em Application (Chrome/Edge) ou Storage (Firefox), depois em Local Storage, e procure a chave biblioteca:livros. Recarregue a página: os livros continuam lá.

Como testar

Requer Node.js 18 ou superior. Não há nada para instalar.

bash
npm test

Os testes cobrem:

os critérios de aceitação CA01 a CA05;
campos obrigatórios e anos inválidos;
ISBN duplicado em qualquer formato (com hífen, com espaço ou só números);
gravação em JSON no storage;
persistência após "recarregar" a página e continuidade dos ids;
dados corrompidos no storage e falha ao gravar.
Próximos passos do backlog

Fora do escopo desta entrega, que cobre só a US01: registrar empréstimo (essencial) e reserva de livros (desejável).
