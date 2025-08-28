# LifeHub

App web (Vite + React) do LifeHub – organização pessoal inteligente.

## Executar

```bash
npm install
npm run dev
```

## Estrutura

- `src/components/` telas e componentes existentes (Dashboard, TasksView, etc.)
- `src/modules/` re-exporta as telas atuais para futura modularização
- `src/theme/tokens.ts` tokens de tema (cores, tipografia, espaçamento, radius)
- `src/services/` stubs: `auth`, `storage`, `notifications`, `aiOrchestrator`, `calendarSync`
- `src/store/` esqueleto de estado (tipos e helpers simples)
- `src/constants/plans.ts` planos (free/premium/anual/vitalício)
- `src/components/PremiumModal.tsx` modal de paywall básico
- `src/styles/globals.css` variáveis CSS já aplicadas (light/dark)

## Próximos passos sugeridos

- Conectar `PremiumModal` a pontos estratégicos (relatórios avançados, automações)
- Implementar persistência real no `store` usando `storage`
- Integrar OAuth real no `authService`
- Sincronizar Google/Outlook no `calendarSync`
- Evoluir `aiOrchestrator` para sugestões contextuais e reagendamento

  # App Mobile de Vida Pessoal Completo

  This is a code bundle for App Mobile de Vida Pessoal Completo. The original project is available at https://www.figma.com/design/cF4OLLG6SrwdEzo2CvpWjS/App-Mobile-de-Vida-Pessoal-Completo.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  