# Attorney Sync AI Platform - Complete Workflow Documentation

**Version:** 1.0
**Last Updated:** January 15, 2026
**Total Workflows:** 21

---

## Table of Contents

1. [Content Creation Workflows](#content-creation-workflows)
   - [Content Brief Generator](#1-content-brief-generator)
   - [AI Article Generator](#2-ai-article-generator)
   - [Content Atomizer](#3-content-atomizer)
   - [Case Study Generator](#4-case-study-generator)
   - [Video Script Writer](#5-video-script-writer)
   - [Podcast Show Notes Generator](#6-podcast-show-notes-generator)

2. [Advertising Workflows](#advertising-workflows)
   - [Google Ads Campaign Builder](#7-google-ads-campaign-builder)
   - [Facebook & Instagram Ads](#8-facebook--instagram-ads)
   - [Email Marketing Campaign](#9-email-marketing-campaign)

3. [Client Operations Workflows](#client-operations-workflows)
   - [Client Approval Request Generator](#10-client-approval-request-generator)
   - [New Client Onboarding Generator](#11-new-client-onboarding-generator)
   - [Email-to-Task Processor](#12-email-to-task-processor)
   - [Intake Call Analysis & Coaching](#13-intake-call-analysis--coaching)

4. [Reporting & Analytics Workflows](#reporting--analytics-workflows)
   - [Monthly Report Generator](#14-monthly-report-generator)
   - [Attribution Capture & Analysis](#15-attribution-capture--analysis)
   - [Competitive Market Assessment](#16-competitive-market-assessment)

5. [Digital Presence Workflows](#digital-presence-workflows)
   - [LinkedIn Content Engine](#17-linkedin-content-engine)
   - [Google Business Profile Optimizer](#18-google-business-profile-optimizer)
   - [Website Audit & Optimization](#19-website-audit--optimization)

6. [Reputation & Compliance Workflows](#reputation--compliance-workflows)
   - [Review Generation & Response](#20-review-generation--response)
   - [Legal Compliance Checker](#21-legal-compliance-checker)

---

## Content Creation Workflows

### 1. Content Brief Generator

**Intent & Purpose:**
Creates comprehensive SEO-optimized content briefs that serve as the foundation for law firm blog posts. This is Step 1 of the Content Publishing Pipeline, designed to ensure every piece of content has proper keyword targeting, search intent alignment, and a clear outline before writing begins.

**When to Use:**
- Before writing any new blog post or website content
- When planning content for a new practice area page
- When creating a content calendar

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client/Firm Name | Law firm this content is for | "Martinez & Associates" |
| Practice Area | Legal specialty for the content | "Car Accidents" |
| Blog Topic | Main topic or question to answer | "What to do after a car accident in Phoenix" |
| Target Location | City/region for local SEO | "Phoenix, Arizona" |
| Word Count | Target length of final article | "1000-1500 (Comprehensive)" |

**Optional Inputs:**
- Target Keywords (comma-separated list)

**Expected Outputs:**
1. **Headline Options** - 3 SEO-optimized headline variations
2. **Meta Description** - 150-160 character SEO description
3. **Primary Keyword Analysis** - Target keyword with difficulty assessment
4. **Secondary Keywords** - Supporting keywords organized by priority
5. **Search Intent Analysis** - What the searcher wants and how to deliver it
6. **Content Outline** - Complete H2/H3 structure with section guidance
7. **Key Points** - Must-include information and differentiators
8. **Internal Links** - Strategy for linking to other firm content
9. **CTA Recommendation** - Call-to-action matched to user intent

**Best Practices:**
- Run this workflow BEFORE writing any content
- Use the output to brief writers or guide your own writing
- The outline becomes the skeleton for the Article Generator workflow
- Review keyword suggestions against actual search volume data

---

### 2. AI Article Generator

**Intent & Purpose:**
Generates full-length, publication-ready blog articles from content briefs. This is Step 2 of the Content Publishing Pipeline, transforming the strategic brief into polished, legally compliant content that's ready for client review and publication.

**When to Use:**
- After completing a Content Brief
- When you need a complete article draft quickly
- When producing content at scale

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client/Firm Name | Law firm name | "Martinez & Associates" |
| Article Headline | Title from content brief | "What to Do After a Car Accident in Phoenix" |
| Content Outline | Paste outline from Content Brief Generator | [H2/H3 structure] |
| Target Keywords | Primary and secondary keywords | "car accident lawyer phoenix" |
| Target Location | Geographic area | "Phoenix, Arizona" |
| Word Count | Target word count | "1000-1500" |
| Writing Tone | Voice for the article | "Warm & Empathetic" |

**Optional Inputs:**
- Include Legal Disclaimer (checkbox, default: on)
- Generate FAQ Schema (checkbox, default: on)

**Expected Outputs:**
1. **Article Content** - Complete, formatted blog post with H2/H3 structure, FAQ section, and legal disclaimer
2. **Meta Title** - SEO-optimized title tag (50-60 chars)
3. **Meta Description** - Compelling meta description (150-160 chars)
4. **Word Count** - Confirmation of target met
5. **FAQ Schema** - JSON-LD structured data for featured snippets

**Best Practices:**
- Always start with a Content Brief first
- Review and customize the output - don't publish without human review
- Have attorneys verify legal accuracy
- Use the FAQ schema on your website for better search visibility

---

### 3. Content Atomizer

**Intent & Purpose:**
Transforms a single blog post into multiple content pieces optimized for different platforms. Maximizes ROI on content investment by repurposing one piece of content into 7+ formats including LinkedIn, Facebook, Twitter threads, Instagram, email newsletters, video scripts, and Google Business posts.

**When to Use:**
- After publishing a new blog post
- When building a social media content calendar
- To maximize reach from quality content investments

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client/Firm Name | Law firm name | "Martinez & Associates" |
| Original Blog Post | Full text of the blog post | [Paste full article] |
| Target Platforms | Which platforms to create content for | LinkedIn, Facebook, Instagram, Email |

**Optional Inputs:**
- Blog URL (for link inclusion)
- Attorney Name (for personal branding)

**Expected Outputs:**
1. **LinkedIn Post** - Professional thought leadership post with hook (under 210 chars before "See more")
2. **Facebook Post** - Approachable, shorter format for Facebook
3. **Twitter Thread** - 7-10 tweet thread with key insights
4. **Instagram Caption** - Emoji-rich caption with hashtags for carousel posts
5. **Email Newsletter** - Subject lines and email body with CTA
6. **FAQ Schema** - Additional Q&A extracted for structured data
7. **Video Script** - 60-90 second script based on blog content
8. **Google Business Post** - Local SEO optimized post

**Best Practices:**
- Use the LinkedIn version for personal attorney accounts
- Post content across platforms over 1-2 weeks (don't post all at once)
- Customize hashtags for your specific location
- Use the video script as a starting point, not verbatim

---

### 4. Case Study Generator

**Intent & Purpose:**
Transforms case results into compelling marketing case studies while maintaining client confidentiality and bar compliance. Creates multiple versions (full, short, social) from a single case outcome.

**When to Use:**
- After settling or winning a significant case
- When updating the "Results" section of your website
- For social proof in marketing materials

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Firm Name | Your law firm | "Johnson & Partners" |
| Case Type | Type of legal case | "Car Accident" |
| Case Outcome | How the case resolved | "Settlement" |
| Case Summary | What happened (detailed, confidential) | "Client rear-ended by commercial vehicle..." |
| Challenges Overcome | Obstacles your team overcame | "Insurance denied claim, disputed liability" |
| Location | Where case occurred | "Houston, Texas" |

**Optional Inputs:**
- Settlement/Verdict Amount (specific or use range)
- Client Testimonial (if available and approved)

**Expected Outputs:**
1. **Full Case Study** - 600-800 word detailed case study
2. **Short Version** - 100-150 word version for website cards
3. **Social Media Versions** - LinkedIn, Facebook, GBP versions
4. **SEO Elements** - Title, meta, keywords, schema markup
5. **Compliance Review** - Checklist confirming bar compliance

**Best Practices:**
- Never use client names without written consent
- Always include the "results may vary" disclaimer
- Have compliance officer review before publishing
- Keep specific dollar amounts consistent with what's publicly filed

---

### 5. Video Script Writer

**Intent & Purpose:**
Creates professional video scripts for law firm YouTube channels, social media, and website videos. Includes teleprompter-ready versions, shot suggestions, and platform-specific adaptations.

**When to Use:**
- Planning educational YouTube content
- Creating attorney introduction videos
- Producing TikTok/Reels content
- Building practice area explanation videos

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Firm/Attorney Name | Who appears in video | "Attorney Michael Chen" |
| Video Type | Category of video | "Educational/FAQ" |
| Topic | What the video covers | "What to do after a car accident" |
| Target Length | Desired duration | "Medium (1-3 minutes)" |
| Platform | Where video will be posted | "YouTube" |
| Practice Area | Legal specialty | "Personal Injury" |
| Tone | Desired feel | "Warm & Approachable" |
| Call to Action | What viewer should do | "Call for a free consultation at 555-1234" |

**Expected Outputs:**
1. **Video Overview** - Title, description, tags for SEO
2. **Full Script** - Timestamped script with stage directions
3. **Teleprompter Version** - Clean, large-text reading version
4. **B-Roll Suggestions** - Visual recommendations per section
5. **Short-Form Versions** - TikTok/Reels and LinkedIn adaptations
6. **Production Notes** - Setting, wardrobe, equipment suggestions

**Best Practices:**
- Practice reading the script aloud before filming
- Keep the hook under 5 seconds - that's where viewers decide to stay
- Film short-form versions separately, not as cuts from long-form
- Include captions for accessibility and silent viewing

---

### 6. Podcast Show Notes Generator

**Intent & Purpose:**
Generates comprehensive podcast show notes, episode descriptions, timestamps, and promotional content. Improves podcast discoverability through SEO and provides value to listeners.

**When to Use:**
- After recording a podcast episode
- When preparing episode for publication
- Creating promotional content for episodes

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Podcast Name | Your podcast title | "The Legal Edge Podcast" |
| Episode Title | This episode's title | "What to Know Before Filing a Personal Injury Claim" |
| Host Name(s) | Who hosted | "Attorney Sarah Johnson" |
| Episode Summary | What was discussed | "Covered statute of limitations, common mistakes..." |
| Episode Length | Duration | "30-45 minutes" |
| Target Audience | Who listens | "Potential clients seeking legal help" |

**Optional Inputs:**
- Episode Number
- Guest Name and info
- Key Timestamps (if known)

**Expected Outputs:**
1. **Episode Description** - Short (160 char) and full versions
2. **Timestamps** - Clickable chapter markers
3. **Key Takeaways** - 5 main points from episode
4. **Resources & Links** - Mentioned resources with placeholders
5. **Guest Bio** - If guest was featured
6. **Social Promotion** - Twitter thread, LinkedIn, Instagram, email
7. **SEO Elements** - Title, meta, keywords
8. **Notable Quotes** - Pull quotes for audiograms

**Best Practices:**
- Add timestamps to YouTube/Spotify for better navigation
- Create audiograms from the notable quotes
- Post show notes on your website (not just podcast platforms) for SEO
- Include a transcript for accessibility and SEO

---

## Advertising Workflows

### 7. Google Ads Campaign Builder

**Intent & Purpose:**
Generates complete, production-ready Google Ads campaigns including 85+ keywords across 5 categories, 3 RSA ad sets for A/B testing, 5 ad groups, negative keywords, extensions, and CSV files for direct import into Google Ads Editor. This is your comprehensive Google Ads launch kit.

**When to Use:**
- Launching a new Google Ads campaign
- Expanding into a new practice area
- Rebuilding an underperforming campaign
- Onboarding a new law firm client

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client/Firm Name | Law firm name | "Martinez & Associates" |
| Practice Area | Legal specialty | "Car Accidents" |
| Target Location | City/region | "Phoenix, AZ" |
| Service Area Radius | Geographic reach | "25 miles" |
| Campaign Goal | What to optimize for | "Phone Calls" |
| Monthly Budget | Ad spend range | "$5,000-10,000" |
| Firm Phone | Trackable phone number | "(555) 123-4567" |
| Website URL | Firm website | "https://martinezlaw.com" |
| Unique Selling Points | Differentiators | "Free consultations, No fee unless we win" |

**Optional Inputs:**
- Landing Page URL (specific campaign landing page)

**Expected Outputs:**
1. **Campaign Name** - Proper naming convention
2. **Campaign Settings** - Networks, budget, bidding, location settings
3. **Keyword Research (85+ Keywords)** - Organized by intent:
   - High-Intent (Hire Now) - 20+ keywords
   - Consultation Keywords - 15+ keywords
   - Research Intent - 15+ keywords
   - Location-Modified - 20+ keywords
   - Long-Tail Opportunities - 15+ keywords
4. **Ad Copy Library (3 RSA Sets)**:
   - Set 1: Trust & Experience Focus (15 headlines, 4 descriptions)
   - Set 2: Results & Social Proof Focus
   - Set 3: Urgency & Availability Focus
5. **Ad Groups (5 Groups)** - Themed with assigned keywords and ads
6. **Negative Keywords** - 50+ organized by category
7. **Extensions** - Sitelinks, callouts, structured snippets
8. **CSV Files** - Import-ready for Google Ads Editor

**Best Practices:**
- Review and adjust keywords based on actual search volume
- Start with manual CPC or maximize clicks until you have 30+ conversions
- Monitor search terms report weekly for new negatives
- Test ad copy variations - don't just use one RSA set

---

### 8. Facebook & Instagram Ads

**Intent & Purpose:**
Generates complete Meta advertising campaigns for legal services including 10 ad copy variants for A/B testing, audience targeting recommendations, lead form setup, Instagram-specific content, and CSV files for Meta Ads Manager bulk upload.

**When to Use:**
- Launching Facebook/Instagram ad campaigns
- Testing new messaging angles
- Expanding reach beyond search advertising
- Retargeting website visitors

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client/Firm Name | Law firm name | "Martinez Law Group" |
| Practice Area | Legal specialty | "Personal Injury" |
| Target Location | Geographic area | "Miami, Florida" |
| Campaign Objective | Goal | "Lead Generation (Form Fills)" |
| Unique Selling Points | Differentiators | "Free consultations, No fee unless we win" |
| Monthly Budget Range | Ad spend | "$5,000 - $10,000" |

**Optional Inputs:**
- Special Offers/CTAs

**Expected Outputs:**
1. **Campaign Structure** - Naming, objectives, budget allocation
2. **Ad Copy Library (10 Variants)**:
   - A1/A2: Empathy-Led variations
   - B1/B2: Authority-Led variations
   - C1/C2: Urgency-Led variations
   - D1/D2: Social Proof variations
   - E1/E2: Value Proposition variations
3. **Instagram-Specific** - Stories ads, Reels scripts, feed posts
4. **Audience Targeting** - Primary, lookalike, and retargeting audiences
5. **Lead Form Setup** - Questions and thank-you screen
6. **Budget Recommendations** - Daily budget, bid strategy, CPL targets
7. **Compliance Notes** - Legal advertising requirements
8. **CSV Files** - Campaign, Ad Set, and Ads CSVs for bulk upload

**Best Practices:**
- Test all 10 ad variants - let Facebook's algorithm find winners
- Use lead forms for highest conversion rates
- Set up the Meta Pixel for retargeting and optimization
- Review ads for compliance before publishing

---

### 9. Email Marketing Campaign

**Intent & Purpose:**
Generates complete email sequences for law firm marketing including welcome series, lead nurture campaigns, re-engagement sequences, and newsletter content. Includes automation logic and segmentation recommendations.

**When to Use:**
- Setting up email automation for new leads
- Re-engaging past inquiries who didn't convert
- Creating a welcome series for new subscribers
- Building newsletter content

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client/Firm Name | Law firm name | "Johnson Legal Associates" |
| Campaign Type | Type of sequence | "Lead Nurture (Unconverted Leads)" |
| Practice Areas | Legal specialties | Personal Injury, Car Accidents |
| Service Area | Geographic location | "Chicago, Illinois and surrounding areas" |
| Email Count | Number of emails | "5 emails" |
| Tone/Voice | Writing style | "Warm & Empathetic" |
| Unique Value | Differentiators | "Free consultations, 24/7 availability" |
| Include Automation | Automation logic | "Yes - full automation logic" |

**Expected Outputs:**
1. **Campaign Overview** - Goals, timeline, expected metrics
2. **Email Sequence** - Full email content for each message:
   - Subject lines and preview text
   - Complete email body
   - CTA buttons and links
   - A/B test suggestions
   - Send timing
3. **Automation Logic** - Entry triggers, flow, branch logic, exit conditions
4. **Segmentation** - Audience segment recommendations
5. **Compliance Checklist** - CAN-SPAM and legal advertising requirements

**Best Practices:**
- Don't send all emails at once - follow the suggested timing
- Personalize with {{first_name}} tokens
- Include unsubscribe links in all emails
- Test subject lines with small segments first

---

## Client Operations Workflows

### 10. Client Approval Request Generator

**Intent & Purpose:**
Generates professional content approval request emails for client review. Creates structured approval workflows that respect clients' busy schedules while ensuring thorough review of deliverables.

**When to Use:**
- Sending blog posts for client approval
- Getting sign-off on ad copy
- Sharing any deliverable requiring client input
- Managing approval workflows efficiently

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client Name | Law firm name | "Martinez & Associates" |
| Client Contact Name | Person to address | "Maria Martinez" |
| Content Type | What needs approval | "Blog Post" |
| Content Title | Title of deliverable | "What to Do After a Car Accident" |
| Content Body | Full content to approve | [Paste content] |
| Approval Deadline | When feedback is needed | "January 18, 2026" |

**Expected Outputs:**
1. **Email Subject** - Clear subject line (under 50 chars)
2. **Email Body** - Professional approval request with:
   - Content overview
   - Review items checklist
   - Timeline and next steps
   - Approval instructions
3. **Content Summary** - Quick reference of deliverable details
4. **Review Checklist** - Specific items for client to verify
5. **Slack Message** - Internal team notification template

**Best Practices:**
- Include specific items for review, not just "please approve"
- Give at least 48-72 hours for approval
- Make approval easy - "Reply 'Approved' or note changes"
- Follow up if no response by deadline

---

### 11. New Client Onboarding Generator

**Intent & Purpose:**
Generates comprehensive client onboarding packages including welcome emails, credential checklists, kickoff meeting agendas, 30-day plans, and 90-day success milestones. Ensures consistent, thorough onboarding for every new client.

**When to Use:**
- Signing a new law firm client
- Standardizing your onboarding process
- Creating onboarding documentation

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| New Client Name | Firm name | "Martinez & Associates" |
| Primary Contact | Main contact person | "Maria Martinez" |
| Primary Contact Email | Contact email | "maria@martinezlaw.com" |
| Practice Areas | Their specialties | Personal Injury, Family Law |
| Services Engaged | What you're providing | SEO, Google Ads, Content Marketing |
| Monthly Retainer | Budget tier | "$5,000-10,000" |
| Start Date | When engagement begins | "February 1, 2026" |

**Expected Outputs:**
1. **Welcome Message** - Professional welcome email
2. **Items Needed** - Brand info, materials required from client
3. **Credentials Checklist** - Platform access requirements with instructions
4. **First 30 Days** - Week-by-week plan with tasks and owners
5. **Kickoff Agenda** - 60-minute kickoff meeting structure
6. **90-Day Milestones** - Success metrics and checkpoints
7. **Communication Plan** - Meeting schedule, reporting, escalation paths

**Best Practices:**
- Send welcome email within 24 hours of signing
- Schedule kickoff call within first week
- Track credential collection - this often delays projects
- Set realistic 90-day milestones based on service tier

---

### 12. Email-to-Task Processor

**Intent & Purpose:**
Parses client emails to extract action items, assess sentiment, identify deadlines, and generate appropriate responses. Ensures nothing falls through the cracks and maintains strong client relationships.

**When to Use:**
- Processing complex client emails
- Identifying action items from client communication
- Assessing client sentiment/relationship health
- Drafting professional responses

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client Name | Law firm name | "Martinez & Associates" |
| Email Content | Full email thread | [Paste email] |
| Account Manager | Who manages this account | "Sarah Johnson" |

**Optional Inputs:**
- Priority Override (if you know urgency level)

**Expected Outputs:**
1. **Email Summary** - Key points and underlying message
2. **Client Sentiment** - Emotional assessment (Happy/Neutral/Frustrated)
3. **Extracted Tasks** - Action items with:
   - Priority level (P0-P4)
   - Deadline
   - Assigned owner
   - Deliverable definition
4. **Follow-up Questions** - Clarifications needed before proceeding
5. **Draft Response** - Professional reply with action items confirmed

**Best Practices:**
- Use for complex emails with multiple requests
- Don't skip sentiment analysis - it flags relationship issues early
- Follow up on P0/P1 items same day
- Track tasks in your project management system

---

### 13. Intake Call Analysis & Coaching

**Intent & Purpose:**
Analyzes intake call transcripts to extract case information, score lead quality, identify red flags, and provide coaching feedback for intake representatives. Improves both case acceptance quality and intake team performance.

**When to Use:**
- Reviewing intake calls for quality assurance
- Training intake staff
- Qualifying leads for attorney review
- Improving intake processes

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Firm Name | Law firm | "Martinez & Associates" |
| Transcript | Full call transcript | [Paste transcript] |
| Firm Practice Areas | What firm handles | Personal Injury, Car Accidents |

**Optional Inputs:**
- Intake Representative Name
- Minimum Case Value threshold

**Expected Outputs:**
1. **Caller Info** - Contact details, relationship to case
2. **Case Summary** - One-liner and detailed summary
3. **Incident Details** - Date, location, parties, injuries, documentation
4. **Qualification Score** - 1-10 score with breakdown:
   - Liability (30% weight)
   - Damages (30% weight)
   - Insurance Coverage (20% weight)
   - Venue (10% weight)
   - Client Factors (10% weight)
5. **Practice Area Match** - Primary and secondary claim types
6. **Red Flags** - Critical, major, and minor concerns
7. **Urgency Level** - SOL tracking and time-sensitive actions
8. **Intake Coaching** - Performance feedback with specific improvements
9. **Follow-up Tasks** - CRM tasks and client communication schedule

**Best Practices:**
- Review high-value calls (7+ score) with attorneys immediately
- Use coaching feedback for regular training sessions
- Track SOL dates in your case management system
- Don't skip documenting red flags - they matter for case acceptance

---

## Reporting & Analytics Workflows

### 14. Monthly Report Generator

**Intent & Purpose:**
Transforms raw marketing analytics into executive-ready narrative reports. Provides clear insights, trend analysis, and actionable recommendations that attorneys can understand and act on.

**When to Use:**
- Creating monthly client reports
- Preparing for client review meetings
- Summarizing marketing performance

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client Name | Law firm name | "Martinez & Associates" |
| Report Month | Reporting period | "January 2026" |
| Key Metrics | Raw performance data | "Sessions: 5,234, Leads: 47..." |
| Active Services | What you're managing | SEO, Google Ads, Content |

**Optional Inputs:**
- Monthly Goals (what targets were set)
- Notable Events (campaign launches, changes)

**Expected Outputs:**
1. **Executive Summary** - 30-second overview with key numbers
2. **Key Wins** - 5 significant achievements with context
3. **Performance Analysis** - Detailed metrics:
   - Website performance
   - Traffic sources
   - Lead generation
   - Google Ads (if active)
   - SEO/Content (if active)
4. **Trend Insights** - What's trending up/down and why
5. **Goal Progress** - Monthly and YTD vs targets
6. **Recommendations** - Prioritized action items
7. **Next Month Focus** - Top 3 priorities with success metrics

**Best Practices:**
- Lead with the executive summary - most clients only read this
- Include specific numbers, not just percentages
- Make recommendations actionable ("Do X by Y date")
- Compare to previous period and goals, not just raw numbers

---

### 15. Attribution Capture & Analysis

**Intent & Purpose:**
Generates "How Did You Hear About Us" tracking systems including intake scripts, form configurations, and analysis of attribution data. Helps firms understand which marketing channels actually drive cases. **This workflow helps you BUILD the system to track attribution, then later ANALYZE the data you collect.**

**When to Use:**
- Setting up attribution tracking for a firm
- Training intake staff on source capture
- Analyzing marketing channel effectiveness
- Optimizing marketing budget allocation

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Client Name | Law firm name | "Martinez & Associates" |
| Mode | What you need | "Generate Tracking System" or "Analyze Attribution Data" or "Both" |
| Intake Methods | How leads come in | Phone Calls, Website Forms, Live Chat |
| Marketing Channels | Active channels | Google Ads, SEO/Organic, Referrals, TV |

**Optional Inputs:**
- Attribution Data (for analysis mode - paste historical data)

**Expected Outputs:**
1. **Intake Script** - Word-for-word script for phone intake:
   - Primary attribution question
   - Follow-up probes for vague answers
   - Quick reference card for staff
2. **Form Field Configuration** - Dropdown options, conditional logic
3. **Tracking Categories** - Standardized category codes
4. **Attribution Analysis** (if data provided):
   - Performance by category
   - Multi-touch journey patterns
   - Data quality assessment
5. **Channel Performance** - Efficiency ranking by CPL and conversion
6. **Optimization Recommendations** - Budget reallocation suggestions

**Best Practices:**
- The intake script is conversational, not interrogating
- Don't accept "Google" as an answer - probe for organic vs. ads
- Track referral sources by name when possible
- Monitor "Unknown" percentage - keep it under 15%

---

### 16. Competitive Market Assessment

**Intent & Purpose:**
Generates comprehensive market analysis for new client pitches including competitor analysis, opportunity sizing, SEO/PPC landscape, and investment recommendations. Perfect for proposals and discovery sessions.

**When to Use:**
- Pitching a prospective law firm client
- Conducting discovery for a new engagement
- Researching a new market or practice area
- Building business case for marketing investment

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Firm Name | Prospect/client name | "Martinez & Associates" |
| Firm Website | Their current website | "https://martinezlaw.com" |
| Practice Areas | What they handle | Personal Injury, Car Accidents |
| Target Location | Their market | "Phoenix, Arizona metro" |
| Firm Size | Number of attorneys | "6-15 Attorneys" |

**Optional Inputs:**
- Known Competitors (URLs)
- Estimated Marketing Budget

**Expected Outputs:**
1. **Executive Summary** - Market opportunity and confidence level
2. **Market Overview** - Population, demand, trends, regulations
3. **Opportunity Sizing** - Revenue projections (conservative/moderate/aggressive)
4. **Competitive Landscape** - Top 5 competitors with strengths/weaknesses
5. **SEO Analysis** - Current position, keyword opportunities, content gaps
6. **PPC Analysis** - CPCs, competitor spend, opportunity assessment
7. **Quick Wins** - 5 actions with 90-day impact
8. **Strategic Priorities** - 12-month roadmap
9. **Investment Recommendation** - Budget allocation and ROI projections

**Best Practices:**
- Be conservative in projections - better to over-deliver
- Research competitors before running the workflow
- Use output for pitch decks and proposals
- Update assessment annually for existing clients

---

## Digital Presence Workflows

### 17. LinkedIn Content Engine

**Intent & Purpose:**
Transforms blog posts or topics into 5 distinct LinkedIn post variants optimized for engagement. Each variant uses a different hook strategy (Story, Myth Buster, Listicle, Question, Data Lead) for testing.

**When to Use:**
- Repurposing blog content for LinkedIn
- Building attorney personal brands
- Creating thought leadership content
- A/B testing post formats

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Attorney Name | Who will post | "David Chen" |
| Firm Name | Law firm | "Martinez & Associates" |
| Source Content | Blog post or topic | [Paste blog or describe topic] |
| Content Angle | Post approach | "Thought Leadership" |

**Optional Inputs:**
- Attorney Title
- Include Call-to-Action
- CTA Type

**Expected Outputs:**
1. **Variant 1: Story Hook** - Personal narrative format
2. **Variant 2: Myth Buster** - Contrarian/debate format
3. **Variant 3: Listicle** - Numbered tips format
4. **Variant 4: Question Hook** - Curiosity-gap format
5. **Variant 5: Data Lead** - Statistics-driven format
6. **Hashtags** - Recommended hashtags for first comment
7. **Best Posting Times** - Optimal schedule

Each variant includes:
- Hook text (under 210 characters - before "See more")
- Full post text (1,200-1,500 characters)
- Character counts
- Engagement focus

**Best Practices:**
- Test all 5 variants over 2-3 weeks
- Put hashtags in first comment, not post body
- Engage on 10-15 posts before and after publishing
- Respond to all comments within first 2 hours

---

### 18. Google Business Profile Optimizer

**Intent & Purpose:**
Optimizes Google Business Profiles for local SEO dominance. Generates descriptions, categories, services, weekly posts, Q&A content, and review response templates.

**When to Use:**
- Setting up a new Google Business Profile
- Optimizing an underperforming GBP
- Creating GBP content calendar
- Improving local search visibility

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Business Name | Firm name (as registered) | "Smith & Associates Law Firm" |
| Practice Areas | Legal specialties | Personal Injury, Criminal Defense |
| City & State | Primary location | "Austin, Texas" |
| Unique Attributes | Differentiators | "Free consultations, Spanish-speaking" |
| Business Hours | Operating hours | "Mon-Fri 8am-6pm, Sat by appointment" |

**Optional Inputs:**
- Service Areas (other cities/regions)
- Languages Spoken

**Expected Outputs:**
1. **Business Description** - Keyword-optimized (750 chars max)
2. **Categories** - Primary and secondary category recommendations
3. **Services List** - 10-20 services with descriptions
4. **Weekly Posts** - 4 weeks of GBP post content
5. **Q&A Section** - 5 pre-populated questions and answers
6. **Review Responses** - Templates for 5-star, 4-star, and negative reviews
7. **Photo Checklist** - Required and recommended photos

**Best Practices:**
- Keep business name exactly as registered (no keyword stuffing)
- Post weekly minimum to maintain freshness
- Pre-populate Q&A before competitors ask unflattering questions
- Respond to all reviews within 24-48 hours

---

### 19. Website Audit & Optimization

**Intent & Purpose:**
Provides comprehensive audit of law firm websites covering SEO, conversion optimization, user experience, and content strategy. Includes 90-day action plan with prioritized improvements.

**When to Use:**
- Onboarding a new client
- Diagnosing underperforming website
- Planning website improvements
- Preparing for website redesign

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Website URL | Site to audit | "https://www.smithlawfirm.com" |
| Firm Name | Law firm | "Smith Law Firm" |
| Practice Areas | What they handle | Personal Injury, Family Law |
| Target Location | Primary market | "Denver, Colorado" |
| Primary Goals | Website objectives | Generate phone calls, Form submissions |

**Optional Inputs:**
- Top 3 Competitor URLs
- Estimated Monthly Traffic

**Expected Outputs:**
1. **Executive Summary** - Overall grade (A-F), key findings, priorities
2. **SEO Audit**:
   - Technical SEO checklist
   - On-page optimization assessment
   - Content SEO evaluation
3. **Conversion Audit**:
   - CTA analysis
   - Trust signals review
   - Contact options assessment
   - Conversion barriers identified
4. **Content Recommendations** - Missing content, improvements, calendar
5. **Local SEO** - GBP, NAP consistency, local optimization
6. **90-Day Action Plan** - Month-by-month tasks with expected outcomes

**Best Practices:**
- Share executive summary first with client leadership
- Prioritize fixes by impact, not ease
- Track baseline metrics before making changes
- Re-audit quarterly to measure progress

---

## Reputation & Compliance Workflows

### 20. Review Generation & Response

**Intent & Purpose:**
Generates review request templates (email and SMS), response templates for positive and negative reviews, and internal tracking documentation. Builds and protects online reputation.

**When to Use:**
- Setting up review request campaigns
- Responding to new reviews
- Handling negative reviews
- Training staff on review management

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Firm Name | Law firm name | "Martinez & Associates" |
| Mode | What you need | "All Templates" |
| Platform | Where review is/goes | "Google Business Profile" |

**Optional Inputs:**
- Review Text (for responses)
- Reviewer Name

**Expected Outputs:**
1. **Review Request Email** - Professional request with platform links
2. **SMS Version** - Short text message version
3. **Positive Response** - Template for 4-5 star reviews
4. **Negative Response** - De-escalation template that moves offline
5. **Internal Notes** - Team documentation and action items

**Best Practices:**
- Request reviews at moment of satisfaction (settlement, positive outcome)
- Never argue with negative reviews publicly
- Don't confirm attorney-client relationship in responses
- Respond to negative reviews within 24 hours

---

### 21. Legal Compliance Checker

**Intent & Purpose:**
Reviews marketing content against state bar advertising rules and legal compliance requirements. Identifies violations, suggests fixes, and provides compliant rewrites. Critical for avoiding ethics complaints.

**When to Use:**
- Before publishing any marketing content
- Reviewing ad copy before launch
- Checking website content for compliance
- Training team on advertising rules

**Required Inputs:**
| Field | Description | Example |
|-------|-------------|---------|
| Content to Review | Marketing material | [Paste content] |
| State Jurisdiction | Primary state bar | "Texas" |
| Content Type | What format | "Google Ads" |
| Practice Areas | Specialties mentioned | Personal Injury, Car Accidents |
| Includes Results? | Case results mentioned? | "Yes - specific amounts mentioned" |
| Includes Testimonials? | Client quotes? | "Yes - with client attribution" |

**Expected Outputs:**
1. **Compliance Summary** - Risk level (PASS to CRITICAL)
2. **Critical Issues** - Must-fix violations with exact locations
3. **Required Changes** - Specific rewrites needed
4. **Recommended Changes** - Best practice improvements
5. **Required Disclaimers** - Exact disclaimer text and placement
6. **State-Specific Requirements** - Rules for the jurisdiction
7. **Compliant Version** - Rewritten content with all issues fixed
8. **Pre-Publication Checklist** - Final verification items

**Risk Levels Explained:**
- **PASS** - No issues found
- **LOW RISK** - Minor improvements suggested
- **MEDIUM RISK** - Changes recommended before publishing
- **HIGH RISK** - Likely violations that need attorney review
- **CRITICAL - DO NOT PUBLISH** - Clear violations present

**Best Practices:**
- Run ALL advertising content through this workflow
- When in doubt, add disclaimers
- Have the managing partner review HIGH RISK or CRITICAL content
- Keep records of compliance reviews

---

## Quick Reference: Workflow Selection Guide

| I need to... | Use this workflow |
|-------------|-------------------|
| Plan a new blog post | Content Brief Generator |
| Write a blog article | AI Article Generator |
| Turn one post into many | Content Atomizer |
| Create LinkedIn content | LinkedIn Content Engine |
| Launch Google Ads | Google Ads Campaign Builder |
| Launch Facebook/Instagram ads | Facebook & Instagram Ads |
| Create email sequences | Email Marketing Campaign |
| Write video scripts | Video Script Writer |
| Create podcast content | Podcast Show Notes Generator |
| Build case studies | Case Study Generator |
| Pitch a new client | Competitive Market Assessment |
| Onboard a new client | New Client Onboarding Generator |
| Get content approved | Client Approval Request Generator |
| Process client emails | Email-to-Task Processor |
| Analyze intake calls | Intake Call Analysis & Coaching |
| Create monthly reports | Monthly Report Generator |
| Track marketing attribution | Attribution Capture & Analysis |
| Optimize Google Business | Google Business Profile Optimizer |
| Audit a website | Website Audit & Optimization |
| Manage reviews | Review Generation & Response |
| Check compliance | Legal Compliance Checker |

---

## Support & Updates

This documentation is for reference. Workflows are continuously improved based on feedback.

For questions about specific workflows or to request enhancements, contact the development team.

**Version History:**
- v1.0 (January 15, 2026) - Initial documentation of all 21 workflows
