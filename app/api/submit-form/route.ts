import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { formId, formData, submissionConfig } = await request.json();

    if (!formId || !formData) {
      return NextResponse.json({ 
        error: 'Missing required fields: formId and formData are required' 
      }, { status: 400 });
    }

    // Handle different submission destinations
    const results: any[] = [];

    if (submissionConfig?.destinations) {
      for (const destination of submissionConfig.destinations) {
        try {
          switch (destination.type) {
            case 'email':
              await handleEmailSubmission(formData, destination);
              results.push({ type: 'email', status: 'success' });
              break;
              
            case 'webhook':
              await handleWebhookSubmission(formData, destination);
              results.push({ type: 'webhook', status: 'success' });
              break;
              
            case 'googlesheets':
              await handleGoogleSheetsSubmission(formData, destination);
              results.push({ type: 'googlesheets', status: 'success' });
              break;
              
            case 'slack':
              await handleSlackSubmission(formData, destination);
              results.push({ type: 'slack', status: 'success' });
              break;
              
            case 'n8n':
              await handleN8nSubmission(formData, destination);
              results.push({ type: 'n8n', status: 'success' });
              break;
              
            default:
              results.push({ type: destination.type, status: 'error', message: 'Unsupported destination type' });
          }
        } catch (error) {
          console.error(`Error with ${destination.type} submission:`, error);
          results.push({ 
            type: destination.type, 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    // Log submission for analytics
    console.log(`Form submission: ${formId}`, {
      timestamp: new Date().toISOString(),
      data: formData,
      results
    });

    return NextResponse.json({
      success: true,
      submissionId: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      results
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit form',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleEmailSubmission(formData: any, config: any) {
  // Implementation would depend on email service (SendGrid, Resend, etc.)
  // For now, just log the submission
  console.log('Email submission:', { formData, config });
  
  // You would implement actual email sending here
  // Example with a webhook to an email service
  if (config.webhookUrl) {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: config.email,
        subject: config.subject || 'New Form Submission',
        formData
      })
    });
  }
}

async function handleWebhookSubmission(formData: any, config: any) {
  if (!config.url) {
    throw new Error('Webhook URL is required');
  }

  const response = await fetch(config.url, {
    method: config.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    },
    body: JSON.stringify({
      ...formData,
      timestamp: new Date().toISOString(),
      ...config.additionalData
    })
  });

  if (!response.ok) {
    throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
  }
}

async function handleGoogleSheetsSubmission(formData: any, config: any) {
  // Implementation would use Google Sheets API
  console.log('Google Sheets submission:', { formData, config });
  
  // You would implement Google Sheets API integration here
  // This could be done via a webhook to a service like Zapier or n8n
  if (config.webhookUrl) {
    await handleWebhookSubmission(formData, { url: config.webhookUrl, method: 'POST' });
  }
}

async function handleSlackSubmission(formData: any, config: any) {
  if (!config.webhookUrl) {
    throw new Error('Slack webhook URL is required');
  }

  const message = {
    text: config.message || 'New form submission received!',
    attachments: [{
      color: 'good',
      fields: Object.entries(formData).map(([key, value]) => ({
        title: key,
        value: String(value),
        short: true
      }))
    }]
  };

  await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}

async function handleN8nSubmission(formData: any, config: any) {
  if (!config.webhookUrl) {
    throw new Error('n8n webhook URL is required');
  }

  await fetch(config.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    },
    body: JSON.stringify({
      formData,
      timestamp: new Date().toISOString(),
      source: 'openloveable-form-builder'
    })
  });
}