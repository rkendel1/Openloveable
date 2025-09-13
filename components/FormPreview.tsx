'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FormPreviewProps {
  formData: any;
  onClose: () => void;
  onGetEmbedCode: () => void;
}

export default function FormPreview({ formData, onClose, onGetEmbedCode }: FormPreviewProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formData.formData.formSchema.id,
          formData: formValues,
          submissionConfig: formData.formData.submissionConfig
        })
      });

      const result = await response.json();
      setSubmitResult(result);
    } catch (error) {
      setSubmitResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Submission failed' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const baseClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";
    
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.id}
            name={field.id}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            name={field.id}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className={baseClasses}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option: string, index: number) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formValues[field.id] === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="text-orange-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`${field.id}[${index}]`}
                  value={option}
                  checked={(formValues[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formValues[field.id] || [];
                    if (e.target.checked) {
                      handleFieldChange(field.id, [...currentValues, option]);
                    } else {
                      handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="text-orange-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            id={field.id}
            name={field.id}
            value={formValues[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );
    }
  };

  const { formSchema, styling } = formData.formData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Form Preview</h2>
              <p className="text-sm text-gray-600">Test your form and get the embed code</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                
                {/* Form Container */}
                <div 
                  className="p-6 border border-gray-200 rounded-lg bg-white"
                  style={{
                    background: styling?.theme?.colors?.background || '#ffffff',
                    color: styling?.theme?.colors?.text || '#000000',
                    fontFamily: styling?.theme?.fonts?.primary || 'inherit'
                  }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {formSchema.title && (
                      <h4 className="text-xl font-bold mb-2">{formSchema.title}</h4>
                    )}
                    {formSchema.description && (
                      <p className="text-gray-600 mb-6">{formSchema.description}</p>
                    )}
                    
                    {formSchema.fields?.map((field: any) => (
                      <div key={field.id} className="space-y-2">
                        <label 
                          htmlFor={field.id}
                          className="block text-sm font-medium"
                        >
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-6"
                      style={{
                        backgroundColor: styling?.theme?.colors?.primary || '#f97316',
                        color: 'white'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </form>
                  
                  {submitResult && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      submitResult.success 
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {submitResult.success 
                        ? '✓ Form submitted successfully!'
                        : `✗ Error: ${submitResult.error}`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration & Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Form Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                  <div>
                    <strong>Form ID:</strong> {formSchema.id}
                  </div>
                  <div>
                    <strong>Fields:</strong> {formSchema.fields?.length || 0} fields
                  </div>
                  <div>
                    <strong>Required Fields:</strong> {formSchema.fields?.filter((f: any) => f.required).length || 0}
                  </div>
                  {formData.websiteAnalysis && (
                    <div>
                      <strong>Website Analysis:</strong> Colors and fonts detected
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={onGetEmbedCode}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Get Embed Code
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const dataStr = JSON.stringify(formData, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `form-${formSchema.id}.json`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full"
                  >
                    Download Configuration
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                      alert('Form configuration copied to clipboard!');
                    }}
                    className="w-full"
                  >
                    Copy JSON Config
                  </Button>
                </div>
              </div>

              {/* Design Customization */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Detected Design</h3>
                {styling?.theme && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Primary Color:</span>
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: styling.theme.colors?.primary || '#f97316' }}
                      />
                      <span className="text-xs text-gray-600">
                        {styling.theme.colors?.primary || '#f97316'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Background:</span>
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: styling.theme.colors?.background || '#ffffff' }}
                      />
                      <span className="text-xs text-gray-600">
                        {styling.theme.colors?.background || '#ffffff'}
                      </span>
                    </div>
                    {styling.theme.fonts?.primary && (
                      <div>
                        <span className="text-sm font-medium">Font:</span>
                        <span className="text-xs text-gray-600 ml-2">
                          {styling.theme.fonts.primary}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}