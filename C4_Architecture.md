# Arquitetura C4 - Sistema de Gestão de Atividades Acadêmicas

## Visão Geral

Este documento apresenta a arquitetura do **Sistema de Gestão de Atividades Acadêmicas** utilizando o modelo C4 (Context, Containers, Components, Code). O sistema permite o gerenciamento de atividades acadêmicas com diferentes níveis de acesso para administradores, tutores e bolsistas.

---

## Nível 1: Contexto do Sistema

```mermaid
graph TB
    subgraph "Sistema Institucional"
        SGAA[Sistema de Gestão de<br/>Atividades Acadêmicas]
    end

    Admin[Administrador]
    Tutor[Tutor]
    Bolsista[Bolsista]

    MongoDB[(MongoDB<br/>Database)]
    FileSystem[Sistema de<br/>Arquivos Local]

    Admin -->|Gerencia usuários e<br/>supervisiona atividades| SGAA
    Tutor -->|Gerencia atividades da<br/>própria bolsa| SGAA
    Bolsista -->|Cria e participa de<br/>atividades| SGAA

    SGAA -->|Armazena dados de<br/>usuários e atividades| MongoDB
    SGAA -->|Armazena arquivos<br/>anexados| FileSystem
```

### Usuários do Sistema

- **Administrador**: Acesso total ao sistema, pode gerenciar todos os usuários e atividades
- **Tutor**: Gerencia atividades relacionadas à sua bolsa específica
- **Bolsista**: Cria atividades e participa das atividades às quais foi convidado

### Sistemas Externos

- **MongoDB**: Base de dados principal para armazenamento de usuários, atividades e bolsas
- **Sistema de Arquivos**: Armazenamento local para arquivos anexados às atividades

---

## Nível 2: Containers

```mermaid
graph TB
    subgraph "Sistema de Gestão de Atividades Acadêmicas"
        subgraph "Frontend"
            WebApp[Aplicação Web<br/>Next.js 15<br/>React + TypeScript]
        end

        subgraph "Backend"
            API[API REST<br/>Next.js App Router<br/>TypeScript]
        end

        subgraph "Autenticação"
            Auth[Sistema de Autenticação<br/>JWT + HTTP Cookies]
        end

        subgraph "Upload"
            FileHandler[Gerenciador de Arquivos<br/>Upload Local]
        end
    end

    subgraph "Dados"
        MongoDB[(MongoDB<br/>Database)]
        FileStorage[Armazenamento<br/>de Arquivos<br/>/public/uploads]
    end

    Users[Usuários<br/>Admin/Tutor/Bolsista]

    Users -->|HTTPS| WebApp
    WebApp -->|API Calls<br/>JSON/REST| API
    API -->|Valida tokens<br/>JWT| Auth
    API -->|Processa uploads<br/>multipart/form-data| FileHandler
    API -->|Queries/Updates<br/>Mongoose ODM| MongoDB
    FileHandler -->|Salva arquivos<br/>File System| FileStorage
```

### Descrição dos Containers

#### Frontend - Aplicação Web

- **Tecnologia**: Next.js 15 com App Router, React 19, TypeScript
- **UI Framework**: Ant Design + Tailwind CSS
- **Responsabilidades**: Interface do usuário, navegação, formulários, visualização de dados

#### Backend - API REST

- **Tecnologia**: Next.js App Router API Routes
- **Responsabilidades**: Lógica de negócio, validação, processamento de dados

#### Sistema de Autenticação

- **Tecnologia**: JWT (jsonwebtoken) + HTTP-only Cookies
- **Responsabilidades**: Login, logout, verificação de permissões, middleware de proteção

#### Gerenciador de Arquivos

- **Tecnologia**: Multer-like upload handler
- **Responsabilidades**: Upload, validação e armazenamento de arquivos

---

## Nível 3: Componentes

### Frontend Components

