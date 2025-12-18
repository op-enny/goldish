PRODUCT REQUIREMENTS DOCUMENT (PRD)
Digital Gold Pre-Information Assistant
Version 2.0 - Aralık 2025
1. Product Vision & Goal
Vision
To provide a trust-based, legally safe, and frictionless digital pre-information experience for customers who want to sell gold jewelry, while ensuring that all valuation authority remains in the physical jewelry store.
Primary Goal
•	Enable users to quickly upload a photo (camera or gallery) from their phone
•	Provide AI-powered visual analysis with detailed pre-information
•	Convert digital interaction into in-store visits via appointment booking
Explicit Non-Goals
•	No binding pricing or valuation
•	No purchase offers or digital transactions
•	All estimates are clearly marked as non-binding AI predictions
2. Target Users
Primary Users
•	Individuals owning gold jewelry
•	Mobile-first users (Android & iOS)
•	Users who want clarity before visiting a jewelry store
Secondary Users
•	Local jewelry store owners
•	Store staff using tablets/desktops in-store
3. Supported Platforms & Devices
Phase 1 (MVP)
•	Mobile web (iOS Safari, Android Chrome)
•	Desktop web (Chrome, Safari, Edge)
•	PWA-ready (optional "Add to Home Screen")
Phase 2 (Optional)
•	Native wrapper via Capacitor (same React codebase)
4. Languages (Mandatory)
•	🇩🇪 German
•	🇹🇷 Turkish
•	🇸🇦 Arabic (RTL support required)
All languages must follow identical logic, use legally safe neutral wording, and respect the same system restrictions.
5. Core User Flow
1.	Language selection
2.	Expectation locking (disclaimers about non-binding nature)
3.	Photo capture or upload
4.	Photo preview & confirmation
5.	AI image analysis (OpenAI GPT-4.1-mini Vision API)
6.	Detailed pre-information result (neutral, non-binding)
7.	Informational gold prices (separate, optional)
8.	Appointment booking CTA
9.	Calendar-connected booking
10.	Confirmation screen
6. AI Image Analysis - Technical Specification
6.1 Recommended Model: GPT-4.1-mini
After comprehensive analysis of OpenAI Vision API pricing and capabilities, GPT-4.1-mini is recommended for MVP due to optimal price/performance ratio.

Model	Token Calculation	Cost/Image (1024x1024)	Quality
GPT-4o (detail: high)	85 base + 170/tile = 765 tokens	$0.0019	Excellent
GPT-4o (detail: low)	85 tokens (fixed)	$0.0002	Basic
GPT-4o-mini	2833 base + 5667/tile = 25,501 tokens	$0.0038	Good (but expensive!)
GPT-4.1-mini ✓	Patch-based × 1.62 = ~1,659 tokens	$0.0007	Very Good
GPT-4.1-nano	Patch-based × 2.46 = ~2,519 tokens	$0.0003	Good

6.2 Why NOT GPT-4o-mini for Vision?
⚠️ IMPORTANT: GPT-4o-mini uses 33x more tokens for images than GPT-4o, making it paradoxically 2x MORE EXPENSIVE for vision tasks despite being cheaper for text.
6.3 Cost Projection (Monthly)
Analyses/Month	GPT-4o (high)	GPT-4.1-mini	GPT-4.1-nano
100	$0.19	$0.07	$0.03
1,000	$1.90	$0.70	$0.30
10,000	$19.00	$7.00	$3.00

6.4 API Configuration
Model: gpt-4.1-mini
Detail Level: auto (patch-based, max 1536 tokens)
Max Output Tokens: 1000
Response Format: Structured JSON
6.5 AI Analysis Output Schema
The AI must return analysis in the following JSON structure:

