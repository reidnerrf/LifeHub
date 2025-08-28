export const aiOrchestrator = {
  async suggestInsights() {
    return [
      {
        id: 'demo-1',
        title: 'Aumente seu foco pela manhã',
        description: 'Você rende melhor entre 9h e 11h. Agende tarefas complexas neste período.'
      },
      {
        id: 'demo-2',
        title: 'Otimize gastos com alimentação',
        description: 'Seus gastos chegaram a 80% do orçamento. Considere revisar suas despesas da semana.'
      }
    ];
  }
};

export default aiOrchestrator;