```mermaid
graph TB
    subgraph "Frontend Application"
        subgraph "Layout & Navigation"
            ClientLayout[ClientLayout]
            Header[Header Component]
        end

        subgraph "Authentication"
            useAuth[useAuth Hook]
            LoginForm[Login Form]
            CadastroForm[Cadastro Form]
        end

        subgraph "Activity Management"
            AtividadeList[AtividadeList]
            AtividadeCard[AtividadeCard]
            AtividadeForm[AtividadeForm]
            AtividadeSearch[AtividadeSearchForm]
        end

        subgraph "Admin Panel"
            UserForm[UserForm]
            AdminPanel[Admin Dashboard]
        end

        subgraph "Pages"
            HomePage[Home Page]
            AtividadePage[Atividade Details]
            ConfigPage[Configurações]
        end
    end

    ClientLayout --> Header
    ClientLayout --> useAuth

    AtividadeList --> AtividadeCard
    AtividadeForm --> useAuth
    AtividadeSearch --> AtividadeList

    AdminPanel --> UserForm
    AdminPanel --> useAuth

    HomePage --> AtividadeList
    AtividadePage --> AtividadeForm
```

### Backend Services & APIs

```mermaid
graph TB
    subgraph "API Layer"
        subgraph "Route Handlers"
            AuthRoutes[/api/auth/*<br/>Login, Logout, Me]
            UserRoutes[/api/users/*<br/>CRUD Usuários]
            AtividadeRoutes[/api/atividades/*<br/>CRUD Atividades]
            BolsaRoutes[/api/bolsas/*<br/>Gerenciar Bolsas]
            UploadRoutes[/api/upload<br/>Upload Arquivos]
        end

        subgraph "Services Layer"
            AuthService[Auth Service]
            UserService[User Service]
            AtividadeService[Atividade Service]
            BolsaService[Bolsa Service]
            UploadService[Upload Service]
        end

        subgraph "Data Layer"
            UserModel[User Model<br/>Mongoose]
            AtividadeModel[Atividade Model<br/>Mongoose]
            BolsaModel[Bolsa Model<br/>Mongoose]
        end

        subgraph "Middleware"
            AuthMiddleware[Auth Middleware]
            Permissions[Permission Checker]
        end
    end

    AuthRoutes --> AuthService
    UserRoutes --> UserService
    AtividadeRoutes --> AtividadeService
    BolsaRoutes --> BolsaService
    UploadRoutes --> UploadService

    AuthService --> UserModel
    UserService --> UserModel
    AtividadeService --> AtividadeModel
    BolsaService --> BolsaModel

    AuthMiddleware --> Permissions
    AuthService --> AuthMiddleware
```

---

## Nível 4: Código (Classes e Interfaces Principais)

### Models (Mongoose Schemas)

```typescript
// User Model
interface User {
  _id: ObjectId;
  email: string;
  password: string; // bcrypt hash
  tipo: "admin" | "tutor" | "bolsista";
  name: string;
  campus: string;
  avatar?: string;
  bolsa?: ObjectId; // ref: Bolsa
  atividades?: ObjectId[]; // ref: Atividade
}

// Atividade Model
interface Atividade {
  _id: ObjectId;
  nome: string;
  descricao: string;
  campus: string;
  categoria: "Ensino" | "Pesquisa" | "Extensão" | "Outros";
  visibilidade: boolean;
  autor: ObjectId; // ref: User
  bolsistas: ObjectId[]; // ref: User
  participantes: ObjectId[]; // ref: User
  datainicio?: Date;
  datafim?: Date;
  arquivo?: {
    fileName: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
  };
}

// Bolsa Model
interface Bolsa {
  _id: ObjectId;
  nome: string;
  descricao: string;
  tutor: ObjectId; // ref: User
  bolsistas: ObjectId[]; // ref: User
}
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthAPI
    participant JWT
    participant Database

    User->>Frontend: Submete credenciais
    Frontend->>AuthAPI: POST /api/auth/login
    AuthAPI->>Database: Valida usuário
    Database-->>AuthAPI: Retorna dados do usuário
    AuthAPI->>JWT: Gera token JWT
    JWT-->>AuthAPI: Token assinado
    AuthAPI-->>Frontend: Set httpOnly cookie + user data
    Frontend-->>User: Redirect baseado no tipo de usuário

    Note over User,Database: Middleware protege rotas subsequentes
    Frontend->>AuthAPI: Requisições protegidas
    AuthAPI->>JWT: Verifica token do cookie
    JWT-->>AuthAPI: Payload validado
    AuthAPI->>Database: Busca dados atualizados
    Database-->>AuthAPI: Dados do usuário
    AuthAPI-->>Frontend: Resposta autorizada
```

