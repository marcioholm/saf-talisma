# Guia do Admin Panel - SAF Talismã

## 🔐 Login

**URL:** `http://localhost:3000/admin/login`

**Credenciais Padrão:**
- Email: `admin@saftalisma.com.br`
- Senha: Use o valor definido em `.env.local` (`NEXT_PUBLIC_ADMIN_PASSWORD`)

```bash
# Exemplo de .env.local
NEXT_PUBLIC_ADMIN_PASSWORD=demo123
```

## 📊 Dashboard

**URL:** `http://localhost:3000/admin/dashboard`

Mostra:
- Total de notícias
- Total de patrocinadores
- Total de resultados
- Inscritos na newsletter
- Quick actions para criar conteúdo

## 📰 Notícias

### Listar Notícias
**URL:** `http://localhost:3000/admin/noticias`

Funcionalidades:
- Visualizar todas as notícias
- Filtrar por categoria
- Ver data de publicação
- Marcar destaques
- Editar ou deletar notícias

### Criar Nova Notícia
**URL:** `http://localhost:3000/admin/noticias/new`

Campos:
- **Título*** - O título do post
- **URL Slug*** - Auto-gerado do título (ex: "novo-resultado" a partir de "Novo Resultado")
- **Resumo** - Breve resumo do post (opcional)
- **Conteúdo*** - Texto completo (suporta quebras de linha)
- **Categoria** - sub-13, sub-15, masculino, evento, noticias
- **Data de Publicação** - Data de quando publicar
- **Autor** - Nome de quem escreveu
- **URL da Imagem** - Link para a imagem de capa
- **Marcar como destaque** - Aparece na home

*Campos obrigatórios

### Editar Notícia
Clique no ícone de editar na listagem

### Deletar Notícia
Clique no ícone de trash na listagem

## 🏆 Patrocinadores

### Listar Patrocinadores
**URL:** `http://localhost:3000/admin/patrocinadores`

Funcionalidades:
- Visualizar todos os patrocinadores
- Filtrar por categoria (Ouro, Prata, Bronze, Parceiro)
- Ver logos
- Marcar destaques
- Editar ou deletar

### Criar Novo Patrocinador
**URL:** `http://localhost:3000/admin/patrocinadores/new`

Campos:
- **Nome*** - Nome da empresa/patrocinador
- **URL do Logo*** - Link direto para a imagem do logo
- **Website** - Site do patrocinador (opcional)
- **Descrição** - Texto sobre o patrocinador
- **Categoria** - Ouro, Prata, Bronze ou Parceiro
- **Ordem** - Número para ordenar (menor vem primeiro)
- **Marcar como destaque** - Aparece em local especial

### Categorias de Patrocínio
- 🥇 **Ouro** - Patrocínio principal (maior investimento)
- 🥈 **Prata** - Patrocínio intermediário
- 🥉 **Bronze** - Patrocínio base
- 🤝 **Parceiro** - Parceria comercial

## 📈 Resultados

### Listar Resultados
**URL:** `http://localhost:3000/admin/resultados`

Funcionalidades:
- Visualizar todos os jogos
- Filtrar por categoria
- Ver placar e resultado
- Estatísticas (vitórias, derrotas, empates)
- Editar ou deletar

### Criar Novo Resultado
**URL:** `http://localhost:3000/admin/resultados/new`

Campos:
- **Data do Jogo*** - Quando foi o jogo
- **Competição*** - Liga Norte Pioneira, Estadual, etc
- **Adversário*** - Nome do time adversário
- **Placar SAF*** - Gols que SAF marcou
- **Placar Adversário*** - Gols do adversário
- **Resultado*** - Auto-calculado (Vitória/Derrota/Empate)
- **Categoria** - Sub-13, Sub-15, Masculino, Feminino
- **Local** - Ginásio/quadra onde aconteceu
- **Observações** - Notas adicionais

**Nota:** O resultado é calculado automaticamente:
- Placar SAF > Adversário = Vitória ✅
- Placar SAF < Adversário = Derrota ❌
- Placar SAF = Adversário = Empate ⚪

## 📧 Newsletter

### Listar Inscritos
**URL:** `http://localhost:3000/admin/newsletter`

Funcionalidades:
- Visualizar todos os inscritos
- Ver data de inscrição
- Remover inscrito
- Exportar como CSV

**Exportar CSV:**
Clique no botão "Exportar CSV" para baixar uma lista de emails.

## 🔧 Funcionalidades Técnicas

### Auto-geração de Slug
Ao digitar o título da notícia, o slug é gerado automaticamente:
- "Notícia Importante" → "noticia-importante"
- Caracteres especiais removidos
- Espaços convertidos para hífen

### Preview de Logo
Ao adicionar a URL do logo do patrocinador, uma preview aparece automaticamente.

### Cálculo Automático de Resultado
Ao preencher os placares, o resultado é calculado automaticamente.

### Exportação de Dados
Inscritos podem ser exportados como arquivo CSV para usar em outras ferramentas.

## 🛡️ Segurança

### Autenticação
- Sessão armazenada em localStorage
- Token persistente entre recargas
- Logout limpa session

### Permissões
- Apenas usuários autenticados acessam admin
- Rotas protegidas redirecionam para login
- Role-based access (admin/editor planejado para Sprint 3)

## 📱 Responsividade

O admin panel é responsivo e funciona em:
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+) - Sidebar colapsável

## 🐛 Troubleshooting

### Erro: "Email ou senha inválidos"
Verifique:
- Email correto: `admin@saftalisma.com.br`
- Senha definida em `.env.local`

### Erro: "401 Unauthorized" ao salvar
- Verifique se `.env.local` tem as credenciais Supabase corretas
- Reinicie o servidor (`npm run dev`)

### Notícias/Patrocinadores não salvam
- Verifique conexão com Supabase
- Abra DevTools (F12) > Console para ver erros
- Verifique se o schema.sql foi executado

### Imagens não carregam
- URL deve ser HTTPS
- URL deve ser diretamente para a imagem (não página HTML)
- Teste a URL no navegador antes de adicionar

## 📞 Suporte

Para problemas ou dúvidas:
1. Abra DevTools (F12)
2. Verifique aba Network e Console
3. Note o erro ou comportamento
4. Contate desenvolvedor

---

**Status:** Sprint 2 Completo ✅
**Versão:** 2.0
**Última atualização:** 2026-08-11
