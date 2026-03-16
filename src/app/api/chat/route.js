import { NextResponse } from 'next/server';
// Named import — NOT default. `import init from ...` causes "init is not a function".
import { init } from '@launchdarkly/node-server-sdk';
import { initAi } from '@launchdarkly/server-sdk-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

let ldClientPromise = null;
let aiClientPromise = null;

/**
 * Returns a singleton LaunchDarkly client.
 */
function getLDClient() {
  if (!ldClientPromise) {
    const client = init(process.env.LD_SERVER_KEY);
    ldClientPromise = client.waitForInitialization().then(() => client);
  }
  return ldClientPromise;
}

/**
 * Returns a singleton LaunchDarkly AI client.
 */
function getAiClient() {
  if (!aiClientPromise) {
    aiClientPromise = getLDClient().then((ldClient) => initAi(ldClient));
  }
  return aiClientPromise;
}

export async function POST(req) {
  try {
    const { message, userKey, userPlan } = await req.json();

    // Setup LD AI context/user. Pass userKey and userPlan from the frontend to ensure server-side targeting fires correctly.
    const context = { 
      kind: 'user', 
      key: userKey || 'server-evaluation',
      plan: userPlan || 'free'
    };
        const fallback = { enabled: false };

    // Get the LD AI client and evaluate the completion config
    const aiClient = await getAiClient();

    const aiConfig = await aiClient.completionConfig('analytics-assistant', context, fallback);

    if (!aiConfig.enabled) {
      return NextResponse.json({
        reply: 'Assistant unavailable',
        modelUsed: null,
      });
    }

    // Extract model name and prompt
    // aiConfig.model is an OBJECT, not a string — use .name to extract the model ID.
    const modelName = aiConfig.model?.name || 'gemini-2.5-flash-lite';
    const systemPrompt = aiConfig.messages?.[0]?.content || 'You are a helpful product analytics assistant.';

    // Initialize Gemini model
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    // Set temperature and max tokens
    const temperature = aiConfig.model?.parameters?.temperature ?? 0.3;
    const maxOutputTokens = aiConfig.model?.parameters?.maxTokens ?? 500;

    // Generate reply
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    });

    const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
                  result.response?.text ||
                  'Sorry, I could not generate an answer.';

    aiConfig.tracker?.trackSuccess?.();

    // Log the model used
    console.log('[ChatAPI] model:', modelName);

    return NextResponse.json({
      reply,
      modelUsed: modelName,
    });
  } catch (error) {
    console.error('[ChatAPI] Error:', error);
    return NextResponse.json({
      reply: 'Internal error',
      modelUsed: null,
    }, { status: 500 });
  }
}

