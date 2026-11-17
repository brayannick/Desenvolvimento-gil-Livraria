# Sistema de Gerenciamento de Biblioteca

Projeto acadêmico da disciplina de Fundamentos da Engenharia de Software para praticar desenvolvimento ágil e XP. Implementa a US01: cadastrar livros informando título, autor, ISBN e ano de publicação.

## Funcionalidades

- Validação de campos obrigatórios e ano inteiro positivo.
- Bloqueio de ISBN duplicado, ignorando espaços e hífens.
- Identificadores automáticos e persistência no navegador.
- Mensagens de sucesso e erro, com preservação dos dados quando a gravação falha.

## Organização

```text
index.html                 Livro animado com login e criação de conta
livros.html                Formulário de cadastro de livros
css/style.css              Estilos da interface
js/entrada.js              Abertura do livro e troca entre login e criação de conta
js/app.js                  Integração do formulário com o cadastro
js/Livro.js                Modelo, validações e mensagens
js/LivroRepository.js      Persistência e consulta por ISBN
tests/                     Testes de unidade, cadastro, aceitação e persistência
```

HTML, CSS e JavaScript com módulos ES, sem frameworks ou dependências externas. Os testes usam o executor nativo do Node.js.

## Executar

Na raiz do projeto:

```sh
python3 -m http.server 8080
```

Acesse http://localhost:8080. É necessário servir os arquivos por HTTP para carregar os módulos JavaScript.

## Testar

Com Node.js 18 ou superior:

```sh
npm test
```

## Armazenamento

A interface injeta o `localStorage` no repositório. A chave `biblioteca.livros` guarda um objeto com `livros` e `proximoId`, mantendo o formato da implementação original. Nos testes, o repositório pode receber um armazenamento simulado; sem argumento, utiliza memória isolada.

Se o armazenamento estiver bloqueado ou contiver dados inválidos, a interface informa o problema e desabilita o cadastro, sem apagar os dados existentes. Se uma gravação falhar, a lista e o próximo identificador permanecem inalterados.

Os dados pertencem ao navegador e à origem usados no cadastro; limpar o armazenamento do navegador remove os livros. Empréstimos e reservas estão fora do escopo desta entrega.

## Interface do livro

Ao carregar a página inicial, o livro aparece fechado, abre a capa e passa três folhas até o login. Os links para criar conta ou voltar ao login repetem a passagem de folhas. A abertura pode ser pulada; a preferência de movimento reduzido mostra o formulário imediatamente. No celular, o livro ocupa uma única página para preservar a leitura dos campos.

A interface usa HTML, CSS 3D e JavaScript puro, sem bibliotecas de animação ou serviços externos. Login e criação de conta são uma demonstração visual: não criam usuários, não autenticam nem armazenam senhas. Os formulários informam essa limitação ao enviar e limpam o campo de senha. O cadastro de livros continua disponível pelo link no rodapé, sem depender de uma conta.

O acabamento usa texturas SVG locais para a granulação de couro e papel e os veios da madeira, combinadas com manchas e sombras em CSS. Ao terminar ou pular a abertura, a capa é ocultada para não permanecer projetada ao lado das páginas.

Durante a abertura, as folhas intermediárias ficam sem informações. O formulário é descoberto pela última folha, cujo verso traz o conteúdo da página esquerda; a troca entre login e criação de conta também acontece enquanto as folhas cobrem o formulário.
