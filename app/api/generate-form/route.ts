import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { websiteUrl, purpose, destination, designPreferences, model = 'claude-3-5-sonnet-20241022' } = await request.json();

    if (!websiteUrl || !purpose || !destination) {
      return NextResponse.json({ 
        error: 'Missing required fields: websiteUrl, purpose, and destination are required' 
      }, { status: 400 });
    }

    // First scrape the website to get design context
    const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scrape-url-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: websiteUrl })
    });

    let websiteData = null;
    if (scrapeResponse.ok) {
      websiteData = await scrapeResponse.json();
    }

    const prompt = `You are an expert form builder AI. Create a custom form based on the following requirements:

Website URL: ${websiteUrl}
Form Purpose: ${purpose}
Data Destination: ${destination}
Design Preferences: ${designPreferences || 'Match website design'}

${websiteData ? `Website Design Context:
${JSON.stringify(websiteData, null, 2)}` : ''}

Please generate:
1. A complete form schema with appropriate fields for the purpose
2. CSS styling that matches the website's design language
3. A React component for the form
4. An embed script for easy integration
5. Submission handling configuration

Return a JSON response with the following structure:
{
  "formSchema": {
    "id": "unique-form-id",
    "title": "Form Title",
    "description": "Form description",
    "fields": [
      {
        "id": "field-id",
        "type": "text|email|textarea|select|checkbox|radio",
        "label": "Field Label",
        "placeholder": "Placeholder text",
        "required": true|false,
        "options": ["option1", "option2"] // for select/radio
      }
    ]
  },
  "styling": {
    "css": "/* CSS rules matching website design */",
    "theme": {
      "colors": {
        "primary": "#hex",
        "secondary": "#hex",
        "background": "#hex",
        "text": "#hex"
      },
      "fonts": {
        "primary": "font-family",
        "secondary": "font-family"
      },
      "spacing": {
        "small": "value",
        "medium": "value",
        "large": "value"
      }
    }
  },
  "reactComponent": "// React component code",
  "embedScript": "// JavaScript embed code",
  "submissionConfig": {
    "endpoint": "webhook-url",
    "method": "POST",
    "headers": {},
    "dataMapping": {}
  }
}

Make the form practical and user-friendly for the specified purpose. Ensure the styling seamlessly integrates with the website's existing design.`;

    const aiProvider = model.includes('gpt') ? openai : anthropic;
    
    const { text } = await generateText({
      model: aiProvider(model),
      prompt,
      maxTokens: 4000,
    });

    // Parse the AI response to extract JSON
    let formData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        formData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        formData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json({ 
        error: 'Failed to generate valid form data',
        aiResponse: text 
      }, { status: 500 });
    }

    // Generate a unique form ID if not provided
    if (!formData.formSchema?.id) {
      formData.formSchema.id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    return NextResponse.json({
      success: true,
      formData,
      websiteAnalysis: websiteData?.success ? {
        colors: websiteData.metadata?.colors || [],
        fonts: websiteData.metadata?.fonts || [],
        title: websiteData.metadata?.title || '',
        description: websiteData.metadata?.description || ''
      } : null
    });

  } catch (error) {
    console.error('Form generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}