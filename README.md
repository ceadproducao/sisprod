# **Documentação SisProd**

## **Visão Geral do Sistema**

O **SisProd** é um sistema de gerenciamento de produção de conteúdo acadêmico, projetado para rastrear o ciclo de vida de disciplinas, desde a concepção até a finalização. Ele permite o gerenciamento detalhado de tópicos, vídeos, e a atribuição de profissionais a diferentes papéis, oferecendo uma visão clara do progresso de cada etapa.

A arquitetura do sistema é construída em React e se baseia em três pilares fundamentais:

1. **Estado Global Centralizado:** Utiliza a Context API do React para gerenciar e compartilhar dados em toda a aplicação.  
2. **Componentização Modular:** A interface é dividida em componentes reutilizáveis e páginas específicas, promovendo a manutenibilidade.  
3. **Backend via Google Apps Script:** A persistência e a lógica de negócios são manipuladas por um backend desacoplado, com o qual o frontend se comunica via requisições HTTP.

## **Estrutura do Projeto**

Esta seção descreve a arquitetura de pastas e os arquivos principais que compõem a aplicação, fornecendo um guia para a navegação e entendimento do código-fonte.

### **Arquitetura de Pastas**

A estrutura do projeto está organizada da seguinte forma, separando páginas, componentes reutilizáveis, estado global e utilitários:

.  
├── AppContext.tsx  
├── AppProvider.tsx  
├── App.tsx  
├── components  
│   ├── CardPessoa  
│   ├── ConfirmPrompt  
│   ├── Cropper  
│   ├── EditProfissional  
│   ├── FormAddDisciplina  
│   ├── FormAddProfissional  
│   ├── Header  
│   ├── index.tsx  
│   ├── Menu  
│   ├── Panel  
│   ├── SelectDisciplina  
│   ├── ShowDisciplinas  
│   ├── ShowPessoal  
│   ├── ShowPessoas  
│   ├── ShowTopicos  
│   ├── ShowVideos  
│   └── Visualizador  
├── getData.tsx  
├── Interfaces  
│   └── index.tsx  
├── main.tsx  
└── pages  
    ├── ChangePasswordScreen  
    ├── DisciplinaPage  
    ├── Home  
    ├── Indicadores  
    ├── LoginScreen  
    ├── ProfissionaisPage  
    └── ProfissionalPage

### **Descrição dos Arquivos Principais**

