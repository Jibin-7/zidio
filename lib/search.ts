import { prisma } from "./db"

// In a real production app, use an Embedding provider like OpenAI (text-embedding-3-small) 
// or Cohere. Anthropic does not provide native embeddings yet.
// For this internship demo, we will simulate embedding generation.
export async function generateEmbedding(text: string): Promise<number[]> {
  // Returns a fake 1536-dimensional vector for demo purposes
  // A real implementation:
  // const res = await openai.embeddings.create({ input: text, model: "text-embedding-3-small" })
  // return res.data[0].embedding
  
  return Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
}

export async function storeEmbedding(feedbackId: string, text: string) {
  const vector = await generateEmbedding(text)
  const vectorStr = `[${vector.join(',')}]`
  
  // Using raw query for pgvector insertion
  await prisma.$executeRaw`
    INSERT INTO "Embedding" ("id", "feedbackId", "vector")
    VALUES (gen_random_uuid(), ${feedbackId}, ${vectorStr}::vector)
    ON CONFLICT ("feedbackId") DO UPDATE SET "vector" = ${vectorStr}::vector;
  `
}

export async function semanticSearch(workspaceId: string, query: string, limit = 5) {
  const queryVector = await generateEmbedding(query)
  const vectorStr = `[${queryVector.join(',')}]`
  
  // Retrieve top-K using pgvector cosine distance (<=>)
  // Ensure we filter by workspaceId for security!
  const results = await prisma.$queryRaw<Array<{ id: string, content: string, channel: string }>>`
    SELECT f.id, f.content, f.channel
    FROM "Feedback" f
    JOIN "Embedding" e ON f.id = e."feedbackId"
    WHERE f."workspaceId" = ${workspaceId}
    ORDER BY e.vector <=> ${vectorStr}::vector
    LIMIT ${limit};
  `
  return results
}
