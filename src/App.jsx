import React, { useState, useEffect } from 'react';
import { workflows, categories } from './workflows/index.js';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers,
  Target, ChevronRight, Copy, Check, Loader2, ArrowLeft, Sparkles,
  Phone, TrendingUp, ClipboardList, Mail, Star, PieChart, CheckSquare,
  Download, Upload, Key, Database, Globe, Save, X, Menu, AlertCircle,
  Linkedin, ExternalLink, RefreshCw, Clock, Zap, Shield, Info, Code,
  ChevronDown, ChevronUp, FileDown, Play, Package, CheckCircle, Circle,
  Calendar, CalendarDays
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
  HISTORY: 'attorneysync_history',
  CLIENT_PROFILES: 'attorneysync_client_profiles',
  TEMPLATES: 'attorneysync_templates'
};

// Workflow chains - define which workflows can chain together
const WORKFLOW_CHAINS = {
  'content-strategy-brief': ['seo-blog-article', 'linkedin-content', 'google-ads'],
  'seo-blog-article': ['linkedin-content', 'website-copy', 'email-newsletter'],
  'ppc-landing-page': ['google-ads', 'linkedin-content'],
  'google-ads': ['ppc-landing-page', 'linkedin-content'],
  'linkedin-content': ['seo-blog-article', 'email-newsletter'],
  'case-intake-call': ['client-testimonial', 'content-strategy-brief'],
  'client-testimonial': ['linkedin-content', 'seo-blog-article'],
  'competitor-analysis': ['content-strategy-brief', 'google-ads', 'ppc-landing-page'],
  'email-newsletter': ['linkedin-content', 'seo-blog-article'],
  'website-copy': ['seo-blog-article', 'ppc-landing-page']
};

// Smart workflow suggestions based on category
const WORKFLOW_SUGGESTIONS = {
  'content': ['linkedin-content', 'email-newsletter', 'google-ads'],
  'advertising': ['ppc-landing-page', 'seo-blog-article', 'linkedin-content'],
  'social': ['seo-blog-article', 'email-newsletter', 'content-strategy-brief'],
  'operations': ['content-strategy-brief', 'client-testimonial', 'competitor-analysis']
};

// Campaign presets - predefined workflow bundles
const CAMPAIGN_PRESETS = [
  {
    id: 'full-content',
    name: 'Full Content Campaign',
    description: 'Content brief, blog article, LinkedIn posts, and email campaign',
    icon: 'Package',
    color: '#6366f1',
    workflowIds: ['content-brief-generator', 'article-generator', 'linkedin-content-engine', 'email-marketing-campaign'],
    estimatedTime: '8-12 min'
  },
  {
    id: 'advertising-blitz',
    name: 'Advertising Campaign',
    description: 'Google Ads and Facebook/Instagram social ads',
    icon: 'Target',
    color: '#f59e0b',
    workflowIds: ['google-ads-campaign-builder', 'facebook-instagram-ads'],
    estimatedTime: '6-10 min'
  },
  {
    id: 'social-media',
    name: 'Social Media Bundle',
    description: 'LinkedIn content and Facebook/Instagram ads',
    icon: 'Share2',
    color: '#0ea5e9',
    workflowIds: ['linkedin-content-engine', 'facebook-instagram-ads'],
    estimatedTime: '4-6 min'
  },
  {
    id: 'seo-focused',
    name: 'SEO Content Package',
    description: 'Blog article, website audit, and Google Business Profile',
    icon: 'Search',
    color: '#10b981',
    workflowIds: ['article-generator', 'website-audit', 'google-business-profile'],
    estimatedTime: '6-8 min'
  },
  {
    id: 'client-success',
    name: 'Client Success Story',
    description: 'Case study, review management, and LinkedIn promotion',
    icon: 'Star',
    color: '#8b5cf6',
    workflowIds: ['case-study-generator', 'review-management', 'linkedin-content-engine'],
    estimatedTime: '5-8 min'
  }
];

