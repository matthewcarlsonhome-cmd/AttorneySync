// Attorney Sync AI Platform - Complete Workflow Configurations
// Matches all 12 workflows from the original proposal

export const workflows = [
  // ============================================
  // MAIN 1-3: CONTENT PUBLISHING PIPELINE
  // ============================================
  {
    id: "content-brief-generator",
    name: "Content Brief Generator",
    description: "Generate comprehensive SEO-optimized content briefs for law firm blog posts. Step 1 of the Content Publishing Pipeline.",
    category: "content",
    icon: "FileText",
    color: "#3B82F6",
    proposalRef: "Main 1-3",
    inputs: [
      { id: "client_name", label: "Client/Firm Name", type: "text", required: true, placeholder: "Martinez & Associates", helpText: "The law firm this content is for" },
      { id: "practice_area", label: "Practice Area", type: "select", required: true, options: ["Personal Injury", "Car Accidents", "Truck Accidents", "Motorcycle Accidents", "Slip and Fall", "Medical Malpractice", "Wrongful Death", "Workers Compensation", "Family Law", "Criminal Defense", "Estate Planning", "Immigration", "Employment Law", "Business Law"] },
      { id: "topic", label: "Blog Topic", type: "textarea", required: true, placeholder: "e.g., What to do after a car accident in [City]", helpText: "The main topic or question this blog should answer" },
      { id: "target_location", label: "Target Location", type: "text", required: true, placeholder: "Phoenix, Arizona", helpText: "City/region for local SEO targeting" },
      { id: "target_keywords", label: "Target Keywords", type: "text", required: false, placeholder: "car accident lawyer phoenix, auto accident attorney", helpText: "Comma-separated primary keywords (optional)" },
      { id: "word_count", label: "Target Word Count", type: "select", required: true, options: ["800-1000 (Standard)", "1000-1500 (Comprehensive)", "1500-2000 (Pillar Content)", "2000+ (Ultimate Guide)"] }
    ],
    systemPrompt: `You are an expert legal content strategist specializing in law firm SEO. Create a comprehensive content brief.

Output in this exact XML structure:
<o>
<headlines>3 compelling headline options, each on its own line</headlines>
<meta_description>150-160 character SEO meta description</meta_description>
<primary_keyword>Main target keyword</primary_keyword>
<secondary_keywords>8-12 related keywords, comma separated</secondary_keywords>
<search_intent>What the searcher is trying to accomplish</search_intent>
<outline>Detailed H2/H3 outline in markdown format</outline>
<key_points>7-10 essential points to cover</key_points>
<internal_links>5 suggested internal link opportunities</internal_links>
<cta_recommendation>Recommended call-to-action</cta_recommendation>
</o>`,
    outputSections: [
      { id: "headlines", label: "Headline Options", format: "list" },
      { id: "meta_description", label: "Meta Description", format: "text" },
      { id: "primary_keyword", label: "Primary Keyword", format: "text" },
      { id: "secondary_keywords", label: "Secondary Keywords", format: "tags" },
      { id: "search_intent", label: "Search Intent", format: "text" },
      { id: "outline", label: "Content Outline", format: "markdown" },
      { id: "key_points", label: "Key Points", format: "list" },
      { id: "internal_links", label: "Internal Links", format: "list" },
      { id: "cta_recommendation", label: "CTA Recommendation", format: "text" }
    ],
    estimatedTime: "30-45 seconds",
    outputActions: ["copy", "download_docx"]
  },

  {
    id: "article-generator",
    name: "AI Article Generator",
    description: "Generate full-length, publication-ready blog articles from content briefs. Step 2 of the Content Publishing Pipeline.",
    category: "content",
    icon: "PenTool",
    color: "#3B82F6",
    proposalRef: "Main 1-3",
    inputs: [
      { id: "client_name", label: "Client/Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "headline", label: "Article Headline", type: "text", required: true, placeholder: "What to Do After a Car Accident in Phoenix" },
      { id: "outline", label: "Content Outline", type: "textarea", required: true, placeholder: "Paste outline from Content Brief Generator...", rows: 8 },
      { id: "target_keywords", label: "Target Keywords", type: "text", required: true, placeholder: "car accident lawyer phoenix" },
      { id: "target_location", label: "Target Location", type: "text", required: true, placeholder: "Phoenix, Arizona" },
      { id: "word_count", label: "Target Word Count", type: "select", required: true, options: ["800-1000", "1000-1500", "1500-2000", "2000+"] },
      { id: "tone", label: "Writing Tone", type: "select", required: true, options: ["Professional & Authoritative", "Warm & Empathetic", "Direct & Action-Oriented", "Educational & Informative"] },
      { id: "include_disclaimer", label: "Include Legal Disclaimer", type: "checkbox", required: false, default: true },
      { id: "include_faq_schema", label: "Generate FAQ Schema", type: "checkbox", required: false, default: true }
    ],
    systemPrompt: `You are an expert legal content writer. Write a complete, publication-ready blog article.

Output in this exact XML structure:
<o>
<article>Complete article in markdown with ## H2 and ### H3 headings</article>
<meta_title>SEO title tag (50-60 chars)</meta_title>
<meta_description>Meta description (150-160 chars)</meta_description>
<word_count>Actual word count</word_count>
<faq_schema>JSON-LD FAQ schema if requested</faq_schema>
</o>`,
    outputSections: [
      { id: "article", label: "Article Content", format: "markdown" },
      { id: "meta_title", label: "Meta Title", format: "text" },
      { id: "meta_description", label: "Meta Description", format: "text" },
      { id: "word_count", label: "Word Count", format: "text" },
      { id: "faq_schema", label: "FAQ Schema", format: "code" }
    ],
    estimatedTime: "60-90 seconds",
    outputActions: ["copy", "download_docx", "publish_wordpress"]
  },

  // ============================================
  // MAIN 2: CLIENT APPROVAL AUTOMATION
  // ============================================
  {
    id: "client-approval-request",
    name: "Client Approval Request Generator",
    description: "Generate professional approval request emails with content preview for client review.",
    category: "operations",
    icon: "CheckSquare",
    color: "#6B7280",
    proposalRef: "Main 2",
    inputs: [
      { id: "client_name", label: "Client Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "client_contact", label: "Client Contact Name", type: "text", required: true, placeholder: "Maria Martinez" },
      { id: "content_type", label: "Content Type", type: "select", required: true, options: ["Blog Post", "Service Page", "Landing Page", "Email Campaign", "Social Media Posts", "Google Ads Copy"] },
      { id: "content_title", label: "Content Title", type: "text", required: true, placeholder: "What to Do After a Car Accident" },
      { id: "content_body", label: "Content to Approve", type: "textarea", required: true, placeholder: "Paste the full content...", rows: 10 },
      { id: "approval_deadline", label: "Approval Needed By", type: "text", required: true, placeholder: "January 18, 2026" }
    ],
    systemPrompt: `You are a client success manager. Generate a professional approval request email.

Output in this exact XML structure:
<o>
<email_subject>Professional email subject</email_subject>
<email_body>Complete email in markdown</email_body>
<content_summary>3-4 bullet summary</content_summary>
<review_checklist>5-7 items for client to verify</review_checklist>
<slack_message>Short Slack message version</slack_message>
</o>`,
    outputSections: [
      { id: "email_subject", label: "Email Subject", format: "text" },
      { id: "email_body", label: "Email Body", format: "markdown" },
      { id: "content_summary", label: "Content Summary", format: "list" },
      { id: "review_checklist", label: "Review Checklist", format: "list" },
      { id: "slack_message", label: "Slack Message", format: "text" }
    ],
    estimatedTime: "20-30 seconds",
    outputActions: ["copy", "send_email"]
  },

  // ============================================
  // MAIN 3: LINKEDIN CONTENT ENGINE
  // ============================================
  {
    id: "linkedin-content-engine",
    name: "LinkedIn Content Engine",
    description: "Transform blog posts into 5 LinkedIn post variants optimized for engagement and thought leadership.",
    category: "social",
    icon: "Linkedin",
    color: "#8B5CF6",
    proposalRef: "Main 3",
    inputs: [
      { id: "attorney_name", label: "Attorney Name", type: "text", required: true, placeholder: "David Chen" },
      { id: "attorney_title", label: "Attorney Title", type: "text", required: false, placeholder: "Partner, Personal Injury" },
      { id: "firm_name", label: "Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "source_content", label: "Source Content", type: "textarea", required: true, placeholder: "Paste blog post or describe topic...", rows: 8 },
      { id: "content_angle", label: "Content Angle", type: "select", required: true, options: ["Thought Leadership", "Educational/How-To", "Personal Story", "Industry Commentary", "Case Insight (Anonymized)", "Legal News Analysis"] },
      { id: "include_cta", label: "Include Call-to-Action", type: "checkbox", required: false, default: true },
      { id: "cta_type", label: "CTA Type", type: "select", required: false, options: ["Free Consultation", "Comment/Engage", "Share Post", "Visit Website", "DM for More Info"] }
    ],
    systemPrompt: `You are a LinkedIn content strategist for attorneys. Generate 5 distinct post variants.

Create these styles:
1. STORY HOOK - Personal anecdote opening
2. MYTH BUSTER - Contrarian take
3. LISTICLE - Numbered insights
4. QUESTION HOOK - Engaging question
5. DATA LEAD - Statistics-based authority

Output in this exact XML structure:
<o>
<variant_1_story>Complete post with story hook</variant_1_story>
<variant_2_myth>Complete myth-busting post</variant_2_myth>
<variant_3_list>Complete listicle post</variant_3_list>
<variant_4_question>Complete question hook post</variant_4_question>
<variant_5_data>Complete data-led post</variant_5_data>
<hashtags>8-10 relevant hashtags</hashtags>
<best_posting_times>Recommended posting times</best_posting_times>
</o>`,
    outputSections: [
      { id: "variant_1_story", label: "Variant 1: Story Hook", format: "text" },
      { id: "variant_2_myth", label: "Variant 2: Myth Buster", format: "text" },
      { id: "variant_3_list", label: "Variant 3: Listicle", format: "text" },
      { id: "variant_4_question", label: "Variant 4: Question Hook", format: "text" },
      { id: "variant_5_data", label: "Variant 5: Data Lead", format: "text" },
      { id: "hashtags", label: "Hashtags", format: "tags" },
      { id: "best_posting_times", label: "Best Posting Times", format: "text" }
    ],
    estimatedTime: "45-60 seconds",
    outputActions: ["copy", "download_docx"]
  },

  // ============================================
  // MAIN 5: GOOGLE ADS CAMPAIGN BUILDER
  // ============================================
  {
    id: "google-ads-campaign-builder",
    name: "Google Ads Campaign Builder",
    description: "Generate complete Google Ads campaigns with ad groups, headlines, descriptions, and keywords. Exports to CSV for direct upload.",
    category: "advertising",
    icon: "Target",
    color: "#EA4335",
    proposalRef: "Main 5",
    inputs: [
      { id: "client_name", label: "Client/Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "practice_area", label: "Practice Area", type: "select", required: true, options: ["Personal Injury - General", "Car Accidents", "Truck Accidents", "Motorcycle Accidents", "Medical Malpractice", "Wrongful Death", "Workers Compensation", "Family Law - Divorce", "Criminal Defense - DUI", "Criminal Defense - General", "Estate Planning", "Immigration"] },
      { id: "target_location", label: "Target Location", type: "text", required: true, placeholder: "Phoenix, AZ" },
      { id: "service_area_radius", label: "Service Area Radius", type: "select", required: true, options: ["10 miles", "25 miles", "50 miles", "Statewide"] },
      { id: "campaign_goal", label: "Campaign Goal", type: "select", required: true, options: ["Phone Calls", "Form Submissions", "Both Calls & Forms"] },
      { id: "monthly_budget", label: "Monthly Budget", type: "select", required: true, options: ["$1,000-2,500", "$2,500-5,000", "$5,000-10,000", "$10,000-25,000", "$25,000+"] },
      { id: "firm_phone", label: "Firm Phone Number", type: "text", required: true, placeholder: "(555) 123-4567" },
      { id: "website_url", label: "Website URL", type: "text", required: true, placeholder: "https://martinezlaw.com" },
      { id: "landing_page", label: "Landing Page URL", type: "text", required: false, placeholder: "https://martinezlaw.com/car-accident-lawyer/" },
      { id: "unique_selling_points", label: "Unique Selling Points", type: "textarea", required: true, placeholder: "Free consultations\nNo fee unless we win\n30+ years experience" }
    ],
    systemPrompt: `You are an expert Google Ads specialist for law firms. Generate a complete, upload-ready campaign.

Headlines must be EXACTLY 30 characters or less.
Descriptions must be EXACTLY 90 characters or less.

Output in this exact XML structure:
<o>
<campaign_name>Campaign name</campaign_name>
<campaign_settings>Budget, bidding, targeting recommendations</campaign_settings>
<ad_groups>Complete ad group structure with keywords, headlines (30 char max), descriptions (90 char max)</ad_groups>
<negative_keywords>50+ negative keywords</negative_keywords>
<extensions>Sitelink, callout, call extension recommendations</extensions>
<csv_data>CSV formatted for Google Ads Editor:
Campaign,Ad Group,Keyword,Match Type,Headline 1,Headline 2,Headline 3,Description 1,Description 2,Final URL
[Complete data rows]</csv_data>
</o>`,
    outputSections: [
      { id: "campaign_name", label: "Campaign Name", format: "text" },
      { id: "campaign_settings", label: "Campaign Settings", format: "markdown" },
      { id: "ad_groups", label: "Ad Groups", format: "markdown" },
      { id: "negative_keywords", label: "Negative Keywords", format: "list" },
      { id: "extensions", label: "Extensions", format: "markdown" },
      { id: "csv_data", label: "CSV for Upload", format: "code" }
    ],
    estimatedTime: "90-120 seconds",
    outputActions: ["copy", "download_csv", "download_xlsx"]
  },

  // ============================================
  // APPENDIX A1: MARKET ASSESSMENT
  // ============================================
  {
    id: "market-assessment",
    name: "Competitive Market Assessment",
    description: "Generate comprehensive market analysis for new client pitches with competitor analysis and opportunity sizing.",
    category: "research",
    icon: "TrendingUp",
    color: "#10B981",
    proposalRef: "Appendix A1",
    inputs: [
      { id: "firm_name", label: "Prospect/Client Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "firm_website", label: "Firm Website URL", type: "text", required: true, placeholder: "https://martinezlaw.com" },
      { id: "practice_areas", label: "Practice Areas", type: "multiselect", required: true, options: ["Personal Injury", "Car Accidents", "Medical Malpractice", "Family Law", "Criminal Defense", "Estate Planning", "Immigration", "Employment Law", "Business Law"] },
      { id: "target_location", label: "Target Market", type: "text", required: true, placeholder: "Phoenix, Arizona metro" },
      { id: "firm_size", label: "Firm Size", type: "select", required: true, options: ["Solo Practitioner", "2-5 Attorneys", "6-15 Attorneys", "16-50 Attorneys", "50+ Attorneys"] },
      { id: "competitor_urls", label: "Known Competitors", type: "textarea", required: false, placeholder: "https://competitor1.com\nhttps://competitor2.com" },
      { id: "monthly_budget_range", label: "Estimated Marketing Budget", type: "select", required: false, options: ["Unknown", "$0-2,500/mo", "$2,500-5,000/mo", "$5,000-10,000/mo", "$10,000+/mo"] }
    ],
    systemPrompt: `You are a legal marketing strategist conducting a market assessment for a pitch. Provide actionable insights.

Output in this exact XML structure:
<o>
<executive_summary>3-4 sentence summary</executive_summary>
<market_overview>Local market size and trends</market_overview>
<opportunity_sizing>Revenue opportunity estimate</opportunity_sizing>
<competitive_landscape>Top 5 competitors analysis</competitive_landscape>
<seo_analysis>Organic visibility assessment</seo_analysis>
<ppc_analysis>Estimated CPCs and competition</ppc_analysis>
<quick_wins>5 immediate opportunities</quick_wins>
<strategic_priorities>Top 5 priorities</strategic_priorities>
<investment_recommendation>Budget recommendation</investment_recommendation>
</o>`,
    outputSections: [
      { id: "executive_summary", label: "Executive Summary", format: "markdown" },
      { id: "market_overview", label: "Market Overview", format: "markdown" },
      { id: "opportunity_sizing", label: "Opportunity Sizing", format: "markdown" },
      { id: "competitive_landscape", label: "Competitive Landscape", format: "markdown" },
      { id: "seo_analysis", label: "SEO Analysis", format: "markdown" },
      { id: "ppc_analysis", label: "PPC Analysis", format: "markdown" },
      { id: "quick_wins", label: "Quick Wins", format: "list" },
      { id: "strategic_priorities", label: "Strategic Priorities", format: "list" },
      { id: "investment_recommendation", label: "Investment Recommendation", format: "markdown" }
    ],
    estimatedTime: "60-90 seconds",
    outputActions: ["copy", "download_docx", "download_pptx"]
  },

  // ============================================
  // APPENDIX A2: EMAIL-TO-TASK
  // ============================================
  {
    id: "email-to-task",
    name: "Email-to-Task Processor",
    description: "Parse client emails to extract action items, deadlines, and create structured task lists.",
    category: "operations",
    icon: "Mail",
    color: "#6B7280",
    proposalRef: "Appendix A2",
    inputs: [
      { id: "client_name", label: "Client Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "email_content", label: "Email Content", type: "textarea", required: true, placeholder: "Paste full email thread here...", rows: 12 },
      { id: "account_manager", label: "Account Manager", type: "text", required: true, placeholder: "Sarah Johnson" },
      { id: "priority_override", label: "Priority Override", type: "select", required: false, options: ["Auto-detect", "High - Urgent", "Medium - This Week", "Low - When Available"] }
    ],
    systemPrompt: `You are a project manager extracting tasks from client emails.

Output in this exact XML structure:
<o>
<email_summary>2-3 sentence summary</email_summary>
<client_sentiment>Happy/Neutral/Concerned/Frustrated</client_sentiment>
<tasks>Task list with title, description, deadline, priority, assignee</tasks>
<follow_up_needed>Clarifying questions</follow_up_needed>
<response_draft>Draft reply email</response_draft>
</o>`,
    outputSections: [
      { id: "email_summary", label: "Email Summary", format: "markdown" },
      { id: "client_sentiment", label: "Client Sentiment", format: "text" },
      { id: "tasks", label: "Extracted Tasks", format: "markdown" },
      { id: "follow_up_needed", label: "Follow-up Questions", format: "list" },
      { id: "response_draft", label: "Draft Response", format: "text" }
    ],
    estimatedTime: "20-30 seconds",
    outputActions: ["copy"]
  },

  // ============================================
  // APPENDIX A3: CLIENT ONBOARDING
  // ============================================
  {
    id: "client-onboarding",
    name: "New Client Onboarding Generator",
    description: "Generate comprehensive onboarding packages including checklists, kickoff agendas, and 90-day milestones.",
    category: "operations",
    icon: "ClipboardList",
    color: "#6B7280",
    proposalRef: "Appendix A3",
    inputs: [
      { id: "client_name", label: "New Client Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "client_contact", label: "Primary Contact Name", type: "text", required: true, placeholder: "Maria Martinez" },
      { id: "client_email", label: "Primary Contact Email", type: "text", required: true, placeholder: "maria@martinezlaw.com" },
      { id: "practice_areas", label: "Practice Areas", type: "multiselect", required: true, options: ["Personal Injury", "Family Law", "Criminal Defense", "Estate Planning", "Immigration", "Employment Law"] },
      { id: "services", label: "Services Engaged", type: "multiselect", required: true, options: ["SEO", "Content Marketing", "Google Ads/PPC", "Social Media", "Website Design", "Reputation Management", "Full Service"] },
      { id: "monthly_retainer", label: "Monthly Retainer", type: "select", required: true, options: ["$1,000-2,500", "$2,500-5,000", "$5,000-10,000", "$10,000-20,000", "$20,000+"] },
      { id: "start_date", label: "Start Date", type: "text", required: true, placeholder: "February 1, 2026" }
    ],
    systemPrompt: `You are a client success specialist. Create a comprehensive onboarding package.

Output in this exact XML structure:
<o>
<welcome_message>Personalized welcome email</welcome_message>
<items_needed>Checklist of items needed from client</items_needed>
<credentials_checklist>Accounts and credentials required</credentials_checklist>
<thirty_day_plan>Week-by-week first 30 days</thirty_day_plan>
<kickoff_agenda>60-minute kickoff meeting agenda</kickoff_agenda>
<ninety_day_milestones>Key milestones for 90 days</ninety_day_milestones>
<communication_plan>Meeting cadence and reporting schedule</communication_plan>
</o>`,
    outputSections: [
      { id: "welcome_message", label: "Welcome Message", format: "markdown" },
      { id: "items_needed", label: "Items Needed", format: "list" },
      { id: "credentials_checklist", label: "Credentials Checklist", format: "list" },
      { id: "thirty_day_plan", label: "First 30 Days", format: "markdown" },
      { id: "kickoff_agenda", label: "Kickoff Agenda", format: "markdown" },
      { id: "ninety_day_milestones", label: "90-Day Milestones", format: "list" },
      { id: "communication_plan", label: "Communication Plan", format: "markdown" }
    ],
    estimatedTime: "45-60 seconds",
    outputActions: ["copy", "download_docx", "send_email"]
  },

  // ============================================
  // APPENDIX A4: REVIEW MANAGEMENT
  // ============================================
  {
    id: "review-management",
    name: "Review Generation & Response",
    description: "Generate review request templates and professional responses to positive and negative reviews.",
    category: "reputation",
    icon: "Star",
    color: "#F59E0B",
    proposalRef: "Appendix A4",
    inputs: [
      { id: "client_name", label: "Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "mode", label: "Mode", type: "select", required: true, options: ["Generate Review Request", "Respond to Positive Review", "Respond to Negative Review", "All Templates"] },
      { id: "review_text", label: "Review Text (for responses)", type: "textarea", required: false, placeholder: "Paste review to respond to..." },
      { id: "reviewer_name", label: "Reviewer Name", type: "text", required: false, placeholder: "John D." },
      { id: "review_platform", label: "Platform", type: "select", required: true, options: ["Google Business Profile", "Avvo", "Yelp", "Facebook", "Lawyers.com"] }
    ],
    systemPrompt: `You are a reputation management specialist for law firms.

Output in this exact XML structure:
<o>
<review_request_email>Email template for requesting reviews</review_request_email>
<review_request_sms>SMS version</review_request_sms>
<positive_response>Response for positive reviews</positive_response>
<negative_response>Response for negative reviews with de-escalation</negative_response>
<internal_notes>Notes for team handling</internal_notes>
</o>`,
    outputSections: [
      { id: "review_request_email", label: "Review Request Email", format: "markdown" },
      { id: "review_request_sms", label: "SMS Version", format: "text" },
      { id: "positive_response", label: "Positive Response", format: "text" },
      { id: "negative_response", label: "Negative Response", format: "text" },
      { id: "internal_notes", label: "Internal Notes", format: "markdown" }
    ],
    estimatedTime: "20-30 seconds",
    outputActions: ["copy"]
  },

  // ============================================
  // APPENDIX A5: INTAKE CALL ANALYSIS
  // ============================================
  {
    id: "intake-call-analysis",
    name: "Intake Call Analysis & Coaching",
    description: "Analyze intake call transcripts to extract case info, qualify leads, and provide coaching insights.",
    category: "operations",
    icon: "Phone",
    color: "#6B7280",
    proposalRef: "Appendix A5",
    inputs: [
      { id: "client_name", label: "Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "transcript", label: "Call Transcript", type: "textarea", required: true, placeholder: "Paste intake call transcript...", rows: 15 },
      { id: "intake_rep_name", label: "Intake Representative", type: "text", required: false, placeholder: "Sarah Johnson" },
      { id: "practice_areas", label: "Firm Practice Areas", type: "multiselect", required: true, options: ["Personal Injury", "Car Accidents", "Truck Accidents", "Medical Malpractice", "Wrongful Death", "Workers Comp", "Family Law", "Criminal Defense"] },
      { id: "minimum_case_value", label: "Minimum Case Value", type: "select", required: false, options: ["No Minimum", "$10,000+", "$25,000+", "$50,000+", "$100,000+"] }
    ],
    systemPrompt: `You are a legal intake specialist and call coach. Analyze the transcript.

Output in this exact XML structure:
<o>
<caller_info>Name, phone, email, relationship to case</caller_info>
<case_summary>2-3 sentence summary</case_summary>
<incident_details>Date, location, injuries, parties</incident_details>
<qualification_score>1-10 score with reasoning</qualification_score>
<practice_area_match>Matching practice area(s)</practice_area_match>
<red_flags>Concerns or issues</red_flags>
<urgency_level>Low/Medium/High/Critical</urgency_level>
<intake_coaching>Feedback for intake rep</intake_coaching>
<follow_up_tasks>Task list for CRM</follow_up_tasks>
</o>`,
    outputSections: [
      { id: "caller_info", label: "Caller Info", format: "markdown" },
      { id: "case_summary", label: "Case Summary", format: "text" },
      { id: "incident_details", label: "Incident Details", format: "markdown" },
      { id: "qualification_score", label: "Qualification Score", format: "text" },
      { id: "practice_area_match", label: "Practice Area", format: "text" },
      { id: "red_flags", label: "Red Flags", format: "list" },
      { id: "urgency_level", label: "Urgency", format: "text" },
      { id: "intake_coaching", label: "Coaching Feedback", format: "markdown" },
      { id: "follow_up_tasks", label: "Follow-up Tasks", format: "list" }
    ],
    estimatedTime: "30-45 seconds",
    outputActions: ["copy"]
  },

  // ============================================
  // APPENDIX A6: MONTHLY REPORTS
  // ============================================
  {
    id: "monthly-report-narrative",
    name: "Monthly Report Generator",
    description: "Transform raw analytics into executive-ready narrative reports with insights and recommendations.",
    category: "analytics",
    icon: "BarChart3",
    color: "#F59E0B",
    proposalRef: "Appendix A6",
    inputs: [
      { id: "client_name", label: "Client Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "report_month", label: "Report Month", type: "text", required: true, placeholder: "January 2026" },
      { id: "metrics_data", label: "Key Metrics", type: "textarea", required: true, placeholder: "Sessions: 5,234 (+12%)\nLeads: 47\nGoogle Ads Spend: $4,500\n...", rows: 10 },
      { id: "goals", label: "Monthly Goals", type: "textarea", required: false, placeholder: "What were the goals?" },
      { id: "notable_events", label: "Notable Events", type: "textarea", required: false, placeholder: "Campaign launches, changes, etc." },
      { id: "services_active", label: "Active Services", type: "multiselect", required: true, options: ["SEO", "Content Marketing", "Google Ads", "Social Media", "Email Marketing", "Reputation Management"] }
    ],
    systemPrompt: `You are a marketing analytics expert creating executive reports for attorneys.

Output in this exact XML structure:
<o>
<executive_summary>3-4 sentence summary</executive_summary>
<key_wins>Top 5 wins with data</key_wins>
<performance_analysis>Detailed analysis</performance_analysis>
<trend_insights>Patterns and trends</trend_insights>
<goal_progress>Progress vs goals</goal_progress>
<recommendations>5-7 recommendations for next month</recommendations>
<next_month_focus>Top 3 priorities</next_month_focus>
</o>`,
    outputSections: [
      { id: "executive_summary", label: "Executive Summary", format: "markdown" },
      { id: "key_wins", label: "Key Wins", format: "list" },
      { id: "performance_analysis", label: "Performance Analysis", format: "markdown" },
      { id: "trend_insights", label: "Trend Insights", format: "markdown" },
      { id: "goal_progress", label: "Goal Progress", format: "markdown" },
      { id: "recommendations", label: "Recommendations", format: "list" },
      { id: "next_month_focus", label: "Next Month Focus", format: "list" }
    ],
    estimatedTime: "45-60 seconds",
    outputActions: ["copy", "download_docx", "download_pptx"]
  },

  // ============================================
  // APPENDIX A7: ATTRIBUTION CAPTURE
  // ============================================
  {
    id: "attribution-capture",
    name: "Attribution Capture & Analysis",
    description: "Generate 'How Did You Hear About Us' tracking systems and analyze attribution data.",
    category: "analytics",
    icon: "PieChart",
    color: "#F59E0B",
    proposalRef: "Appendix A7",
    inputs: [
      { id: "client_name", label: "Client Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "mode", label: "Mode", type: "select", required: true, options: ["Generate Tracking System", "Analyze Attribution Data", "Both"] },
      { id: "attribution_data", label: "Attribution Data", type: "textarea", required: false, placeholder: "Google Search: 45 leads\nGoogle Ads: 34 leads\n...", rows: 8 },
      { id: "intake_method", label: "Intake Methods", type: "multiselect", required: true, options: ["Phone Calls", "Website Forms", "Live Chat", "Email", "Walk-ins"] },
      { id: "marketing_channels", label: "Marketing Channels", type: "multiselect", required: true, options: ["Google Ads", "SEO/Organic", "Google Business", "Facebook Ads", "TV", "Radio", "Billboards", "Referrals"] }
    ],
    systemPrompt: `You are a marketing attribution specialist for law firms.

Output in this exact XML structure:
<o>
<intake_script>Word-for-word script for asking attribution</intake_script>
<form_field_config>Dropdown options and setup</form_field_config>
<tracking_categories>Standardized categories</tracking_categories>
<attribution_analysis>Analysis of provided data</attribution_analysis>
<channel_performance>Performance by channel</channel_performance>
<optimization_recommendations>Recommendations</optimization_recommendations>
</o>`,
    outputSections: [
      { id: "intake_script", label: "Intake Script", format: "text" },
      { id: "form_field_config", label: "Form Configuration", format: "markdown" },
      { id: "tracking_categories", label: "Categories", format: "list" },
      { id: "attribution_analysis", label: "Attribution Analysis", format: "markdown" },
      { id: "channel_performance", label: "Channel Performance", format: "markdown" },
      { id: "optimization_recommendations", label: "Recommendations", format: "list" }
    ],
    estimatedTime: "30-45 seconds",
    outputActions: ["copy", "download_docx"]
  },

  // ============================================
  // CONTENT ATOMIZER
  // ============================================
  {
    id: "content-atomizer",
    name: "Content Atomizer",
    description: "Transform one blog post into multiple content pieces for social, email, video, and more.",
    category: "content",
    icon: "Layers",
    color: "#3B82F6",
    proposalRef: "Main 1-3 Extension",
    inputs: [
      { id: "client_name", label: "Client/Firm Name", type: "text", required: true, placeholder: "Martinez & Associates" },
      { id: "original_content", label: "Original Blog Post", type: "textarea", required: true, placeholder: "Paste full blog post...", rows: 10 },
      { id: "blog_url", label: "Blog URL", type: "text", required: false, placeholder: "https://martinezlaw.com/blog/..." },
      { id: "platforms", label: "Target Platforms", type: "multiselect", required: true, options: ["LinkedIn", "Facebook", "Twitter/X", "Instagram", "Email Newsletter", "FAQ Schema", "Video Script", "Google Business Post"] },
      { id: "attorney_name", label: "Attorney Name", type: "text", required: false, placeholder: "Maria Martinez" }
    ],
    systemPrompt: `You are a content repurposing specialist. Transform blog content into multiple formats.

Output in this exact XML structure:
<o>
<linkedin_post>1200-1500 char LinkedIn post</linkedin_post>
<facebook_post>400-600 char Facebook post</facebook_post>
<twitter_thread>5-7 tweet thread</twitter_thread>
<instagram_caption>Caption with hashtags</instagram_caption>
<email_newsletter>Newsletter snippet</email_newsletter>
<faq_schema>JSON-LD FAQ markup</faq_schema>
<video_script>60-90 second script</video_script>
<gbp_post>Google Business post</gbp_post>
</o>`,
    outputSections: [
      { id: "linkedin_post", label: "LinkedIn", format: "text" },
      { id: "facebook_post", label: "Facebook", format: "text" },
      { id: "twitter_thread", label: "Twitter Thread", format: "list" },
      { id: "instagram_caption", label: "Instagram", format: "text" },
      { id: "email_newsletter", label: "Email Newsletter", format: "markdown" },
      { id: "faq_schema", label: "FAQ Schema", format: "code" },
      { id: "video_script", label: "Video Script", format: "markdown" },
      { id: "gbp_post", label: "Google Business", format: "text" }
    ],
    estimatedTime: "45-60 seconds",
    outputActions: ["copy", "download_docx"]
  }
];

// Category definitions
export const categories = {
  content: { name: "Content Creation", color: "#3B82F6", icon: "FileText", description: "Blog posts, briefs, and content" },
  advertising: { name: "Advertising", color: "#EA4335", icon: "Target", description: "Google Ads campaigns" },
  social: { name: "Social Media", color: "#8B5CF6", icon: "Share2", description: "LinkedIn and social content" },
  research: { name: "Research & Analysis", color: "#10B981", icon: "TrendingUp", description: "Market and competitor analysis" },
  analytics: { name: "Analytics & Reporting", color: "#F59E0B", icon: "BarChart3", description: "Reports and attribution" },
  reputation: { name: "Reputation", color: "#F59E0B", icon: "Star", description: "Reviews management" },
  operations: { name: "Operations", color: "#6B7280", icon: "Settings", description: "Client workflows" }
};

// Proposal reference mapping
export const proposalMapping = {
  "Main 1-3": ["content-brief-generator", "article-generator", "content-atomizer"],
  "Main 2": ["client-approval-request"],
  "Main 3": ["linkedin-content-engine"],
  "Main 5": ["google-ads-campaign-builder"],
  "Appendix A1": ["market-assessment"],
  "Appendix A2": ["email-to-task"],
  "Appendix A3": ["client-onboarding"],
  "Appendix A4": ["review-management"],
  "Appendix A5": ["intake-call-analysis"],
  "Appendix A6": ["monthly-report-narrative"],
  "Appendix A7": ["attribution-capture"]
};

export default workflows;
