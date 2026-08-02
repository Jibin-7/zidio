import { config } from "dotenv";
config();
import { classifyFeedback } from "./lib/ai";

async function run() {
  console.log("Key:", process.env.ANTHROPIC_API_KEY ? "Set" : "Not Set");
  const result = await classifyFeedback("This app is amazing!", []);
  console.log("Result:", result);
}
run();