// Environment variables for default API keys (set in .env file or Netlify)
const ENV_API_KEYS = {
  anthropic: (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim(),
  openai: (import.meta.env.VITE_OPENAI_API_KEY || '').trim(),
  google: (import.meta.env.VITE_GOOGLE_API_KEY || '').trim()
};

// Debug: Log env key status (remove in production)
console.log('ENV Keys Status:', {
  anthropic: ENV_API_KEYS.anthropic ? `${ENV_API_KEYS.anthropic.substring(0, 10)}...` : 'NOT SET',
  openai: ENV_API_KEYS.openai ? `${ENV_API_KEYS.openai.substring(0, 8)}...` : 'NOT SET',
  google: ENV_API_KEYS.google ? `${ENV_API_KEYS.google.substring(0, 8)}...` : 'NOT SET'
});

// Check if any env keys are configured
const hasEnvKeys = Object.values(ENV_API_KEYS).some(key => key.length > 0);

// Default settings structure (uses env vars as fallback)
const defaultSettings = {
  provider: import.meta.env.VITE_DEFAULT_PROVIDER || 'anthropic',
  model: import.meta.env.VITE_DEFAULT_MODEL || 'claude-sonnet-4-20250514',
  apiKeys: {
    anthropic: ENV_API_KEYS.anthropic,
    openai: ENV_API_KEYS.openai,
    google: ENV_API_KEYS.google
  },
  wordpressUrl: '',
  wordpressUsername: '',
  wordpressAppPassword: '',
  defaultClientName: '',
  defaultLocation: ''
};

// Escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Parse XML output from Claude
function parseXMLOutput(text, sections) {
  const result = {};
  (sections || []).forEach(section => {
    const escapedId = escapeRegex(section.id);
    const regex = new RegExp(`<${escapedId}>([\\s\\S]*?)<\\/${escapedId}>`, 'i');
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

// Download helper - consolidated and with proper cleanup
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Clean up to prevent memory leak
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function downloadCSV(content, filename) {
  downloadFile(content, filename, 'text/csv');
}

function downloadText(content, filename) {
  downloadFile(content, filename, 'text/plain');
}

function downloadMarkdown(content, filename) {
  downloadFile(content, filename, 'text/markdown');
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
  const [artifacts, setArtifacts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // New feature states
  const [clientProfiles, setClientProfiles] = useState([]);
  const [selectedClientProfile, setSelectedClientProfile] = useState(null);
  const [templates, setTemplates] = useState({});
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showClientProfileModal, setShowClientProfileModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newClientProfile, setNewClientProfile] = useState({
    name: '',
    practiceAreas: [],
    location: '',
    tone: 'professional',
    competitors: '',
    website: '',
    uniqueValue: ''
  });

  // Campaign Builder states
  const [campaignWorkflows, setCampaignWorkflows] = useState([]);
  const [campaignResults, setCampaignResults] = useState([]);
  const [campaignProgress, setCampaignProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [campaignClientProfile, setCampaignClientProfile] = useState(null);
  const [campaignFormData, setCampaignFormData] = useState({});

  // Content Calendar states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduledPosts, setScheduledPosts] = useState([]);

  // Campaign Wizard states
  const [campaignStep, setCampaignStep] = useState(1); // 1: Select Firm, 2: Select Workflows, 3: Configure Inputs, 4: Review & Run, 5: Results
  const [campaignInputs, setCampaignInputs] = useState({}); // Stores inputs for each workflow by workflow ID
  const [currentConfigWorkflow, setCurrentConfigWorkflow] = useState(0); // Index of workflow being configured

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old single API key format
        if (parsed.anthropicApiKey && !parsed.apiKeys) {
          parsed.apiKeys = {
            anthropic: parsed.anthropicApiKey,
            openai: '',
            google: ''
          };
          delete parsed.anthropicApiKey;
        }
        // Merge with defaults, using env vars as fallback for empty keys
        const mergedApiKeys = {
          anthropic: parsed.apiKeys?.anthropic || ENV_API_KEYS.anthropic,
          openai: parsed.apiKeys?.openai || ENV_API_KEYS.openai,
          google: parsed.apiKeys?.google || ENV_API_KEYS.google
        };
        setSettings({ ...defaultSettings, ...parsed, apiKeys: mergedApiKeys });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    // Load artifacts history
    const savedArtifacts = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedArtifacts) {
      try {
        setArtifacts(JSON.parse(savedArtifacts));
      } catch (e) {
        console.error('Failed to load artifacts:', e);
      }
    }
    // Load client profiles
    const savedProfiles = localStorage.getItem(STORAGE_KEYS.CLIENT_PROFILES);
    if (savedProfiles) {
      try {
        setClientProfiles(JSON.parse(savedProfiles));
      } catch (e) {
        console.error('Failed to load client profiles:', e);
      }
    }
    // Load templates
    const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    }
  }, []);

  // Save artifact to history
  const saveArtifact = (workflow, inputs, outputs, rawContent) => {
    const artifact = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowCategory: workflow.category,
      provider: settings.provider,
      model: settings.model,
      inputs: { ...inputs },
      outputs: { ...outputs },
      rawContent,
      outputSections: workflow.outputSections
    };

    const updated = [artifact, ...artifacts].slice(0, 50); // Keep last 50
    setArtifacts(updated);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return artifact;
  };

  // Delete artifact
  const deleteArtifact = (artifactId) => {
    const updated = artifacts.filter(a => a.id !== artifactId);
    setArtifacts(updated);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    if (selectedArtifact?.id === artifactId) {
      setSelectedArtifact(null);
    }
  };

  // Clear all artifacts
  const clearAllArtifacts = () => {
    setArtifacts([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    setSelectedArtifact(null);
  };

  // Safe localStorage save with quota handling
  const safeLocalStorageSave = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        setError('Storage full. Please clear some history to continue saving.');
        return false;
      }
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  };

  // Client Profile Functions
  const saveClientProfile = (profile) => {
    const newProfile = {
      ...profile,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updated = [...clientProfiles, newProfile];
    setClientProfiles(updated);
    safeLocalStorageSave(STORAGE_KEYS.CLIENT_PROFILES, updated);
    return newProfile;
  };

  const deleteClientProfile = (profileId) => {
    const updated = clientProfiles.filter(p => p.id !== profileId);
    setClientProfiles(updated);
    safeLocalStorageSave(STORAGE_KEYS.CLIENT_PROFILES, updated);
    if (selectedClientProfile?.id === profileId) {
      setSelectedClientProfile(null);
    }
  };

  const applyClientProfile = (profile) => {
    if (!selectedWorkflow || !profile) return;

    const newFormData = { ...formData };
    selectedWorkflow.inputs.forEach(input => {
      if (input.id === 'client_name' && profile.name) {
        newFormData[input.id] = profile.name;
      } else if ((input.id === 'target_location' || input.id === 'location') && profile.location) {
        newFormData[input.id] = profile.location;
      } else if (input.id === 'practice_areas' && profile.practiceAreas?.length) {
        newFormData[input.id] = profile.practiceAreas;
      } else if (input.id === 'website_url' && profile.website) {
        newFormData[input.id] = profile.website;
      } else if (input.id === 'competitors' && profile.competitors) {
        newFormData[input.id] = profile.competitors;
      } else if (input.id === 'tone' && profile.tone) {
        newFormData[input.id] = profile.tone;
      } else if (input.id === 'unique_value' && profile.uniqueValue) {
        newFormData[input.id] = profile.uniqueValue;
      }
    });
    setFormData(newFormData);
    setSelectedClientProfile(profile);
  };

  // Template Functions
  const saveTemplate = (workflowId, name, data) => {
    const workflowTemplates = templates[workflowId] || [];
    const newTemplate = {
      id: Date.now().toString(),
      name,
      data: { ...data },
      createdAt: new Date().toISOString()
    };
    const updated = {
      ...templates,
      [workflowId]: [...workflowTemplates, newTemplate]
    };
    setTemplates(updated);
    safeLocalStorageSave(STORAGE_KEYS.TEMPLATES, updated);
    return newTemplate;
  };

  const deleteTemplate = (workflowId, templateId) => {
    const workflowTemplates = templates[workflowId] || [];
    const updated = {
      ...templates,
      [workflowId]: workflowTemplates.filter(t => t.id !== templateId)
    };
    setTemplates(updated);
    safeLocalStorageSave(STORAGE_KEYS.TEMPLATES, updated);
  };

  const applyTemplate = (template) => {
    if (!template?.data) return;
    setFormData({ ...formData, ...template.data });
  };

  // Workflow Chaining - get suggested next workflows
  const getChainedWorkflows = (workflowId) => {
    const chainIds = WORKFLOW_CHAINS[workflowId] || [];
    return chainIds.map(id => workflows.find(w => w.id === id)).filter(Boolean);
  };

  // Smart Suggestions - get suggested workflows based on category
  const getSuggestedWorkflows = (category) => {
    const suggestionIds = WORKFLOW_SUGGESTIONS[category] || [];
    return suggestionIds.map(id => workflows.find(w => w.id === id)).filter(Boolean);
  };

  // Chain to next workflow with data transfer
  const chainToWorkflow = (nextWorkflow, currentOutput) => {
    const initialData = {};

    // Transfer relevant data from current output to next workflow inputs
    nextWorkflow.inputs.forEach(input => {
      // Carry over client name
      if (input.id === 'client_name' && formData.client_name) {
        initialData[input.id] = formData.client_name;
      }
      // Carry over location
      else if ((input.id === 'target_location' || input.id === 'location') && (formData.target_location || formData.location)) {
        initialData[input.id] = formData.target_location || formData.location;
      }
      // Carry over practice areas
      else if (input.id === 'practice_areas' && formData.practice_areas) {
        initialData[input.id] = formData.practice_areas;
      }
      // Transfer content brief to article topic
      else if (input.id === 'topic' && currentOutput?.topic_suggestions) {
        // Extract first topic from suggestions
        const topics = currentOutput.topic_suggestions.split('\n').filter(t => t.trim());
        if (topics.length > 0) {
          initialData[input.id] = topics[0].replace(/^[\d\.\-\*]+\s*/, '').trim();
        }
      }
      // Transfer article content for social posts
      else if (input.id === 'content_to_repurpose' && currentOutput?.article_body) {
        initialData[input.id] = currentOutput.article_body.substring(0, 2000);
      }
      // Use defaults
      else if (input.default !== undefined) {
        initialData[input.id] = input.default;
      }
    });

    setSelectedWorkflow(nextWorkflow);
    setFormData(initialData);
    setOutput(null);
    setRawOutput('');
    setError(null);
    setShowSuggestions(false);
    setCurrentView('workflow');
  };

  // Campaign Builder Functions
  const selectCampaignPreset = (preset) => {
    const selectedWorkflowsList = preset.workflowIds
      .map(id => workflows.find(w => w.id === id))
      .filter(Boolean);
    setCampaignWorkflows(selectedWorkflowsList);
  };

  const toggleCampaignWorkflow = (workflow) => {
    setCampaignWorkflows(prev => {
      const exists = prev.find(w => w.id === workflow.id);
      if (exists) {
        return prev.filter(w => w.id !== workflow.id);
      }
      return [...prev, workflow];
    });
  };

  const buildCampaignFormData = (workflow, profile, previousOutputs) => {
    const data = {};

    workflow.inputs.forEach(input => {
      // Apply from client profile
      if (input.id === 'client_name' && profile?.name) {
        data[input.id] = profile.name;
      } else if ((input.id === 'target_location' || input.id === 'location') && profile?.location) {
        data[input.id] = profile.location;
      } else if (input.id === 'practice_areas' && profile?.practiceAreas?.length) {
        data[input.id] = profile.practiceAreas;
      } else if (input.id === 'website_url' && profile?.website) {
        data[input.id] = profile.website;
      } else if (input.id === 'competitors' && profile?.competitors) {
        data[input.id] = profile.competitors;
      } else if (input.id === 'tone' && profile?.tone) {
        data[input.id] = profile.tone;
      } else if (input.id === 'unique_value' && profile?.uniqueValue) {
        data[input.id] = profile.uniqueValue;
      }
      // Transfer data from previous outputs
      else if (input.id === 'topic' && previousOutputs.length > 0) {
        const briefOutput = previousOutputs.find(p => p.workflowId === 'content-strategy-brief');
        if (briefOutput?.outputs?.topic_suggestions) {
          const topics = briefOutput.outputs.topic_suggestions.split('\n').filter(t => t.trim());
          if (topics.length > 0) {
            data[input.id] = topics[0].replace(/^[\d\.\-\*]+\s*/, '').trim();
          }
        }
      }
      else if (input.id === 'content_to_repurpose' && previousOutputs.length > 0) {
        const articleOutput = previousOutputs.find(p => p.workflowId === 'seo-blog-article');
        if (articleOutput?.outputs?.article_body) {
          data[input.id] = articleOutput.outputs.article_body.substring(0, 2000);
        }
      }
      // Apply manual form data overrides
      else if (campaignFormData[input.id] !== undefined) {
        data[input.id] = campaignFormData[input.id];
      }
      // Use defaults
      else if (input.default !== undefined) {
        data[input.id] = input.default;
      }
    });

    return data;
  };

  const runCampaign = async () => {
    const apiKey = getCurrentApiKey();
    if (!apiKey) {
      setError(`API key not configured. Please go to Settings and add your ${MODEL_PROVIDERS[settings.provider].name} API key.`);
      return;
    }

    if (campaignWorkflows.length === 0) {
      setError('Please select at least one workflow for your campaign.');
      return;
    }

    setCampaignProgress({ current: 0, total: campaignWorkflows.length, status: 'running' });
    setCampaignResults([]);
    setError(null);

    const results = [];

    for (let i = 0; i < campaignWorkflows.length; i++) {
      const workflow = campaignWorkflows[i];
      setCampaignProgress({ current: i + 1, total: campaignWorkflows.length, status: 'running' });

      try {
        const workflowFormData = buildCampaignFormData(workflow, campaignClientProfile, results);
        const userMessage = buildUserMessage(workflow, workflowFormData);

        const content = await callAPIStreaming(
          workflow.systemPrompt,
          userMessage,
          () => {} // No streaming updates needed for batch
        );

        const parsed = parseXMLOutput(content, workflow.outputSections);

        const result = {
          workflowId: workflow.id,
          workflowName: workflow.name,
          workflowColor: workflow.color,
          inputs: workflowFormData,
          outputs: parsed,
          rawContent: content,
          outputSections: workflow.outputSections,
          timestamp: new Date().toISOString()
        };

        results.push(result);
        setCampaignResults([...results]);

        // Also save as individual artifact
        saveArtifact(workflow, workflowFormData, parsed, content);
      } catch (err) {
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          workflowColor: workflow.color,
          error: err.message,
          timestamp: new Date().toISOString()
        });
        setCampaignResults([...results]);
      }
    }

    setCampaignProgress({ current: campaignWorkflows.length, total: campaignWorkflows.length, status: 'complete' });
  };

  const exportCampaignAsZip = async () => {
    if (campaignResults.length === 0) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const clientName = campaignClientProfile?.name || 'campaign';

    // Create a combined markdown file for all outputs
    let combinedContent = `# ${clientName} - Campaign Bundle\n\nGenerated: ${dateStr}\n\n---\n\n`;

    campaignResults.forEach((result, index) => {
      if (result.error) {
        combinedContent += `## ${index + 1}. ${result.workflowName} (ERROR)\n\n${result.error}\n\n---\n\n`;
      } else {
        combinedContent += `## ${index + 1}. ${result.workflowName}\n\n`;
        (result.outputSections || []).forEach(section => {
          const sectionContent = result.outputs?.[section.id];
          if (sectionContent) {
            combinedContent += `### ${section.label}\n\n${sectionContent}\n\n`;
          }
        });
        combinedContent += `---\n\n`;
      }
    });

    downloadMarkdown(combinedContent, `${clientName.toLowerCase().replace(/\s+/g, '-')}-campaign-${dateStr}.md`);
  };

  const resetCampaign = () => {
    setCampaignWorkflows([]);
    setCampaignResults([]);
    setCampaignProgress({ current: 0, total: 0, status: 'idle' });
    setCampaignFormData({});
    setCampaignStep(1);
    setCampaignInputs({});
    setCurrentConfigWorkflow(0);
    setCampaignClientProfile(null);
  };

  // Initialize campaign inputs for selected workflows
  const initializeCampaignInputs = () => {
    const inputs = {};
    campaignWorkflows.forEach(workflow => {
      inputs[workflow.id] = {};
      workflow.inputs.forEach(input => {
        // Pre-fill from client profile if available
        if (input.id === 'client_name' && campaignClientProfile?.name) {
          inputs[workflow.id][input.id] = campaignClientProfile.name;
        } else if ((input.id === 'target_location' || input.id === 'location') && campaignClientProfile?.location) {
          inputs[workflow.id][input.id] = campaignClientProfile.location;
        } else if (input.id === 'practice_areas' && campaignClientProfile?.practiceAreas?.length) {
          inputs[workflow.id][input.id] = campaignClientProfile.practiceAreas;
        } else if (input.id === 'website_url' && campaignClientProfile?.website) {
          inputs[workflow.id][input.id] = campaignClientProfile.website;
        } else if (input.id === 'tone' && campaignClientProfile?.tone) {
          inputs[workflow.id][input.id] = campaignClientProfile.tone;
        } else if (input.default !== undefined) {
          inputs[workflow.id][input.id] = input.default;
        } else {
          inputs[workflow.id][input.id] = input.type === 'checkbox' ? false : '';
        }
      });
    });
    setCampaignInputs(inputs);
  };

  // Check if a workflow has all required inputs filled
  const isWorkflowReady = (workflow) => {
    const workflowInputs = campaignInputs[workflow.id] || {};
    return workflow.inputs
      .filter(input => input.required)
      .every(input => {
        const value = workflowInputs[input.id];
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== '';
      });
  };

  // Check if all workflows are ready
  const allWorkflowsReady = () => {
    return campaignWorkflows.every(workflow => isWorkflowReady(workflow));
  };

  // Run campaign with configured inputs
  const runCampaignWithInputs = async () => {
    const apiKey = getCurrentApiKey();
    if (!apiKey) {
      setError(`API key not configured. Please go to Settings and add your ${MODEL_PROVIDERS[settings.provider].name} API key.`);
      return;
    }

    setCampaignStep(5);
    setCampaignProgress({ current: 0, total: campaignWorkflows.length, status: 'running' });
    setCampaignResults([]);
    setError(null);

    const results = [];

    for (let i = 0; i < campaignWorkflows.length; i++) {
      const workflow = campaignWorkflows[i];
      setCampaignProgress({ current: i + 1, total: campaignWorkflows.length, status: 'running' });

      try {
        const workflowFormData = campaignInputs[workflow.id] || {};
        const userMessage = buildUserMessage(workflow, workflowFormData);

        const content = await callAPIStreaming(
          workflow.systemPrompt,
          userMessage,
          () => {}
        );

        const parsed = parseXMLOutput(content, workflow.outputSections);

        const result = {
          workflowId: workflow.id,
          workflowName: workflow.name,
          workflowColor: workflow.color,
          inputs: workflowFormData,
          outputs: parsed,
          rawContent: content,
          outputSections: workflow.outputSections,
          timestamp: new Date().toISOString()
        };

        results.push(result);
        setCampaignResults([...results]);
        saveArtifact(workflow, workflowFormData, parsed, content);
      } catch (err) {
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          workflowColor: workflow.color,
          error: err.message,
          timestamp: new Date().toISOString()
        });
        setCampaignResults([...results]);
      }
    }

    setCampaignProgress({ current: campaignWorkflows.length, total: campaignWorkflows.length, status: 'complete' });
  };

  // Filtered workflows for search
  const filteredWorkflows = workflows.filter(workflow => {
    if (!workflowSearch.trim()) return true;
    const search = workflowSearch.toLowerCase();
    return (
      workflow.name.toLowerCase().includes(search) ||
      workflow.description.toLowerCase().includes(search) ||
      workflow.category.toLowerCase().includes(search)
    );
  });

  // Filtered artifacts for history search
  const filteredArtifacts = artifacts.filter(artifact => {
    if (!historySearch.trim()) return true;
    const search = historySearch.toLowerCase();
    return (
      artifact.workflowName.toLowerCase().includes(search) ||
      (artifact.inputs?.client_name || '').toLowerCase().includes(search) ||
      artifact.workflowCategory.toLowerCase().includes(search)
    );
  });

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Get current API key
  const getCurrentApiKey = () => {
    const localKey = settings.apiKeys?.[settings.provider] || '';
    const envKey = ENV_API_KEYS[settings.provider] || '';
    // Use local key if set, otherwise fall back to env key
    const key = localKey || envKey;
    return key.trim();
  };

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

  // Streaming API call based on provider
  const callAPIStreaming = async (systemPrompt, userMessage, onChunk) => {
    const apiKey = getCurrentApiKey();
    const modelConfig = getModelConfig(settings.provider, settings.model);
    const maxTokens = modelConfig.maxOutput;

    // Check if prompt might be too large for the model
    const totalInputTokens = estimateTokens(systemPrompt) + estimateTokens(userMessage);
    if (totalInputTokens > modelConfig.contextLimit * 0.8) {
      throw new Error(`Input too large for ${settings.model}. Estimated ${totalInputTokens.toLocaleString()} tokens, limit is ${modelConfig.contextLimit.toLocaleString()}. Try a model with higher context limit.`);
    }

    let fullContent = '';

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
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  fullContent += parsed.delta.text;
                  onChunk(fullContent);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (streamError) {
        throw new Error(`Stream reading failed: ${streamError.message}`);
      }
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
          stream: true,
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

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  onChunk(fullContent);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (streamError) {
        throw new Error(`Stream reading failed: ${streamError.message}`);
      }
    }

    else if (settings.provider === 'google') {
      // Google uses streamGenerateContent with alt=sse
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
            generationConfig: { maxOutputTokens: maxTokens }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  fullContent += text;
                  onChunk(fullContent);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (streamError) {
        throw new Error(`Stream reading failed: ${streamError.message}`);
      }
    }

    return fullContent;
  };

  // Handle form submission with streaming
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

      // Stream the response, updating rawOutput as chunks arrive
      const content = await callAPIStreaming(
        selectedWorkflow.systemPrompt,
        userMessage,
        (partialContent) => {
          setRawOutput(partialContent);
          // Parse progressively to show sections as they complete
          const parsed = parseXMLOutput(partialContent, selectedWorkflow.outputSections);
          setOutput(parsed);
        }
      );

      // Final parse with complete content
      setRawOutput(content);
      const parsed = parseXMLOutput(content, selectedWorkflow.outputSections);
      setOutput(parsed);

      // Auto-save artifact
      saveArtifact(selectedWorkflow, formData, parsed, content);

      // Show smart suggestions for next workflows
      setShowSuggestions(true);
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

    (selectedWorkflow.outputSections || []).forEach(section => {
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

  // Publish to WordPress (with optional scheduling)
  const publishToWordPress = async (scheduledDateTime = null) => {
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
        status: scheduledDateTime ? 'future' : 'draft',
        excerpt: output.meta_description || '',
      };

      // Add scheduled date if provided
      if (scheduledDateTime) {
        postData.date = scheduledDateTime;
      }

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

      if (scheduledDateTime) {
        const scheduledDate = new Date(scheduledDateTime);
        // Add to scheduled posts list
        setScheduledPosts(prev => [...prev, {
          id: result.id,
          title: postData.title,
          scheduledFor: scheduledDateTime,
          workflowId: selectedWorkflow?.id,
          createdAt: new Date().toISOString()
        }]);
        setWpPublishResult({
          success: true,
          message: `Scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          postId: result.id,
          editUrl: result.link ? result.link.replace(/\/$/, '') + '?preview=true' : null
        });
      } else {
        setWpPublishResult({
          success: true,
          message: `Draft created successfully!`,
          postId: result.id,
          editUrl: result.link ? result.link.replace(/\/$/, '') + '?preview=true' : null
        });
      }
    } catch (err) {
      setWpPublishResult({ success: false, message: err.message });
    } finally {
      setPublishingToWP(false);
      setShowScheduleModal(false);
    }
  };

  // Schedule post to WordPress
  const handleSchedulePost = () => {
    if (!scheduleDate) {
      setWpPublishResult({ success: false, message: 'Please select a date.' });
      return;
    }
    const dateTime = `${scheduleDate}T${scheduleTime}:00`;
    publishToWordPress(dateTime);
  };

  // Get default schedule date (tomorrow)
  const getDefaultScheduleDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Format relative time
  const formatRelativeTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // View artifact in detail
  const viewArtifact = (artifact) => {
    setSelectedArtifact(artifact);
    setCurrentView('artifact');
  };

  // Render Campaign Builder Page - Step-based Wizard
  const renderCampaignBuilder = () => {
    const hasApiKey = !!getCurrentApiKey();
    const currentProvider = MODEL_PROVIDERS[settings.provider];
    const isRunning = campaignProgress.status === 'running';
    const isComplete = campaignProgress.status === 'complete';
    const currentWorkflow = campaignWorkflows[currentConfigWorkflow];

    const steps = [
      { num: 1, label: 'Select Firm', icon: Database },
      { num: 2, label: 'Choose Workflows', icon: Layers },
      { num: 3, label: 'Configure Inputs', icon: PenTool },
      { num: 4, label: 'Run Campaign', icon: Play }
    ];

    // Handle advancing to next step
    const nextStep = () => {
      if (campaignStep === 2 && campaignWorkflows.length > 0) {
        initializeCampaignInputs();
        setCurrentConfigWorkflow(0);
      }
      setCampaignStep(prev => Math.min(prev + 1, 5));
    };

    const prevStep = () => {
      if (campaignStep === 5) {
        resetCampaign();
      } else {
        setCampaignStep(prev => Math.max(prev - 1, 1));
      }
    };

    // Render input field for workflow configuration
    const renderInputField = (input, workflowId) => {
      const value = campaignInputs[workflowId]?.[input.id] ?? '';
      const onChange = (newValue) => {
        setCampaignInputs(prev => ({
          ...prev,
          [workflowId]: { ...prev[workflowId], [input.id]: newValue }
        }));
      };

      if (input.type === 'select') {
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select...</option>
            {(input.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      if (input.type === 'textarea') {
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={input.placeholder}
            rows={input.rows || 3}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        );
      }
      if (input.type === 'checkbox') {
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-600">{input.label}</span>
          </label>
        );
      }
      return (
        <input
          type={input.type || 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={input.placeholder}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => { setCurrentView('dashboard'); resetCampaign(); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">Campaign Builder</span>
              </div>
            </div>
            {hasApiKey && (
              <span className="text-xs px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 font-medium">
                {currentProvider.icon} {(settings.model || 'Unknown').split('-').slice(0, 2).join(' ')}
              </span>
            )}
          </div>
        </header>

        {/* Step Progress Indicator */}
        {campaignStep < 5 && (
          <div className="bg-white border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isActive = campaignStep === step.num;
                  const isCompleted = campaignStep > step.num;
                  return (
                    <div key={step.num} className="flex items-center">
                      <div className={`flex items-center gap-2 ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-2' :
                          isCompleted ? 'bg-green-100' : 'bg-slate-100'
                        }`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-12 sm:w-24 h-0.5 mx-2 ${isCompleted ? 'bg-green-300' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <main className="max-w-5xl mx-auto px-4 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-800 text-sm flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 1: Select Law Firm */}
          {campaignStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Select Your Law Firm</h1>
                <p className="text-slate-500">Choose a law firm profile to auto-fill campaign details</p>
              </div>

              {clientProfiles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Law Firms Yet</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">Create a law firm profile to save time by auto-filling client information across all workflows.</p>
                  <button
                    onClick={() => { setShowClientProfileModal(true); }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    + Add Your First Law Firm
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {clientProfiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => { setCampaignClientProfile(profile); nextStep(); }}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                        campaignClientProfile?.id === profile.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {profile.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-lg">{profile.name}</h3>
                          <p className="text-slate-500 text-sm">{profile.location || 'No location set'}</p>
                          {profile.practiceAreas?.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {profile.practiceAreas.slice(0, 3).map(area => (
                                <span key={area} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{area}</span>
                              ))}
                              {profile.practiceAreas.length > 3 && (
                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">+{profile.practiceAreas.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowClientProfileModal(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span> Add New Law Firm
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Workflows */}
          {campaignStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Workflows</h1>
                <p className="text-slate-500">Select a preset campaign or pick individual workflows</p>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {CAMPAIGN_PRESETS.map(preset => {
                  const PresetIcon = iconMap[preset.icon] || Package;
                  const isSelected = preset.workflowIds.every(id => campaignWorkflows.find(w => w.id === id));
                  return (
                    <button
                      key={preset.id}
                      onClick={() => selectCampaignPreset(preset)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                        isSelected ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: preset.color + '20' }}>
                          <PresetIcon className="w-5 h-5" style={{ color: preset.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{preset.name}</h4>
                          <span className="text-xs text-slate-400">{preset.workflowIds.length} workflows • {preset.estimatedTime}</span>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <p className="text-sm text-slate-500">{preset.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Individual Workflows */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Or Select Individual Workflows</h3>
                  {campaignWorkflows.length > 0 && (
                    <button onClick={() => setCampaignWorkflows([])} className="text-xs text-slate-500 hover:text-red-500">Clear All</button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workflows.map(workflow => {
                    const isSelected = campaignWorkflows.find(w => w.id === workflow.id);
                    const WIcon = iconMap[workflow.icon] || FileText;
                    return (
                      <button
                        key={workflow.id}
                        onClick={() => toggleCampaignWorkflow(workflow)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? <CheckCircle className="w-4 h-4 text-indigo-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
                          <WIcon className="w-4 h-4" style={{ color: workflow.color }} />
                          <span className="text-sm font-medium text-slate-800 truncate">{workflow.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={campaignWorkflows.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                >
                  Configure Inputs ({campaignWorkflows.length})
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Configure Inputs */}
          {campaignStep === 3 && currentWorkflow && (
            <div className="space-y-6">
              {/* Workflow Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {campaignWorkflows.map((workflow, idx) => {
                  const WIcon = iconMap[workflow.icon] || FileText;
                  const isReady = isWorkflowReady(workflow);
                  return (
                    <button
                      key={workflow.id}
                      onClick={() => setCurrentConfigWorkflow(idx)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                        idx === currentConfigWorkflow
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : isReady
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                        {idx === currentConfigWorkflow ? idx + 1 : isReady ? <Check className="w-3 h-3" /> : idx + 1}
                      </span>
                      <WIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{workflow.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Current Workflow Configuration */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: currentWorkflow.color + '20' }}>
                      {(() => { const WIcon = iconMap[currentWorkflow.icon] || FileText; return <WIcon className="w-5 h-5" style={{ color: currentWorkflow.color }} />; })()}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">{currentWorkflow.name}</h2>
                      <p className="text-sm text-slate-500">{currentWorkflow.description?.substring(0, 80)}...</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {currentWorkflow.inputs.map(input => (
                    <div key={input.id}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {input.label}
                        {input.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderInputField(input, currentWorkflow.id)}
                      {input.helpText && <p className="text-xs text-slate-400 mt-1">{input.helpText}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
                  Back to Workflows
                </button>
                <div className="flex gap-3">
                  {currentConfigWorkflow > 0 && (
                    <button onClick={() => setCurrentConfigWorkflow(prev => prev - 1)} className="px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                      ← Previous
                    </button>
                  )}
                  {currentConfigWorkflow < campaignWorkflows.length - 1 ? (
                    <button
                      onClick={() => setCurrentConfigWorkflow(prev => prev + 1)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                    >
                      Next Workflow →
                    </button>
                  ) : (
                    <button
                      onClick={nextStep}
                      disabled={!allWorkflowsReady()}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg shadow-indigo-200"
                    >
                      Review & Run Campaign
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Run */}
          {campaignStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Ready to Launch!</h1>
                <p className="text-slate-500">Review your campaign and start generating content</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {campaignClientProfile?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{campaignClientProfile?.name}</h3>
                    <p className="text-slate-500">{campaignClientProfile?.location}</p>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-800 mb-3">Workflows to Run ({campaignWorkflows.length})</h4>
                <div className="space-y-2">
                  {campaignWorkflows.map((workflow, idx) => {
                    const WIcon = iconMap[workflow.icon] || FileText;
                    const ready = isWorkflowReady(workflow);
                    return (
                      <div key={workflow.id} className={`flex items-center gap-3 p-3 rounded-xl ${ready ? 'bg-green-50' : 'bg-red-50'}`}>
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                        <WIcon className="w-5 h-5" style={{ color: workflow.color }} />
                        <span className="flex-1 font-medium text-slate-800">{workflow.name}</span>
                        {ready ? (
                          <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Ready</span>
                        ) : (
                          <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Missing inputs</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={prevStep} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
                  Back to Configure
                </button>
                <button
                  onClick={runCampaignWithInputs}
                  disabled={!hasApiKey || !allWorkflowsReady()}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 flex items-center gap-2 text-lg"
                >
                  <Play className="w-6 h-6" /> Launch Campaign
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {campaignStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  {isComplete ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />}
                  {isComplete ? 'Campaign Complete!' : 'Running Campaign...'}
                </h1>
                {isComplete && (
                  <div className="flex gap-2">
                    <button onClick={exportCampaignAsZip} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700">
                      <Download className="w-4 h-4" /> Export All
                    </button>
                    <button onClick={resetCampaign} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> New Campaign
                    </button>
                  </div>
                )}
              </div>

              {/* Progress */}
              {isRunning && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Processing workflow {campaignProgress.current} of {campaignProgress.total}</span>
                    <span>{Math.round((campaignProgress.current / campaignProgress.total) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${(campaignProgress.current / campaignProgress.total) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="space-y-4">
                {campaignResults.map((result, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (result.workflowColor || '#6366f1') + '15' }}>
                          {result.error ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5" style={{ color: result.workflowColor }} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{result.workflowName}</h3>
                          {result.error && <p className="text-sm text-red-500">Error: {result.error}</p>}
                        </div>
                      </div>
                      {!result.error && (
                        <button
                          onClick={() => copyToClipboard(result.rawContent, `campaign-${idx}`)}
                          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                        >
                          {copiedId === `campaign-${idx}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          {copiedId === `campaign-${idx}` ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                    {!result.error && (
                      <div className="p-5 max-h-80 overflow-y-auto">
                        {(result.outputSections || []).map(section => {
                          const content = result.outputs?.[section.id];
                          if (!content) return null;
                          return (
                            <div key={section.id} className="mb-4 last:mb-0">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{section.label}</h4>
                              <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{content.substring(0, 600)}{content.length > 600 ? '...' : ''}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  // Render History Page
  const renderHistory = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Professional History Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('dashboard')} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Generation History</h1>
                <p className="text-[10px] text-slate-400 -mt-0.5">{artifacts.length} saved generation{artifacts.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {artifacts.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all saved generations? This cannot be undone.')) {
                    clearAllArtifacts();
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700 px-4 py-2 hover:bg-red-50 rounded-xl font-medium transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* History Search */}
          {artifacts.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by workflow, client, or category..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 shadow-sm transition-all hover:shadow-md"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {artifacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No saved generations yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Run a workflow to generate content. Results are automatically saved here for future reference.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Browse Workflows
              </button>
            </div>
          ) : filteredArtifacts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-700">No results match "{historySearch}"</p>
              <button onClick={() => setHistorySearch('')} className="text-indigo-600 text-sm mt-3 font-medium hover:text-indigo-700">Clear search</button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArtifacts.map(artifact => {
                const Icon = iconMap[categories[artifact.workflowCategory]?.icon] || FileText;
                return (
                  <div
                    key={artifact.id}
                    className="bg-white rounded-2xl border border-slate-200/60 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all shadow-sm"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{artifact.workflowName}</h3>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-full">{formatRelativeTime(artifact.timestamp)}</span>
                              <span>•</span>
                              <span>{MODEL_PROVIDERS[artifact.provider]?.icon} {(artifact.model || 'Unknown').split('-').slice(0, 2).join(' ')}</span>
                            </div>
                            {artifact.inputs.client_name && (
                              <p className="text-sm text-slate-600 mt-1 truncate">
                                Client: {artifact.inputs.client_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => viewArtifact(artifact)}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl hover:from-indigo-100 hover:to-purple-100 font-medium transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteArtifact(artifact.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  };

  // Render Artifact Detail Page
  const renderArtifactDetail = () => {
    if (!selectedArtifact) return null;

    const Icon = iconMap[categories[selectedArtifact.workflowCategory]?.icon] || FileText;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('history')} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <Icon className="w-5 h-5 text-slate-600" />
              <div>
                <h1 className="font-semibold text-slate-900">{selectedArtifact.workflowName}</h1>
                <p className="text-xs text-slate-500">
                  {new Date(selectedArtifact.timestamp).toLocaleString()} • {MODEL_PROVIDERS[selectedArtifact.provider]?.icon} {selectedArtifact.model}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Download as markdown
                  const dateStr = new Date(selectedArtifact.timestamp).toISOString().split('T')[0];
                  let content = `# ${selectedArtifact.workflowName}\n\nGenerated: ${dateStr}\n\n---\n\n`;
                  (selectedArtifact.outputSections || []).forEach(section => {
                    const sectionContent = selectedArtifact.outputs[section.id];
                    if (sectionContent) {
                      content += `## ${section.label}\n\n${sectionContent}\n\n---\n\n`;
                    }
                  });
                  downloadMarkdown(content, `${selectedArtifact.workflowName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.md`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => deleteArtifact(selectedArtifact.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Inputs Summary */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
              <h3 className="font-medium text-slate-700 text-sm">Inputs</h3>
            </div>
            <div className="p-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedArtifact.inputs).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex gap-2">
                      <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-slate-900 truncate">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Output Sections */}
          {(selectedArtifact.outputSections || []).map(section => {
            const content = selectedArtifact.outputs?.[section.id];
            if (!content) return null;

            return (
              <div key={section.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-medium text-slate-700 text-sm">{section.label}</h3>
                  <button
                    onClick={() => copyToClipboard(content, `artifact-${section.id}`)}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600"
                  >
                    {copiedId === `artifact-${section.id}` ? (
                      <><Check className="w-3 h-3" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  {section.format === 'markdown' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  ) : (
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded">{content}</pre>
                  )}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  };

  // Render Settings Page
  const renderSettings = () => {
    const currentProvider = MODEL_PROVIDERS[settings.provider];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Professional Settings Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
            <button onClick={() => setCurrentView('dashboard')} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Settings</h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">Configure AI models & law firm profiles</p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Model Provider Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">AI Model Configuration</span>
                <p className="text-xs text-slate-500">Select your preferred AI provider and model</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Model Provider</label>
                <div className="grid grid-cols-3 gap-3">
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
                      className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                        settings.provider === key
                          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md shadow-indigo-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <div className="text-sm font-bold text-slate-900">{provider.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{provider.models.length} models</div>
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
                  {ENV_API_KEYS[settings.provider] && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Default configured)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={settings.apiKeys?.[settings.provider] || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, [settings.provider]: e.target.value }
                  })}
                  placeholder={ENV_API_KEYS[settings.provider] ? '••••••••••••••••' : currentProvider.apiKeyPlaceholder}
                  className="input font-mono text-sm"
                />
                {ENV_API_KEYS[settings.provider] ? (
                  <p className="text-xs text-green-600 mt-1">
                    Using pre-configured API key. Override by entering a new key above.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Get your API key from {currentProvider.apiKeyHelp}
                  </p>
                )}
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

          {/* Law Firm Profiles */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Law Firm Profiles</span>
                  <span className="text-xs text-slate-500 ml-2">({clientProfiles.length} saved)</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewClientProfile({ name: '', practiceAreas: [], location: '', tone: 'professional', competitors: '', website: '', uniqueValue: '' });
                  setShowClientProfileModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 text-sm font-semibold shadow-lg shadow-purple-200/50 transition-all hover:shadow-xl"
              >
                <span>+ Add Firm</span>
              </button>
            </div>
            <div className="p-5">
              {clientProfiles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="font-medium text-slate-700">No law firm profiles yet</p>
                  <p className="text-sm text-slate-400 mt-1">Add profiles to auto-fill workflows and campaigns</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProfiles.map(profile => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/60 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                          {profile.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900">{profile.name}</div>
                          <div className="text-xs text-slate-500 truncate">
                            {profile.location || 'No location'} • {profile.practiceAreas?.length || 0} practice areas
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteClientProfile(profile.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Default (Legacy Support) */}
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">Quick Defaults</span>
                <p className="text-xs text-slate-500">Used when no profile selected</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <input
                type="text"
                value={settings.defaultClientName}
                onChange={(e) => setSettings({ ...settings, defaultClientName: e.target.value })}
                placeholder="Default Firm Name"
                className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300"
              />
              <input
                type="text"
                value={settings.defaultLocation}
                onChange={(e) => setSettings({ ...settings, defaultLocation: e.target.value })}
                placeholder="Default Location (e.g., Phoenix, Arizona)"
                className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300"
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
    filteredWorkflows.forEach(w => {
      if (!groupedWorkflows[w.category]) groupedWorkflows[w.category] = [];
      groupedWorkflows[w.category].push(w);
    });

    const hasApiKey = !!getCurrentApiKey();
    const totalWorkflows = workflows.length;
    const currentProvider = MODEL_PROVIDERS[settings.provider];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Professional Header with Gradient */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-sm tracking-tight">Attorney Sync AI</span>
                <span className="text-[10px] text-slate-400 -mt-0.5">{totalWorkflows} Marketing Workflows</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasApiKey && (
                <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-full text-slate-600 font-medium border border-slate-200/60">
                  {currentProvider.icon} {(settings.model || 'Unknown').split('-').slice(0, 2).join(' ')}
                </span>
              )}
              <button
                onClick={() => setCurrentView('campaign')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg shadow-indigo-200/50 transition-all hover:shadow-xl hover:shadow-indigo-300/50"
                title="Campaign Builder"
              >
                <Package className="w-4 h-4" />
                Campaign
              </button>
              <button onClick={() => setCurrentView('history')} className="p-2.5 hover:bg-slate-100 rounded-xl relative transition-colors">
                <Clock className="w-4 h-4 text-slate-500" />
                {artifacts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {artifacts.length > 9 ? '9+' : artifacts.length}
                  </span>
                )}
              </button>
              <button onClick={() => setCurrentView('settings')} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          {!hasApiKey && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-4 mb-6 flex items-center gap-4 text-sm shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-amber-800 flex-1">
                Configure your API key in{' '}
                <button onClick={() => setCurrentView('settings')} className="underline font-semibold hover:text-amber-900">Settings</button>
                {' '}to start generating content
              </span>
            </div>
          )}

          {/* Hero Section with Enhanced Visual Design */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-6 md:p-8 mb-6 text-white shadow-2xl shadow-indigo-300/30">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/90 mb-3 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" />
                  AI-Powered Platform
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Legal Marketing Automation</h2>
                <p className="text-indigo-100 mt-2 max-w-md">{totalWorkflows} professional workflows for content creation, advertising campaigns, and business operations</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-4">
                <button
                  onClick={() => setCurrentView('campaign')}
                  disabled={!hasApiKey}
                  className="group flex items-center gap-3 px-6 py-4 bg-white text-indigo-700 rounded-2xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-base">Campaign Builder</div>
                    <div className="text-xs font-normal text-indigo-500">Run multiple workflows at once</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar with Enhanced Styling */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search workflows by name, category, or feature..."
                value={workflowSearch}
                onChange={(e) => setWorkflowSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 shadow-sm transition-all hover:shadow-md"
              />
              {workflowSearch && (
                <button
                  onClick={() => setWorkflowSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {clientProfiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">Law Firms:</span>
                {clientProfiles.slice(0, 3).map(profile => (
                  <span key={profile.id} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100/60">
                    {profile.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {workflowSearch && filteredWorkflows.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No workflows match "{workflowSearch}"</p>
              <button onClick={() => setWorkflowSearch('')} className="text-blue-600 text-sm mt-2">Clear search</button>
            </div>
          )}

          {/* Workflow Categories with Full Descriptions */}
          <div className="space-y-6">
            {Object.entries(groupedWorkflows).map(([categoryId, categoryWorkflows]) => {
              const category = categories[categoryId];
              const Icon = iconMap[category.icon] || FileText;
              return (
                <div key={categoryId} className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: category.color + '15' }}>
                      <Icon className="w-4 h-4" style={{ color: category.color }} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800">{category.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({categoryWorkflows.length} workflows)</span>
                    </div>
                  </div>

                  {/* Workflow Cards with Professional Styling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryWorkflows.map(workflow => {
                      const WIcon = iconMap[workflow.icon] || FileText;
                      return (
                        <button
                          key={workflow.id}
                          onClick={() => selectWorkflow(workflow)}
                          disabled={!hasApiKey}
                          className="bg-white rounded-2xl p-4 border border-slate-200/60 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                              style={{ backgroundColor: workflow.color + '15' }}
                            >
                              <WIcon className="w-5 h-5" style={{ color: workflow.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                                {workflow.name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                                {workflow.description}
                              </p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                                  {workflow.inputs.length} inputs
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                                  {(workflow.outputSections || []).length} outputs
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 flex-shrink-0 mt-1 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer with Enhanced Styling */}
          <footer className="mt-8 pt-6 border-t border-slate-200/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium text-slate-600">Attorney Sync AI</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Powered by {currentProvider.name}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{totalWorkflows} Workflows Available</span>
              </div>
            </div>
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
                      <FileText className="w-3 h-3" /> Generated Outputs ({(selectedWorkflow.outputSections || []).length})
                    </h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      {(selectedWorkflow.outputSections || []).slice(0, 5).map(section => (
                        <li key={section.id} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-green-500 rounded-full" />
                          {section.label}
                        </li>
                      ))}
                      {(selectedWorkflow.outputSections || []).length > 5 && (
                        <li className="text-green-600">+{(selectedWorkflow.outputSections || []).length - 5} more...</li>
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
                        (Large for {(settings.model || 'Unknown').split('-').slice(0,2).join(' ')})
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
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Inputs</span>
                <div className="flex items-center gap-2">
                  {/* Template Dropdown */}
                  {(templates[selectedWorkflow.id] || []).length > 0 && (
                    <select
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                      onChange={(e) => {
                        const template = (templates[selectedWorkflow.id] || []).find(t => t.id === e.target.value);
                        if (template) applyTemplate(template);
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="">Load Template...</option>
                      {(templates[selectedWorkflow.id] || []).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                  {/* Client Profile Dropdown */}
                  {clientProfiles.length > 0 && (
                    <select
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                      value={selectedClientProfile?.id || ''}
                      onChange={(e) => {
                        const profile = clientProfiles.find(p => p.id === e.target.value);
                        if (profile) applyClientProfile(profile);
                      }}
                    >
                      <option value="">Select Client...</option>
                      {clientProfiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                  {/* Add Client Profile */}
                  <button
                    type="button"
                    onClick={() => setShowClientProfileModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    + Client
                  </button>
                </div>
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
                        {(input.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {input.type === 'multiselect' && (
                      <div className="flex flex-wrap gap-1.5">
                        {(input.options || []).map(opt => {
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

                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="flex-1 py-2.5 btn btn-primary rounded-lg text-sm">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generate with {currentProvider.icon}</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTemplateName('');
                      setShowSaveTemplateModal(true);
                    }}
                    className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                    title="Save as Template"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
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
                      <>
                        <button
                          onClick={() => publishToWordPress()}
                          disabled={publishingToWP}
                          className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center gap-1 disabled:opacity-50"
                          title="Save as WordPress Draft"
                        >
                          {publishingToWP ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Draft
                        </button>
                        <button
                          onClick={() => { setScheduleDate(getDefaultScheduleDate()); setShowScheduleModal(true); }}
                          disabled={publishingToWP}
                          className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 flex items-center gap-1 disabled:opacity-50"
                          title="Schedule WordPress Post"
                        >
                          <Calendar className="w-3 h-3" /> Schedule
                        </button>
                      </>
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

                {loading && !rawOutput && (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                      <p className="text-sm text-slate-600">Connecting to {currentProvider.name}...</p>
                    </div>
                  </div>
                )}

                {loading && rawOutput && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-sm text-blue-700 font-medium">Streaming response...</span>
                      <span className="text-xs text-blue-500">({rawOutput.length.toLocaleString()} chars)</span>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 max-h-[400px] overflow-y-auto">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">{rawOutput}</pre>
                    </div>
                  </div>
                )}

                {!loading && output && (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {(selectedWorkflow.outputSections || []).map(section => {
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

          {/* Smart Suggestions Panel - shows after successful generation */}
          {showSuggestions && output && !loading && (
            <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-indigo-900 text-sm">Continue Your Workflow</span>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-indigo-700 mb-3">Based on your output, these workflows would be great next steps:</p>
              <div className="flex flex-wrap gap-2">
                {getChainedWorkflows(selectedWorkflow.id).map(workflow => {
                  const Icon = iconMap[categories[workflow.category]?.icon] || FileText;
                  return (
                    <button
                      key={workflow.id}
                      onClick={() => chainToWorkflow(workflow, output)}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-sm text-sm transition-all"
                    >
                      <Icon className="w-4 h-4 text-indigo-600" />
                      <span className="text-slate-700">{workflow.name}</span>
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                    </button>
                  );
                })}
                {getChainedWorkflows(selectedWorkflow.id).length === 0 &&
                  getSuggestedWorkflows(selectedWorkflow.category).map(workflow => {
                    const Icon = iconMap[categories[workflow.category]?.icon] || FileText;
                    return (
                      <button
                        key={workflow.id}
                        onClick={() => chainToWorkflow(workflow, output)}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-sm text-sm transition-all"
                      >
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span className="text-slate-700">{workflow.name}</span>
                        <ChevronRight className="w-3 h-3 text-indigo-400" />
                      </button>
                    );
                  })
                }
              </div>
            </div>
          )}
        </main>

        {/* Save Template Modal */}
        {showSaveTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Save as Template</h3>
                <button onClick={() => setShowSaveTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Save current inputs as a reusable template for "{selectedWorkflow.name}"
              </p>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-4"
                placeholder="Template name..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newTemplateName.trim()) {
                      saveTemplate(selectedWorkflow.id, newTemplateName.trim(), formData);
                      setShowSaveTemplateModal(false);
                      setNewTemplateName('');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  Schedule to WordPress
                </h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Schedule your post to be published automatically at a future date and time.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Publication Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Publication Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {scheduleDate && (
                  <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                    <p className="text-indigo-700">
                      <strong>Scheduled for:</strong>{' '}
                      {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSchedulePost}
                    disabled={!scheduleDate || publishingToWP}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {publishingToWP ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling...</>
                    ) : (
                      <><Calendar className="w-4 h-4" /> Schedule Post</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main render - wrap with global modals
  const renderCurrentView = () => {
    if (currentView === 'settings') return renderSettings();
    if (currentView === 'workflow') return renderWorkflowPage();
    if (currentView === 'history') return renderHistory();
    if (currentView === 'artifact') return renderArtifactDetail();
    if (currentView === 'campaign') return renderCampaignBuilder();
    return renderDashboard();
  };

  return (
    <>
      {renderCurrentView()}

      {/* Global Modal: Add Law Firm Profile */}
      {showClientProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Add Law Firm Profile</h3>
              <button onClick={() => setShowClientProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Law Firm Name *</label>
                <input
                  type="text"
                  value={newClientProfile.name}
                  onChange={(e) => setNewClientProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Smith & Associates"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Location *</label>
                <input
                  type="text"
                  value={newClientProfile.location}
                  onChange={(e) => setNewClientProfile(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Los Angeles, California"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Practice Areas</label>
                <input
                  type="text"
                  value={newClientProfile.practiceAreas.join(', ')}
                  onChange={(e) => setNewClientProfile(p => ({ ...p, practiceAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Personal Injury, Car Accidents, Wrongful Death"
                />
                <p className="text-xs text-slate-400 mt-1">Comma-separated list</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Website URL</label>
                <input
                  type="text"
                  value={newClientProfile.website}
                  onChange={(e) => setNewClientProfile(p => ({ ...p, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="https://smithlaw.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Brand Voice/Tone</label>
                <select
                  value={newClientProfile.tone}
                  onChange={(e) => setNewClientProfile(p => ({ ...p, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="professional">Professional & Authoritative</option>
                  <option value="empathetic">Warm & Empathetic</option>
                  <option value="authoritative">Direct & Confident</option>
                  <option value="conversational">Friendly & Conversational</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Unique Value Proposition</label>
                <textarea
                  value={newClientProfile.uniqueValue}
                  onChange={(e) => setNewClientProfile(p => ({ ...p, uniqueValue: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  rows={2}
                  placeholder="What makes this firm unique? (e.g., 30+ years experience, no fee unless we win)"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowClientProfileModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newClientProfile.name.trim()) {
                    saveClientProfile(newClientProfile);
                    setShowClientProfileModal(false);
                    setNewClientProfile({
                      name: '', practiceAreas: [], location: '', tone: 'professional',
                      competitors: '', website: '', uniqueValue: ''
                    });
                  }
                }}
                disabled={!newClientProfile.name.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Law Firm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
