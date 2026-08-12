# 🚀 Quick Start - SAF Talismã Website

## 1️⃣ Setup Inicial (2 minutos)

```bash
# 1. Copiar arquivo de ambiente
cp .env.local.example .env.local

# 2. Instalar dependências
npm install

# 3. Rodar desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

## 2️⃣ Configurar Banco de Dados (5 minutos)

1. Vá para [Supabase Console](https://app.supabase.com)
2. Selecione seu projeto: `zompnocfdlofhsyuiuhj`
3. Vá em **SQL Editor** → **New Query**
4. Copie todo o conteúdo de `database/schema.sql`
5. Cole na query e clique **Run**

✅ Banco está pronto!

## 3️⃣ Testar Admin Panel (1 minuto)

1. Acesse: **http://localhost:3000/admin/login**
2. Email: `admin@saftalisma.com.br`
3. Senha: `demo123` (ou a definida em .env.local)
4. Clique **Entrar**

🎉 Pronto! Você está no dashboard.

## 📚 Próximas Leituras

1. **ADMIN_GUIDE.md** - Como usar o painel
2. **SETUP_SUPABASE.md** - Detalhes do banco de dados
3. **DEVELOPMENT.md** - Roadmap e planejamento
4. **README.md** - Documentação técnica completa

## 🎯 Estrutura do Projeto

```
saf-talisma/
├── src/
│   ├── app/
│   │   ├── admin/ ← Painel administrativo
│   │   ├── noticias/ ← Páginas públicas
│   │   ├── sobre/
│   │   ├── patrocinadores/
│   │   └── api/ ← APIs
│   ├── components/ ← Componentes React
│   ├── lib/ ← Lógica compartilhada
│   └── types/ ← Tipos TypeScript
├── database/
│   └── schema.sql ← SQL do banco
├── public/ ← Assets estáticos
└── .env.local ← Variáveis de ambiente
```

## ⚡ Comandos Úteis

```bash
# Rodar desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linter (verificar erros)
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

## 🎨 Acesso Rápido

| Página | URL |
|--------|-----|
| Home | http://localhost:3000 |
| Notícias | http://localhost:3000/noticias |
| Sobre Nós | http://localhost:3000/sobre |
| Transparência | http://localhost:3000/transparencia |
| Patrocinadores | http://localhost:3000/patrocinadores |
| **Admin Login** | **http://localhost:3000/admin/login** |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Admin Notícias | http://localhost:3000/admin/noticias |
| Admin Patrocinadores | http://localhost:3000/admin/patrocinadores |
| Admin Resultados | http://localhost:3000/admin/resultados |

## ✨ Features Prontas

✅ Home responsiva com hero banner
✅ Blog com categorias e filtros
✅ Página sobre com histórico
✅ Transparência com resultados
✅ Patrocinadores em grid
✅ **Admin Panel completo** ← NOVO!
  - Login/Autenticação
  - CRUD de Notícias
  - CRUD de Patrocinadores
  - CRUD de Resultados
  - Gerenciamento de Newsletter
✅ APIs REST prontas
✅ Supabase PostgreSQL integrado
✅ Tailwind CSS para styling
✅ TypeScript para segurança de tipos

## 🚀 Deploy em Produção

1. Push para GitHub
2. Conectar Vercel ao repositório
3. Vercel compila e deploy automaticamente
4. Apontar DNS para Vercel

Veja guia completo em `DEVELOPMENT.md` - Sprint 4

## 🐛 Problemas?

1. Verifique `.env.local` tem todas as variáveis
2. Reinicie o servidor (`npm run dev`)
3. Limpe cache do navegador (Ctrl+Shift+Delete)
4. Abra DevTools (F12) para ver erros
5. Verifique logs do terminal

## 📞 Contacto

Desenvolvido por: **NorthWay Assessoria de Marketing**
Gabriel - Founder & Developer
Arapoti, Paraná, Brasil

---

**Status:** ✅ Sprint 1 + 2 Completos
**Pronto para:** Testes e refinamentos
**Data:** Agosto 2026
