const chatbotService = require('../services/chatbotService');

const chatbotController = {
  // Handle chatbot queries
  handleQuery: async (req, res) => {
    try {
      const { query, params } = req.body;
      let result;

      switch (query) {
        case 'top_employee':
          result = await chatbotService.getTopEmployee(params.month, params.year);
          break;
        case 'popular_newspaper':
          result = await chatbotService.getPopularNewspaper();
          break;
        case 'delivery_stats':
          result = await chatbotService.getDeliveryStats(params.startDate, params.endDate);
          break;
        case 'revenue_analytics':
          result = await chatbotService.getRevenueAnalytics(params.startDate, params.endDate);
          break;
        default:
          return res.status(400).json({ error: 'Invalid query type' });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = chatbotController; 