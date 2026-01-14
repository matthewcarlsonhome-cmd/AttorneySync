import React, { useState, useEffect } from 'react';
import { workflows, categories, proposalMapping } from './workflows/index.js';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers, 
  Target, ChevronRight, Copy, Check, Loader2, ArrowLeft, Sparkles,
  Phone, TrendingUp, ClipboardList, Mail, Star, PieChart, CheckSquare,
  Download, Upload, Key, Database, Globe, Save, X, Menu, AlertCircle,
  Linkedin, ExternalLink, RefreshCw
} from 'lucide-react';

// Icon mapping
const iconMap = { 
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers, 
  Target, Phone, TrendingUp, ClipboardList, Mail, Star, PieChart, 
  CheckSquare, Linkedin 
};

// Local storage keys
const STORAGE_KEYS = {
  SETTINGS: 'attorneysync_settings',
  HISTORY: 'attorneysync_history'
};

// Default settings structure
const defaultSettings = {
  anthropicApiKey: '',
  wordpressUrl: '',
  wordpressUsername: '',
  wordpressAppPassword: '',
  defaultClientName: '',
  defaultLocation: '',
  companyName: 'Attorney Sync',
  theme: 'light'
};

// Parse XML output from Claude
function parseXMLOutput(text, sections) {
  const result = {};
  sections.forEach(section => {
    const regex = new RegExp(`<${section.id}>([\\s\\S]*?)<\\/${section.id}>`, 'i');
    const match = text.match(regex);
    result[section.id] = match ? match[1].trim() : '';
  });
  return result;
}

// Build user message from inputs
function buildUserMessage(workflow, formData) {
  let message = `Please generate the requested output for the following:\n\n`;
  workflow.inputs.forEach(input => {
    const value = formData[input.id];
    if (value !== undefined && value !== '' && value !== null) {
      if (Array.isArray(value)) {
        message += `**${input.label}:** ${value.join(', ')}\n`;
      } else if (typeof value === 'boolean') {
        message += `**${input.label}:** ${value ? 'Yes' : 'No'}\n`;
      } else {
        message += `**${input.label}:** ${value}\n`;
      }
    }
  });
  return message;
}

