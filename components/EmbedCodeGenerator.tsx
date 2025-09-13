'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EmbedCodeGeneratorProps {
  formData: any;
  onClose: () => void;
}

export default function EmbedCodeGenerator({ formData, onClose }: EmbedCodeGeneratorProps) {
  const [embedType, setEmbedType] = useState<'script' | 'iframe' | 'react'>('script');
  const [copied, setCopied] = useState(false);

  const { formSchema, styling, reactComponent, submissionConfig } = formData.formData;
  const formId = formSchema.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const generateEmbedCode = () => {
    switch (embedType) {
      case 'script':
        return `<!-- OpenLoveable Form Widget -->
<div id="openloveable-form-${formId}"></div>
<script>
(function() {
  var formContainer = document.getElementById('openloveable-form-${formId}');
  if (!formContainer) return;
  
  // Form configuration
  var formConfig = ${JSON.stringify({ formSchema, styling, submissionConfig }, null, 2)};
  
  // Create form HTML
  var formHTML = \`
    <form id="form-${formId}" style="
      font-family: ${styling?.theme?.fonts?.primary || 'inherit'};
      background: ${styling?.theme?.colors?.background || '#ffffff'};
      color: ${styling?.theme?.colors?.text || '#000000'};
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      ${formSchema.title ? `<h3 style="margin: 0 0 16px 0; font-size: 1.5rem; font-weight: bold;">${formSchema.title}</h3>` : ''}
      ${formSchema.description ? `<p style="margin: 0 0 24px 0; color: #666;">${formSchema.description}</p>` : ''}
      
      ${formSchema.fields?.map((field) => `
        <div style="margin-bottom: 16px;">
          <label for="${field.id}" style="display: block; margin-bottom: 8px; font-weight: 500;">
            ${field.label}${field.required ? '<span style="color: #ef4444; margin-left: 4px;">*</span>' : ''}
          </label>
          ${field.type === 'textarea' 
            ? `<textarea 
                id="${field.id}" 
                name="${field.id}" 
                placeholder="${field.placeholder || ''}" 
                ${field.required ? 'required' : ''}
                style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical; min-height: 100px;"
              ></textarea>`
            : field.type === 'select' 
            ? `<select 
                id="${field.id}" 
                name="${field.id}" 
                ${field.required ? 'required' : ''}
                style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;"
              >
                <option value="">Select an option...</option>
                ${field.options?.map(option => `<option value="${option}">${option}</option>`).join('') || ''}
              </select>`
            : `<input 
                type="${field.type}" 
                id="${field.id}" 
                name="${field.id}" 
                placeholder="${field.placeholder || ''}" 
                ${field.required ? 'required' : ''}
                style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;"
              />`
          }
        </div>
      `).join('') || ''}
      
      <button type="submit" style="
        width: 100%;
        padding: 12px 24px;
        background: ${styling?.theme?.colors?.primary || '#f97316'};
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
        Submit
      </button>
    </form>
  \`;
  
  formContainer.innerHTML = formHTML;
  
  // Handle form submission
  document.getElementById('form-${formId}').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var formData = new FormData(this);
    var data = {};
    for (var pair of formData.entries()) {
      data[pair[0]] = pair[1];
    }
    
    // Submit to OpenLoveable
    fetch('${baseUrl}/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: '${formId}',
        formData: data,
        submissionConfig: formConfig.submissionConfig
      })
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        this.innerHTML = '<div style="text-align: center; padding: 24px; color: #059669;"><h3>Thank you!</h3><p>Your submission has been received.</p></div>';
      } else {
        alert('There was an error submitting the form. Please try again.');
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      alert('There was an error submitting the form. Please try again.');
    });
  });
})();
</script>`;

      case 'iframe':
        return `<!-- OpenLoveable Form iFrame -->
<iframe 
  src="${baseUrl}/embed/form/${formId}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
>
</iframe>`;

      case 'react':
        return `import React, { useState } from 'react';

const OpenLoveableForm = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('${baseUrl}/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: '${formId}',
          formData,
          submissionConfig: ${JSON.stringify(submissionConfig, null, 6)}
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: '#059669' }}>
        <h3>Thank you!</h3>
        <p>Your submission has been received.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      fontFamily: '${styling?.theme?.fonts?.primary || 'inherit'}',
      background: '${styling?.theme?.colors?.background || '#ffffff'}',
      color: '${styling?.theme?.colors?.text || '#000000'}',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      ${formSchema.title ? `<h3 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
        ${formSchema.title}
      </h3>` : ''}
      
      ${formSchema.description ? `<p style={{ margin: '0 0 24px 0', color: '#666' }}>
        ${formSchema.description}
      </p>` : ''}
      
      ${formSchema.fields?.map((field) => `
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="${field.id}" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          ${field.label}${field.required ? '<span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>' : ''}
        </label>
        ${field.type === 'textarea' 
          ? `<textarea
              id="${field.id}"
              name="${field.id}"
              value={formData.${field.id} || ''}
              onChange={handleInputChange}
              placeholder="${field.placeholder || ''}"
              ${field.required ? 'required' : ''}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />`
          : field.type === 'select'
          ? `<select
              id="${field.id}"
              name="${field.id}"
              value={formData.${field.id} || ''}
              onChange={handleInputChange}
              ${field.required ? 'required' : ''}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Select an option...</option>
              ${field.options?.map(option => `<option value="${option}">${option}</option>`).join('') || ''}
            </select>`
          : `<input
              type="${field.type}"
              id="${field.id}"
              name="${field.id}"
              value={formData.${field.id} || ''}
              onChange={handleInputChange}
              placeholder="${field.placeholder || ''}"
              ${field.required ? 'required' : ''}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />`
        }
      </div>`).join('') || ''}
      
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '12px 24px',
          background: '${styling?.theme?.colors?.primary || '#f97316'}',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default OpenLoveableForm;`;

      default:
        return '';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Embed Code</h2>
              <p className="text-sm text-gray-600">Copy and paste this code into your website</p>
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

          {/* Embed Type Selector */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setEmbedType('script')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  embedType === 'script'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setEmbedType('iframe')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  embedType === 'iframe'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                iFrame
              </button>
              <button
                onClick={() => setEmbedType('react')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  embedType === 'react'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                React Component
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              {embedType === 'script' && 'JavaScript Embed'}
              {embedType === 'iframe' && 'iFrame Embed'}
              {embedType === 'react' && 'React Component'}
            </h3>
            <p className="text-sm text-blue-800">
              {embedType === 'script' && 'Copy and paste this code where you want the form to appear on your website. The form will automatically match your site\'s styling.'}
              {embedType === 'iframe' && 'Use this iFrame to embed the form. This method provides the most isolation but may require additional styling.'}
              {embedType === 'react' && 'Use this React component in your React application. Make sure to install the required dependencies.'}
            </p>
          </div>

          {/* Code Display */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {embedType === 'script' && 'HTML + JavaScript'}
                {embedType === 'iframe' && 'HTML'}
                {embedType === 'react' && 'React JSX'}
              </span>
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className={copied ? 'bg-green-50 border-green-300 text-green-700' : ''}
              >
                {copied ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Code
                  </div>
                )}
              </Button>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={embedType === 'script' ? 'html' : embedType === 'react' ? 'jsx' : 'html'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  maxHeight: '500px',
                  overflow: 'auto'
                }}
                showLineNumbers={true}
              >
                {generateEmbedCode()}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Form Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Form ID:</span> {formId}
              </div>
              <div>
                <span className="font-medium">Fields:</span> {formSchema.fields?.length || 0}
              </div>
              <div>
                <span className="font-medium">Submission URL:</span> {baseUrl}/api/submit-form
              </div>
              <div>
                <span className="font-medium">Form Type:</span> {embedType.charAt(0).toUpperCase() + embedType.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}