import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { cvType, cvData } = req.body;

    if (!cvType || !cvData) {
      return res.status(400).json({ error: 'Missing cvType or cvData' });
    }

    if (!['academic', 'professional'].includes(cvType)) {
      return res.status(400).json({ error: 'Invalid cvType. Must be "academic" or "professional"' });
    }

    // Validate required fields
    if (!cvData.fullName) {
      return res.status(400).json({ error: 'Missing required field: fullName' });
    }

    // Return success with formatted data
    return res.status(200).json({
      success: true,
      cvType,
      data: cvData,
      message: 'CV data validated successfully'
    });
  } catch (error: any) {
    console.error('generate-cv error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate CV' });
  }
}
