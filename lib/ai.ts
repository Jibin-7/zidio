import { GoogleGenAI, Type, Schema } from "@google/genai"

export type ClassificationResult = {
  sentiment: "POS" | "NEU" | "NEG"
  sentimentScore: number
  themes: string[]
  featureArea?: string
  rationale: string
}

export async function classifyFeedback(content: string, existingThemes: string[]): Promise<ClassificationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn("No Gemini API Key found. Skipping classification.")
    return null
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = `
You are an expert customer feedback analyst.
Analyze the following feedback and classify it.
Try to reuse existing themes if applicable. Existing themes: ${existingThemes.join(", ")}

Feedback: "${content}"
`
  // We define the schema for structured JSON output
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      sentiment: {
        type: Type.STRING,
        enum: ["POS", "NEU", "NEG"],
        description: "The overall sentiment of the feedback"
      },
      sentimentScore: {
        type: Type.NUMBER,
        description: "Number between -1 (extremely negative) and 1 (extremely positive)"
      },
      themes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Array of 1-3 theme names"
      },
      featureArea: {
        type: Type.STRING,
        description: "String label of the feature area, if applicable"
      },
      rationale: {
        type: Type.STRING,
        description: "One-line rationale for your classification"
      }
    },
    required: ["sentiment", "sentimentScore", "themes", "rationale"]
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0,
      }
    })

    if (!response.text) throw new Error("No text in response")
    const parsed = JSON.parse(response.text) as ClassificationResult
    return parsed
  } catch (error: any) {
    console.warn("AI Classification failed, using silent fallback:", error?.message || error)
    
    const text = content.toLowerCase()
    let sentiment: "POS" | "NEU" | "NEG" = "NEU"
    let score = 0
    let theme = "General Feedback"

    if (text.includes("great") || text.includes("love") || text.includes("fast") || text.includes("awesome") || text.includes("good")) {
      sentiment = "POS"
      score = 0.8
    } else if (text.includes("fail") || text.includes("error") || text.includes("crash") || text.includes("bad") || text.includes("confusing") || text.includes("never") || text.includes("wish")) {
      sentiment = "NEG"
      score = -0.8
    }

    if (text.includes("billing") || text.includes("charge")) theme = "Billing"
    else if (text.includes("ui") || text.includes("dark mode") || text.includes("customization")) theme = "UX/UI"
    else if (text.includes("integration") || text.includes("salesforce")) theme = "Integrations"
    else if (text.includes("crash") || text.includes("bug")) theme = "Bugs"
    else if (text.includes("export") || text.includes("pdf")) theme = "Exports & Reports"

    return {
      sentiment,
      sentimentScore: score,
      themes: [theme],
      featureArea: theme,
      rationale: "Classified based on primary keyword extraction."
    }
  }
}
