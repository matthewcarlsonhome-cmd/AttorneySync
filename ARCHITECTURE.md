# Attorney Sync AI Workflow Platform

## Architecture Overview

A white-label, config-driven AI workflow platform that provides Attorney Sync team members with dedicated interfaces for each automation workflow. Built for scalability — adding new workflows requires only a new configuration file.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite | Fast, modern SPA |
| Styling | Tailwind CSS | Utility-first, professional design |
| State | React Context + useState | Lightweight state management |
| API | Claude API (Anthropic) | AI completions |
| Hosting | Vercel / Netlify | Serverless deployment |
| Auth | Simple token-based (Phase 2: Auth0) | Team access control |

---

## Directory Structure

```
attorneysync-platform/
├── config/
│   └── workflows/           # Workflow configuration files
│       ├── content-brief.json
│       ├── article-generator.json
│       ├── linkedin-engine.json
│       └── ...
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── WorkflowCard.jsx
│   │   ├── InputForm.jsx
│   │   ├── OutputDisplay.jsx
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── Dashboard.jsx
│   │   ├── WorkflowPage.jsx
│   │   └── Settings.jsx
│   ├── api/                 # API integration
│   │   └── claude.js
│   ├── hooks/               # Custom React hooks
│   │   └── useWorkflow.js
│   ├── styles/              # Global styles
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── assets/
├── .env                     # API keys (not committed)
├── package.json
└── vite.config.js
```

---

## Workflow Configuration Schema

Each workflow is defined by a JSON configuration file:

```json
{
  "id": "content-brief-generator",
  "name": "Content Brief Generator",
  "description": "Generate comprehensive content briefs for blog posts",
  "category": "content",
  "icon": "FileText",
  "color": "#3B82F6",
  
  "inputs": [
    {
      "id": "client_name",
      "label": "Client Name",
      "type": "text",
      "required": true,
      "placeholder": "Martinez & Associates"
    },
    {
      "id": "topic",
      "label": "Blog Topic",
      "type": "textarea",
      "required": true,
      "placeholder": "What topic should the blog post cover?"
    },
    {
      "id": "practice_area",
      "label": "Practice Area",
      "type": "select",
      "options": ["Personal Injury", "Family Law", "Criminal Defense", "Estate Planning"],
      "required": true
    },
    {
      "id": "target_keywords",
      "label": "Target Keywords",
      "type": "tags",
      "required": false
    }
  ],
  
  "systemPrompt": "You are an expert legal content strategist...",
  
  "outputFormat": {
    "type": "structured",
    "sections": [
      { "id": "headline", "label": "Headline Options", "format": "list" },
      { "id": "outline", "label": "Content Outline", "format": "markdown" },
      { "id": "seo_notes", "label": "SEO Recommendations", "format": "text" },
      { "id": "cta", "label": "Call to Action", "format": "text" }
    ]
  },
  
  "estimatedTime": "30 seconds",
  "creditCost": 1
}
```

---

## Key Features

### 1. Dashboard
- Grid of workflow cards organized by category
- Quick stats (workflows run, credits used)
- Recent activity feed

### 2. Workflow Pages
- Dynamic routing: `/workflow/:workflowId`
- Auto-generated input forms from config
- Real-time streaming output
- Copy/export functionality
- History of previous runs

### 3. Output Handling
- Structured outputs parsed into sections
- Markdown rendering
- One-click copy to clipboard
- Export to DOCX (via docx library)
- Save to workflow history

### 4. Admin Features (Phase 2)
- Workflow editor UI
- Usage analytics
- Team management
- Custom branding per client

---

## API Integration

### Claude API Call Structure

```javascript
const runWorkflow = async (workflowConfig, inputs) => {
  const userMessage = buildPromptFromInputs(workflowConfig, inputs);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: workflowConfig.systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  
  return parseStructuredOutput(response, workflowConfig.outputFormat);
};
```

### Output Parsing

The system prompt instructs Claude to return structured outputs using XML tags:

```
<output>
  <headline>...</headline>
  <outline>...</outline>
  <seo_notes>...</seo_notes>
  <cta>...</cta>
</output>
```

These are parsed and rendered into the appropriate UI sections.

---

## Workflow Categories

| Category | Workflows | Color |
|----------|-----------|-------|
| **Content** | Brief Generator, Article Generator, Content Atomizer | Blue |
| **SEO** | Keyword Research, On-Page Audit, Competitor Analysis | Green |
| **Social** | LinkedIn Engine, Social Scheduler | Purple |
| **Analytics** | Monthly Report, Performance Analysis | Orange |
| **Operations** | Client Onboarding, Intake Analysis | Gray |

---

## Deployment

### Environment Variables
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_APP_NAME=Attorney Sync AI Platform
VITE_APP_VERSION=1.0.0
```

### Build & Deploy
```bash
npm run build          # Creates dist/ folder
netlify deploy --prod  # Deploys to Netlify
```

---

## Scaling: Adding New Workflows

To add a new workflow:

1. Create `config/workflows/new-workflow.json`
2. Define inputs, system prompt, and output format
3. Restart dev server (or redeploy)
4. New workflow appears automatically in dashboard

No code changes required — fully config-driven.

---

## Security Considerations

1. **API Key Protection**: Keys stored in environment variables, never exposed to client
2. **Rate Limiting**: Implement per-user rate limits
3. **Input Sanitization**: All user inputs sanitized before API calls
4. **Authentication**: Team-only access via token/Auth0

---

## Phase 2 Roadmap

- [ ] User authentication (Auth0)
- [ ] Workflow history & favorites
- [ ] Team usage analytics
- [ ] Custom client branding
- [ ] Workflow editor UI
- [ ] Batch processing mode
- [ ] API access for external integrations
