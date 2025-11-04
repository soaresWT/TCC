# Sistema de Gestão de Atividades Acadêmicas - Instruções para AI

## Arquitetura & Stack Principal

**Next.js 15 App Router** com TypeScript, MongoDB (Mongoose), JWT auth, Ant Design, Tailwind CSS.

### Estrutura de Autenticação (Core Pattern)

- **3 tipos de usuário**: `admin` (total), `tutor` (gerencia própria bolsa), `bolsista` (básico)
- **JWT em httpOnly cookie**: 7 dias expiração, payload: `{userId, email, tipo, bolsa}`
- **Middleware**: Protege `/admin/*`, `/atividades/cadastro`, `/home` - veja `middleware.ts`
- **Permissões**: Função `checkPermission()` em `src/lib/auth.ts` define regras por tipo

### Padrões de API (src/app/api/\*)

```typescript
// Sempre: await dbConnection() primeiro
// Auth obrigatória: const user = await requireAuth(request)
// Público: GET atividades (sem auth)
// Headers: Content-Type: application/json
// Errors: NextResponse.json({error}, {status})
```

### Organização de Código (Refatorada)

- **Types centralizados**: `src/types/` - use `import { User, Atividade } from "@/types"`
- **Services pattern**: `src/services/` - métodos reutilizáveis para API calls
- **Models**: Mongoose schemas com pre-hooks (ex: hash password em User)

## Comandos Essenciais

```bash
npm run dev --turbopack     # Desenvolvimento (Turbopack enabled)
npm run build              # Build produção
npm run lint              # ESLint check
```

## Padrões de Componentes

### Formulários (Ant Design + Form Hook)

```tsx
// Sempre usar Form.useForm() hook
const [form] = Form.useForm<FormValues>();
// Validation rules obrigatórias
// Size="large" padrão para consistência
// Loading states para submissão
```

### Estrutura de Atividades (Core Entity)

```typescript
// Schema: nome, descricao, campus, categoria, autor, bolsistas[], arquivo?, visibilidade
// Categorias fixas: ["Ensino", "Pesquisa", "Extensão", "Outros"]
// Campuses: importar de src/lib/campuses.ts
// Autor automático via authUser.userId
```

### Upload de Arquivos

- **Endpoint**: `/api/upload` (POST multipart/form-data)
- **Storage**: `public/uploads/`
- **Tipos**: PDF, DOC, imagens, TXT (max 10MB)
- **Response**: `{fileName, originalName, size, type, url}`

## Padrões de Navegação & Estado

### useAuth Hook (Global State)

```tsx
// Sempre usar: const { user, login, logout, hasPermission } = useAuth()
// Auto-redirect baseado em user.tipo após login
// Admin → /admin, outros → /home
```

### Proteção de Rotas

- Middleware Next.js intercepta ANTES da renderização
- Redirects: não autenticado → `/cadastro`, sem permissão → `/home`
- Client-side: use `hasPermission(action)` para UI condicional

## Integração MongoDB

### Conexão (src/lib/mongodb.ts)

- **Retry logic**: 5 tentativas com 3s intervalo
- **Pool settings**: min 5, max 10 conexões
- **Timeout**: 15s conexão, 45s socket
- **URL**: MONGODB_URI env var obrigatória

### Schemas & Population

```javascript
// Sempre populate relações nas queries
.populate("autor", "name email tipo")
.populate("bolsistas", "name email tipo campus bolsa")
// ObjectId refs: User.atividades[], Atividade.bolsistas[]
```

## Convenções de Desenvolvimento

### Error Handling

- **API**: Try/catch com NextResponse.json + status codes apropriados
- **Client**: message.error() do Ant Design para feedback visual
- **Auth errors**: 401 para não autenticado, 403 para sem permissão

### File Structure Patterns

- **Components**: Sempre default export + named export para reusabilidade
- **Services**: Classes estáticas com métodos públicos
- **Types**: Interfaces separadas por domínio (user, atividade, bolsa)

### Environment Variables

```bash
JWT_SECRET=              # Chave forte JWT
MONGODB_URI=            # String conexão MongoDB
NEXT_PUBLIC_APP_URL=    # URL base da aplicação
```

## Debugging & Scripts

### Admin Inicial (AUTHENTICATION.md)

```
Email: admin@sistema.com
Senha: admin123
```

### Scripts Disponíveis

- `src/scripts/initializeSystem.ts` - Setup inicial (vazio - implementar se necessário)
- Ant Design DevTools integradas para debug de formulários

## Performance & Boas Práticas

- **Turbopack**: Habilitado por padrão no dev
- **MongoDB indexes**: Text search preparado (BUSCA_TEXTUAL.md vazio - implementar)
- **Memoization**: useMemo para filtros de usuários (veja AtividadeForm.tsx)
- **Lazy loading**: Dynamic imports para componentes pesados quando necessário

Essa base de conhecimento permite implementação imediata sem necessidade de explorar múltiplos arquivos para entender padrões estabelecidos.