// Download helpers
function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [formData, setFormData] = useState({});
  const [output, setOutput] = useState(null);
  const [rawOutput, setRawOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [publishingToWP, setPublishingToWP] = useState(false);
  const [wpPublishResult, setWpPublishResult] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Handle workflow selection
  const selectWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    // Pre-fill with default values from settings
    const initialData = {};
    workflow.inputs.forEach(input => {
      if (input.id === 'client_name' && settings.defaultClientName) {
        initialData[input.id] = settings.defaultClientName;
      } else if ((input.id === 'target_location' || input.id === 'location') && settings.defaultLocation) {
        initialData[input.id] = settings.defaultLocation;
      } else if (input.default !== undefined) {
        initialData[input.id] = input.default;
      }
    });
    setFormData(initialData);
    setOutput(null);
    setRawOutput('');
    setError(null);
    setWpPublishResult(null);
    setCurrentView('workflow');
  };

  // Handle form input changes
  const handleInputChange = (inputId, value) => {
    setFormData(prev => ({ ...prev, [inputId]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!settings.anthropicApiKey) {
      setError('API key not configured. Please go to Settings and add your Anthropic API key.');
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);
    setRawOutput('');

    try {
      const userMessage = buildUserMessage(selectedWorkflow, formData);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          system: selectedWorkflow.systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      setRawOutput(content);
      const parsed = parseXMLOutput(content, selectedWorkflow.outputSections);
      setOutput(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download CSV for Google Ads
  const handleDownloadCSV = () => {
    if (output?.csv_data) {
      const filename = `${formData.client_name || 'campaign'}_google_ads_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(output.csv_data, filename);
    }
  };

  // Publish to WordPress
  const publishToWordPress = async () => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
      setWpPublishResult({ success: false, message: 'WordPress credentials not configured. Go to Settings.' });
      return;
    }

    if (!output?.article) {
      setWpPublishResult({ success: false, message: 'No article content to publish.' });
      return;
    }

    setPublishingToWP(true);
    setWpPublishResult(null);

    try {
      const wpUrl = settings.wordpressUrl.replace(/\/$/, '');
      const auth = btoa(`${settings.wordpressUsername}:${settings.wordpressAppPassword}`);

      const postData = {
        title: formData.headline || output.meta_title || 'Untitled Post',
        content: output.article,
        status: 'draft', // Always create as draft for review
        excerpt: output.meta_description || '',
      };

      const response = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `WordPress API Error: ${response.status}`);
      }

      const result = await response.json();
      setWpPublishResult({
        success: true,
        message: `Draft created successfully!`,
        postId: result.id,
        editUrl: result.link?.replace(/\/$/, '') + '?preview=true'
      });
    } catch (err) {
      setWpPublishResult({ success: false, message: err.message });
    } finally {
      setPublishingToWP(false);
    }
  };

  // Render Settings Page
  const renderSettings = () => (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <Settings className="w-6 h-6 text-slate-700" />
          <h1 className="font-bold text-slate-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* API Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">API Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Anthropic API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={settings.anthropicApiKey}
                  onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* WordPress Integration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-slate-900">WordPress Integration</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Connect to publish articles directly to client WordPress sites as drafts.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WordPress Site URL</label>
                <input
                  type="url"
                  value={settings.wordpressUrl}
                  onChange={(e) => setSettings({ ...settings, wordpressUrl: e.target.value })}
                  placeholder="https://client-site.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={settings.wordpressUsername}
                    onChange={(e) => setSettings({ ...settings, wordpressUsername: e.target.value })}
                    placeholder="admin"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Application Password</label>
                  <input
                    type="password"
                    value={settings.wordpressAppPassword}
                    onChange={(e) => setSettings({ ...settings, wordpressAppPassword: e.target.value })}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Generate an Application Password in WordPress: Users → Profile → Application Passwords
              </p>
            </div>
          </div>

          {/* Default Values */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-purple-600" />
              <h2 className="font-semibold text-slate-900">Default Values</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Pre-fill common fields to save time.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Client Name</label>
                <input
                  type="text"
                  value={settings.defaultClientName}
                  onChange={(e) => setSettings({ ...settings, defaultClientName: e.target.value })}
                  placeholder="Martinez & Associates"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Location</label>
                <input
                  type="text"
                  value={settings.defaultLocation}
                  onChange={(e) => setSettings({ ...settings, defaultLocation: e.target.value })}
                  placeholder="Phoenix, Arizona"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {settingsSaved ? (
              <><Check className="w-5 h-5" /> Settings Saved!</>
            ) : (
              <><Save className="w-5 h-5" /> Save Settings</>
            )}
          </button>
        </div>
      </main>
    </div>
  );

  // Render Dashboard
  const renderDashboard = () => {
    const groupedWorkflows = {};
    workflows.forEach(w => {
      if (!groupedWorkflows[w.category]) groupedWorkflows[w.category] = [];
      groupedWorkflows[w.category].push(w);
    });

    const hasApiKey = !!settings.anthropicApiKey;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Attorney Sync AI</h1>
                  <p className="text-xs text-slate-500">Workflow Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 hidden md:block">{workflows.length} Workflows</span>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* API Key Warning */}
          {!hasApiKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">API Key Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please configure your Anthropic API key in{' '}
                  <button onClick={() => setCurrentView('settings')} className="underline font-medium">
                    Settings
                  </button>{' '}
                  to use the workflows.
                </p>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Attorney Sync AI Workflow Platform</h2>
            <p className="text-blue-100 max-w-2xl">
              All 12 workflows from your proposal, ready to use. Select a workflow to generate content, 
              analyze data, or streamline operations. Powered by Claude AI.
            </p>
          </div>

          {/* Proposal Reference Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">Proposal Workflow Mapping</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(proposalMapping).map(([ref, ids]) => (
                <div key={ref} className="bg-slate-50 rounded-lg p-2">
                  <span className="font-medium text-slate-700">{ref}:</span>
                  <span className="text-slate-500 ml-1">{ids.length} workflow{ids.length > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Categories */}
          {Object.entries(groupedWorkflows).map(([categoryId, categoryWorkflows]) => {
            const category = categories[categoryId];
            const Icon = iconMap[category.icon] || FileText;
            return (
              <div key={categoryId} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color + '20' }}>
                    <Icon className="w-4 h-4" style={{ color: category.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                  <span className="text-sm text-slate-400">({categoryWorkflows.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryWorkflows.map(workflow => {
                    const WIcon = iconMap[workflow.icon] || FileText;
                    return (
                      <button
                        key={workflow.id}
                        onClick={() => selectWorkflow(workflow)}
                        disabled={!hasApiKey}
                        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: workflow.color + '15' }}>
                            <WIcon className="w-5 h-5" style={{ color: workflow.color }} />
                          </div>
                          <div className="flex items-center gap-2">
                            {workflow.proposalRef && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {workflow.proposalRef}
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">{workflow.name}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2">{workflow.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-slate-400">~{workflow.estimatedTime}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  };

  // Render Workflow Page
  const renderWorkflowPage = () => {
    if (!selectedWorkflow) return null;
    const Icon = iconMap[selectedWorkflow.icon] || FileText;
    const showWordPressButton = selectedWorkflow.outputActions?.includes('publish_wordpress');
    const showCSVDownload = selectedWorkflow.outputActions?.includes('download_csv');

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <button 
                onClick={() => { setCurrentView('dashboard'); setOutput(null); }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedWorkflow.color + '15' }}>
                <Icon className="w-5 h-5" style={{ color: selectedWorkflow.color }} />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-slate-900">{selectedWorkflow.name}</h1>
                <p className="text-xs text-slate-500">{categories[selectedWorkflow.category].name} • {selectedWorkflow.proposalRef}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Inputs</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {selectedWorkflow.inputs.map(input => (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {input.label}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {input.type === 'text' && (
                        <input
                          type="text"
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          required={input.required}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      )}
                      
                      {input.type === 'textarea' && (
                        <textarea
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          required={input.required}
                          rows={input.rows || 4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        />
                      )}
                      
                      {input.type === 'select' && (
                        <select
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          required={input.required}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="">Select...</option>
                          {input.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      
                      {input.type === 'multiselect' && (
                        <div className="flex flex-wrap gap-2">
                          {input.options.map(opt => {
                            const selected = (formData[input.id] || []).includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  const current = formData[input.id] || [];
                                  if (selected) {
                                    handleInputChange(input.id, current.filter(v => v !== opt));
                                  } else {
                                    handleInputChange(input.id, [...current, opt]);
                                  }
                                }}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                  selected 
                                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      
                      {input.type === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[input.id] ?? input.default ?? false}
                            onChange={(e) => handleInputChange(input.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-600">Yes</span>
                        </label>
                      )}
                      
                      {input.helpText && (
                        <p className="text-xs text-slate-500 mt-1">{input.helpText}</p>
                      )}
                    </div>
                  ))}
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Generate Output</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Output Display */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Output</h2>
                  {output && (
                    <div className="flex items-center gap-2">
                      {showCSVDownload && output.csv_data && (
                        <button
                          onClick={handleDownloadCSV}
                          className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" /> CSV
                        </button>
                      )}
                      {showWordPressButton && output.article && (
                        <button
                          onClick={publishToWordPress}
                          disabled={publishingToWP}
                          className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-1 disabled:opacity-50"
                        >
                          {publishingToWP ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> WordPress</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {wpPublishResult && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${
                    wpPublishResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {wpPublishResult.message}
                    {wpPublishResult.editUrl && (
                      <a 
                        href={wpPublishResult.editUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 underline flex items-center gap-1 inline-flex"
                      >
                        View Draft <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {!output && !loading && (
                  <div className="flex items-center justify-center h-64 text-slate-400">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Fill in the inputs and click Generate</p>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 text-blue-500 animate-spin" />
                      <p className="text-slate-500">Generating with Claude AI...</p>
                      <p className="text-xs text-slate-400 mt-1">{selectedWorkflow.estimatedTime}</p>
                    </div>
                  </div>
                )}
                
                {output && (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {selectedWorkflow.outputSections.map(section => {
                      const content = output[section.id];
                      if (!content) return null;
                      return (
                        <div key={section.id} className="border-b border-slate-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-700">{section.label}</h3>
                            <button
                              onClick={() => copyToClipboard(content, section.id)}
                              className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === section.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-slate-600">
                            {section.format === 'code' ? (
                              <pre className="bg-slate-50 p-3 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                                {content}
                              </pre>
                            ) : section.format === 'list' ? (
                              <ul className="list-disc list-inside space-y-1">
                                {content.split('\n').filter(Boolean).map((item, i) => (
                                  <li key={i}>{item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')}</li>
                                ))}
                              </ul>
                            ) : section.format === 'tags' ? (
                              <div className="flex flex-wrap gap-2">
                                {content.split(',').map((tag, i) => (
                                  <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs">
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : section.format === 'markdown' ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{content}</ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap">{content}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Main render
  if (currentView === 'settings') return renderSettings();
  if (currentView === 'workflow') return renderWorkflowPage();
  return renderDashboard();
}
