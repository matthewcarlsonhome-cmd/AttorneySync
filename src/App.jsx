import React, { useState, useEffect } from 'react';
import { workflows, categories } from './workflows/index.js';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Search, Share2, BarChart3, Settings, PenTool, Layers,
  Target, ChevronRight, Copy, Check, Loader2, ArrowLeft, Sparkles,
  Phone, TrendingUp, ClipboardList, Mail, Star, PieChart, CheckSquare,
  Download, Upload, Key, Database, Globe, Save, X, Menu, AlertCircle,
  Linkedin, ExternalLink, RefreshCw, Clock, Zap, Shield, Info, Code,
  ChevronDown, ChevronUp, FileDown, Play, Package, CheckCircle, Circle
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
    description: 'Strategy brief, blog article, social posts, and email newsletter',
    icon: 'Package',
    color: '#6366f1',
    workflowIds: ['content-strategy-brief', 'seo-blog-article', 'linkedin-content', 'email-newsletter'],
    estimatedTime: '8-12 min'
  },
  {
    id: 'advertising-blitz',
    name: 'Advertising Campaign',
    description: 'Landing page, Google Ads, and social ads',
    icon: 'Target',
    color: '#f59e0b',
    workflowIds: ['ppc-landing-page', 'google-ads', 'facebook-instagram-ads'],
    estimatedTime: '6-10 min'
  },
  {
    id: 'social-media',
    name: 'Social Media Bundle',
    description: 'LinkedIn content and social media ads',
    icon: 'Share2',
    color: '#0ea5e9',
    workflowIds: ['linkedin-content', 'facebook-instagram-ads'],
    estimatedTime: '4-6 min'
  },
  {
    id: 'seo-focused',
    name: 'SEO Content Package',
    description: 'Blog article, website copy, and Google Business Profile',
    icon: 'Search',
    color: '#10b981',
    workflowIds: ['seo-blog-article', 'website-copy', 'google-business-profile'],
    estimatedTime: '6-8 min'
  },
  {
    id: 'client-success',
    name: 'Client Success Story',
    description: 'Case study, testimonial, and promotional content',
    icon: 'Star',
    color: '#8b5cf6',
    workflowIds: ['case-study-generator', 'client-testimonial', 'linkedin-content'],
    estimatedTime: '5-8 min'
  }
];

