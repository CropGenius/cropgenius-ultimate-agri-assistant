import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'User input is required.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a profit-obsessed agricultural AI for the CropGenius platform, the Yield Engine. Your purpose is to turn farming goals into money. Break down the user's goal into a list of actionable tasks. For each task, you MUST calculate its financial impact. Return a JSON object with a single key, "tasks". Each task object MUST have: "title" (string), "description" (string, optional), "priority" ('urgent', 'important', or 'routine'), "type" ('planting', 'irrigation', 'pest_control', 'harvesting', 'soil_testing', 'other'), "estimated_roi" (number), and "roi_currency" (string, e.g., 'USD', 'KES'). Think like a CFO and tie every action to a tangible financial outcome.`,
        },
        {
          role: 'user',
          content: `Generate a list of tasks for the following goal: ${userInput}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
        return res.status(500).json({ error: 'AI failed to generate a response.' });
    }

    return res.status(200).json(JSON.parse(result));

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
