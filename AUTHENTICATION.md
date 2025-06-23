# Sistema de Gestão de Atividades - Autenticação e Permissões

## Visão Geral

Este sistema implementa um sistema de autenticação baseado em JWT (JSON Web Tokens) com diferentes níveis de permissão baseados no tipo de usuário.

## Tipos de Usuário e Permissões

### 1. Admin (Administrador)

- **Permissões**: Acesso total ao sistema
- **Pode**:
  - Gerenciar todos os usuários
  - Criar, editar e excluir qualquer atividade
  - Gerenciar bolsas
  - Acessar área administrativa

### 2. Tutor

- **Permissões**: Gerenciamento limitado
- **Pode**:
  - Gerenciar usuários da mesma bolsa
  - Criar bolsistas para sua bolsa
  - Criar atividades
  - Ver usuários da própria bolsa
- **Não pode**:
  - Criar outros tutores ou admins
  - Gerenciar usuários de outras bolsas

### 3. Bolsista

- **Permissões**: Básicas
- **Pode**:
  - Criar atividades
  - Editar próprio perfil
  - Ver próprio perfil
- **Não pode**:
  - Gerenciar outros usuários
  - Acessar área administrativa

## Funcionalidades Públicas

### Consulta de Atividades

- Qualquer pessoa (autenticada ou não) pode consultar atividades
- Listagem e detalhes das atividades são públicos
- Filtros e busca disponíveis para todos

### Criação de Atividades

- **Requer autenticação**: Apenas usuários logados podem criar atividades
- Todas as atividades são automaticamente associadas ao autor
- O autor é exibido na listagem das atividades

## Como Usar

### 1. Primeiro Acesso (Admin)

```
Email: admin@sistema.com
Senha: admin123
```

### 2. Criar Usuários

- Admins podem criar qualquer tipo de usuário
- Tutores podem criar apenas bolsistas da própria bolsa
- Usuários podem se auto-cadastrar como bolsistas ou tutores

### 3. Login

- Acesse `/cadastro`
- Use a aba "Login" para entrar no sistema
- Use a aba "Cadastro" para criar uma nova conta

### 4. Navegação

- **Header dinâmico**: Mostra opções baseadas no usuário logado
- **Menu**: Adapta-se às permissões do usuário
- **Proteção de rotas**: Páginas protegidas redirecionam para login

## Estrutura de Autenticação

### JWT Token

- Armazenado em cookie httpOnly
- Expiração: 7 dias
- Contém: userId, email, tipo, bolsa

### Middleware

- Protege rotas `/admin/*`, `/atividades/cadastro`, `/home`
- Verifica autenticação e permissões
- Redireciona para páginas apropriadas

### Hooks React

- `useAuth()`: Gerencia estado de autenticação
- Funções: login, logout, checkAuth, hasPermission

## Segurança

### Senhas

- Hash com bcrypt (salt rounds: 10)
- Validação mínima: 6 caracteres

### Tokens

- JWT com chave secreta forte
- HttpOnly cookies (não acessíveis via JavaScript)
- Secure em produção

### Autorização

- Verificação no backend para todas as operações
- Middleware de autenticação em rotas protegidas
- Validação de permissões por endpoint

## Desenvolvimento

### Variáveis de Ambiente

```env
JWT_SECRET=sua-chave-jwt-super-secreta
MONGODB_URI=sua-conexao-mongodb
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Endpoints da API

#### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Verificar usuário atual

#### Usuários

- `GET /api/users` - Listar usuários (com filtro por permissão)
- `POST /api/users` - Criar usuário (requer auth)

#### Atividades

- `GET /api/atividades` - Listar atividades (público)
- `POST /api/atividades` - Criar atividade (requer auth)

#### Bolsas

- `GET /api/bolsas` - Listar bolsas
- `POST /api/bolsas` - Criar bolsa (admin only)
