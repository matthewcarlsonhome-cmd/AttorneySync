# Attorney Sync AI Workflow Platform

A white-label, config-driven AI workflow platform for legal marketing automation. Built with React, Tailwind CSS, and Claude API.

## Features

- **10 Pre-built Workflows** optimized for legal marketing
- **Config-driven Architecture** - add new workflows without code changes
- **Professional UI** - clean, modern interface suitable for client-facing use
- **Real-time AI Generation** - powered by Claude Sonnet
- **Copy-to-clipboard** - easy export of all outputs
- **Responsive Design** - works on desktop and mobile

## Workflows Included

### Content
- **Content Brief Generator** - SEO-optimized content briefs
- **AI Article Generator** - Full blog post generation
- **Content Atomizer** - Repurpose content for multiple platforms

### SEO & Research
- **Keyword Research** - Comprehensive keyword analysis
- **Competitor Analysis** - Strategic competitive intelligence
- **Market Assessment** - Market opportunity analysis

### Social Media
- **LinkedIn Content Engine** - 5 post variants per topic

### Analytics
- **Monthly Report Narrative** - Transform data into insights

### Operations
- **Client Onboarding Checklist** - New client setup materials
- **Intake Call Analysis** - Lead qualification from transcripts

## Quick Start

### 1. Clone and Install

```bash
cd attorneysync-platform
npm install
```

### 2. Configure API Key

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Deploy to Netlify

```bash
npm run build
netlify deploy --prod
```

## Adding New Workflows

To add a new workflow, edit `src/workflows/index.js` and add a new object to the `workflows` array:

```javascript
{
  id: "new-workflow",
  name: "New Workflow Name",
  description: "What this workflow does",
  category: "content", // content, seo, social, analytics, operations
  icon: "FileText", // Lucide icon name
  color: "#3B82F6", // Hex color
  inputs: [
    { id: "input_name", label: "Input Label", type: "text", required: true, placeholder: "..." }
  ],
  systemPrompt: "You are an expert...",
  outputSections: [
    { id: "output_name", label: "Output Label", format: "markdown" }
  ],
  estimatedTime: "30-45 seconds"
}
```

No code changes required — just add the configuration and restart.

## Input Types

- `text` - Single line text input
- `textarea` - Multi-line text input
- `select` - Dropdown with options
- `multiselect` - Multiple selection chips
- `checkbox` - Boolean toggle

## Output Formats

- `text` - Plain text
- `markdown` - Rendered markdown
- `list` - Bulleted list
- `tags` - Comma-separated tags as chips
- `code` - Monospace code block

## Project Structure

```
attorneysync-platform/
├── src/
│   ├── workflows/
│   │   └── index.js      # All workflow configurations
│   ├── styles/
│   │   └── index.css     # Tailwind + custom styles
│   ├── App.jsx           # Main application
│   └── main.jsx          # Entry point
├── ARCHITECTURE.md       # Detailed architecture docs
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

## Security Notes

- API keys are stored in environment variables
- Never commit `.env` files
- For production, consider a backend proxy to protect API keys

## Support

For questions or customization requests, contact Matthew Carlson Consulting.