// Environment variables for default API keys (set in .env file)
const ENV_API_KEYS = {
  anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  openai: import.meta.env.VITE_OPENAI_API_KEY || '',
  google: import.meta.env.VITE_GOOGLE_API_KEY || ''
};

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
        editUrl: result.link ? result.link.replace(/\/$/, '') + '?preview=true' : null
      });
    } catch (err) {
      setWpPublishResult({ success: false, message: err.message });
    } finally {
      setPublishingToWP(false);
    }
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

  // Render Campaign Builder Page
  const renderCampaignBuilder = () => {
    const hasApiKey = !!getCurrentApiKey();
    const currentProvider = MODEL_PROVIDERS[settings.provider];
    const isRunning = campaignProgress.status === 'running';
    const isComplete = campaignProgress.status === 'complete';

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => { setCurrentView('dashboard'); resetCampaign(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
              <Package className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-slate-900">Campaign Builder</span>
              {campaignWorkflows.length > 0 && (
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                  {campaignWorkflows.length} workflows selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasApiKey && (
                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                  {currentProvider.icon} {(settings.model || 'Unknown').split('-').slice(0, 2).join(' ')}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-3 text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-red-800">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Campaign Results View */}
          {campaignResults.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {isComplete ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
                  Campaign Results {isComplete && `(${campaignResults.filter(r => !r.error).length}/${campaignResults.length} successful)`}
                </h2>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <>
                      <button
                        onClick={exportCampaignAsZip}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Download className="w-4 h-4" />
                        Export All
                      </button>
                      <button
                        onClick={resetCampaign}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <RefreshCw className="w-4 h-4" />
                        New Campaign
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {isRunning && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                    <span>Running workflow {campaignProgress.current} of {campaignProgress.total}...</span>
                    <span>{Math.round((campaignProgress.current / campaignProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${(campaignProgress.current / campaignProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Results Cards */}
              <div className="space-y-4">
                {campaignResults.map((result, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: (result.workflowColor || '#6366f1') + '15' }}
                        >
                          {result.error ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4" style={{ color: result.workflowColor || '#6366f1' }} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{result.workflowName}</h3>
                          {result.error && <p className="text-xs text-red-600">Error: {result.error}</p>}
                        </div>
                      </div>
                      {!result.error && (
                        <button
                          onClick={() => copyToClipboard(result.rawContent, `campaign-${index}`)}
                          className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 px-2 py-1"
                        >
                          {copiedId === `campaign-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedId === `campaign-${index}` ? 'Copied' : 'Copy All'}
                        </button>
                      )}
                    </div>
                    {!result.error && (
                      <div className="p-4 max-h-64 overflow-y-auto">
                        {(result.outputSections || []).slice(0, 2).map(section => {
                          const content = result.outputs?.[section.id];
                          if (!content) return null;
                          return (
                            <div key={section.id} className="mb-3">
                              <h4 className="text-xs font-medium text-slate-500 uppercase mb-1">{section.label}</h4>
                              <div className="text-sm text-slate-700 line-clamp-4">
                                {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
                              </div>
                            </div>
                          );
                        })}
                        {(result.outputSections || []).length > 2 && (
                          <p className="text-xs text-slate-400">+ {(result.outputSections || []).length - 2} more sections</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Setup (show when not running and no results) */}
          {!isRunning && campaignResults.length === 0 && (
            <>
              {/* Client Profile Selection */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  Client Profile
                </h3>
                {clientProfiles.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No client profiles saved yet.{' '}
                    <button onClick={() => setCurrentView('settings')} className="text-blue-600 hover:underline">
                      Create one in Settings
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {clientProfiles.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => setCampaignClientProfile(profile)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          campaignClientProfile?.id === profile.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 truncate">{profile.name}</div>
                        <div className="text-xs text-slate-500 truncate">{profile.location || 'No location'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaign Presets */}
              <div className="mb-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick Start Presets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CAMPAIGN_PRESETS.map(preset => {
                    const PresetIcon = iconMap[preset.icon] || Package;
                    const isSelected = preset.workflowIds.every(id =>
                      campaignWorkflows.find(w => w.id === id)
                    ) && campaignWorkflows.length === preset.workflowIds.length;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => selectCampaignPreset(preset)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: preset.color + '15' }}
                          >
                            <PresetIcon className="w-5 h-5" style={{ color: preset.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900">{preset.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{preset.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                              <span>{preset.workflowIds.length} workflows</span>
                              <span>•</span>
                              <span>{preset.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Workflow Selection */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Select Workflows
                  </h3>
                  {campaignWorkflows.length > 0 && (
                    <button
                      onClick={() => setCampaignWorkflows([])}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {workflows.map(workflow => {
                    const isSelected = campaignWorkflows.find(w => w.id === workflow.id);
                    const WIcon = iconMap[workflow.icon] || FileText;
                    return (
                      <button
                        key={workflow.id}
                        onClick={() => toggleCampaignWorkflow(workflow)}
                        disabled={!hasApiKey}
                        className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                          <WIcon className="w-4 h-4 flex-shrink-0" style={{ color: workflow.color }} />
                          <span className="font-medium text-sm text-slate-900 truncate">{workflow.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Workflows Order */}
              {campaignWorkflows.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Execution Order</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaignWorkflows.map((workflow, index) => {
                      const WIcon = iconMap[workflow.icon] || FileText;
                      return (
                        <div
                          key={workflow.id}
                          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <WIcon className="w-4 h-4" style={{ color: workflow.color }} />
                          <span className="text-sm font-medium text-slate-900">{workflow.name}</span>
                          <button
                            onClick={() => toggleCampaignWorkflow(workflow)}
                            className="text-slate-400 hover:text-red-500 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Run Campaign Button */}
              <div className="flex justify-center">
                <button
                  onClick={runCampaign}
                  disabled={!hasApiKey || campaignWorkflows.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <Play className="w-5 h-5" />
                  Run Campaign ({campaignWorkflows.length} workflows)
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    );
  };

  // Render History Page
  const renderHistory = () => {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <Clock className="w-5 h-5 text-slate-600" />
              <h1 className="font-semibold text-slate-900">Generation History</h1>
              <span className="text-sm text-slate-500">({artifacts.length} saved)</span>
            </div>
            {artifacts.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all saved generations? This cannot be undone.')) {
                    clearAllArtifacts();
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg"
              >
                Clear All
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* History Search */}
          {artifacts.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by workflow, client, or category..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {artifacts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No saved generations yet</h3>
              <p className="text-slate-500 mb-4">Run a workflow to generate content. Results are automatically saved here.</p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4" />
                Browse Workflows
              </button>
            </div>
          ) : filteredArtifacts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No results match "{historySearch}"</p>
              <button onClick={() => setHistorySearch('')} className="text-blue-600 text-sm mt-2">Clear search</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArtifacts.map(artifact => {
                const Icon = iconMap[categories[artifact.workflowCategory]?.icon] || FileText;
                return (
                  <div
                    key={artifact.id}
                    className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                            <Icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate">{artifact.workflowName}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>{formatRelativeTime(artifact.timestamp)}</span>
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
                            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteArtifact(artifact.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
    filteredWorkflows.forEach(w => {
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
                  {currentProvider.icon} {(settings.model || 'Unknown').split('-').slice(0, 2).join(' ')}
                </span>
              )}
              <button
                onClick={() => setCurrentView('campaign')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                title="Campaign Builder"
              >
                <Package className="w-3.5 h-3.5" />
                Campaign
              </button>
              <button onClick={() => setCurrentView('history')} className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Clock className="w-4 h-4 text-slate-500" />
                {artifacts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {artifacts.length > 9 ? '9+' : artifacts.length}
                  </span>
                )}
              </button>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('campaign')}
                  disabled={!hasApiKey}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Campaign Builder
                </button>
              </div>
            </div>
          </div>

          {/* Search and Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={workflowSearch}
                onChange={(e) => setWorkflowSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {workflowSearch && (
                <button
                  onClick={() => setWorkflowSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {clientProfiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Quick:</span>
                {clientProfiles.slice(0, 3).map(profile => (
                  <span key={profile.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
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
                                  {(workflow.outputSections || []).length} outputs
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

        {/* Client Profile Modal */}
        {showClientProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">New Client Profile</h3>
                <button onClick={() => setShowClientProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Client/Firm Name *</label>
                  <input
                    type="text"
                    value={newClientProfile.name}
                    onChange={(e) => setNewClientProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Smith & Associates"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
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
                    placeholder="Personal Injury, Car Accidents"
                  />
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tone/Voice</label>
                  <select
                    value={newClientProfile.tone}
                    onChange={(e) => setNewClientProfile(p => ({ ...p, tone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="empathetic">Empathetic</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unique Value Proposition</label>
                  <textarea
                    value={newClientProfile.uniqueValue}
                    onChange={(e) => setNewClientProfile(p => ({ ...p, uniqueValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    rows={2}
                    placeholder="What makes this firm unique?"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowClientProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newClientProfile.name.trim()) {
                      const profile = saveClientProfile(newClientProfile);
                      applyClientProfile(profile);
                      setShowClientProfileModal(false);
                      setNewClientProfile({
                        name: '', practiceAreas: [], location: '', tone: 'professional',
                        competitors: '', website: '', uniqueValue: ''
                      });
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    );
  };

  // Main render
  if (currentView === 'settings') return renderSettings();
  if (currentView === 'workflow') return renderWorkflowPage();
  if (currentView === 'history') return renderHistory();
  if (currentView === 'artifact') return renderArtifactDetail();
  if (currentView === 'campaign') return renderCampaignBuilder();
  return renderDashboard();
}
