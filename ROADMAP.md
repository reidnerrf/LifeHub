# Roadmap de Implementação (LifeHub)

## M1 (Semanas 1–4): Fundações + MVP
- Infra & DevX
  - Repo organizado, .gitignore, scripts, CI básico
  - Backend Node + Mongo (Docker) com modelos: User, Task, Note, Suggestion
  - Autenticação básica (JWT) e `X-User-Id` (fallback)
- Telas & Fluxos
  - Onboarding (perguntas rápidas; tema; login e import stub)
  - Home/Dashboard: timeline do dia, FAB, sugestões IA (stub), score planejamento
  - Tarefas: lista/Kanban, criar/editar/concluir/excluir, tags/prioridade (UI)
  - Notas: criar/editar/excluir, busca simples
  - Foco: Pomodoro básico (25/5), contador e sessões do dia
  - Configurações: usuário atual, import Google (stub), premium modal
- IA (fase 1 - heurística)
  - /ai/suggestions (slots livres), /ai/score-planning, /ai/reschedule (simples)
- Entregas
  - Web rodando com backend local; persistência por usuário
  - Métricas: latência API, erros, uso IA

## M2 (Semanas 5–8): Agenda, Hábitos, Finanças leves
- Agenda
  - Visualização mensal/semanal/diário (UI)
  - Sync Google leitura (OAuth stub→real), alertas “sair em 20min” (simulado)
- Hábitos & Bem‑estar
  - CRUD hábitos, check-ins humor/energia/sono
  - Relatórios básicos hábitos x produtividade
- Finanças
  - Contas a pagar/receber, lembretes de vencimento, resumo mensal
- IA (fase 2 - qualidade)
  - Melhorar rescheduler (espaços, prioridades), justificativas explicáveis
- Entregas
  - Fluxos completos agenda/hábitos/finanças com dados básicos

## M3 (Semanas 9–12): IA avançada + Assistente
- Time Orchestrator (core)
  - Modelo que cruza tarefas, eventos, hábitos, energia/sono, slots livres
  - Sugestão de horários ótimos + auto-rescheduler 1-toque
  - “Você tem 30min livres → adiantar X?”
  - Aprendizado contínuo (preferências manhã/noite, duração real, variação semanal)
- RAG nas notas
  - Embeddings, busca semântica e links nota↔tarefa/hábito; resumos
- Assistente conversacional
  - Criar/planejar por texto/voz (“planeje minha semana”, rituais)
- Entregas
  - IA com justificativas; painel de insights semanais

## M4 (Semanas 13–16): Gamificação, internacionalização e polimento
- Gamificação: pontos, medalhas, quests semanais
- Internacionalização e multi-idioma
- Notificações inteligentes (pontaria de horário)
- Integrações adicionais (Outlook, Trello/CSV)
- Paywall/vitalício, trial 7–14 dias, bundle anual
- Observabilidade (Sentry, OTel), privacidade (IA local-first quando possível)

## Backlog Estratégico
- “Semana Ideal”, saúde digital, automations, wearable support

## Métricas-chave
- Aha moment D0; WAU (foco ≥2 + 7 tarefas concluídas); uso IA; retenção D7/D30; churn premium; tempo salvo/semana; % sync calendário e % check‑ins
