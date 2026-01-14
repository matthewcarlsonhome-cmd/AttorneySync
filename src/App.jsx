import React, { useState, useEffect } from 'react';
import { workflows, categories, proposalMapping } from './workflows/index.js';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers,
  Target, ChevronRight, Copy, Check, Loader2, ArrowLeft, Sparkles,
  Phone, TrendingUp, ClipboardList, Mail, Star, PieChart, CheckSquare,
  Download, Upload, Key, Database, Globe, Save, X, Menu, AlertCircle,
  Linkedin, ExternalLink, RefreshCw, Clock, Zap, Shield, Info
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Settings</h1>
              <p className="text-xs text-slate-500">Configure your platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          {/* API Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">API Configuration</h2>
                  <p className="text-sm text-slate-500">Connect to Claude AI</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Anthropic API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={settings.anthropicApiKey}
                  onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                  placeholder="sk-ant-api03-..."
                  className="input font-mono text-sm"
                />
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Get your API key from{' '}
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                    console.anthropic.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* WordPress Integration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-500/30">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">WordPress Integration</h2>
                  <p className="text-sm text-slate-500">Publish articles directly to WordPress</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">WordPress Site URL</label>
                <input
                  type="url"
                  value={settings.wordpressUrl}
                  onChange={(e) => setSettings({ ...settings, wordpressUrl: e.target.value })}
                  placeholder="https://client-site.com"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={settings.wordpressUsername}
                    onChange={(e) => setSettings({ ...settings, wordpressUsername: e.target.value })}
                    placeholder="admin"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Application Password</label>
                  <input
                    type="password"
                    value={settings.wordpressAppPassword}
                    onChange={(e) => setSettings({ ...settings, wordpressAppPassword: e.target.value })}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="input"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 flex items-start gap-1.5">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Generate an Application Password in WordPress: Users &rarr; Profile &rarr; Application Passwords
              </p>
            </div>
          </div>

          {/* Default Values */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Default Values</h2>
                  <p className="text-sm text-slate-500">Pre-fill common fields automatically</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default Client Name</label>
                <input
                  type="text"
                  value={settings.defaultClientName}
                  onChange={(e) => setSettings({ ...settings, defaultClientName: e.target.value })}
                  placeholder="Martinez & Associates"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default Location</label>
                <input
                  type="text"
                  value={settings.defaultLocation}
                  onChange={(e) => setSettings({ ...settings, defaultLocation: e.target.value })}
                  placeholder="Phoenix, Arizona"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            className="w-full py-4 btn btn-primary rounded-xl text-base"
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

    // Statistics
    const totalWorkflows = workflows.length;
    const categoryCount = Object.keys(categories).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Attorney Sync AI</h1>
                  <p className="text-xs text-slate-500">Legal Marketing Automation</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-600">{totalWorkflows} Workflows</span>
                </div>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* API Key Warning */}
          {!hasApiKey && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm animate-fadeIn">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">API Key Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please configure your Anthropic API key in{' '}
                  <button onClick={() => setCurrentView('settings')} className="underline font-semibold hover:text-amber-800 transition-colors">
                    Settings
                  </button>{' '}
                  to start using the workflows.
                </p>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-10 mb-10 text-white overflow-hidden shadow-2xl shadow-blue-500/30">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  Powered by Claude AI
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                AI-Powered Legal Marketing
              </h2>
              <p className="text-blue-100 max-w-2xl text-lg leading-relaxed">
                {totalWorkflows} professional workflows designed specifically for law firm marketing.
                Generate content, analyze markets, build campaigns, and streamline operations.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{totalWorkflows} Workflows</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Layers className="w-5 h-5" />
                  <span className="font-medium">{categoryCount} Categories</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">30-120s Generation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Reference Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Proposal Workflow Mapping</h3>
                <p className="text-sm text-slate-500">Quick reference to proposal sections</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(proposalMapping).map(([ref, ids]) => (
                <div key={ref} className="bg-slate-50 hover:bg-slate-100 rounded-xl p-3 transition-colors cursor-default">
                  <span className="font-semibold text-slate-700 text-sm">{ref}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{ids.length} workflow{ids.length > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Categories */}
          <div className="space-y-10">
            {Object.entries(groupedWorkflows).map(([categoryId, categoryWorkflows]) => {
              const category = categories[categoryId];
              const Icon = iconMap[category.icon] || FileText;
              return (
                <div key={categoryId} className="animate-fadeIn">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                      style={{
                        backgroundColor: category.color + '15',
                        boxShadow: `0 4px 14px ${category.color}20`
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                      <p className="text-sm text-slate-500">{category.description}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="badge badge-gray">{categoryWorkflows.length} workflow{categoryWorkflows.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Workflow Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                    {categoryWorkflows.map(workflow => {
                      const WIcon = iconMap[workflow.icon] || FileText;
                      return (
                        <button
                          key={workflow.id}
                          onClick={() => selectWorkflow(workflow)}
                          disabled={!hasApiKey}
                          className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-slate-200"
                          style={{
                            transform: 'translateY(0)',
                          }}
                          onMouseEnter={(e) => { if (hasApiKey) e.currentTarget.style.transform = 'translateY(-4px)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                              style={{ backgroundColor: workflow.color + '12' }}
                            >
                              <WIcon className="w-6 h-6" style={{ color: workflow.color }} />
                            </div>
                            <div className="flex items-center gap-2">
                              {workflow.proposalRef && (
                                <span className="badge badge-gray text-xs">
                                  {workflow.proposalRef}
                                </span>
                              )}
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{workflow.name}</h4>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{workflow.description}</p>
                          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-medium">{workflow.estimatedTime}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Attorney Sync AI &middot; Legal Marketing Automation Platform &middot; Powered by Claude
            </p>
          </footer>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-4">
              <button
                onClick={() => { setCurrentView('dashboard'); setOutput(null); }}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
              </button>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  backgroundColor: selectedWorkflow.color + '15',
                  boxShadow: `0 4px 14px ${selectedWorkflow.color}20`
                }}
              >
                <Icon className="w-6 h-6" style={{ color: selectedWorkflow.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-slate-900 truncate">{selectedWorkflow.name}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{categories[selectedWorkflow.category].name}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="badge badge-gray text-xs py-0">{selectedWorkflow.proposalRef}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Workflow Inputs</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Fill in the details to generate output</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {selectedWorkflow.inputs.map(input => (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
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
                          className="input"
                        />
                      )}

                      {input.type === 'textarea' && (
                        <textarea
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          required={input.required}
                          rows={input.rows || 4}
                          className="input resize-none"
                        />
                      )}

                      {input.type === 'select' && (
                        <select
                          value={formData[input.id] || ''}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          required={input.required}
                          className="input bg-white cursor-pointer"
                        >
                          <option value="">Select an option...</option>
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
                                className={`chip ${selected ? 'chip-selected' : 'chip-default'}`}
                              >
                                {selected && <Check className="w-3.5 h-3.5 -ml-0.5" />}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {input.type === 'checkbox' && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={formData[input.id] ?? input.default ?? false}
                              onChange={(e) => handleInputChange(input.id, e.target.checked)}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all" />
                            <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Yes, include this</span>
                        </label>
                      )}

                      {input.helpText && (
                        <p className="text-sm text-slate-500 mt-2 flex items-start gap-1.5">
                          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                          {input.helpText}
                        </p>
                      )}
                    </div>
                  ))}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 animate-fadeIn">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Error</p>
                        <p className="mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 btn btn-primary rounded-xl text-base"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating with Claude AI...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Generate Output</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Output Display */}
            <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">Generated Output</h2>
                    <p className="text-sm text-slate-500 mt-0.5">AI-generated content ready for use</p>
                  </div>
                  {output && (
                    <div className="flex items-center gap-2">
                      {showCSVDownload && output.csv_data && (
                        <button
                          onClick={handleDownloadCSV}
                          className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2 font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download CSV
                        </button>
                      )}
                      {showWordPressButton && output.article && (
                        <button
                          onClick={publishToWordPress}
                          disabled={publishingToWP}
                          className="px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                        >
                          {publishingToWP ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Publish to WP</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {wpPublishResult && (
                    <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 animate-fadeIn ${
                      wpPublishResult.success
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {wpPublishResult.success ? (
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{wpPublishResult.success ? 'Success!' : 'Error'}</p>
                        <p className="text-sm mt-0.5">{wpPublishResult.message}</p>
                        {wpPublishResult.editUrl && (
                          <a
                            href={wpPublishResult.editUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium mt-2 hover:underline"
                          >
                            View Draft <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {!output && !loading && (
                    <div className="flex items-center justify-center h-[400px] text-slate-400">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-600 mb-1">Ready to Generate</p>
                        <p className="text-sm text-slate-400">Fill in the inputs and click Generate</p>
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                        <p className="text-lg font-medium text-slate-900 mb-1">Generating Content</p>
                        <p className="text-sm text-slate-500">Powered by Claude AI</p>
                        <p className="text-xs text-slate-400 mt-2">Estimated: {selectedWorkflow.estimatedTime}</p>
                      </div>
                    </div>
                  )}

                  {output && (
                    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                      {selectedWorkflow.outputSections.map(section => {
                        const content = output[section.id];
                        if (!content) return null;
                        return (
                          <div key={section.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0 animate-fadeIn">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-slate-800">{section.label}</h3>
                              <button
                                onClick={() => copyToClipboard(content, section.id)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
                                title="Copy to clipboard"
                              >
                                {copiedId === section.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                )}
                              </button>
                            </div>
                            <div className="text-sm text-slate-600">
                              {section.format === 'code' ? (
                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                                  {content}
                                </pre>
                              ) : section.format === 'list' ? (
                                <ul className="space-y-2">
                                  {content.split('\n').filter(Boolean).map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                      <span>{item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : section.format === 'tags' ? (
                                <div className="flex flex-wrap gap-2">
                                  {content.split(',').map((tag, i) => (
                                    <span key={i} className="badge badge-blue">
                                      {tag.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : section.format === 'markdown' ? (
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">{content}</div>
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
