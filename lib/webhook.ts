export async function triggerAutoTriage(feedback: any) {
  // In a real production app, you would fetch registered webhooks for this workspace
  // from the database (e.g. Slack/Discord/Zendesk integration endpoints)
  
  if (feedback.sentiment !== "NEG") return

  const webhookUrl = process.env.AUTO_TRIAGE_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.log("[Auto-Triage] Negative feedback detected. Skipping webhook dispatch because AUTO_TRIAGE_WEBHOOK_URL is not set.")
    return
  }

  try {
    console.log(`[Auto-Triage] Dispatching negative feedback alert to webhook...`)
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "feedback.negative",
        data: {
          id: feedback.id,
          content: feedback.content,
          channel: feedback.channel,
          score: feedback.sentimentScore
        }
      })
    })
  } catch (error) {
    console.error("[Auto-Triage] Failed to dispatch webhook:", error)
  }
}
