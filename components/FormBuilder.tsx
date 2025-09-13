'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FormBuilderProps {
  onFormGenerated: (formData: any) => void;
  onClose: () => void;
}

export default function FormBuilder({ onFormGenerated, onClose }: FormBuilderProps) {
  const [step, setStep] = useState(1);
  const [formConfig, setFormConfig] = useState({
    websiteUrl: '',
    purpose: '',
    destination: '',
    destinationType: 'email',
    designPreferences: '',
    model: 'claude-3-5-sonnet-20241022'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      generateForm();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generateForm = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConfig)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form');
      }

      onFormGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Website URL</h3>
            <p className="text-sm text-gray-600">
              Enter the URL of the website where this form will be embedded. We'll analyze the design to match your form styling.
            </p>
            <input
              type="url"
              value={formConfig.websiteUrl}
              onChange={(e) => setFormConfig({ ...formConfig, websiteUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Form Purpose</h3>
            <p className="text-sm text-gray-600">
              What is this form for? This helps us determine the right fields and structure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Client Intake',
                'Contact Form',
                'Waitlist Signup',
                'Feedback Collection',
                'Newsletter Signup',
                'Event Registration',
                'Lead Generation',
                'Custom'
              ].map((purpose) => (
                <button
                  key={purpose}
                  onClick={() => setFormConfig({ ...formConfig, purpose })}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    formConfig.purpose === purpose
                      ? 'border-orange-400 bg-orange-50 text-gray-900'
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
            {formConfig.purpose === 'Custom' && (
              <Textarea
                value={formConfig.purpose === 'Custom' ? formConfig.designPreferences : ''}
                onChange={(e) => setFormConfig({ ...formConfig, purpose: e.target.value })}
                placeholder="Describe your custom form purpose..."
                className="w-full"
                rows={3}
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Destination</h3>
            <p className="text-sm text-gray-600">
              Where should form submissions be sent?
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="destinationType"
                  value="email"
                  checked={formConfig.destinationType === 'email'}
                  onChange={(e) => setFormConfig({ ...formConfig, destinationType: e.target.value })}
                  className="text-orange-500"
                />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">Send submissions to an email address</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="destinationType"
                  value="webhook"
                  checked={formConfig.destinationType === 'webhook'}
                  onChange={(e) => setFormConfig({ ...formConfig, destinationType: e.target.value })}
                  className="text-orange-500"
                />
                <div>
                  <div className="font-medium">Webhook</div>
                  <div className="text-sm text-gray-500">Send to a custom webhook URL</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="destinationType"
                  value="googlesheets"
                  checked={formConfig.destinationType === 'googlesheets'}
                  onChange={(e) => setFormConfig({ ...formConfig, destinationType: e.target.value })}
                  className="text-orange-500"
                />
                <div>
                  <div className="font-medium">Google Sheets</div>
                  <div className="text-sm text-gray-500">Append rows to a Google Sheet</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="destinationType"
                  value="slack"
                  checked={formConfig.destinationType === 'slack'}
                  onChange={(e) => setFormConfig({ ...formConfig, destinationType: e.target.value })}
                  className="text-orange-500"
                />
                <div>
                  <div className="font-medium">Slack</div>
                  <div className="text-sm text-gray-500">Post to a Slack channel</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="destinationType"
                  value="n8n"
                  checked={formConfig.destinationType === 'n8n'}
                  onChange={(e) => setFormConfig({ ...formConfig, destinationType: e.target.value })}
                  className="text-orange-500"
                />
                <div>
                  <div className="font-medium">n8n Workflow</div>
                  <div className="text-sm text-gray-500">Trigger an n8n automation workflow</div>
                </div>
              </label>
            </div>

            {/* Destination configuration input */}
            <div className="mt-4">
              {formConfig.destinationType === 'email' && (
                <input
                  type="email"
                  value={formConfig.destination}
                  onChange={(e) => setFormConfig({ ...formConfig, destination: e.target.value })}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              )}
              
              {['webhook', 'googlesheets', 'slack', 'n8n'].includes(formConfig.destinationType) && (
                <input
                  type="url"
                  value={formConfig.destination}
                  onChange={(e) => setFormConfig({ ...formConfig, destination: e.target.value })}
                  placeholder={
                    formConfig.destinationType === 'slack' 
                      ? 'https://hooks.slack.com/services/...'
                      : formConfig.destinationType === 'n8n'
                      ? 'https://your-n8n-instance.com/webhook/...'
                      : 'https://your-webhook-url.com/endpoint'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Design Preferences</h3>
            <p className="text-sm text-gray-600">
              Any specific design requirements or customizations? We'll analyze your website automatically, but you can add extra preferences here.
            </p>
            <Textarea
              value={formConfig.designPreferences}
              onChange={(e) => setFormConfig({ ...formConfig, designPreferences: e.target.value })}
              placeholder="e.g., Use dark theme, rounded corners, specific colors, etc."
              rows={4}
              className="w-full"
            />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Review Configuration</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Website:</strong> {formConfig.websiteUrl}</div>
                <div><strong>Purpose:</strong> {formConfig.purpose}</div>
                <div><strong>Destination:</strong> {formConfig.destinationType} - {formConfig.destination}</div>
                {formConfig.designPreferences && (
                  <div><strong>Design:</strong> {formConfig.designPreferences}</div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formConfig.websiteUrl.trim() !== '';
      case 2:
        return formConfig.purpose.trim() !== '';
      case 3:
        return formConfig.destination.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create AI Form</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </div>
              ) : step === 4 ? (
                'Generate Form'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}