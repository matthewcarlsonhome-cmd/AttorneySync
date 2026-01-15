import React, { useState, useEffect } from 'react';
import { workflows, categories } from './workflows/index.js';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers,
  Target, ChevronRight, Copy, Check, Loader2, ArrowLeft, Sparkles,
  Phone, TrendingUp, ClipboardList, Mail, Star, PieChart, CheckSquare,
  Download, Upload, Key, Database, Globe, Save, X, Menu, AlertCircle,
  Linkedin, ExternalLink, RefreshCw, Clock, Zap, Shield, Info, Code,
  ChevronDown, ChevronUp, FileDown
} from 'lucide-react';

// Icon mapping
const iconMap = {
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers,
  Target, Phone, TrendingUp, ClipboardList, Mail, Star, PieChart,
  CheckSquare, Linkedin
};

// Model providers and their available models with token limits
const MODEL_PROVIDERS = {
  anthropic: {
    name: 'Claude (Anthropic)',
    icon: '🟠',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast & capable', contextLimit: 200000, maxOutput: 8192 },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most powerful', contextLimit: 200000, maxOutput: 8192 },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Previous gen', contextLimit: 200000, maxOutput: 8192 },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Previous gen', contextLimit: 200000, maxOutput: 4096 }
    ],
    apiKeyPlaceholder: 'sk-ant-api03-...',
    apiKeyHelp: 'console.anthropic.com'
  },
  openai: {
    name: 'ChatGPT (OpenAI)',
    icon: '🟢',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest multimodal', contextLimit: 128000, maxOutput: 16384 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & affordable', contextLimit: 128000, maxOutput: 16384 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High capability', contextLimit: 128000, maxOutput: 4096 },
      { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4', contextLimit: 8192, maxOutput: 4096 }
    ],
    apiKeyPlaceholder: 'sk-...',
    apiKeyHelp: 'platform.openai.com'
  },
  google: {
    name: 'Gemini (Google)',
    icon: '🔵',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable', contextLimit: 2000000, maxOutput: 8192 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast & efficient', contextLimit: 1000000, maxOutput: 8192 },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Balanced', contextLimit: 32000, maxOutput: 2048 }
    ],
    apiKeyPlaceholder: 'AIza...',
    apiKeyHelp: 'aistudio.google.com'
  }
};

// Get current model config
function getModelConfig(provider, modelId) {
  const providerConfig = MODEL_PROVIDERS[provider];
  if (!providerConfig) return { contextLimit: 8192, maxOutput: 4096 };
  const model = providerConfig.models.find(m => m.id === modelId);
  return model || { contextLimit: 8192, maxOutput: 4096 };
}

// Estimate token count (rough: ~4 chars per token for English)
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Local storage keys
const STORAGE_KEYS = {
  SETTINGS: 'attorneysync_settings',
  HISTORY: 'attorneysync_history'
};

// Default settings structure
const defaultSettings = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKeys: {
    anthropic: '',
    openai: '',
    google: ''
  },
  wordpressUrl: '',
  wordpressUsername: '',
  wordpressAppPassword: '',
  defaultClientName: '',
  defaultLocation: ''
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