* **main.tsx**: O ponto de entrada da aplicação. Ele renderiza o componente App dentro do AppProvider.  
* **App.tsx**: O componente raiz da aplicação. É responsável por buscar os dados iniciais e configurar o roteamento de todas as páginas usando react-router-dom.  
* **AppContext.tsx**: Define a "forma" do contexto global da aplicação, especificando quais estados e funções estarão disponíveis para os componentes.  
* **AppProvider.tsx**: O provedor de contexto que envolve toda a aplicação. Ele gerencia o estado global (disciplinas, profissionais, usuário atual, etc.) e o disponibiliza para todos os componentes filhos.  
* **Interfaces/index.tsx**: Centraliza todas as definições de tipo TypeScript (Disciplina, Profissional, Topico, Video), garantindo consistência em todo o projeto.  
* **getData.tsx**: Contém a lógica de busca e transformação de dados da API do Google Apps Script, convertendo os dados brutos em objetos tipados.  
* **components/**: Contém todos os componentes de UI reutilizáveis, como cards, formulários, modais e tabelas. O arquivo index.tsx nesta pasta exporta todos os componentes para facilitar as importações.  
* **pages/**: Contém os componentes que representam as páginas completas da aplicação, como a Home, a página de uma disciplina específica, a tela de login, etc.

## **Estrutura de Dados (As Interfaces)**

O coração do SisProd é a forma como os dados são modelados. Quatro interfaces principais definem a estrutura de todo o sistema:

### **`Profissional`**

Representa uma pessoa, seja ele um usuário do sistema, conteudista, validador, administrador, etc. Contém informações de identificação, contato e permissões.

export interface Profissional {

    id: number,

    nome: string,

    email: string,

    telefone: string,

    foto: string,

    internoExterno: "Interno" | "Externo",

    treinamentos: string,

    admin: boolean,

    temAcesso: boolean,

}

### **`Disciplina`**

É a entidade principal do sistema. Agrupa todas as informações relacionadas a um curso ou matéria, incluindo seus tópicos e os profissionais orientadores.

export interface Disciplina {

    id: number,

    nome: string,

    versao: string,

    up: string,

    disciplinaAntiga: string;

    area: string,

    excluida: string,

    status: "Não Iniciada" | "Produzindo" | "Pronta para Oferta" | "Finalizada",

    ano: string,

    prioridade: "" | "Baixa" | "Normal" | "Alta",

    orientadores: Profissional\[\],

    // ...outras propriedades

    topicos: Topico\[\],

}

### **`Topico`**

Representa uma unidade de conteúdo dentro de uma `Disciplina`. Cada tópico tem seu próprio ciclo de vida, status de produção, responsáveis (conteudistas, validadores) e contém uma lista de vídeos associados.

export interface Topico {

    id: string,

    idDisciplina: number,

    tipo: "Completo" | "Video"

    numero: number,

    conteudistas: Profissional\[\],

    validadores: Profissional\[\],

    status: "Nada" | "Iniciado Contato" | "Na mão" | "...",

    // ...outras propriedades

    videos: Video\[\],

    excluido: "" | "Excluído",

}

### **`Video`**

É a menor unidade de conteúdo rastreável, sempre associada a um `Topico`. Possui seu próprio status, tipo (Videoaula, Videocast, etc.) e profissionais associados (apresentador, convidado).

export interface Video {

    id: string,

    idDisciplina: number,

    topicoNum: number,

    tipo: "Apresentação" | "Videoaula" | "Video Embutido" | "Videocast",

    status: "Não Gravado" | "Liberado OC" | "Agendado" | "...",

    apresentador: Profissional\[\],

    convidado: Profissional\[\],

    // ...outras propriedades

    excluido: "" | "Excluído"

}

**Relação:** A estrutura é hierárquica: uma `Disciplina` contém múltiplos `Topicos`, e cada `Topico` contém múltiplos `Videos`. A interface `Profissional` se relaciona com todas as outras, representando os responsáveis em cada nível.

## **Núcleo da Aplicação**

### **Gerenciamento de Estado Global (`AppContext` e `AppProvider`)**

Para evitar a complexidade de passar dados por múltiplos níveis de componentes (props drilling), o SisProd utiliza a **Context API do React**.

* **`AppContext.tsx`**: Define o "contrato" do estado global, especificando quais dados (`Disciplinas`, `Profissionais`, `currentUser`, etc.) e funções de alteração (`setDisciplinas`, `setCurrentUser`, etc.) estarão disponíveis.  
* **`AppProvider.tsx`**: É o componente que "abraça" toda a aplicação. Ele gerencia os estados com `useState` e os fornece para todos os componentes filhos através do `AppContext.Provider`. Ele também é responsável por carregar o usuário do `localStorage` para manter a sessão ativa.

### **Comunicação com a API (`getData.ts`)**

Toda a comunicação com o backend (Google Apps Script) é centralizada na função `getData`.

* **Busca de Dados**: Ela faz uma única requisição `fetch` para buscar os dados de todas as planilhas (Disciplinas, Tópicos, Vídeos, Profissionais).  
* **Transformação e Relacionamento**: Após receber os dados brutos, esta função é crucial, pois ela **transforma e relaciona** as informações. Por exemplo, ela pega a lista de vídeos e a associa aos tópicos corretos, e depois pega a lista de tópicos e a associa às disciplinas corretas. Ela também popula os campos `orientadores`, `conteudistas`, etc., com os objetos `Profissional` completos, em vez de apenas seus nomes.

### **Roteamento e Autenticação (`App.tsx`)**

O `App.tsx` organiza a navegação e a segurança da aplicação.

* **`react-router-dom`**: Define todas as rotas possíveis, como `/`, `/disciplina/:id`, `/profissionais`, etc.  
* **`PrivateRoute`**: Um componente de ordem superior (HOC) que protege as rotas. Ele verifica se há um `currentUser` no `AppContext`. Se não houver, redireciona para `/login`. Ele também força o usuário a alterar a senha no primeiro acesso.  
* **`LoginRoute`**: Protege a rota de login, impedindo que um usuário já logado acesse a tela de login novamente, redirecionando-o para a página inicial.

## **Visualização e Componentes de UI**

### **Páginas (Views)**

As páginas são os componentes de mais alto nível que representam as telas principais do sistema. Elas são responsáveis por buscar os dados necessários (geralmente do `AppContext`) e compor os componentes de UI para exibir essas informações.

* **`Home`**: A tela inicial, que exibe uma lista paginada e filtrável de todas as disciplinas.  
* **`DisciplinaPage`**: A visão detalhada de uma única disciplina, compondo `ShowPessoal`, `ShowTopicos` e `ShowVideos` para apresentar todas as informações de forma organizada.  
* **`ProfissionaisPage`**: Exibe a lista de todos os profissionais, utilizando `ShowPessoas`.  
* **`ProfissionalPage`**: O perfil de um profissional, mostrando seus dados e as disciplinas em que atua.  
* **`Indicadores`**: O dashboard da aplicação, que processa os dados de disciplinas e tópicos para exibir métricas de produção.  
* **`LoginScreen` / `ChangePasswordScreen`**: Telas de autenticação e gerenciamento de senha.

### **Componentes de Exibição**

São componentes focados em apresentar dados de forma consistente. Eles são reutilizados em várias páginas.

* **`ShowDisciplinas` / `ShowTopicos` / `ShowVideos`**: Componentes especializados em renderizar listas ou tabelas de seus respectivos tipos de dados. Eles recebem um array de dados e o apresentam de forma padronizada. `ShowTopicos` e `ShowVideos` incluem a lógica para expandir linhas e exibir detalhes.  
* **`CardPessoa`**: Um dos componentes mais reutilizados. Exibe um "cartão" com a foto e o nome de um profissional. Sua inteligência está em adaptar o texto exibido: em uma lista geral, mostra o email; dentro de uma `DisciplinaPage`, mostra as funções daquela pessoa na disciplina.  
* **`ShowPessoal`**: Um componente de composição. Ele simplesmente recebe uma `Disciplina`, extrai todos os profissionais envolvidos e utiliza o `CardPessoa` para renderizar a lista do "Pessoal Técnico".

### **Componentes de Interação (Modais e Formulários)**

Estes componentes são responsáveis por capturar a entrada do usuário para criar ou modificar dados. Geralmente, são renderizados como modais sobre a página atual.

* **`Panel`**: O componente de edição mais complexo. É um modal com abas que centraliza toda a lógica de edição de uma `Disciplina` e seus `Topicos` e `Videos` aninhados. Ele mantém um estado temporário e só envia as alterações para a API quando o usuário clica em "Salvar".  
* **`FormAddDisciplina` / `FormAddProfissional` / `EditProfissional`**: Formulários dedicados para criar ou editar uma entidade específica. Eles gerenciam o estado de seus próprios campos e, na submissão, chamam a API e, em seguida, a `closeAction` para fechar o modal e atualizar a UI.  
* **`Cropper`**: Um componente utilitário focado em uma única tarefa: recortar imagens. É utilizado pelos formulários de adição/edição de profissionais.  
* **`ConfirmPrompt`**: Um modal genérico para confirmar ações, garantindo que o usuário não execute uma ação destrutiva por engano.

# **Documentação de Páginas**

## **ChangePasswordScreen**

### **Visão Geral**

ChangePasswordScreen é uma página de formulário dedicada à alteração de senha do usuário. Ela possui dois modos de operação:

1. **Primeiro Acesso**: Se for o primeiro login do usuário (primeiroAcesso do AppContext é true), o campo "Senha atual" é omitido.  
2. **Alteração Padrão**: Para usuários já logados, o formulário solicita a senha atual, a nova senha e a confirmação.

### **Dependências**

* **Bibliotecas:** react-router-dom.  
* **Contexto:** AppContext.

## **DisciplinaPage**

### **Visão Geral**

DisciplinaPage é a página principal para visualizar os detalhes de uma única disciplina. Ela compõe vários componentes (ShowPessoal, ShowTopicos, ShowVideos) para exibir todas as informações relevantes e gerencia a abertura do Panel de edição.

### **Dependências**

* **Bibliotecas:** react-router-dom.  
* **Componentes Internos:** Header, Menu, Panel, ShowPessoal, ShowTopicos, ShowVideos, ConfirmPrompt.  
* **Contexto:** AppContext.  
* **Interfaces TypeScript:** Disciplina.

## **Home**

### **Visão Geral**

A página Home é a tela principal da aplicação, exibindo uma lista de todas as disciplinas. Ela oferece funcionalidades avançadas de busca, filtragem (por versão, status de arquivamento) e paginação.

### **Dependências**

* **Componentes Internos:** Header, Menu, ShowDisciplinas, FormAddDisciplina.  
* **Contexto:** AppContext.

## **Indicadores**

### **Visão Geral**

A página Indicadores apresenta um dashboard com métricas de produção, como o número de disciplinas finalizadas, em produção e com problemas. Os dados são apresentados em cards e em uma estrutura hierárquica expansível, permitindo ao usuário visualizar listas detalhadas de cada indicador.

### **Dependências**

* **Componentes Internos:** Header, Menu, Visualizador.  
* **Contexto:** AppContext.  
* **Interfaces TypeScript:** Disciplina, Topico, Video.

## **LoginScreen**

### **Visão Geral**

LoginScreen é a página de login da aplicação. O usuário insere seu email e senha para autenticação. Em caso de sucesso, o usuário é redirecionado para a página inicial ou para a tela de alteração de senha, caso seja seu primeiro acesso.

### **Dependências**

* **Bibliotecas:** react-router-dom.  
* **Contexto:** AppContext.

## **ProfissionaisPage**

### **Visão Geral**

Esta página serve como um contêiner para o componente ShowPessoas, que exibe a lista de todos os profissionais. Ela também gerencia a abertura do modal FormAddProfissional para adicionar novos profissionais.

### **Dependências**

* **Componentes Internos:** Header, Menu, ShowPessoas, FormAddProfissional.  
* **Contexto:** AppContext.

## **ProfissionalPage**

### **Visão Geral**

ProfissionalPage exibe a página de perfil de um profissional específico. Mostra suas informações de contato, treinamentos, permissões e uma lista filtrável de todas as disciplinas em que atua. Permite que administradores ou o próprio usuário editem as informações do perfil.

### **Dependências**

* **Bibliotecas:** react-router-dom.  
* **Componentes Internos:** Header, Menu, ShowDisciplinas, ConfirmPrompt, EditProfissional.  
* **Contexto:** AppContext.  
* **Interfaces TypeScript:** Disciplina, Profissional.

# **Documentação de Componentes**

## **Panel**

### **Visão Geral**

O componente Panel é uma interface de usuário modal, organizada em abas, projetada para a visualização e edição detalhada de uma entidade Disciplina. Ele permite que o usuário modifique não apenas os dados gerais da disciplina, mas também seus componentes aninhados, como Tópicos e Vídeos.

### **Assinatura do Componente**

export default function Panel({   
    tipo,   
    setTipo,   
    open,   
    setOpen,   
    disciplina   
}: {   
    tipo: string,   
    setTipo: Function,   
    open: boolean,   
    setOpen: Function,   
    disciplina: Disciplina   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| tipo | string | Sim | Define qual aba do painel está ativa. Valores esperados: "disciplina", "topico", "video". |
| setTipo | Function | Sim | Função de callback para alterar a aba ativa. |
| open | boolean | Sim | Controla a visibilidade do painel. true para exibir, false para ocultar. |
| setOpen | Function | Sim | Função de callback para fechar o painel. |
| disciplina | Disciplina | Sim | O objeto Disciplina inicial que será exibido e editado no painel. |

## **CardPessoa**

### **Visão Geral**

O componente CardPessoa é um card de exibição reutilizável que mostra as informações de um Profissional. Quando usado dentro do contexto de uma Disciplina específica, o card exibe as funções que a pessoa desempenha. Caso contrário, exibe o email do profissional. O card inteiro funciona como um link para a página de perfil detalhada do profissional.

### **Assinatura do Componente**

export default function CardPessoa({   
    pessoa,   
    disciplina   
}: {   
    pessoa: Profissional,   
    disciplina?: Disciplina   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| pessoa | Profissional | Sim | O objeto Profissional cujas informações serão exibidas. |
| disciplina | Disciplina | Não | Se fornecido, o card determinará e exibirá as funções da pessoa na disciplina. |

## **ConfirmPrompt**

### **Visão Geral**

ConfirmPrompt é um componente modal simples e reutilizável, projetado para solicitar a confirmação do usuário antes de executar uma ação. Ele exibe uma mensagem de texto, um botão de "Confirmar" e um de "Cancelar".

### **Assinatura do Componente**

export default function ConfirmPrompt({   
    text,   
    confirmAction,   
    setClosed   
}: {   
    text: string,   
    confirmAction: () \=\> void,   
    setClosed: (value: boolean) \=\> void   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| text | string | Sim | A mensagem a ser exibida ao usuário. |
| confirmAction | () \=\> void | Sim | A função a ser executada ao clicar em "Confirmar". |
| setClosed | (value: boolean) \=\> void | Sim | A função para fechar o modal. |

## **Cropper**

### **Visão Geral**

O Cropper é um componente modal que permite ao usuário recortar uma imagem fornecida. Ele utiliza a biblioteca react-image-crop para fornecer uma interface de recorte circular.

### **Assinatura do Componente**

export default function Cropper({  
    file,  
    setFoto,  
    setOpenCropper  
}: {  
    file: File;  
    setFoto: Function,  
    setOpenCropper: Function;  
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| file | File | Sim | O arquivo de imagem original para recortar. |
| setFoto | Function | Sim | Função que recebe o novo arquivo (File) da imagem recortada. |
| setOpenCropper | Function | Sim | Função para fechar o modal do cropper. |

## **EditProfissional**

### **Visão Geral**

EditProfissional é um formulário modal para editar as informações de um profissional existente, integrando o componente Cropper para a edição da foto de perfil.

### **Assinatura do Componente**

export default function EditProfissional({   
    closeAction,   
    profissional   
}: {   
    closeAction: Function,   
    profissional: Profissional   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| closeAction | Function | Sim | Função para fechar o modal. |
| profissional | Profissional | Sim | O objeto Profissional a ser editado. |

## **FormAddDisciplina**

### **Visão Geral**

FormAddDisciplina é um formulário para a criação de uma nova Disciplina, permitindo a configuração de seus detalhes, tópicos e profissionais padrão.

### **Assinatura do Componente**

export default function FormAddDisciplina({   
    closeAction   
}: {   
    closeAction: () \=\> void   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| closeAction | () \=\> void | Sim | Função de callback para fechar o modal do formulário. |

## **FormAddProfissional**

### **Visão Geral**

FormAddProfissional é um formulário modal para criar um novo profissional, coletando suas informações e permissões.

### **Assinatura do Componente**

export default function FormAddProfissional({   
    closeAction   
}: {   
    closeAction: Function   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| closeAction | Function | Sim | Função para fechar o modal, recebendo opcionalmente o novo profissional. |

## **Header**

### **Visão Geral**

O Header renderiza a barra de navegação superior, com logotipo, botão de menu e um botão "voltar" opcional.

### **Assinatura do Componente**

export default function Header({   
    back   
}: {   
    back?: string   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| back | string | Não | URL para o botão "voltar". |

## **Menu**

### **Visão Geral**

Menu é o menu lateral (sidebar) da aplicação, contendo a navegação principal, link para o perfil e botão de logout.

### **Assinatura do Componente**

export default function Menu()

## **SelectDisciplina**

### **Visão Geral**

SelectDisciplina é um widget de busca e seleção para encontrar e escolher uma disciplina de uma lista.

### **Assinatura do Componente**

export default function SelectDisciplina({   
    disciplinaAtual,   
    disciplinaSelecionada,   
    setDisciplinaSelecionada   
}: {   
    disciplinaAtual?: Disciplina,   
    disciplinaSelecionada?: Disciplina,   
    setDisciplinaSelecionada: Function   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| disciplinaAtual | Disciplina | Não | Disciplina a ser excluída da lista. |
| disciplinaSelecionada | Disciplina | Não | A disciplina atualmente selecionada. |
| setDisciplinaSelecionada | Function | Sim | Função para atualizar a seleção. |

## **ShowDisciplinas**

### **Visão Geral**

ShowDisciplinas renderiza uma lista de disciplinas como links, com estilização condicional baseada em seu status.

### **Assinatura do Componente**

export default function ShowDisciplinas({   
    profissional,   
    disciplinas,   
    idsAntigos   
}: {   
    profissional?: Profissional,   
    disciplinas: Disciplina\[\],   
    idsAntigos?: string\[\]   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| profissional | Profissional | Não | Se fornecido, exibe as funções do profissional em cada disciplina. |
| disciplinas | Disciplina\[\] | Sim | O array de disciplinas a ser renderizado. |
| idsAntigos | string\[\] | Não | IDs de disciplinas a serem estilizadas como "antigas". |

## **ShowPessoal**

### **Visão Geral**

ShowPessoal exibe o "Pessoal Técnico" único associado a uma disciplina, renderizando uma lista de CardPessoa.

### **Assinatura do Componente**

export default function ShowPessoal({   
    disciplina   
}: {   
    disciplina: Disciplina   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| disciplina | Disciplina | Sim | A disciplina da qual o pessoal técnico será extraído. |

## **ShowPessoas**

### **Visão Geral**

ShowPessoas renderiza a página de "Profissionais", com funcionalidades de busca e filtragem por cargo.

### **Assinatura do Componente**

export default function ShowPessoas({   
    setPanelOpen   
}: {   
    setPanelOpen: Function   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| setPanelOpen | Function | Sim | Função para abrir o painel de adição de um novo profissional. |

## **ShowTopicos**

### **Visão Geral**

ShowTopicos renderiza uma tabela interativa e expansível dos tópicos de uma disciplina, com status destacados por cores.

### **Assinatura do Componente**

export default function ShowTopicos({  
    topicos,  
    classBtn,  
    classTitle,  
    setOpenPainel,  
    setTipoPainel  
}: {  
    topicos: Topico\[\];  
    classBtn: string;  
    classTitle: string;  
    setOpenPainel: Function;  
    setTipoPainel: Function;  
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| topicos | Topico\[\] | Sim | Array de tópicos a ser exibido. |
| classBtn | string | Sim | Classe CSS para o botão de edição. |
| classTitle | string | Sim | Classe CSS para o título da seção. |
| setOpenPainel | Function | Sim | Função para abrir o painel de edição. |
| setTipoPainel | Function | Sim | Função para definir a aba do painel como "topico". |

## **ShowVideos**

### **Visão Geral**

ShowVideos renderiza uma tabela interativa de vídeos, agrupados visualmente por tópico, com status destacados por cores.

### **Assinatura do Componente**

export default function ShowVideos({  
    videos,  
    classBtn,  
    classTitle,  
    setOpenPainel,  
    setTipoPainel  
}: {  
    videos: Video\[\];  
    classBtn: string;  
    classTitle: string;  
    setOpenPainel: Function;  
    setTipoPainel: Function;  
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| videos | Video\[\] | Sim | Array de vídeos a ser exibido. |
| classBtn | string | Sim | Classe CSS para o botão de edição. |
| classTitle | string | Sim | Classe CSS para o título da seção. |
| setOpenPainel | Function | Sim | Função para abrir o painel de edição. |
| setTipoPainel | Function | Sim | Função para definir a aba do painel como "video". |

## **Visualizador**

### **Visão Geral**

Visualizador é um componente modal genérico para exibir uma lista de itens (disciplinas, tópicos, etc.) como links navegáveis.

### **Assinatura do Componente**

export default function Visualizador({   
    tipo,   
    title,   
    subtitle,   
    lista,   
    reset   
}: {   
    tipo: string,   
    title: string,   
    subtitle: string,   
    lista: any\[\],   
    reset: Function   
})

### **Props**

| Prop | Tipo | Obrigatório | Descrição |
| :---- | :---- | :---- | :---- |
| tipo | string | Sim | O tipo de item na lista ("disciplina", "topico", etc.). |
| title | string | Sim | O título principal do modal. |
| subtitle | string | Sim | Um subtítulo opcional. |
| lista | any\[\] | Sim | O array de itens a serem exibidos. |
| reset | Function | Sim | Função para fechar o modal. |

# **Backend com Google Apps Script**

## **Visão Geral**

O backend do SisProd é construído inteiramente sobre a plataforma **Google Apps Script (GAS)**, implantado como um **Aplicativo Web**. Essa abordagem *serverless* permite que o script atue como uma API RESTful, manipulando requisições HTTP (GET e POST) enviadas pelo frontend em React.

O **Google Sheets** funciona como o banco de dados do sistema, onde todas as informações sobre disciplinas, tópicos, vídeos e profissionais são armazenadas e persistidas em abas separadas.

## **Princípios de Arquitetura**

* **Endpoint Único para Múltiplas Ações:** Em vez de múltiplos endpoints (`/login`, `/disciplinas`, etc.), a API utiliza um único endpoint para todas as operações de escrita (`doPost`). A ação específica a ser executada é determinada por um campo `acao` no corpo da requisição JSON.  
* **Mapeamento Dinâmico de Colunas:** A função `mapearCabecalhos` lê a segunda linha de cada planilha para criar um mapa entre os nomes das colunas e seus índices. Isso torna o código mais legível e resiliente a mudanças na ordem das colunas na planilha.  
* **Persistência Direta em Planilhas:** Todas as operações de CRUD (Criar, Ler, Atualizar, Deletar) são traduzidas em manipulações diretas das linhas e células nas planilhas: `Profissionais`, `Disciplinas`, `Topicos` e `Vídeo`.  
* **Segurança com Bcrypt:** As senhas dos usuários não são armazenadas em texto plano. Elas são hasheadas usando a biblioteca **bcrypt**, uma prática padrão de segurança para proteger as credenciais.

## **Principais Funções e Endpoints**

### **`doGet(e)` \- Leitura de Dados**

Este é o endpoint responsável por todas as operações de leitura.

* **Funcionalidade:** Recebe uma requisição `GET` com um parâmetro de URL `planilhas` (ex: `?planilhas=Disciplinas,Profissionais`).  
* **Processo:** Lê os dados brutos das planilhas especificadas, converte cada linha em um objeto JSON (usando os cabeçalhos como chaves) e retorna um único objeto JSON contendo arrays de dados para cada planilha solicitada. É a fonte de dados para a função `getData.tsx` no frontend.

### **`doPost(e)` \- Escrita e Modificação de Dados**

Este endpoint é o coração do backend, gerenciando todas as operações que modificam dados. Ele funciona como um "roteador" baseado no parâmetro `acao`.

* **`login`**: Autentica um usuário comparando o email e a senha (via bcrypt) com os registros na planilha "Profissionais". Retorna um status de sucesso e um booleano `primeiroAcesso` se o usuário ainda não definiu uma senha.  
* **`adicionarDisciplina`**: Recebe um objeto `Disciplina` complexo, cria uma nova linha na planilha "Disciplinas" e, em seguida, itera sobre seus `topicos` e `videos` para criar as linhas correspondentes em suas respectivas planilhas.  
* **`updateDisciplina`**: A ação mais complexa. Recebe um objeto `Disciplina` modificado, encontra a linha existente e a atualiza. Em seguida, realiza uma lógica de "diff" para seus tópicos e vídeos: atualiza os existentes, adiciona novos e remove os que foram excluídos no frontend.  
* **`adicionarProfissional` / `editarProfissional`**: Gerencia a criação e edição de usuários. Inclui uma lógica para o upload de fotos (ver seção "Gerenciamento de Imagens").  
* **`alterarSenha`**: Valida a senha atual e atualiza para uma nova senha hasheada.  
* **Outras Ações:** Inclui operações mais simples como `tornarAdmin`, `permitirAcesso` e `arquivoDisciplina`.

### **Funções Auxiliares Críticas**

* **`mapearCabecalhos(sheet)`**: Como descrito anteriormente, cria um objeto de mapeamento `{'Nome da Coluna': index}` para evitar o uso de índices de coluna fixos.  
* **`sort(sheet)`**: Chamada após quase todas as operações de escrita, esta função reordena as planilhas para manter a consistência. A ordenação é específica para cada aba (disciplinas por ID; tópicos e vídeos por ID da disciplina e depois número do tópico). Ela também detecta e preserva colunas que usam `ARRAYFORMULA`.

## **Fluxo de Autenticação**

1. O frontend envia uma requisição `POST` com `acao: "login"`, contendo `email` e `senha`.  
2. O backend localiza o profissional pelo email na planilha "Profissionais".  
3. Ele recupera o hash da senha armazenado na coluna "Senha". Se estiver vazio, usa um hash padrão para a senha inicial.  
4. A função `bcrypt.compareSync` compara a senha enviada com o hash armazenado.  
5. Se a comparação for bem-sucedida, retorna `{ sucesso: true }` e a flag `primeiroAcesso`, que instrui o frontend a forçar a troca de senha. Caso contrário, retorna uma mensagem de erro.

## **Gerenciamento de Imagens**

O upload de fotos de perfil é tratado de forma engenhosa:

1. O frontend, após o recorte da imagem, a converte para uma string **Base64**.  
2. Essa string é enviada no corpo da requisição `POST` para as ações `adicionarProfissional` ou `editarProfissional`.  
3. O Google Apps Script recebe a string Base64 e a decodifica de volta para dados binários.  
4. Cria um `blob` (arquivo) a partir desses dados.  
5. Salva este arquivo em uma pasta específica no Google Drive.  
6. Define as permissões do arquivo para "qualquer pessoa com o link pode ver".  
7. Obtém o link da miniatura (`thumbnail`) do arquivo recém-criado.  
8. Salva este URL da imagem na célula "Foto" da planilha "Profissionais".

## **Considerações Importantes**

* **Implantação:** O script deve ser implantado como "Aplicativo Web", com as permissões corretas ("Executar como eu" e "Acesso para qualquer pessoa").  
* **Dependências:** O funcionamento da autenticação depende da inclusão de uma biblioteca externa de `bcrypt` para Google Apps Script no projeto.  
* **Performance:** Por operar diretamente sobre o Google Sheets, o desempenho pode ser mais lento do que um banco de dados tradicional, especialmente com um grande volume de dados. No entanto, para a escala do SisProd, essa solução é extremamente eficaz e de baixo custo.

