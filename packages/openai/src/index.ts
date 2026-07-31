export class AIService {
  async initialize() {
    console.log("AI Service initialized.");
  }

  async shutdown() {
    console.log("AI Service stopped.");
  }
}

export const ai = new AIService();
