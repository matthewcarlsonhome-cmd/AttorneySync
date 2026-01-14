# Attorney Sync AI

**AI-Powered Legal Marketing Automation Platform**

A white-label, config-driven AI workflow platform built specifically for legal marketing teams. Generate content, analyze markets, build campaigns, and streamline operations—all powered by Claude AI.

---

## Features

### Core Capabilities

- **12 Pre-built Workflows** — Complete coverage of legal marketing operations from content creation to client onboarding
- **Real-time AI Generation** — Powered by Claude Sonnet for fast, high-quality outputs
- **Config-driven Architecture** — Add new workflows without code changes
- **Professional UI** — Clean, modern interface with glassmorphism effects and smooth animations
- **Copy-to-Clipboard** — One-click copy for all generated outputs
- **Responsive Design** — Fully responsive across desktop, tablet, and mobile

### Integrations

- **WordPress Publishing** — Publish articles directly as drafts to client WordPress sites
- **Google Ads CSV Export** — Download campaign-ready CSV files for Google Ads Editor upload
- **Local Storage** — Settings and preferences persist across sessions

### Design System

- **Modern Aesthetics** — Gradient hero sections, card-based layouts, and subtle shadows
- **Category Color-coding** — Visual organization with distinct colors per workflow category
- **Animated Interactions** — Smooth hover effects, loading states, and fade-in animations
- **Accessible Forms** — Clear labels, help text, and visual feedback

---

## Workflows

### Content Creation (3 workflows)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **Content Brief Generator** | Generate SEO-optimized content briefs with headlines, meta descriptions, outlines, and keyword recommendations | Main 1-3 |
| **AI Article Generator** | Create full-length, publication-ready blog articles with FAQ schema and WordPress integration | Main 1-3 |
| **Content Atomizer** | Transform one blog post into 8+ formats: LinkedIn, Facebook, Twitter, Instagram, email, FAQ schema, video script, Google Business | Main 1-3 Extension |

### Advertising (1 workflow)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **Google Ads Campaign Builder** | Generate complete campaigns with ad groups, headlines (30 char), descriptions (90 char), keywords, and CSV export | Main 5 |

### Social Media (1 workflow)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **LinkedIn Content Engine** | Generate 5 post variants per topic: Story Hook, Myth Buster, Listicle, Question Hook, and Data Lead | Main 3 |

### Research & Analysis (1 workflow)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **Competitive Market Assessment** | Comprehensive market analysis with competitor landscape, SEO/PPC analysis, opportunity sizing, and strategic priorities | Appendix A1 |

### Analytics & Reporting (2 workflows)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **Monthly Report Generator** | Transform raw metrics into executive-ready narrative reports with insights and recommendations | Appendix A6 |
| **Attribution Capture & Analysis** | Generate "How Did You Hear About Us" tracking systems and analyze attribution data | Appendix A7 |

### Reputation Management (1 workflow)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **Review Generation & Response** | Generate review request templates and professional responses for both positive and negative reviews | Appendix A4 |

### Operations (3 workflows)

| Workflow | Description | Proposal Ref |
|----------|-------------|--------------|
| **Client Approval Request Generator** | Generate professional approval request emails with content preview and review checklists | Main 2 |
| **New Client Onboarding Generator** | Create complete onboarding packages: welcome messages, checklists, 30-day plans, kickoff agendas, 90-day milestones | Appendix A3 |
| **Intake Call Analysis & Coaching** | Analyze call transcripts to extract case info, qualification scores, red flags, and coaching insights | Appendix A5 |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 18.2 | UI components and state management |
| **Build Tool** | Vite 5 | Fast development with HMR |
| **Styling** | Tailwind CSS 3.3.6 | Utility-first responsive design |
| **Icons** | Lucide React 0.294 | Professional icon library |
| **Markdown** | React Markdown 9.0.1 | Render formatted AI outputs |
| **AI** | Claude API (Anthropic) | Content generation engine |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AttorneySync

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. Open the app at `http://localhost:5173`
2. Click the **Settings** icon in the header
3. Enter your Anthropic API key
4. (Optional) Configure WordPress credentials for direct publishing
5. (Optional) Set default client name and location to pre-fill forms

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Netlify, Vercel, or any static hosting.

---

## Project Structure

```
AttorneySync/
├── src/
│   ├── App.jsx              # Main application component (970 lines)
│   ├── main.jsx             # React entry point
│   ├── workflows/
│   │   └── index.js         # All 12 workflow configurations (612 lines)
│   └── styles/
│       └── index.css        # Tailwind + custom design system (449 lines)
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind customization
├── postcss.config.js        # PostCSS configuration
├── ARCHITECTURE.md          # Technical architecture documentation
└── README.md                # This file
```