function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
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
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.anthropicApiKey && !parsed.apiKeys) {
          parsed.apiKeys = {
            anthropic: parsed.anthropicApiKey,
            openai: '',
            google: ''
          };
          delete parsed.anthropicApiKey;
        }
        setSettings({ ...defaultSettings, ...parsed });
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

  // Get current API key
  const getCurrentApiKey = () => settings.apiKeys?.[settings.provider] || '';

  // Handle workflow selection
  const selectWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
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
    setShowSystemPrompt(false);
    setCurrentView('workflow');
  };

  // Handle form input changes
  const handleInputChange = (inputId, value) => {
    setFormData(prev => ({ ...prev, [inputId]: value }));
  };

  // API call based on provider
  const callAPI = async (systemPrompt, userMessage) => {
    const apiKey = getCurrentApiKey();
    const modelConfig = getModelConfig(settings.provider, settings.model);
    const maxTokens = modelConfig.maxOutput;

    // Check if prompt might be too large for the model
    const totalInputTokens = estimateTokens(systemPrompt) + estimateTokens(userMessage);
    if (totalInputTokens > modelConfig.contextLimit * 0.8) {
      throw new Error(`Input too large for ${settings.model}. Estimated ${totalInputTokens.toLocaleString()} tokens, limit is ${modelConfig.contextLimit.toLocaleString()}. Try a model with higher context limit.`);
    }

    if (settings.provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: settings.model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }
      const data = await response.json();
      return data.content[0].text;
    }

    else if (settings.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    }

    else if (settings.provider === 'google') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
          generationConfig: { maxOutputTokens: maxTokens }
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiKey = getCurrentApiKey();

    if (!apiKey) {
      setError(`API key not configured. Please go to Settings and add your ${MODEL_PROVIDERS[settings.provider].name} API key.`);
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);
    setRawOutput('');

    try {
      const userMessage = buildUserMessage(selectedWorkflow, formData);
      const content = await callAPI(selectedWorkflow.systemPrompt, userMessage);
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

  // Download all output as markdown
  const downloadAllOutput = () => {
    if (!output || !selectedWorkflow) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const clientName = formData.client_name || 'output';
    let content = `# ${selectedWorkflow.name}\n\nGenerated: ${dateStr}\n\n---\n\n`;

    selectedWorkflow.outputSections.forEach(section => {
      const sectionContent = output[section.id];
      if (sectionContent) {
        content += `## ${section.label}\n\n${sectionContent}\n\n---\n\n`;
      }
    });

    downloadMarkdown(content, `${clientName}_${selectedWorkflow.id}_${dateStr}.md`);
  };

  // Download Google Ads CSVs
  const handleDownloadGoogleAdsCSVs = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const clientName = formData.client_name || 'campaign';

    if (output?.csv_data) {
      downloadCSV(output.csv_data, `${clientName}_google_ads_full_${dateStr}.csv`);
    }

    if (output?.campaign_name) {
      const campaignCSV = `Campaign Name,Campaign Type,Budget,Bid Strategy,Location Target
"${output.campaign_name}","Search","${formData.monthly_budget || ''}","Maximize Conversions","${formData.target_location || ''}"`;
      downloadCSV(campaignCSV, `${clientName}_campaigns_${dateStr}.csv`);
    }

    if (output?.ad_groups) {
      const adGroupLines = output.ad_groups.split('\n').filter(line => line.includes('Ad Group'));
      if (adGroupLines.length > 0) {
        let adGroupCSV = 'Campaign,Ad Group,Default Max CPC\n';
        adGroupLines.forEach(line => {
          const match = line.match(/Ad Group[:\s]*(.+)/i);
          if (match) {
            adGroupCSV += `"${output.campaign_name}","${match[1].trim()}","$2.00"\n`;
          }
        });
        downloadCSV(adGroupCSV, `${clientName}_ad_groups_${dateStr}.csv`);
      }
    }

    if (output?.negative_keywords) {
      const negKeywords = output.negative_keywords.split('\n').filter(Boolean);
      let negKeywordCSV = 'Campaign,Negative Keyword,Match Type\n';
      negKeywords.forEach(kw => {
        const cleaned = kw.replace(/^[-•*]\s*/, '').trim();
        if (cleaned) {
          negKeywordCSV += `"${output.campaign_name || ''}","${cleaned}","Broad"\n`;
        }
      });
      downloadCSV(negKeywordCSV, `${clientName}_negative_keywords_${dateStr}.csv`);
    }

    if (output?.extensions) {
      let extensionsCSV = 'Campaign,Extension Type,Extension Text,Final URL\n';
      const extLines = output.extensions.split('\n').filter(Boolean);
      extLines.forEach(line => {
        const cleaned = line.replace(/^[-•*]\s*/, '').trim();
        if (cleaned && cleaned.length > 2) {
          extensionsCSV += `"${output.campaign_name || ''}","Sitelink","${cleaned}","${formData.website_url || ''}"\n`;
        }
      });
      downloadCSV(extensionsCSV, `${clientName}_extensions_${dateStr}.csv`);
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
        status: 'draft',
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
  const renderSettings = () => {
    const currentProvider = MODEL_PROVIDERS[settings.provider];

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <Settings className="w-5 h-5 text-slate-600" />
            <h1 className="font-semibold text-slate-900">Settings</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Model Provider Selection */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-slate-900 text-sm">AI Model Configuration</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(MODEL_PROVIDERS).map(([key, provider]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSettings({
                          ...settings,
                          provider: key,
                          model: provider.models[0].id
                        });
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        settings.provider === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{provider.icon}</div>
                      <div className="text-sm font-medium text-slate-900">{provider.name.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="input bg-white cursor-pointer"
                >
                  {currentProvider.models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description} ({(model.contextLimit / 1000).toFixed(0)}K context)
                    </option>
                  ))}
                </select>
                {(() => {
                  const currentModel = currentProvider.models.find(m => m.id === settings.model);
                  if (currentModel) {
                    return (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Context Window:</span>
                          <span className="font-medium">{currentModel.contextLimit.toLocaleString()} tokens</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Max Output:</span>
                          <span className="font-medium">{currentModel.maxOutput.toLocaleString()} tokens</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {currentProvider.name} API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKeys?.[settings.provider] || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, [settings.provider]: e.target.value }
                  })}
                  placeholder={currentProvider.apiKeyPlaceholder}
                  className="input font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your API key from {currentProvider.apiKeyHelp}
                </p>
              </div>
            </div>
          </div>

          {/* WordPress Integration */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-green-50 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="font-medium text-slate-900 text-sm">WordPress Integration</span>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="url"
                value={settings.wordpressUrl}
                onChange={(e) => setSettings({ ...settings, wordpressUrl: e.target.value })}
                placeholder="https://your-site.com"
                className="input text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={settings.wordpressUsername}
                  onChange={(e) => setSettings({ ...settings, wordpressUsername: e.target.value })}
                  placeholder="Username"
                  className="input text-sm"
                />
                <input
                  type="password"
                  value={settings.wordpressAppPassword}
                  onChange={(e) => setSettings({ ...settings, wordpressAppPassword: e.target.value })}
                  placeholder="App Password"
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Default Values */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-purple-50 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-slate-900 text-sm">Default Values</span>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={settings.defaultClientName}
                onChange={(e) => setSettings({ ...settings, defaultClientName: e.target.value })}
                placeholder="Default Client Name"
                className="input text-sm"
              />
              <input
                type="text"
                value={settings.defaultLocation}
                onChange={(e) => setSettings({ ...settings, defaultLocation: e.target.value })}
                placeholder="Default Location"
                className="input text-sm"
              />
            </div>
          </div>

          <button onClick={saveSettings} className="w-full py-3 btn btn-primary rounded-xl">
            {settingsSaved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
          </button>
        </main>
      </div>
    );
  };

  // Render Dashboard
  const renderDashboard = () => {
    const groupedWorkflows = {};
    workflows.forEach(w => {
      if (!groupedWorkflows[w.category]) groupedWorkflows[w.category] = [];
      groupedWorkflows[w.category].push(w);
    });

    const hasApiKey = !!getCurrentApiKey();
    const totalWorkflows = workflows.length;
    const currentProvider = MODEL_PROVIDERS[settings.provider];

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-900">Attorney Sync AI</span>
              <span className="text-xs text-slate-400 hidden sm:inline">| {totalWorkflows} Workflows</span>
            </div>
            <div className="flex items-center gap-2">
              {hasApiKey && (
                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                  {currentProvider.icon} {settings.model.split('-').slice(0, 2).join(' ')}
                </span>
              )}
              <button onClick={() => setCurrentView('settings')} className="p-2 hover:bg-slate-100 rounded-lg">
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-4">
          {!hasApiKey && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-3 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-800">
                Configure your API key in{' '}
                <button onClick={() => setCurrentView('settings')} className="underline font-medium">Settings</button>
              </span>
            </div>
          )}

          {/* Compact Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">AI-Powered Legal Marketing</h2>
                <p className="text-blue-100 text-sm">{totalWorkflows} workflows for content, ads & operations</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-white/20 rounded">{totalWorkflows} Workflows</span>
                <span className="px-2 py-1 bg-white/20 rounded">{Object.keys(categories).length} Categories</span>
              </div>
            </div>
          </div>

          {/* Workflow Categories with Full Descriptions */}
          <div className="space-y-6">
            {Object.entries(groupedWorkflows).map(([categoryId, categoryWorkflows]) => {
              const category = categories[categoryId];
              const Icon = iconMap[category.icon] || FileText;
              return (
                <div key={categoryId}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" style={{ color: category.color }} />
                    <span className="text-sm font-semibold text-slate-700">{category.name}</span>
                    <span className="text-xs text-slate-400">({categoryWorkflows.length})</span>
                  </div>

                  {/* Workflow Cards with Full Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryWorkflows.map(workflow => {
                      const WIcon = iconMap[workflow.icon] || FileText;
                      return (
                        <button
                          key={workflow.id}
                          onClick={() => selectWorkflow(workflow)}
                          disabled={!hasApiKey}
                          className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: workflow.color + '15' }}
                            >
                              <WIcon className="w-5 h-5" style={{ color: workflow.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                                {workflow.name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {workflow.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-slate-400">
                                  {workflow.inputs.length} inputs
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-400">
                                  {workflow.outputSections.length} outputs
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">Attorney Sync AI · Powered by {currentProvider.name}</p>
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
    const isGoogleAds = selectedWorkflow.id === 'google-ads-campaign-builder';
    const currentProvider = MODEL_PROVIDERS[settings.provider];

    // Generate input summary
    const requiredInputs = selectedWorkflow.inputs.filter(i => i.required);
    const optionalInputs = selectedWorkflow.inputs.filter(i => !i.required);

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
            <button onClick={() => { setCurrentView('dashboard'); setOutput(null); }} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4 text-slate-500" />
            </button>
            <Icon className="w-5 h-5" style={{ color: selectedWorkflow.color }} />
            <span className="font-semibold text-slate-900 truncate">{selectedWorkflow.name}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">· {categories[selectedWorkflow.category].name}</span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-4">
          {/* Workflow Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: selectedWorkflow.color + '15' }}
              >
                <Icon className="w-6 h-6" style={{ color: selectedWorkflow.color }} />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900">{selectedWorkflow.name}</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedWorkflow.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Required Inputs */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" /> Required Inputs ({requiredInputs.length})
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {requiredInputs.map(input => (
                        <li key={input.id} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-blue-500 rounded-full" />
                          {input.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outputs */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Generated Outputs ({selectedWorkflow.outputSections.length})
                    </h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      {selectedWorkflow.outputSections.slice(0, 5).map(section => (
                        <li key={section.id} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-green-500 rounded-full" />
                          {section.label}
                        </li>
                      ))}
                      {selectedWorkflow.outputSections.length > 5 && (
                        <li className="text-green-600">+{selectedWorkflow.outputSections.length - 5} more...</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Prompt Section */}
          {(() => {
            const modelConfig = getModelConfig(settings.provider, settings.model);
            const promptTokens = estimateTokens(selectedWorkflow.systemPrompt);
            const isOverLimit = promptTokens > modelConfig.contextLimit * 0.5;

            return (
              <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
                <button
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">System Prompt</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${isOverLimit ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      ~{promptTokens.toLocaleString()} tokens
                    </span>
                    {isOverLimit && (
                      <span className="text-xs text-amber-600">
                        (Large for {settings.model.split('-').slice(0,2).join(' ')})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(selectedWorkflow.systemPrompt, 'system-prompt'); }}
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                      title="Copy system prompt"
                    >
                      {copiedId === 'system-prompt' ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {showSystemPrompt ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>
                {showSystemPrompt && (
                  <div className="px-4 pb-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Model: {settings.model} (Context: {modelConfig.contextLimit.toLocaleString()}, Output: {modelConfig.maxOutput.toLocaleString()})</span>
                    </div>
                    <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-64">
                      {selectedWorkflow.systemPrompt}
                    </pre>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Form */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">Inputs</span>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {selectedWorkflow.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {input.label}{input.required && <span className="text-red-500">*</span>}
                    </label>

                    {input.type === 'text' && (
                      <input
                        type="text"
                        value={formData[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                        required={input.required}
                        className="input text-sm py-2"
                      />
                    )}

                    {input.type === 'textarea' && (
                      <textarea
                        value={formData[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                        required={input.required}
                        rows={input.rows || 3}
                        className="input text-sm py-2 resize-none"
                      />
                    )}

                    {input.type === 'select' && (
                      <select
                        value={formData[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        required={input.required}
                        className="input text-sm py-2 bg-white"
                      >
                        <option value="">Select...</option>
                        {input.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {input.type === 'multiselect' && (
                      <div className="flex flex-wrap gap-1.5">
                        {input.options.map(opt => {
                          const selected = (formData[input.id] || []).includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const current = formData[input.id] || [];
                                handleInputChange(input.id, selected ? current.filter(v => v !== opt) : [...current, opt]);
                              }}
                              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                selected ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
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
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-600">Yes</span>
                      </label>
                    )}
                  </div>
                ))}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-2.5 btn btn-primary rounded-lg text-sm">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate with {currentProvider.icon}</>
                  )}
                </button>
              </form>
            </div>

            {/* Output Display */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Output</span>
                {output && (
                  <div className="flex items-center gap-1">
                    {/* Universal Download Button */}
                    <button
                      onClick={downloadAllOutput}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 flex items-center gap-1"
                      title="Download all output as Markdown"
                    >
                      <FileDown className="w-3 h-3" /> Download
                    </button>
                    {isGoogleAds && (
                      <button
                        onClick={handleDownloadGoogleAdsCSVs}
                        className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> CSVs
                      </button>
                    )}
                    {showWordPressButton && output.article && (
                      <button
                        onClick={publishToWordPress}
                        disabled={publishingToWP}
                        className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center gap-1 disabled:opacity-50"
                      >
                        {publishingToWP ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} WP
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 min-h-[400px]">
                {wpPublishResult && (
                  <div className={`p-2 rounded-lg mb-3 text-xs flex items-center gap-2 ${
                    wpPublishResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {wpPublishResult.success ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {wpPublishResult.message}
                  </div>
                )}

                {!output && !loading && (
                  <div className="flex items-center justify-center h-[300px] text-slate-400">
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Fill inputs and generate</p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                      <p className="text-sm text-slate-600">Generating with {currentProvider.name}...</p>
                    </div>
                  </div>
                )}

                {output && (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {selectedWorkflow.outputSections.map(section => {
                      const content = output[section.id];
                      if (!content) return null;
                      return (
                        <div key={section.id} className="pb-3 border-b border-slate-100 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-700">{section.label}</span>
                            <button
                              onClick={() => copyToClipboard(content, section.id)}
                              className="p-1 hover:bg-slate-100 rounded"
                            >
                              {copiedId === section.id ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-slate-600">
                            {section.format === 'code' ? (
                              <pre className="bg-slate-900 text-slate-100 p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                {content}
                              </pre>
                            ) : section.format === 'list' ? (
                              <ul className="space-y-1">
                                {content.split('\n').filter(Boolean).map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>{item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : section.format === 'tags' ? (
                              <div className="flex flex-wrap gap-1">
                                {content.split(',').map((tag, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : section.format === 'markdown' ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{content}</ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap bg-slate-50 p-2 rounded">{content}</div>
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
