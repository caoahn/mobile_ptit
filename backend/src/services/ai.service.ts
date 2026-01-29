export interface IAIService {
  scanIngredients(imageUrl: string): Promise<any>;
}

export class AIService implements IAIService {
  async scanIngredients(imageUrl: string): Promise<any> {
    // MOCK AI Implementation
    // In production, call OpenAI Vision API or similar
    return [
      { name: "Tomato", amount: "2", unit: "pcs", confidence: 0.98 },
      { name: "Red Onion", amount: "1", unit: "pcs", confidence: 0.84 },
      { name: "Bell Pepper", amount: "1", unit: "pcs", confidence: 0.91 },
    ];
  }
}