---

## Adding New Workflows

The platform is fully config-driven. To add a new workflow, edit `src/workflows/index.js`:

```javascript
{
  id: "new-workflow-id",
  name: "Workflow Display Name",
  description: "Brief description of what this workflow does",
  category: "content", // content, advertising, social, research, analytics, reputation, operations
  icon: "FileText",    // Lucide icon name
  color: "#3B82F6",    // Category color (hex)
  proposalRef: "Main X",
  inputs: [
    {
      id: "input_id",
      label: "Input Label",
      type: "text",        // text, textarea, select, multiselect, checkbox
      required: true,
      placeholder: "Example placeholder",
      helpText: "Optional help text shown below input"
    }
  ],
  systemPrompt: `You are an expert... Output in XML format:
<o>
<section_id>Content here</section_id>
</o>`,
  outputSections: [
    { id: "section_id", label: "Section Label", format: "markdown" }
    // formats: markdown, text, list, tags, code
  ],
  estimatedTime: "30-45 seconds",
  outputActions: ["copy", "download_csv", "publish_wordpress"]
}
```

No code changes required—just add the configuration and restart.

### Input Types

| Type | Description |
|------|-------------|
| `text` | Single-line text input |
| `textarea` | Multi-line text input (configurable rows) |
| `select` | Dropdown with predefined options |
| `multiselect` | Multi-selection chips (click to toggle) |
| `checkbox` | Boolean toggle (yes/no) |

### Output Formats

| Format | Description |
|--------|-------------|
| `markdown` | Rendered markdown with prose styling |
| `text` | Plain text with preserved whitespace |
| `list` | Bulleted list from newline-separated items |
| `tags` | Comma-separated items as badges |
| `code` | Monospace code block with dark theme |

---

## Application Views

### Dashboard
- Hero section with platform overview and statistics
- API key warning banner (when not configured)
- Proposal workflow mapping reference card
- Workflow cards organized by category with:
  - Category icon and color coding
  - Workflow name and description
  - Estimated generation time
  - Proposal reference badge
  - Hover animations and disabled state for missing API key

### Workflow Page
- Two-column layout: inputs on left, outputs on right
- Dynamic form generation based on workflow configuration
- Real-time AI generation with loading state
- Output sections with:
  - Format-specific rendering
  - Copy-to-clipboard for each section
  - CSV download button (for Google Ads workflows)
  - WordPress publish button (for article workflows)

### Settings Page
- API Configuration (Anthropic API key)
- WordPress Integration (URL, username, application password)
- Default Values (client name, location)
- Settings persist to localStorage

---

## Design System

### Colors

| Category | Color | Usage |
|----------|-------|-------|
| Content | `#3B82F6` (Blue) | Content creation workflows |
| Advertising | `#EA4335` (Red) | Google Ads workflows |
| Social | `#8B5CF6` (Purple) | LinkedIn and social media |
| Research | `#10B981` (Green) | Market analysis |
| Analytics | `#F59E0B` (Amber) | Reports and attribution |
| Reputation | `#F59E0B` (Amber) | Review management |
| Operations | `#6B7280` (Gray) | Client operations |

### CSS Classes

```css
.btn-primary    /* Gradient blue button with shadow */
.btn-secondary  /* Light gray button */
.btn-ghost      /* Transparent hover button */
.input          /* Styled form input */
.card           /* White card with border and shadow */
.badge          /* Small rounded label */
.chip           /* Selectable chip for multiselect */
.prose          /* Markdown content styling */
```

---

## API Integration

### Claude API

The application makes direct browser API calls to Claude:

```javascript
POST https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: [Your API Key]
  - anthropic-version: 2023-06-01
  - anthropic-dangerous-direct-browser-access: true

Body:
  - model: claude-sonnet-4-20250514
  - max_tokens: 8192
  - system: [Workflow system prompt]
  - messages: [User inputs formatted as message]
```

### WordPress REST API

For article publishing:

```javascript
POST {wordpress_url}/wp-json/wp/v2/posts
Headers:
  - Authorization: Basic [base64(username:app_password)]
Body:
  - title: [Article headline]
  - content: [Article body]
  - status: draft
  - excerpt: [Meta description]
```

---

## Security Notes

- **API Key Storage**: Keys are stored in browser localStorage (client-side only)
- **No Server**: This is a client-side application—API keys are sent directly to Claude
- **Production Recommendation**: For production deployments, consider implementing a backend proxy to protect API keys
- **WordPress**: Uses Application Passwords (not user passwords) for secure authentication

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## License

Proprietary - Matthew Carlson Consulting

---

## Support

For questions, customization requests, or support, contact Matthew Carlson Consulting.
