# Setup Supabase - SAF Talismã

## 🔑 Credenciais Fornecidas

```
URL:               https://zompnocfdlofhsyuiuhj.supabase.co
Anon Key:          sb_publishable_xfyG0CUyTWHk1JDesbUG8w_FVsOF56o
Projeto:           zompnocfdlofhsyuiuhj
```

## ✅ Checklist de Setup

### Passo 1: Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local
```

Seu `.env.local` deve ficar assim:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zompnocfdlofhsyuiuhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xfyG0CUyTWHk1JDesbUG8w_FVsOF56o
SUPABASE_SERVICE_ROLE_KEY=??? (FALTA PEDIR AO USUÁRIO)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Passo 2: Executar Schema SQL

1. Vá para [Supabase Console](https://app.supabase.com)
2. Selecione seu projeto: **zompnocfdlofhsyuiuhj**
3. Clique em **SQL Editor** (à esquerda)
4. Clique em **New Query**
5. Copie todo o conteúdo de `database/schema.sql`
6. Cole na query
7. Clique em **Run**

Você verá: ✓ Queries executed successfully

### Passo 3: Verificar Tabelas

No Supabase Console, vá em **Table Editor** e confirme que existem:
- ✓ posts
- ✓ sponsors
- ✓ newsletter_subscribers
- ✓ resultados
- ✓ estatisticas

### Passo 4: Verificar RLS (Row Level Security)

Vá em **Authentication > Policies** e confirme que as policies estão criadas:
- ✓ Posts são públicos para leitura
- ✓ Sponsors são públicos para leitura
- ✓ Newsletter permite insert anônimo
- ✓ Resultados públicos para leitura
- ✓ Estatísticas públicas para leitura

### Passo 5: Instalar Dependências

```bash
npm install
```

### Passo 6: Rodar Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🧪 Testar a Conexão

### Via Terminal
```bash
# Testar se o Supabase está acessível
curl https://zompnocfdlofhsyuiuhj.supabase.co

# Deve retornar: {"msg":"Hello"}
```

### Via API
```bash
# Listar posts (deve estar vazio)
curl http://localhost:3000/api/posts

# Resposta esperada:
# {"data":[],"pagination":{"page":1,"limit":10,"total":0,"totalPages":0}}
```

### Via Dashboard
1. Acesse http://localhost:3000
2. Scroll down para **Últimas Notícias**
3. Deve estar vazio (sem dados ainda)

## ⚠️ Segurança

### Regenerar Chaves (IMPORTANTE!)

Depois de confirmar que está funcionando, regenere as chaves no Supabase:

1. Vá em **Settings > API**
2. Clique em **Regenerate** para ANON KEY
3. Clique em **Regenerate** para SERVICE ROLE KEY
4. Atualize .env.local com as novas chaves

Isso garante que a chave antiga (compartilhada) não funciona mais.

## 🐛 Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY is not set"

**Solução:** Você precisa da SERVICE_ROLE_KEY no .env.local

### Erro: "Relation 'public.posts' does not exist"

**Solução:** Execute o schema.sql novamente no SQL Editor

### Erro: "No such file or directory: 'database/schema.sql'"

**Solução:** Execute do diretório raiz do projeto:
```bash
cd /caminho/para/saf-talisma
npm run dev
```

### Conexão lenta

**Solução:** Seu projeto Supabase pode estar em sleep (plano free). Clique em qualquer coisa no console para "acordar".

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## ✅ Próxima Etapa

Assim que confirmar que tudo está funcionando, começamos **Sprint 2**:
- Admin Panel com autenticação
- CRUD de Notícias
- CRUD de Patrocinadores
- CRUD de Resultados
- Integração de Email

---

**Status:** ⏳ Aguardando SERVICE_ROLE_KEY
**Próximo:** Sprint 2 - Admin Panel
