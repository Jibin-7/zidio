import { GoogleGenAI } from "@google/genai"
import * as dotenv from "dotenv"

dotenv.config()

async function test() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.log("No key")
    return
  }

  const ai = new GoogleGenAI({ apiKey })

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello"
    })
    console.log("Response:", response.text)
  } catch (error: any) {
    console.log("Error:", error.message)
  }
}

test()
