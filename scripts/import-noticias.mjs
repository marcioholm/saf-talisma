import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envRaw = fs.readFileSync(".env", "utf8");
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const client = createClient(url, serviceKey, { auth: { persistSession: false } });

const noticias = [
  {
    titulo: "Fim de semana decisivo na Liga Norte Pioneira",
    slug: "fim-de-semana-decisivo-na-liga-norte-pioneira",
    subtitulo: "Sub-13 e Sub-15 entram em quadra contra Castro pela 3ª etapa da liga",
    resumo: "Sub-13 e Sub-15 entram em quadra contra Castro pela 3ª etapa da liga",
    conteudo: `A Associação SAF Talismã se prepara para um fim de semana importante na 3ª etapa da Liga Norte Pioneira, disputada em Ribeirão do Pinhal. No dia 17, as categorias Sub-13 e Sub-15 enfrentam a equipe de Castro em confrontos diretos que têm peso na tabela geral do campeonato.\n\nAs duas equipes entram em quadra com o mesmo objetivo: representar Arapoti com garra e somar mais uma vitória na história do clube.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-18T08:00:00-03:00",
  },
  {
    titulo: "Sub-13, líder geral, mede forças com Castro",
    slug: "sub-13-lider-geral-mede-forcas-com-castro",
    subtitulo: "Categoria entra em quadra às 18h em busca de manter a liderança da competição",
    resumo: "Categoria entra em quadra às 18h em busca de manter a liderança da competição",
    conteudo: `Na liderança geral da Liga Norte Pioneira, a categoria Sub-13 do SAF Talismã entra em quadra no sábado, às 18h, contra a equipe de Castro. O confronto direto é visto como um passo importante na busca pelo título de campeãs gerais ao fim da temporada.\n\nO time chega embalado por uma campanha sólida na competição.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-18T08:00:00-03:00",
  },
  {
    titulo: "Sub-15 busca vitória para se aproximar da liderança",
    slug: "sub-15-busca-vitoria-para-se-aproximar-da-lideranca",
    subtitulo: "Time ocupa a 3ª colocação geral e enfrenta Castro às 19h",
    resumo: "Time ocupa a 3ª colocação geral e enfrenta Castro às 19h",
    conteudo: `Ocupando a 3ª colocação geral da Liga Norte Pioneira, a categoria Sub-15 entra em quadra no sábado, dia 18/07, às 19h, contra a equipe de Castro. O time busca um resultado positivo para se aproximar da liderança da competição e seguir brigando pelo topo da tabela.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-18T09:00:00-03:00",
  },
  {
    titulo: "Sub-13 vence dois jogos e avança à semifinal no mesmo dia",
    slug: "sub-13-vence-dois-jogos-e-avanca-a-semifinal-no-mesmo-dia",
    subtitulo: "Time bate Castro e Ponta Grossa e carimba vaga contra Imbituva",
    resumo: "Time bate Castro e Ponta Grossa e carimba vaga contra Imbituva",
    conteudo: `A categoria Sub-13, líder geral da Liga Norte Pioneira, confirmou uma etapa de alto nível em Ribeirão do Pinhal ao vencer Castro por 2x1 e Ponta Grossa por 2x0. Com os dois resultados, o time carimbou vaga na semifinal contra Imbituva, disputada no mesmo domingo, dia 19.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-19T10:00:00-03:00",
  },
  {
    titulo: "Sub-15 é campeã da 3ª etapa e assume a liderança geral",
    slug: "sub-15-e-campea-da-3-etapa-e-assume-a-lideranca-geral",
    subtitulo: "Time vence nos pênaltis, goleia e bate a equipe da casa na decisão",
    resumo: "Time vence nos pênaltis, goleia e bate a equipe da casa na decisão",
    conteudo: `A categoria Sub-15 do SAF Talismã fez uma campanha histórica na 3ª etapa da Liga Norte Pioneira, em Ribeirão do Pinhal. O time empatou em 2x2 com Castro na fase classificatória, mas venceu nos pênaltis por 4x2, depois goleou Tibagi por 7x0 e bateu Imbituva por 2x0.\n\nNa decisão, superou a equipe da casa, Ribeirão do Pinhal, por 4x2, conquistando o título da etapa e assumindo a liderança geral da Liga Norte Pioneira.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-19T15:00:00-03:00",
  },
  {
    titulo: "Sub-13 termina a etapa em 3º lugar após eliminação na semifinal",
    slug: "sub-13-termina-a-etapa-em-3-lugar-apos-eliminacao-na-semifinal",
    subtitulo: "Time chegou como líder geral, mas não avançou diante de Imbituva",
    resumo: "Depois de chegar à semifinal como líder geral da competição, o Sub-13 não avançou diante de Imbituva",
    conteudo: `Depois de chegar à semifinal como líder geral da competição, com vitórias sobre Castro e Ponta Grossa, o Sub-13 do SAF Talismã não conseguiu avançar à decisão diante de Imbituva. Mesmo com a eliminação, a equipe fechou a 3ª etapa da Liga Norte Pioneira no pódio, em terceiro lugar.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-19T18:00:00-03:00",
  },
  {
    titulo: "Os destaques da 3ª etapa em Ribeirão do Pinhal",
    slug: "os-destaques-da-3-etapa-em-ribeirao-do-pinhal",
    subtitulo: "SAF Talismã divulga artilheiras, defesa menos vazada e prêmios individuais",
    resumo: "SAF Talismã divulga artilheiras, defesa menos vazada e prêmios individuais",
    conteudo: `Com o Sub-15 campeão e líder geral da Liga Norte Pioneira, e o Sub-13 terminando em 3º lugar, o SAF Talismã divulgou os destaques individuais da 3ª etapa.\n\nAs artilheiras do Sub-15 foram Isabelle, Emanuelle e Isabela Furio, cada uma com 4 gols marcados na etapa. A defesa menos vazada da competição foi a dupla de goleiras Helen e Helena, com apenas 4 gols sofridos ao longo da etapa. Helen ainda foi eleita a goleira destaque da 3ª etapa, enquanto Isabela Furio levou o prêmio de atleta de linha destaque.`,
    categoria_slug: "categorias-de-base",
    published_at: "2026-07-20T10:00:00-03:00",
  },
  {
    titulo: "Convocação oficial: Guilherme Souza",
    slug: "convocacao-oficial-guilherme-souza",
    subtitulo: "Atleta de Arapoti é convocado para o Sul-Americano de Clubes",
    resumo: "Atleta de Arapoti é convocado para o Sul-Americano de Clubes",
    conteudo: `O SAF Talismã anunciou a convocação oficial do atleta Guilherme Souza, de Arapoti, para representar o clube no Campeonato Sul-Americano de Clubes de Futsal. A diretoria destacou a dedicação, disciplina e evolução do atleta dentro do esporte como méritos que credenciaram a convocação para a competição internacional.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-22T10:00:00-03:00",
  },
  {
    titulo: "Convocação oficial: Andréia Salvador",
    slug: "convocacao-oficial-andreia-salvador",
    subtitulo: "Atleta que joga e treina na Itália reforça o elenco no Sul-Americano",
    resumo: "Atleta que joga e treina na Itália reforça o elenco no Sul-Americano",
    conteudo: `A atleta Andréia Salvador foi convocada oficialmente pelo SAF Talismã para o Campeonato Sul-Americano de Clubes. Atualmente ela atua como atleta da equipe VIP/Itália e também como técnica da Nsg – Noi Santa Giuliana, na Itália. A convocação reconhece sua trajetória e a confiança do clube em seu potencial para a competição de alto nível.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-23T10:00:00-03:00",
  },
  {
    titulo: "Convocação oficial: Maria Cicília Rolim",
    slug: "convocacao-oficial-maria-cicilia-rolim",
    subtitulo: "Presidente da associação é convocada para acompanhar a equipe no Paraguai",
    resumo: "Presidente da associação é convocada para acompanhar a equipe no Paraguai",
    conteudo: `Maria Cicília Rolim, presidente da Associação SAF Talismã, foi oficialmente convocada para acompanhar a equipe no Campeonato Sul-Americano de Clubes, em reconhecimento ao trabalho realizado à frente da associação. A publicação, feita em Arapoti, celebra mais um capítulo na trajetória dela dentro do clube.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-24T10:00:00-03:00",
  },
  {
    titulo: "Elenco embarca rumo a Assunção",
    slug: "elenco-embarca-rumo-a-assuncao",
    subtitulo: "Delegação chega à capital paraguaia para o início da competição",
    resumo: "Delegação chega à capital paraguaia para o início da competição",
    conteudo: `Com o elenco fechado para a disputa do Sul-Americano de Clubes de Futsal, a delegação do SAF Talismã chegou a Assunção, capital do Paraguai, para o início da competição internacional.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-29T08:00:00-03:00",
  },
  {
    titulo: "Estreia com vitória sobre o Uruguai",
    slug: "estreia-com-vitoria-sobre-o-uruguai",
    subtitulo: "SAF Talismã vence o Palermo FC por 6x2 na abertura do Sul-Americano",
    resumo: "SAF Talismã vence o Palermo FC por 6x2 na abertura do Sul-Americano",
    conteudo: `Representando o Brasil no Sul-Americano de Clubes de Futsal, em Assunção, o SAF Talismã estreou na competição com uma vitória por 6x2 sobre o Palermo FC, do Uruguai. O resultado garantiu os três primeiros pontos da equipe na fase de grupos, que ainda reserva confrontos contra times do Paraguai e da Bolívia na briga por vaga na próxima fase.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-29T18:00:00-03:00",
  },
  {
    titulo: "Equipe se aquece para nova rodada do torneio",
    slug: "equipe-se-aquece-para-nova-rodada-do-torneio",
    subtitulo: "Elenco realiza aquecimento pré-jogo antes de mais um confronto decisivo",
    resumo: "Elenco realiza aquecimento pré-jogo antes de mais um confronto decisivo",
    conteudo: `Antes de mais um confronto decisivo do Sul-Americano de Clubes, o elenco do SAF Talismã realizou o aquecimento pré-jogo em Assunção, motivado para mais um desafio da competição internacional.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-30T09:00:00-03:00",
  },
  {
    titulo: "Derrota para o Paraguai por 4x2",
    slug: "derrota-para-o-paraguai-por-4x2",
    subtitulo: "David abre o placar, mas time da casa busca a virada",
    resumo: "David abre o placar, mas time da casa busca a virada",
    conteudo: `Em jogo disputado pelo Sul-Americano de Clubes, o SAF Talismã perdeu por 4x2 para a equipe paraguaia. O atleta David abriu o placar para o Brasil, mas o time da casa buscou a virada ao longo da partida. Apesar do resultado, a equipe seguiu na competição focada nos próximos confrontos.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-30T14:00:00-03:00",
  },
  {
    titulo: "Empate em 3x3 com a Bolívia",
    slug: "empate-em-3x3-com-a-bolivia",
    subtitulo: "Mateuzinho marca dois gols, um deles de cobertura, e Joãozin também balança as redes",
    resumo: "Mateuzinho marca dois gols, um deles de cobertura, e Joãozin também balança as redes",
    conteudo: `O SAF Talismã ficou no empate por 3x3 com a equipe boliviana em mais uma partida do Sul-Americano de Clubes. O atleta Mateuzinho abriu o placar ainda no primeiro tempo com um gol de cobertura e ampliou a vantagem no segundo tempo, fechando dois gols na partida. Joãozin também balançou as redes para o Brasil, mas a Bolívia buscou a reação e empatou o confronto em 3x3.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-30T16:00:00-03:00",
  },
  {
    titulo: "Galdino tem atuação de destaque no gol",
    slug: "galdino-tem-atuacao-de-destaque-no-gol",
    subtitulo: "Goleiro faz defesas decisivas em uma das melhores atuações do torneio",
    resumo: "Goleiro faz defesas decisivas em uma das melhores atuações do torneio",
    conteudo: `O goleiro Galdino teve uma atuação apontada como uma das melhores do Campeonato Sul-Americano disputado em Assunção. Suas defesas foram decisivas para segurar o resultado da equipe nos momentos em que o SAF Talismã mais precisou.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-30T18:00:00-03:00",
  },
  {
    titulo: "Golaço de Mateuzinho no Sul-Americano",
    slug: "golaco-de-mateuzinho-no-sul-americano",
    subtitulo: "Gol de cobertura é apontado como um dos melhores lances da competição",
    resumo: "Gol de cobertura é apontado como um dos melhores lances da competição",
    conteudo: `O atleta Mateuzinho marcou um gol de cobertura considerado um dos melhores lances do Sul-Americano de Clubes disputado no Paraguai, com uma finalização de categoria diante do goleiro adversário.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-31T10:00:00-03:00",
  },
  {
    titulo: "Mensagem de despedida de atleta convocado",
    slug: "mensagem-de-despedida-de-atleta-convocado",
    subtitulo: "Luan Carlos agradece pela oportunidade de representar o Brasil",
    resumo: "Luan Carlos agradece pela oportunidade de representar o Brasil",
    conteudo: `Após a eliminação da equipe na competição, o atleta Luan Carlos publicou uma mensagem de agradecimento pela oportunidade de representar o Brasil no Sul-Americano de Clubes, em Assunção, mesmo sem o resultado esperado dentro de quadra.`,
    categoria_slug: "campeonatos",
    published_at: "2026-07-31T15:00:00-03:00",
  },
  {
    titulo: "TBT: a goleada histórica sobre o Chile",
    slug: "tbt-a-goleada-historica-sobre-o-chile",
    subtitulo: "Relembre a vitória por 13x0 sobre o Churros FC",
    resumo: "Relembre a vitória por 13x0 sobre o Churros FC",
    conteudo: `Em uma publicação de "throwback", o SAF Talismã relembrou o resultado que definiu a colocação da equipe no ranking do Sul-Americano de Clubes: uma vitória por 13x0 sobre o Churros FC, do Chile. Mesmo sem avançar às semifinais, a equipe encerrou sua participação na competição com essa atuação de destaque.`,
    categoria_slug: "campeonatos",
    published_at: "2026-08-06T10:00:00-03:00",
  },
  {
    titulo: "Balanço final: o elenco que representou o Brasil no Sul-Americano",
    slug: "balanco-final-o-elenco-que-representou-o-brasil-no-sul-americano",
    subtitulo: "Presidente Maria Cicília Rolim destaca a entrega coletiva do grupo",
    resumo: "Presidente Maria Cicília Rolim destaca a entrega coletiva do grupo",
    conteudo: `Encerrada a participação no Sul-Americano de Clubes, em Assunção, o SAF Talismã fez um balanço da campanha internacional. A presidente da associação, Maria Cicília Rolim, que acompanhou a equipe de perto durante toda a competição, destacou o empenho coletivo do grupo e a forma como cada atleta representou Arapoti e o Brasil dentro e fora de quadra.`,
    categoria_slug: "campeonatos",
    published_at: "2026-08-06T12:00:00-03:00",
  },
];

