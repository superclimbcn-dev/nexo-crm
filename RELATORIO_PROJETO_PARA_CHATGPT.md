# Relatório técnico — Nexo CRM / Superclim

## Texto de contexto para fornecer ao ChatGPT

Você está trabalhando em um projeto chamado **Nexo CRM**, atualmente customizado para a operação comercial da **Superclim**, em Sabadell/Barcelona. O sistema é um CRM web integrado ao WhatsApp Business Cloud API. Seu fluxo principal recebe leads pelo WhatsApp, cria ou atualiza contatos e conversas, faz uma triagem automática por tipo de serviço, solicita fotos, registra as mensagens e apresenta os dados em dashboards, inbox e pipeline comercial.

O produto visível ao usuário deve permanecer em **espanhol**, mesmo quando a conversa de desenvolvimento ocorrer em português. O projeto exige TypeScript estrito, proíbe `any`, recomenda lógica DRY e determina que tokens e credenciais nunca apareçam em logs.

### Tecnologias

- Next.js 14 com App Router, React 18 e TypeScript estrito.
- Tailwind CSS 3, Radix UI, Lucide e componentes próprios.
- PostgreSQL acessado por Prisma 5; a migração foi preparada para Supabase.
- NextAuth 4 com login por e-mail/senha, Prisma Adapter e sessão JWT.
- Meta WhatsApp Business Cloud API para mensagens e mídia.
- Recharts para gráficos e dnd-kit para componentes Kanban.
- BullMQ, Redis e OpenAI constam nas dependências, mas não estão integrados aos fluxos ativos encontrados.

### Arquitetura e responsabilidades

- `src/app`: páginas e rotas do App Router. A maior parte das páginas é Server Component e consulta o Prisma diretamente.
- `src/components`: layout, chat, analytics, UI básica e um segundo conjunto de componentes chamado `nexus`.
- `src/lib/whatsapp/service.ts`: principal serviço de domínio. Concentra validação de webhook, normalização, persistência, triagem, envio de mensagens, tratamento de status e disparo lógico de automações.
- `src/lib/pricing/sabadell.ts`: regras de estimativa comercial em euros e adicional de deslocamento.
- `prisma/schema.prisma`: modelo relacional completo.
- Server Actions: criação de oportunidades, ativação/desativação de automações e envio manual de mensagens.

### Fluxo principal do WhatsApp

1. A Meta chama `GET /api/webhooks/whatsapp` para validar o webhook e `POST /api/webhooks/whatsapp` para eventos reais.
2. Em produção, o POST valida `x-hub-signature-256` usando o segredo do webhook.
3. O serviço normaliza telefone, texto, perfil e tipo da mensagem; mídia é exposta por `/api/media/[mediaId]`.
4. O sistema cria o contato, se necessário, e reutiliza uma conversa aberta ou pendente. Mensagens recebidas são deduplicadas por `whatsappId`.
5. A máquina de estados de triagem funciona assim:
   - `waiting_reply` → envia menu e muda para `AWAITING_SERVICE_SELECTION`;
   - opção `1`, `2` ou `3` → registra Sofás/Alfombras, Impermeabilización ou Carros e muda para `AWAITING_PHOTOS`;
   - imagem válida → muda para `TRIAGE_COMPLETED` e confirma que um assessor analisará o material;
   - entrada inválida ou ausência de foto → reenvia instrução adequada;
   - após conclusão, não envia mais resposta automática de triagem.
6. A seleção do serviço salva em `Contact.customFields` a estimativa de preço, moeda EUR, localização e possível adicional de deslocamento.
7. A resposta é enviada pela Graph API, persistida como mensagem outbound e posteriormente atualizada para enviada, entregue, lida ou falha pelos eventos de status.

Existe também `POST /api/whatsapp/webhook`, um webhook simplificado com campos `From`, `Body` e `MessageSid`, aparentemente mantido para testes ou compatibilidade. O endpoint oficial completo é o plural `/api/webhooks/whatsapp`.

### Funcionalidades presentes

- Dashboard inicial com total de leads, pendências de triagem e distribuição entre os três serviços.
- Inbox com conversas reais do banco, filtros e acesso ao detalhe.
- Tela de conversa com histórico, envio manual de texto e galeria de mídias.
- Lista de contatos e tags.
- Pipeline/CRM com oportunidades por etapa e criação de novas oportunidades em EUR.
- Campanhas: leitura de campanhas, estatísticas e segmentação visual por tags.
- Automações: listagem, métricas, logs e ativação/desativação.
- Templates: atualmente mantidos no estado local da tela com dados mockados.
- Analytics: mistura contagens reais (mensagens do dia e contatos) com dados demonstrativos no componente visual.
- Configuração e ajuda: páginas placeholder.
- `/dashboard`: uma interface alternativa “Nexus”, baseada inteiramente em mocks e separada do dashboard principal `/`.

### Modelo de dados

As entidades centrais são:

- `User`, `Account`, `Session` e `VerificationToken` para autenticação;
- `Contact`, `Tag` e `Note` para cadastro e segmentação;
- `Conversation` e `Message` para atendimento omnicanal, hoje focado em WhatsApp;
- `Deal` e `Activity` para pipeline comercial;
- `Campaign` e `CampaignMessage` para disparos em massa;
- `Template` para templates aprovados do WhatsApp;
- `Automation` e `AutomationLog` para gatilhos e auditoria;
- `Settings` para IA e credenciais/configurações do WhatsApp.