### Permission System

```typescript
function checkPermission(
  user: UserPayload,
  action: string,
  targetUserId?: string
): boolean {
  switch (user.tipo) {
    case "admin":
      return true; // Admin pode tudo

    case "tutor":
      if (action === "manage-users") return true; // Mesma bolsa
      if (action === "create-activity") return true;
      return false;

    case "bolsista":
      if (action === "create-activity") return true;
      if (action === "edit-profile" && targetUserId === user.userId)
        return true;
      return false;

    default:
      return false;
  }
}
```

---

## Fluxos Principais

### 1. Criação de Atividade

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AtividadeAPI
    participant UploadAPI
    participant Database

    User->>Frontend: Preenche formulário de atividade
    alt Com arquivo
        Frontend->>UploadAPI: POST /api/upload (multipart)
        UploadAPI-->>Frontend: {fileName, url}
    end
    Frontend->>AtividadeAPI: POST /api/atividades
    AtividadeAPI->>Database: Cria nova atividade
    Database-->>AtividadeAPI: Atividade criada
    AtividadeAPI->>Database: Atualiza referências em User.atividades
    Database-->>AtividadeAPI: Atualizado
    AtividadeAPI-->>Frontend: Success response
    Frontend-->>User: Confirmação + redirect
```

### 2. Gerenciamento de Usuários (Admin)

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant UserAPI
    participant AuthAPI
    participant Database

    Admin->>Frontend: Acessa /admin/users
    Frontend->>AuthAPI: Verifica permissões
    AuthAPI-->>Frontend: Autorizado (admin)
    Frontend->>UserAPI: GET /api/users
    UserAPI->>Database: Lista usuários com populate
    Database-->>UserAPI: Usuários + bolsas
    UserAPI-->>Frontend: Lista completa
    Frontend-->>Admin: Exibe tabela de usuários

    Admin->>Frontend: Edita usuário
    Frontend->>UserAPI: PUT /api/users/[id]
    UserAPI->>Database: Atualiza dados
    Database-->>UserAPI: Usuário atualizado
    UserAPI-->>Frontend: Success
    Frontend-->>Admin: Confirmação
```

---

## Considerações Técnicas

### Segurança

- **JWT em HTTP-only cookies** (7 dias de expiração)
- **Bcrypt** para hash de senhas
- **Middleware de autenticação** protegendo rotas sensíveis
- **Validação de permissões** baseada em tipos de usuário

### Performance

- **Turbopack** habilitado para desenvolvimento
- **Mongoose population** para relacionamentos
- **Paginação** em listagens grandes
- **Lazy loading** de componentes pesados

### Escalabilidade

- **MongoDB** com índices otimizados
- **Arquitetura modular** com services separados
- **TypeScript** para type safety
- **Next.js App Router** para SSR/SSG otimizado

### Deployment

- **Next.js build** para produção
- **MongoDB Atlas** ou instância própria
- **Variáveis de ambiente** para configuração
- **Static file serving** através do Next.js

---

## Próximos Passos / Roadmap

1. **Busca Textual**: Implementar índices de texto no MongoDB
2. **Notificações**: Sistema de notificações em tempo real
3. **Relatórios**: Dashboard com métricas e relatórios
4. **API Externa**: Integração com sistemas acadêmicos existentes
5. **Mobile**: Aplicativo móvel React Native
6. **Backup**: Sistema automatizado de backup dos dados
