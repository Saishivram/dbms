import { Groq } from 'groq-sdk';

class ChatService {
  constructor() {
    this.history = [
      {
        role: "system",
        content: `You are an AI assistant for a newspaper delivery business.
          You help owners manage their newspaper delivery operations.
          Be helpful, concise, and professional in your responses.
          If asked about specific customer data, newspaper details, or business metrics, 
          say you can only provide information based on the database results provided to you.`,
      },
    ];
  }

  async sendMessage(message, ownerId) {
    try {
      // Add user message to history
      this.history.push({ role: "user", content: message });
      
      // First, fetch database information through our backend API
      let dbContext = "";
      try {
        const dbResponse = await fetch("/api/chat/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            ownerId: ownerId || 0
          }),
        });
        
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          dbContext = dbData.contextData || "";
        }
      } catch (dbError) {
        console.error("Error fetching database context:", dbError);
      }
      
      // Prepare the messages for Groq, including the database context if available
      const messages = [...this.history];
      if (dbContext) {
        messages.push({
          role: "system",
          content: `Here is relevant information from the database: ${dbContext}`
        });
      }
      
      // Call Groq API directly from the frontend (for development only)
      const groq = new Groq({
        apiKey: "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",
        dangerouslyAllowBrowser: true // Only for development!
      });
      
      const response = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 800,
      });
      
      // Get the response text
      const responseText = response.choices[0].message.content;
      
      // Add response to history
      this.history.push({ role: "assistant", content: responseText });
      
      // Keep history to reasonable size
      if (this.history.length > 21) {
        const systemMessage = this.history[0];
        this.history = [systemMessage, ...this.history.slice(-20)];
      }
      
      return responseText;
    } catch (error) {
      console.error("Error with chat service:", error);
      return "Sorry, I encountered an error. Please try again later.";
    }
  }
}

export const chatService = new ChatService();