Category	Fields	Example Values
Basic Info	category, metalColor, estimatedPurity, estimatedWeight, condition	Ring, Yellow Gold, 18K (750), 4.2-5.1g, Very Good
Gemstone	detected, stoneType, stoneCut, stoneColor, clarity, estimatedCarat, count, setting	true, Diamond, Brilliant, Colorless, Eye-clean, 0.4-0.6ct, 1+12, Prong
Design	style, era, origin, craftsmanship, pattern	Classic Solitaire Halo, Modern 2010-2020, European, High Quality, Pavé band
Technical	hallmarkVisible, widthThickness, specialFeatures	Yes (750), ~2.5mm, Milgrain details
6.6 Strictly Forbidden AI Outputs
•	Binding price or value
•	Exact weight confirmation
•	Purity confirmation (only estimation)
•	Sales or persuasive language
•	Any statement implying guaranteed accuracy
7. Functional Requirements
7.1 Photo Capture & Upload
•	Take a photo using the phone camera
•	Select an existing photo from gallery
•	Upload from desktop file system
•	Supported formats: JPG, PNG, WEBP, HEIC
•	Max file size: 20MB
•	HTTPS required for camera access
•	Frontend must not store images permanently
7.2 Pre-Information Result Screen
•	Clearly labeled as "Photo-based, non-binding pre-information"
•	AI confidence score displayed
•	Expandable sections for detailed analysis
•	Mandatory disclaimer: "Final evaluation is only possible in the store."
7.3 Gold Prices (Informational Only)
•	Display current gram gold prices (8K, 14K, 18K, 21K, 22K, 24K)
•	Clearly separated from AI result
•	Mandatory disclaimer about informational nature
7.4 Appointment Booking
•	Embed external booking system (Calendly / Microsoft Bookings / Google)
•	Show real availability
•	Confirmation emails
•	Calendar invites (.ics / add-to-calendar links)
8. Non-Functional Requirements
Performance
•	Image upload + analysis response < 10 seconds (target)
•	Progressive loading states during analysis
Security & Privacy
•	GDPR / DSGVO compliant
•	No long-term image storage
•	Images deleted or expired automatically
•	OpenAI API key never exposed to frontend
•	No personal data required before booking
Accessibility
•	Large tap targets
•	High contrast
•	RTL layout for Arabic
•	Screen reader-friendly structure
9. Technical Stack
Layer	Technology	Notes
Frontend	React + TypeScript	PWA-ready, mobile-first
Styling	Tailwind CSS / Styled Components	RTL support
AI Vision	OpenAI GPT-4.1-mini	Via backend proxy
Backend	Node.js / Next.js API Routes	API key protection
Booking	Calendly / MS Bookings embed	External integration
Hosting	Vercel / Netlify	Edge functions support

10. UX & Communication Principles
This system INFORMS, not CONVINCES.
•	Consultative, neutral tone
•	Expectation locking at the beginning
•	Authority shift to the physical store
•	No persuasion or emotional language
•	No urgency tactics
11. Success Metrics (KPIs)
•	Photo upload completion rate
•	Appointment booking conversion rate
•	In-store visit quality (merchant feedback)
•	Reduction in "price-only inquiries"
•	AI analysis accuracy feedback
12. MVP Scope & Timeline
MVP Includes
•	Mobile-first React app
•	OpenAI GPT-4.1-mini Vision integration
•	Multilingual UI (DE, TR, AR)
•	Booking integration
•	Legal disclaimers
MVP Excludes
•	Native mobile apps
•	User accounts
•	Push notifications
•	Payment or sales features
Estimated MVP Timeline: 2-3 weeks
13. Risks & Mitigations
Risk	Mitigation
User insists on price	Hard system rules + repeated boundary messaging
Legal concerns	No valuation, no pricing, strong disclaimers
Camera permission issues	Fallback to gallery upload
AI hallucination	Strict prompt engineering + JSON schema validation
API costs spike	Rate limiting + usage monitoring
Poor image quality	Image validation + guidance to user

14. Final Statement
This product is intentionally designed to:
•	Protect the jeweler from legal liability
•	Respect the customer with honest, helpful information
•	Avoid legal and expectation risks
•	Drive qualified, informed store visits
It is NOT a digital appraisal tool. 
It IS a digital pre-information and conversion assistant.
