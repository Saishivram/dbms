class ChatService {
    constructor() {
      this.API_URL = "http://localhost:5000/api/chat";
      this.history = [
        {
          role: "system",
          content: `You are an AI assistant for a newspaper delivery business.
            You help owners manage their newspaper delivery operations.
            Be helpful, concise, and professional in your responses.
            Be sure to explain complex terms and concepts clearly.
            You are a database assistant. Never make assumptions or guess information. Always fetch data from the database and respond based only on that. If data is missing, say you cannot find it. Do not infer or make up values. If there's a discrepancy between user input and database, ask the user if they want to update the database.
            If asked about specific customer data, newspaper details, or business metrics, say you can only provide information based on the database results provided to you.
            You are a friendly assistant. Always respond in a conversational and natural tone. Avoid using numbered or bulleted lists unless explicitly asked to. When providing database results, weave them into full sentences that sound like you're chatting with the user.
            Avoid technical jargon and make sure to explain any complex terms or concepts clearly.
            Make sure giving correct and factual information to the user and verify the database proprly before ansering statistical data present in database.`,
        },
      ];
      this.fallbackMode = false;
    }
  
    async sendMessage(message, ownerId) {
      try {
        // Add user message to history
        this.history.push({ role: "user", content: message });
        
        let responseText;
        
        if (this.fallbackMode) {
          // Use fallback local responses if backend has issues
          responseText = this.getFallbackResponse(message);
        } else {
          try {
            // Try to call the backend API
            const response = await fetch(this.API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message,
                history: this.history,
                ownerId: ownerId || 0
              }),
            });
  
            if (!response.ok) {
              throw new Error(`API responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            responseText = data.message;
          } catch (apiError) {
            console.error("Error calling backend API, using fallback mode:", apiError);
            this.fallbackMode = true;
            responseText = this.getFallbackResponse(message);
          }
        }
        
        // Add response to history
        this.history.push({ role: "assistant", content: responseText });
        
        // Keep history to reasonable size
        if (this.history.length > 21) {
          const systemMessage = this.history[0];
          this.history = [systemMessage, ...this.history.slice(-20)];
        }
        
        return responseText;
      } catch (error) {
        console.error("Error in chat service:", error);
        return "Sorry, I encountered an error. Please try again later.";
      }
    }
    
    getFallbackResponse(message) {
      // Simple fallback responses when backend is unavailable
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! How can I help you with your newspaper delivery business today?";
      }
      else if (lowerMessage.includes('delivery') || lowerMessage.includes('route')) {
        return "Managing delivery routes effectively is essential for a newspaper business. You can optimize routes by grouping customers geographically.";
      }
      else if (lowerMessage.includes('customer')) {
        return "Customer management is crucial for retention. I'd be happy to suggest strategies for improving customer satisfaction.";
      }
      else if (lowerMessage.includes('employee') || lowerMessage.includes('staff')) {
        return "Effective employee management helps ensure reliable delivery. What specific aspect of employee management are you interested in?";
      }
      else {
        return "I understand you're asking about aspects of your newspaper delivery business. While I'm currently operating in offline mode, I can still offer general advice on delivery management, customer relations, or business operations.";
      }
    }
  }
  
  export const chatService = new ChatService();