Os status de triagem não são enum do Prisma: ficam em `Contact.status` como string. Parte dos estados antigos (`interesse_*`) ainda é reconhecida e normalizada pelo serviço.

### Variáveis de ambiente necessárias

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_WEBHOOK_SECRET`
- `WHATSAPP_API_VERSION` (opcional; padrão atual no código: `v18.0`)
- `PHONE_NUMBER_ID` ou `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TOKEN` ou `WHATSAPP_ACCESS_TOKEN`
- `TEST_WHATSAPP_TO` apenas para o script manual de teste

### Estado real e lacunas importantes

1. **Autenticação incompleta na experiência:** NextAuth está configurado para `/login`, mas não existe página de login nem middleware/proteção global de rotas no repositório.
2. **Automações ainda não executam ações reais:** gatilhos `KEYWORD` e `NEW_CONVERSATION` apenas criam log e incrementam contador. `INACTIVITY`, `SCHEDULE` e `WEBHOOK` estão explicitamente inativos. O conteúdo de `Automation.flow` não é enviado ao contato.
3. **Campanhas são principalmente consulta/UI:** não foi encontrado fluxo para criar, programar ou disparar campanhas; botões principais não estão ligados a ações.
4. **Templates são mockados:** a tela não consulta o modelo Prisma `Template` e suas alterações ficam somente no estado do navegador.
5. **Analytics é parcialmente mockado:** apenas duas métricas vêm do banco.
6. **Configurações não estão implementadas:** embora exista o modelo `Settings`, a página é placeholder e o serviço usa variáveis de ambiente, não esse registro.
7. **IA não está ativa:** OpenAI e campos de IA existem, mas não há chamada ao modelo no fluxo atual.
8. **Fila não está ativa:** BullMQ/ioredis estão instalados no manifesto, porém sem uso no código analisado.
9. **Seed está desatualizado:** usa português, marca “Nexo Digital”, preços em BRL, credenciais de demonstração previsíveis e automações incompatíveis com a customização Superclim em espanhol/EUR.
10. **Inconsistência monetária no schema:** `Deal.currency` ainda tem padrão `BRL`, embora a criação atual force `EUR`; templates têm idioma padrão `pt_BR`.
11. **Logs e privacidade:** os logs operacionais incluem o telefone completo do cliente. Isso merece revisão à luz da regra do próprio projeto de registrar apenas dados necessários.
12. **Serviço central muito grande:** `whatsapp/service.ts` tem mais de 1.200 linhas e reúne muitas responsabilidades, aumentando risco de regressão e dificultando testes.
13. **Sem testes automatizados encontrados:** há apenas um script manual para a API da Meta.
14. **Dependências locais ausentes/incompletas:** a validação `npx tsc --noEmit` não pôde confirmar a saúde do código porque módulos declarados no `package.json`, inclusive Prisma Client e NextAuth, não estavam disponíveis no ambiente. Os erros de tipos derivados disso não devem ser tratados como defeitos confirmados até executar `npm install` e `prisma generate`.
15. **Versão da Graph API:** o fallback `v18.0` deve ser conferido antes de produção, pois versões da Meta expiram.

### Prioridades recomendadas

1. Restaurar dependências, gerar Prisma Client e executar typecheck/build.
2. Completar autenticação e autorização por papel (`ADMIN`, `MANAGER`, `AGENT`).
3. Atualizar o seed para Superclim, espanhol e EUR; remover credenciais triviais.
4. Criar testes para assinatura do webhook, idempotência e máquina de estados da triagem.
5. Dividir o serviço WhatsApp em módulos: transporte Meta, mídia, persistência, triagem e automações.
6. Implementar de ponta a ponta campanhas, templates e automações, ou marcar claramente as telas como demonstração.
7. Centralizar status de triagem e migrá-los para um tipo persistente mais seguro.
8. Revisar logs, rate limiting, retries e processamento assíncrono de webhooks.
9. Unificar/remover o dashboard mockado `/dashboard` para evitar duas experiências concorrentes.

### Regras para qualquer alteração futura

- Preserve a interface e todas as mensagens automáticas em espanhol, salvo instrução explícita em contrário.
- Não use `any`; mantenha TypeScript estrito.
- Não exponha tokens, segredos nem credenciais em código ou logs.
- Antes de alterar webhook, endpoint oficial ou regra comercial, confirme a intenção quando houver ambiguidade.
- Faça mudanças pequenas, reutilizáveis e acompanhadas por validação de tipos e testes proporcionais ao risco.

## Resumo executivo

O projeto já possui uma base funcional relevante para atendimento e triagem via WhatsApp: recebe eventos reais da Meta, deduplica mensagens, mantém contatos e conversas, coleta fotos, registra o funil e permite resposta manual. O núcleo operacional mais maduro é WhatsApp + inbox + triagem + CRM básico. Campanhas, templates, analytics, IA, configurações e automações ainda estão parcial ou majoritariamente incompletos. Antes de considerar o sistema pronto para produção, as maiores necessidades são segurança/autenticação, testes, atualização do seed, conclusão dos fluxos apenas visuais e validação integral do build com as dependências instaladas.
