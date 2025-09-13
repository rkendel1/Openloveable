'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FormBuilder from '@/components/FormBuilder';
import FormPreview from '@/components/FormPreview';
import EmbedCodeGenerator from '@/components/EmbedCodeGenerator';

export default function FormBuilderPage() {
  const [currentView, setCurrentView] = useState<'builder' | 'preview' | 'embed'>('builder');
  const [currentFormData, setCurrentFormData] = useState<any>(null);

  const handleFormGenerated = (formData: any) => {
    setCurrentFormData(formData);
    setCurrentView('preview');
  };

  const handleGetEmbedCode = () => {
    setCurrentView('embed');
  };

  const handleBackToPreview = () => {
    setCurrentView('preview');
  };

  const handleStartOver = () => {
    setCurrentFormData(null);
    setCurrentView('builder');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img
                src="/firecrawl-logo-with-fire.webp"
                alt="Firecrawl"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900">AI Form Builder</h1>
            </div>
            <div className="flex items-center gap-3">
              {currentFormData && (
                <Button
                  variant="outline"
                  onClick={handleStartOver}
                  size="sm"
                >
                  Start Over
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                size="sm"
              >
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'builder' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your AI-Generated Form
              </h2>
              <p className="text-lg text-gray-600">
                Our AI will analyze your website and create a perfectly matched form with just a few questions.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <FormBuilder
                onFormGenerated={handleFormGenerated}
                onClose={() => {}} // No close action needed on dedicated page
              />
            </div>
          </div>
        )}

        {currentView === 'preview' && currentFormData && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Form Preview
              </h2>
              <p className="text-lg text-gray-600">
                Test your form and get the embed code when you're satisfied.
              </p>
            </div>
            
            <FormPreview
              formData={currentFormData}
              onClose={() => {}} // No close action needed on dedicated page
              onGetEmbedCode={handleGetEmbedCode}
            />
          </div>
        )}

        {currentView === 'embed' && currentFormData && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Embed Your Form
              </h2>
              <p className="text-lg text-gray-600">
                Copy the code below and paste it into your website.
              </p>
            </div>
            
            <EmbedCodeGenerator
              formData={currentFormData}
              onClose={handleBackToPreview}
            />
          </div>
        )}
      </div>

      {/* Features Section - Show only on builder view */}
      {currentView === 'builder' && !currentFormData && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Use Our AI Form Builder?
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Design Matching</h4>
                <p className="text-gray-600">Automatically matches your website's colors, fonts, and design language</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Smart Fields</h4>
                <p className="text-gray-600">AI selects the perfect form fields based on your form's purpose</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Easy Embed</h4>
                <p className="text-gray-600">One-line script that works on any website or platform</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Auto-Submit</h4>
                <p className="text-gray-600">Connect to email, Slack, webhooks, or n8n workflows automatically</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}