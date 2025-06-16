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
          content: `You are an expert agricultural assistant for the CropGenius platform. Your role is to break down a high-level farmer's goal into a structured list of specific, actionable tasks. Return the tasks as a JSON object with a single key, "tasks", which is an array of objects. Each task object should have the following properties: "title" (string), "description" (string, optional), "priority" ('urgent', 'important', or 'routine'), and "type" ('planting', 'irrigation', 'pest_control', 'harvesting', 'soil_testing', 'other').`,
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
