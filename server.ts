import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Define a type for memory items sent from the frontend to keep server.ts self-contained
interface ServerMemoryItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  chapter: string;
  date: string;
  description: string;
  tags: string[];
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API client as recommended in instructions
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('✨ Gemini client initialized successfully on Fillory Vault server.');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini client:', err);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY not configured or is placeholder. Server will operate in Offline Slumber Mode.');
}

// ==========================================
// API ROUTES FIRST (BEFORE VITE MIDDLEWARE)
// ==========================================

// 1. Health & Configuration check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineMode: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// 2. Magic Search Endpoint (AI-grounded retrieval)
app.post('/api/search', async (req, res) => {
  const { query, items } = req.body as { query: string; items: ServerMemoryItem[] };

  if (!query || !items) {
    res.status(400).json({ error: 'Query and items are required.' });
    return;
  }

  // Fallback if Gemini client is not configured
  if (!ai) {
    const lowerQuery = query.toLowerCase();
    const matched = items.filter((item) => {
      return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.chapter.toLowerCase().includes(lowerQuery) ||
        item.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        item.date.includes(lowerQuery)
      );
    });

    res.json({
      matchedIds: matched.map((m) => m.id),
      narrative: `Keeper, the Divine Eyes of the Vault are currently slumbering in offline mode. However, our simple parchment search filters have scoured the scrolls and matched ${matched.length} memories containing "${query}". Add your true Gemini API Key in the Secrets Panel to awaken the full archive's magical sight!`,
      relevanceExplanation: 'Filtered using client tags, titles, and descriptions offline.',
      onlineMode: false,
    });
    return;
  }

  try {
    const prompt = `You are the ancient Magical Spirit of the Fillory Royal Vault.
A user (the "Keeper of the Vault") has requested: "${query}"

Here is the current catalog of memory scrolls currently resting in the vault:
${JSON.stringify(items, null, 2)}

Filter these items to return ONLY the IDs that fit the Keeper's search request.
You should do smart semantic matching. For example:
- "beach videos" should match videos with beach tags or descriptions.
- "Julia" should match things involving Julia the sorceress.
- "memories from 2024" should match items with dates starting with "2024".
- "warm cozy vibes" should match things like campfires, fireplaces, royal feasts.

Additionally, write a highly immersive, beautiful, dark-fantasy narrative welcoming the Keeper, written with rich editorial, poetic tones inspired by "The Magicians" and ancient libraries. Address the Keeper as "Keeper" or "Honored Archivist". Summarize what you found in the shadows of the archive.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of memory IDs that match the search query.',
            },
            narrative: {
              type: Type.STRING,
              description: 'A poetic, dark-fantasy, in-character explanation of the search results for the Keeper.',
            },
            relevanceExplanation: {
              type: Type.STRING,
              description: 'A short high-level summary of why these items matched.',
            },
          },
          required: ['matchedIds', 'narrative', 'relevanceExplanation'],
        },
      },
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText.trim());
      res.json({
        ...parsed,
        onlineMode: true,
      });
    } else {
      throw new Error('No text returned from Gemini API.');
    }
  } catch (error: any) {
    console.error('❌ Gemini search error:', error);
    res.status(500).json({
      error: 'The magic spell failed to resolve the search.',
      details: error.message,
      onlineMode: false,
    });
  }
});

// 3. AI Chapters Suggestions Endpoint
app.post('/api/chapters/suggest', async (req, res) => {
  const { items } = req.body as { items: ServerMemoryItem[] };

  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Selected items are required.' });
    return;
  }

  if (!ai) {
    res.json({
      suggestedName: 'Chronicles of the Seeker',
      suggestedDescription: 'A custom collection of your latest archive records, awaiting proper cataloging once the Arcane Sight is active.',
      sealSymbol: '❈',
      onlineMode: false,
    });
    return;
  }

  try {
    const prompt = `You are the chief magical scribe of Fillory. 
The Keeper has selected these memory scrolls:
${JSON.stringify(items, null, 2)}

Suggest a single, majestic, premium dark fantasy "Chapter" name and description to group these memories under.
The chapter should sound like an elegant chronicle in a royal library (e.g., "The Clockwork Expeditions", "Shadows of the East Tower", "Whispers of the Wellspring").
Also suggest a beautiful single-character magical seal or symbol for it (e.g. "⚜", "✧", "❈", "☯", "⚛", "✥", "⚓", "⚔", "✵").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedName: {
              type: Type.STRING,
              description: 'A majestic dark-fantasy chapter name.',
            },
            suggestedDescription: {
              type: Type.STRING,
              description: 'A luxurious, poetic summary description of this chapter.',
            },
            sealSymbol: {
              type: Type.STRING,
              description: 'A single iconic character or symbol acting as the magical seal.',
            },
          },
          required: ['suggestedName', 'suggestedDescription', 'sealSymbol'],
        },
      },
    });

    const resultText = response.text;
    if (resultText) {
      const parsed = JSON.parse(resultText.trim());
      res.json({
        ...parsed,
        onlineMode: true,
      });
    } else {
      throw new Error('No text returned from Gemini API.');
    }
  } catch (error: any) {
    console.error('❌ Gemini chapter suggest error:', error);
    res.status(500).json({
      error: 'Failed to suggest a chapter title.',
      details: error.message,
    });
  }
});

// 4. Memory Legend Generator Endpoint
app.post('/api/legend/generate', async (req, res) => {
  const { item } = req.body as { item: ServerMemoryItem };

  if (!item) {
    res.status(400).json({ error: 'A memory item is required.' });
    return;
  }

  if (!ai) {
    res.json({
      legend: `In the grand records of Fillory, the scroll of "${item.title}" stands as a silent sentinel. Under the chapter of "${item.chapter}", it whispers of its secrets on the date of ${item.date}. Once the True Arcane Sight (Gemini API Key) is linked, the ancient scribe will write a full, customized legend for this memory.`,
      onlineMode: false,
    });
    return;
  }

  try {
    const prompt = `You are the royal high-scribe of the Fillory Royal Library. 
Write a luxurious, cinematic, short legend or fable about this specific memory scroll:
Title: "${item.title}"
Chapter: "${item.chapter}"
Date: "${item.date}"
Description: "${item.description}"
Tags: ${item.tags.join(', ')}

The fable should feel dark, magical, nostalgic, and incredibly high-quality, as if read from an ancient gold-engraved parchment. Limit the response to around 120-150 words. Finish with a short, enigmatic warning or moral related to the passage of time.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({
      legend: response.text,
      onlineMode: true,
    });
  } catch (error: any) {
    console.error('❌ Gemini legend generator error:', error);
    res.status(500).json({
      error: 'Failed to conjure the legend.',
      details: error.message,
    });
  }
});


// ==========================================
// VITE OR STATIC FILES SERVING (LATER)
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite development middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('⚡ Production static directory served:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏰 Fillory Vault full-stack server running on http://localhost:${PORT}`);
  });
}

start();
