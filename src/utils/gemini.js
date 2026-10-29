const { GoogleGenAI } = require('@google/genai');
const AppError = require('./AppError');

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) throw new AppError('GEMINI_API_KEY is not configured', 500);
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

/**
 * Improve post content with Gemini.
 * Optionally accepts an uploaded document (PDF/text) which is sent inline
 * (see https://ai.google.dev/gemini-api/docs/document-processing) as extra reference material.
 */
exports.improveContent = async ({ title, description, content, instructions, file }) => {
  const prompt = [
    'You are an expert editor. Improve the blog post below: fix grammar and spelling, improve clarity,',
    'flow, structure and tone, while keeping the original meaning, facts and language.',
    'Return ONLY the improved post content as plain text/markdown, with no preface or commentary.',
    instructions ? `Additional instructions from the author: ${instructions}` : '',
    file ? 'The attached document is reference material; use it to enrich or correct the post where relevant.' : '',
    '',
    `Title: ${title}`,
    description ? `Description: ${description}` : '',
    '',
    'Content:',
    content,
  ]
    .filter((l) => l !== '')
    .join('\n');

  const parts = [{ text: prompt }];
  if (file) {
    parts.push({
      inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') },
    });
  }

  try {
    const response = await getClient().models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: parts,
    });
    const text = (response.text || '').trim();
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`AI service error: ${err.message}`, 502);
  }
};
