# Documentação - Interfaces e Serviços

## Estrutura Organizada

Esta refatoração organizou o código em uma estrutura mais limpa e maintível:

### 📁 Estrutura de Tipos (`src/types/`)

```
src/types/
├── index.ts          # Exporta todos os tipos
├── user.ts           # Interfaces relacionadas a usuários
├── bolsa.ts          # Interfaces de bolsas
├── atividade.ts      # Interfaces de atividades
├── api.ts            # Tipos de resposta da API
└── forms/
    └── auth.ts       # Formulários de autenticação
```

### 📁 Estrutura de Serviços (`src/services/`)

```
src/services/
├── index.ts          # Exporta todos os serviços
├── auth.ts           # Serviços de autenticação
├── user.ts           # Serviços de usuário
├── bolsa.ts          # Serviços de bolsa
├── atividade.ts      # Serviços de atividade
└── upload.ts         # Serviços de upload
```

## Como Usar

### 1. Importação de Tipos

```typescript
// Importar tipos específicos
import { User, UserFormData } from "@/types/user";
import { Bolsa } from "@/types/bolsa";
import { LoginForm, UserForm } from "@/types/forms/auth";

// Ou importar tudo de uma vez
import { User, Bolsa, LoginForm } from "@/types";
```

### 2. Importação de Serviços

```typescript
// Importar serviços específicos
import { AuthService } from "@/services/auth";
import { UserService } from "@/services/user";

// Ou importar vários serviços
import { AuthService, UserService, BolsaService } from "@/services";
```

### 3. Exemplos de Uso

#### Autenticação

```typescript
// Login
const handleLogin = async (credentials: LoginForm) => {
  try {
    const result = await AuthService.login(credentials);
    if (result.success) {
      // Login bem-sucedido
    }
  } catch (error) {
    // Tratar erro
  }
};

// Registro
const handleRegister = async (userData: UserForm) => {
  try {
    await AuthService.register(userData);
    // Usuário criado com sucesso
  } catch (error) {
    // Tratar erro
  }
};
```

#### Usuários

```typescript
// Listar usuários
const loadUsers = async () => {
  try {
    const users: User[] = await UserService.getUsers();
    setUsers(users);
  } catch (error) {
    // Tratar erro
  }
};

// Criar usuário
const createUser = async (userData: UserFormData) => {
  try {
    const newUser = await UserService.createUser(userData);
    // Usuário criado
  } catch (error) {
    // Tratar erro
  }
};
```

#### Bolsas

```typescript
// Listar bolsas
const loadBolsas = async () => {
  try {
    const bolsas: Bolsa[] = await BolsaService.getBolsas();
    setBolsas(bolsas);
  } catch (error) {
    // Tratar erro
  }
};
```

#### Atividades

```typescript
// Buscar atividades com filtros
const searchAtividades = async () => {
  try {
    const params: AtividadeSearchParams = {
      search: "termo",
      categoria: "Ensino",
      campus: "Centro",
    };
    const atividades = await AtividadeService.getAtividades(params);
    setAtividades(atividades);
  } catch (error) {
    // Tratar erro
  }
};
```

## Vantagens da Nova Estrutura

### ✅ Centralização

- Todas as interfaces estão organizadas por domínio
- Serviços centralizados com métodos reutilizáveis

### ✅ Type Safety

- TypeScript forte em todos os pontos
- Redução de erros de tipagem

### ✅ Reutilização

- Serviços podem ser usados em qualquer componente
- Tipos consistentes em toda aplicação

### ✅ Manutenibilidade

- Mudanças de API centralizadas nos serviços
- Fácil atualização de tipos

### ✅ Testabilidade

- Serviços isolados facilitam testes unitários
- Mocking simplificado

## Migração de Código Existente

### Antes (código antigo):

```typescript
// Cada componente fazia suas próprias requisições
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(userData),
});
const data = await response.json();
```

### Depois (código refatorado):

```typescript
// Uso do serviço centralizado
const user = await UserService.createUser(userData);
```

## Próximos Passos

1. **Migrar componentes restantes** para usar os novos serviços
2. **Adicionar cache** nos serviços se necessário
3. **Implementar interceptors** para tratamento global de erros
4. **Adicionar testes** para os serviços
5. **Documentar APIs** com JSDoc nos serviços