const { data: categorias, error: catError } = await client
  .from("post_categories")
  .select("id, slug");

if (catError || !categorias) {
  console.error("Erro ao buscar categorias:", catError?.message);
  process.exit(1);
}

const catBySlug = new Map(categorias.map((c) => [c.slug, c.id]));

let inseridos = 0;
let pulados = 0;
const erros = [];

for (const n of noticias) {
  const catId = catBySlug.get(n.categoria_slug);
  if (!catId) {
    erros.push(`${n.slug}: categoria ${n.categoria_slug} não encontrada`);
    continue;
  }

  const { data: existente } = await client
    .from("posts")
    .select("id")
    .eq("slug", n.slug)
    .maybeSingle();

  if (existente) {
    pulados++;
    continue;
  }

  const { error } = await client.from("posts").insert({
    titulo: n.titulo,
    slug: n.slug,
    conteudo: n.conteudo,
    resumo: n.resumo,
    subtitulo: n.subtitulo,
    status: "published",
    published_at: n.published_at,
    data_publicacao: n.published_at,
    autor: "SAF Talismã",
    categoria_id: catId,
    destaque: false,
  });

  if (error) {
    erros.push(`${n.slug}: ${error.message}`);
  } else {
    inseridos++;
  }
}

console.log(`Inseridos: ${inseridos}`);
console.log(`Já existentes (pulados): ${pulados}`);
if (erros.length) {
  console.log("Erros:");
  erros.forEach((e) => console.log(" -", e));
  process.exit(1);
}
