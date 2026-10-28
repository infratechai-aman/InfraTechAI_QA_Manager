import React, { useState, useMemo, useCallback } from 'react';
import {
  Users, Bot, Sparkles, Play, RefreshCw, Search,
  CheckCircle2, AlertTriangle, TrendingUp, X,
  ThumbsUp, ThumbsDown, MessageSquare, Filter,
  Activity, ChevronRight, Send, ArrowLeft, Zap
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   64 NAMED AGENTIC CUSTOMER AGENTS
   8 Industry Sectors × 8 Agents each
   All INR (₹) pricing
   ═══════════════════════════════════════════════════════════ */

const SECTORS = [
  { id: 'enterprise', label: 'Enterprise Tech', color: '#6E7BFF', shortColor: '#6E7BFF33' },
  { id: 'founders',   label: 'Founders / YC',   color: '#3ECF8E', shortColor: '#3ECF8E33' },
  { id: 'cfo',        label: 'Finance / CFOs',  color: '#F6A943', shortColor: '#F6A94333' },
  { id: 'qa',         label: 'QA & Automation', color: '#4A9EFF', shortColor: '#4A9EFF33' },
  { id: 'sales',      label: 'Sales & GTM',     color: '#A78BFA', shortColor: '#A78BFA33' },
  { id: 'infosec',    label: 'InfoSec & CISO',  color: '#F25B5B', shortColor: '#F25B5B33' },
  { id: 'indie',      label: 'Indie / Solo Dev', color: '#3ECF8E', shortColor: '#3ECF8E33' },
  { id: 'support',    label: 'Support & CS',    color: '#F6A943', shortColor: '#F6A94333' },
];

const ALL_AGENTS = [
  // ─── 1. Enterprise Tech (8) ───────────────────────────────────────────
  { id:'a01', name:'Rahul Mehta',     title:'CTO, FinTech Unicorn',          sector:'enterprise', budgetINR:250000, wtpINR:65000, skepticism:82, sentiment:72, decision:'CONSIDERING', avatar:'RM', avatarBg:'from-indigo-600 to-purple-700',
    opinion:'Automation ROI is strong but I need SOC2 Type II and VAPT audit before connecting to production infra. Our board mandates quarterly security reviews.', objection:'No enterprise SSO / SAML + no SOC2 cert.', mustHave:'SAML/SSO, audit logs, VAPT report.' },
  { id:'a02', name:'Priya Nair',      title:'VP Engineering, B2B SaaS',      sector:'enterprise', budgetINR:180000, wtpINR:50000, skepticism:75, sentiment:78, decision:'CONSIDERING', avatar:'PN', avatarBg:'from-blue-600 to-indigo-700',
    opinion:'We burn 200 hours/sprint on QA. If determinism is guaranteed, at ₹50k/mo this is an easy sell. But I need a Slack integration and custom webhook pipelines.', objection:'No native Slack alert integration.', mustHave:'Slack + Jira integration, SLA dashboard.' },
  { id:'a03', name:'Arjun Kapoor',    title:'Principal Architect, Enterprise',sector:'enterprise', budgetINR:200000, wtpINR:55000, skepticism:70, sentiment:80, decision:'CONSIDERING', avatar:'AK', avatarBg:'from-cyan-600 to-blue-700',
    opinion:'GraphQL schema drift and microservice contract testing is our pain. Show me it can handle distributed system regression without manual mocking.', objection:'Unclear distributed tracing capability.', mustHave:'API contract testing + distributed trace support.' },
  { id:'a04', name:'Sneha Reddy',     title:'Engineering Director, HealthTech',sector:'enterprise', budgetINR:300000, wtpINR:70000, skepticism:88, sentiment:68, decision:'REJECT',     avatar:'SR', avatarBg:'from-rose-600 to-pink-700',
    opinion:'HIPAA compliance is non-negotiable. I cannot onboard a QA tool that stores test logs on shared cloud infra without explicit data residency guarantees in India.', objection:'No HIPAA / DPDP data residency guarantee.', mustHave:'India-region data residency SLA.' },
  { id:'a05', name:'Vikram Singh',    title:'CTO, EduTech Scale-up',         sector:'enterprise', budgetINR:120000, wtpINR:42000, skepticism:60, sentiment:85, decision:'BUY',         avatar:'VS', avatarBg:'from-violet-600 to-indigo-700',
    opinion:"Our Cypress tests are flaking 30% of the time. Any tool that drives that to under 2% while cutting QA headcount by half pays for itself in month one. I'm in.", objection:'Need 30-day money-back SLA.', mustHave:'Flake-rate SLA + 30-day trial.' },
  { id:'a06', name:'Amit Sharma',     title:'VP Product, Series C SaaS',     sector:'enterprise', budgetINR:150000, wtpINR:48000, skepticism:55, sentiment:88, decision:'BUY',         avatar:'AS', avatarBg:'from-sky-600 to-cyan-700',
    opinion:'The outbound Harvey piece is a bonus—autonomous QA alone at this price point is a steal. PM velocity will double when eng stops getting dragged into manual regression.', objection:'Want CRM sync for Harvey leads.', mustHave:'HubSpot / Salesforce lead sync.' },
  { id:'a07', name:'Nandini Roy',     title:'Engineering Lead, Logistics',   sector:'enterprise', budgetINR:160000, wtpINR:52000, skepticism:65, sentiment:82, decision:'CONSIDERING', avatar:'NR', avatarBg:'from-teal-600 to-emerald-700',
    opinion:'Logistics APIs change weekly. If the AI QA engine auto-updates assertions based on schema changes, that alone is a game changer for our on-call rotation.', objection:'Needs auto-assertion regeneration on schema change.', mustHave:'Schema-aware assertion auto-heal.' },
  { id:'a08', name:'Rohan Bose',      title:'Head of Platform, Fintech',     sector:'enterprise', budgetINR:220000, wtpINR:58000, skepticism:72, sentiment:76, decision:'CONSIDERING', avatar:'RB', avatarBg:'from-purple-600 to-violet-700',
    opinion:'We need zero-trust agent execution — no secrets or tokens stored plaintext. Show me the vault integration and I can push this through procurement.', objection:'Need HashiCorp Vault or AWS Secrets Manager integration.', mustHave:'Secrets vault integration, zero plaintext credentials.' },

  // ─── 2. Founders / YC (8) ────────────────────────────────────────────
  { id:'b01', name:'Sahil Agarwal',   title:'YC Founder (W25), B2B SaaS',   sector:'founders', budgetINR:30000, wtpINR:22000, skepticism:30, sentiment:96, decision:'BUY',         avatar:'SA', avatarBg:'from-emerald-500 to-teal-600',
    opinion:'₹22k/mo is one good inbound deal from Harvey. I\'m literally going to type out my cold email now. Where\'s the onboarding link?', objection:'Wants shorter minimum commitment.', mustHave:'Month-to-month pricing, no annual lock-in.' },
  { id:'b02', name:'Ishita Bansal',   title:'Solo Founder, DevTools SaaS',  sector:'founders', budgetINR:20000, wtpINR:18000, skepticism:40, sentiment:92, decision:'BUY',         avatar:'IB', avatarBg:'from-green-500 to-emerald-600',
    opinion:'I run every function myself. Autonomous QA means I stop context-switching between product and testing. Harvey is the SDR I could never afford to hire.', objection:'Need self-serve onboarding with zero setup calls.', mustHave:'No-touch self-serve setup + API docs.' },
  { id:'b03', name:'Karan Mehta',     title:'Founder, AI Tools Startup',    sector:'founders', budgetINR:25000, wtpINR:20000, skepticism:45, sentiment:89, decision:'BUY',         avatar:'KM', avatarBg:'from-teal-500 to-cyan-600',
    opinion:'Any founder spending more than 2 days/week on QA is leaving money on the table. I\'ve been waiting for something like this since 2023.', objection:'Want usage-based pricing tier.', mustHave:'Pay-per-test-run option.' },
  { id:'b04', name:'Deepa Joshi',     title:'Co-Founder, PropTech Startup', sector:'founders', budgetINR:18000, wtpINR:15000, skepticism:55, sentiment:84, decision:'CONSIDERING', avatar:'DJ', avatarBg:'from-sky-500 to-blue-600',
    opinion:'At our stage we need product velocity more than perfect QA. Harvey sounds great but I worry the emails will sound robotic. Show me sample copy first.', objection:'Needs to review Harvey email tone and persona calibration.', mustHave:'Email preview + template library before commit.' },
  { id:'b05', name:'Varun Khanna',    title:'Founder, HRTech (Series A)',   sector:'founders', budgetINR:50000, wtpINR:35000, skepticism:38, sentiment:93, decision:'BUY',         avatar:'VK', avatarBg:'from-violet-500 to-purple-600',
    opinion:'Series A pressure means zero tolerance for regressions. QA Manager will be the first tool I mandate for my eng team. Putting this on the roadmap today.', objection:'Needs team seat pricing.', mustHave:'5-seat team tier at ₹50k/mo.' },
  { id:'b06', name:'Meera Krishnan',  title:'Tech Co-Founder, Marketplace', sector:'founders', budgetINR:22000, wtpINR:19000, skepticism:42, sentiment:91, decision:'BUY',         avatar:'MK', avatarBg:'from-fuchsia-500 to-pink-600',
    opinion:'Marketplaces are testing nightmares—buyer and seller flows, payment states, edge cases galore. I\'d pay ₹19k just for the bug detection layer.', objection:'Needs e-commerce / payment flow test coverage.', mustHave:'Stripe + Razorpay payment flow test templates.' },
  { id:'b07', name:'Aditya Rao',      title:'Founder, B2B Analytics SaaS',  sector:'founders', budgetINR:28000, wtpINR:23000, skepticism:35, sentiment:94, decision:'BUY',         avatar:'AR', avatarBg:'from-lime-500 to-green-600',
    opinion:'Data integrity bugs in analytics are invisible until a customer screenshots a wrong number. QA Manager with automated data assertions is exactly what we need.', objection:'Needs database assertion testing.', mustHave:'SQL / BigQuery assertion layer.' },
  { id:'b08', name:'Prithvi Shah',    title:'Founder, API-first SaaS',      sector:'founders', budgetINR:32000, wtpINR:26000, skepticism:48, sentiment:88, decision:'CONSIDERING', avatar:'PS', avatarBg:'from-orange-500 to-amber-600',
    opinion:'API testing is table stakes but what interests me is the agentic dispatch layer—can Harvey also run enrichment workflows, not just cold emails?', objection:'Wants Harvey to do multi-step enrichment chains.', mustHave:'Custom automation sequences beyond cold email.' },

  // ─── 3. Finance / CFOs (8) ────────────────────────────────────────────
  { id:'c01', name:'Suresh Pillai',   title:'CFO, Series C SaaS (₹500Cr ARR)',sector:'cfo', budgetINR:400000, wtpINR:80000, skepticism:90, sentiment:65, decision:'CONSIDERING', avatar:'SP', avatarBg:'from-yellow-600 to-amber-700',
    opinion:'ROI model works if I can show ₹40L headcount saving per year from eliminating 3 QA contractor seats. Send me a detailed cost-displacement analysis.', objection:'Needs formal ROI documentation for finance committee.', mustHave:'ROI calculator + cost displacement one-pager.' },
  { id:'c02', name:'Ritu Agarwal',    title:'Head of Finance, Logistics SaaS',sector:'cfo', budgetINR:120000, wtpINR:38000, skepticism:78, sentiment:73, decision:'CONSIDERING', avatar:'RA', avatarBg:'from-amber-600 to-yellow-700',
    opinion:'I approve annual software budgets in Q4. The ₹38k/mo price is within our discretionary spend cap but I need sign-off from IT security before procurement.', objection:'IT security approval required before purchase.', mustHave:'Security questionnaire + VAPT report.' },
  { id:'c03', name:'Gaurav Malhotra', title:'CFO, D2C Brand (₹100Cr Revenue)',sector:'cfo', budgetINR:80000, wtpINR:30000, skepticism:70, sentiment:76, decision:'CONSIDERING', avatar:'GM', avatarBg:'from-orange-600 to-red-700',
    opinion:'D2C companies run on thin margins. ₹30k/mo is justifiable only if Harvey generates at least ₹3L in qualified pipeline per month. What\'s the guaranteed lead SLA?', objection:'Needs pipeline value guarantee or SLA.', mustHave:'Lead delivery SLA: minimum X qualified contacts/month.' },
  { id:'c04', name:'Leena Kapoor',    title:'VP Finance, Healthtech',        sector:'cfo', budgetINR:200000, wtpINR:60000, skepticism:85, sentiment:68, decision:'REJECT',     avatar:'LK', avatarBg:'from-rose-600 to-red-700',
    opinion:'Our spend has been frozen since the rate hike. This is genuinely interesting software but I cannot get it through the finance committee in FY25.', objection:'Budget freeze, revisit in Q1 FY26.', mustHave:'Early renewal pricing locked-in quote.' },
  { id:'c05', name:'Ramesh Iyer',     title:'CFO, Enterprise Software Co.',  sector:'cfo', budgetINR:350000, wtpINR:90000, skepticism:80, sentiment:70, decision:'CONSIDERING', avatar:'RI', avatarBg:'from-amber-600 to-orange-700',
    opinion:'₹90k/mo is fine if we can negotiate 2-year contract with annual indexation and a mutual NDA. Our legal team will need 3 weeks to review.', objection:'Needs 2-year contract with legal review.', mustHave:'Multi-year pricing + NDAs + SLA credits.' },
  { id:'c06', name:'Ananya Sharma',   title:'Controller, SaaS Platform',    sector:'cfo', budgetINR:60000, wtpINR:28000, skepticism:65, sentiment:79, decision:'CONSIDERING', avatar:'AS2', avatarBg:'from-yellow-500 to-orange-600',
    opinion:'Controller perspective: I need clean audit trails. If test artifacts and lead data can be exported to S3 for internal audit, this is easily approvable.', objection:'Needs S3 / GCS export of all data artifacts.', mustHave:'Raw data export to cloud storage.' },
  { id:'c07', name:'Rohit Jain',      title:'Financial Analyst, AI Startup', sector:'cfo', budgetINR:25000, wtpINR:20000, skepticism:55, sentiment:84, decision:'BUY',         avatar:'RJ', avatarBg:'from-lime-600 to-green-700',
    opinion:'At pre-Series A we have tight budgets but QA and sales costs are our biggest inefficiencies. ₹20k is less than one contractor hour-rate for a month. Easy yes.', objection:'Wants month-to-month with no setup fee.', mustHave:'Zero setup fee, monthly commitment.' },
  { id:'c08', name:'Kavita Desai',    title:'Head of Procurement, MNC',     sector:'cfo', budgetINR:500000, wtpINR:100000, skepticism:92, sentiment:62, decision:'REJECT',     avatar:'KD', avatarBg:'from-red-600 to-rose-700',
    opinion:'MNC procurement requires vendor due diligence: ISO 27001, SOC 2, GDPR impact assessment, and our internal infosec questionnaire (200 questions). Current timeline is 6 months.', objection:'Full vendor due diligence required — 6 months.', mustHave:'ISO 27001 + SOC2 + DPA + questionnaire support.' },

  // ─── 4. QA & Automation (8) ───────────────────────────────────────────
  { id:'d01', name:'Tanmay Bhat',     title:'Head of QA, Fintech Platform',  sector:'qa', budgetINR:100000, wtpINR:42000, skepticism:60, sentiment:86, decision:'BUY',         avatar:'TB', avatarBg:'from-sky-600 to-blue-700',
    opinion:'I\'ve evaluated Playwright, Testsigma, and Katalon. None offer autonomous agent-driven test creation. If flake rate is under 1%, this is the best QA investment I\'ve seen.', objection:'Needs Playwright compatibility.', mustHave:'Playwright / Cypress framework support.' },
  { id:'d02', name:'Rashmi Gupta',    title:'SDET Lead, E-commerce Giant',  sector:'qa', budgetINR:150000, wtpINR:55000, skepticism:65, sentiment:84, decision:'CONSIDERING', avatar:'RG', avatarBg:'from-blue-600 to-sky-700',
    opinion:'At scale we run 10,000 test cases per sprint. I need parallel execution across 50+ browser/device combos. Can this handle it without per-seat licensing?', objection:'Needs parallel execution at scale (50+ workers).', mustHave:'Parallel test execution + flat team pricing.' },
  { id:'d03', name:'Saurabh Mishra',  title:'Automation Architect, BankTech',sector:'qa', budgetINR:120000, wtpINR:45000, skepticism:72, sentiment:80, decision:'CONSIDERING', avatar:'SM', avatarBg:'from-indigo-600 to-blue-700',
    opinion:'Banking core testing requires IBM Mainframe and COBOL integration testing alongside REST APIs. Can the AI QA engine generate test cases from OpenAPI spec + COBOL copybook?', objection:'Needs mainframe + COBOL test generation.', mustHave:'OpenAPI spec-driven test generation.' },
  { id:'d04', name:'Preethi Kumar',   title:'QA Lead, Mobile Gaming Studio', sector:'qa', budgetINR:50000, wtpINR:28000, skepticism:50, sentiment:88, decision:'BUY',         avatar:'PK', avatarBg:'from-violet-600 to-purple-700',
    opinion:'Mobile game regression on 200 Android/iOS device combos is a nightmare. If there\'s BrowserStack integration and agentic test prioritisation by risk, I\'m subscribing today.', objection:'Needs BrowserStack device farm integration.', mustHave:'BrowserStack + LambdaTest cloud device integration.' },
  { id:'d05', name:'Harish Nambiar',  title:'Staff SDET, SaaS Infrastructure',sector:'qa', budgetINR:90000, wtpINR:38000, skepticism:58, sentiment:87, decision:'BUY',         avatar:'HN', avatarBg:'from-teal-600 to-green-700',
    opinion:'Infrastructure tests in Terraform are almost impossible to automate. If QA Manager can interpret IaC diffs and auto-generate regression suites—sold.', objection:'Wants Terraform / Pulumi IaC test generation.', mustHave:'IaC diff-aware test generation.' },
  { id:'d06', name:'Divya Menon',     title:'QA Engineer, EdTech Platform',  sector:'qa', budgetINR:35000, wtpINR:22000, skepticism:40, sentiment:92, decision:'BUY',         avatar:'DM', avatarBg:'from-fuchsia-600 to-pink-700',
    opinion:'We just fired our QA agency and have zero test coverage. This tool literally replaces an entire function for 1/5th the cost. Management will love it.', objection:'Needs starter templates for web testing.', mustHave:'Pre-built test suite templates for common web flows.' },
  { id:'d07', name:'Akash Trivedi',   title:'Lead QA, B2B Marketplace',     sector:'qa', budgetINR:70000, wtpINR:32000, skepticism:55, sentiment:86, decision:'CONSIDERING', avatar:'AT', avatarBg:'from-emerald-600 to-teal-700',
    opinion:'Marketplace testing involves complex state machines: seller onboarding, escrow flows, dispute resolution. I need behaviour-driven test generation from user stories.', objection:'Needs BDD / Gherkin style test authoring.', mustHave:'BDD test generation from user story prompts.' },
  { id:'d08', name:'Swati Rajan',     title:'Director of Quality, SaaS Corp',sector:'qa', budgetINR:200000, wtpINR:65000, skepticism:68, sentiment:82, decision:'CONSIDERING', avatar:'SR2', avatarBg:'from-cyan-600 to-sky-700',
    opinion:'I manage 8 SDETs across 3 products. If this auto-generates regression plans from JIRA stories and creates test reports for stakeholders, I could redeploy 4 SDETs to feature work.', objection:'Needs JIRA epic → test suite auto-mapping.', mustHave:'JIRA integration with auto test plan generation.' },

  // ─── 5. Sales & GTM (8) ───────────────────────────────────────────────
  { id:'e01', name:'Manish Goel',     title:'VP Sales, B2B SaaS',           sector:'sales', budgetINR:80000, wtpINR:35000, skepticism:45, sentiment:90, decision:'BUY',         avatar:'MG', avatarBg:'from-purple-600 to-violet-700',
    opinion:'An AI SDR that runs 24x7 without burning out or asking for variable pay is my dream hire. Harvey doing 200+ personalised outreaches a day? I want 10 seats.', objection:'Needs multi-seat Harvey deployment.', mustHave:'Team Harvey deployment + centralised reply inbox.' },
  { id:'e02', name:'Sonali Kaur',     title:'Head of Growth, SaaS Startup',  sector:'sales', budgetINR:40000, wtpINR:28000, skepticism:48, sentiment:89, decision:'BUY',         avatar:'SK', avatarBg:'from-pink-600 to-rose-700',
    opinion:'Cold outbound has been killing my email domain reputation. Harvey\'s domain warmup + spam scoring feature is what sold me. I\'ll trial it with a fresh domain.', objection:'Wants dedicated subdomain warmup support.', mustHave:'Domain warmup guide + spam score checker integration.' },
  { id:'e03', name:'Rajiv Menon',     title:'SDR Manager, Enterprise SaaS',  sector:'sales', budgetINR:60000, wtpINR:30000, skepticism:55, sentiment:85, decision:'CONSIDERING', avatar:'RM2', avatarBg:'from-indigo-600 to-blue-700',
    opinion:'My SDRs waste 40% of time on research and personalisation. If Harvey automates the research layer and my team just reviews and approves—huge ROI on their time.', objection:'Needs human review step before send (Decisions Desk).', mustHave:'Approval workflow before any email is sent.' },
  { id:'e04', name:'Aditi Verma',     title:'Director of Revenue, PropTech', sector:'sales', budgetINR:90000, wtpINR:42000, skepticism:62, sentiment:82, decision:'CONSIDERING', avatar:'AV', avatarBg:'from-orange-600 to-amber-700',
    opinion:'Property tech sales cycles are 6–8 months. Harvey needs to run multi-touch nurture sequences, not just one-shot cold emails, or our conversion rate won\'t move.', objection:'Needs multi-touch nurture sequence automation.', mustHave:'Multi-touch email sequences with delay logic.' },
  { id:'e05', name:'Nikhil Gupta',    title:'Founder-led Sales, B2B AI',    sector:'sales', budgetINR:30000, wtpINR:22000, skepticism:35, sentiment:94, decision:'BUY',         avatar:'NG', avatarBg:'from-violet-500 to-purple-600',
    opinion:'As a technical founder doing sales myself, Harvey running outbound while I focus on product is the exact leverage I need. Booking a demo call today.', objection:'Wants demo call to see Harvey in action live.', mustHave:'Live demo of Harvey generating and sending a sequence.' },
  { id:'e06', name:'Priya Tiwari',    title:'GTM Lead, Developer Tools',    sector:'sales', budgetINR:50000, wtpINR:26000, skepticism:58, sentiment:83, decision:'CONSIDERING', avatar:'PT', avatarBg:'from-sky-500 to-blue-600',
    opinion:'DevTools GTM is community-first. Harvey doing cold email would kill our brand if it sounds generic. I need tight control over voice and persona.', objection:'Needs strict tone/voice control for Harvey.', mustHave:'Persona editor + tone calibration controls.' },
  { id:'e07', name:'Siddharth Jha',   title:'Sales Director, Logistics SaaS',sector:'sales', budgetINR:70000, wtpINR:32000, skepticism:50, sentiment:87, decision:'BUY',         avatar:'SJ', avatarBg:'from-teal-500 to-green-600',
    opinion:'Logistics contacts are hard to find—Harvey scraping verified phone + email from logistics directories and job boards is something I\'ve been building internally. ₹32k saves months.', objection:'Needs logistics-specific company database enrichment.', mustHave:'Industry vertical enrichment (logistics, manufacturing).' },
  { id:'e08', name:'Nisha Rawat',     title:'Chief Revenue Officer, SaaS',  sector:'sales', budgetINR:150000, wtpINR:60000, skepticism:68, sentiment:78, decision:'CONSIDERING', avatar:'NR2', avatarBg:'from-amber-500 to-yellow-600',
    opinion:'I need CRO-level dashboards: pipeline coverage, reply rate, objection categories, meeting rate by persona. If Harvey provides this analytics layer I\'ll sign an annual deal.', objection:'Needs CRO-level analytics + attribution dashboard.', mustHave:'Full funnel analytics: open → reply → meeting → deal.' },

  // ─── 6. InfoSec & CISO (8) ───────────────────────────────────────────
  { id:'f01', name:'Anand Kumar',     title:'CISO, Payments Platform',      sector:'infosec', budgetINR:300000, wtpINR:70000, skepticism:92, sentiment:62, decision:'REJECT',     avatar:'AK2', avatarBg:'from-red-600 to-rose-700',
    opinion:'Every piece of software touching our infra must pass a mandatory 90-day InfoSec evaluation including pentesting, threat modelling, and IR policy review. Not negotiable.', objection:'90-day mandatory InfoSec evaluation before any pilot.', mustHave:'Pentest report, IR policy, threat model document.' },
  { id:'f02', name:'Sunita Rao',      title:'Data Protection Officer, Bank', sector:'infosec', budgetINR:200000, wtpINR:55000, skepticism:88, sentiment:65, decision:'CONSIDERING', avatar:'SRo', avatarBg:'from-rose-600 to-pink-700',
    opinion:'DPDP Act 2023 compliance is my core mandate. Any SaaS storing Indian user data must sign a formal Data Processing Agreement and appoint a DPO contact. Do you have this?', objection:'Needs India DPDP Act DPA + appointed DPO contact.', mustHave:'DPDP-compliant Data Processing Agreement.' },
  { id:'f03', name:'Rohit Kapila',    title:'VP InfoSec, InsurTech',        sector:'infosec', budgetINR:180000, wtpINR:52000, skepticism:85, sentiment:68, decision:'CONSIDERING', avatar:'RK', avatarBg:'from-orange-600 to-red-700',
    opinion:'IRDAI regulations require all vendor integrations to be approved by our tech committee. The QA automation angle is strong but Harvey doing email outreach from our domain raises DMARC red flags.', objection:'DMARC policy conflict + IRDAI vendor approval needed.', mustHave:'DMARC/SPF compliance documentation + IRDAI vendor form.' },
  { id:'f04', name:'Kavya Krishnan',  title:'Security Architect, DevTools', sector:'infosec', budgetINR:100000, wtpINR:40000, skepticism:78, sentiment:72, decision:'CONSIDERING', avatar:'KK', avatarBg:'from-amber-600 to-orange-700',
    opinion:'From an architecture standpoint: is the QA agent execution sandboxed? Can it access env vars, credentials, or file system? I need an architecture white-paper before recommending this.', objection:'Needs execution sandbox architecture documentation.', mustHave:'Agent execution sandboxing white-paper + network egress controls.' },
  { id:'f05', name:'Manoj Sinha',     title:'Head of GRC, Enterprise SaaS', sector:'infosec', budgetINR:250000, wtpINR:65000, skepticism:80, sentiment:70, decision:'CONSIDERING', avatar:'MS', avatarBg:'from-red-600 to-rose-700',
    opinion:'GRC perspective: I need a vendor risk register entry. That requires: business continuity plan, disaster recovery SLA, and sub-processor list.', objection:'Needs vendor risk register documentation.', mustHave:'BCP + DR SLA + sub-processor disclosure.' },
  { id:'f06', name:'Tara Menon',      title:'Cloud Security Lead, Startup', sector:'infosec', budgetINR:60000, wtpINR:32000, skepticism:65, sentiment:80, decision:'BUY',         avatar:'TM', avatarBg:'from-violet-600 to-indigo-700',
    opinion:'For an early-stage tool the security posture looks surprisingly mature. SOC2 in progress + pen test quarterly is more than most vendors offer. Worth the pilot.', objection:'Wants quarterly pen test schedule.', mustHave:'Quarterly pen test cadence commitment.' },
  { id:'f07', name:'Vaibhav Doshi',   title:'Cybersecurity Manager, NBFC',  sector:'infosec', budgetINR:120000, wtpINR:45000, skepticism:75, sentiment:74, decision:'CONSIDERING', avatar:'VD', avatarBg:'from-pink-600 to-rose-700',
    opinion:'RBI cybersecurity framework mandates that all third-party integrations be reviewed by our cyber cell. This will take 8–12 weeks. Happy to start the paperwork.', objection:'RBI cyber cell review required (8–12 weeks).', mustHave:'RBI framework compliance checklist.' },
  { id:'f08', name:'Meghna Pillai',   title:'AppSec Lead, D2C Platform',    sector:'infosec', budgetINR:80000, wtpINR:36000, skepticism:70, sentiment:76, decision:'CONSIDERING', avatar:'MP', avatarBg:'from-sky-600 to-blue-700',
    opinion:'OWASP Top 10 coverage in the QA suite is a must. If QA Manager auto-scans for SQLi, XSS, SSRF during regression — this becomes our AppSec tool too, not just QA.', objection:'Needs OWASP Top 10 auto-scan integration.', mustHave:'DAST / SAST scan triggers in QA pipeline.' },

  // ─── 7. Indie / Solo Dev (8) ──────────────────────────────────────────
  { id:'g01', name:'Aryan Mishra',    title:'Indie Hacker, MicroSaaS Builder',sector:'indie', budgetINR:10000, wtpINR:8000, skepticism:30, sentiment:97, decision:'BUY',         avatar:'AM', avatarBg:'from-green-500 to-teal-600',
    opinion:'₹8k/month is two dinners and some Netflix. This replaces 20 hours of my time every month. Shutting my laptop right now to sign up.', objection:'Needs lifetime deal option.', mustHave:'AppSumo / LTD deal option.' },
  { id:'g02', name:'Ritika Sen',      title:'Solo Developer, Open Source',  sector:'indie', budgetINR:5000, wtpINR:4000, skepticism:40, sentiment:93, decision:'BUY',         avatar:'RS', avatarBg:'from-lime-500 to-green-600',
    opinion:'I maintain 3 open source packages. Automated regression on each PR with zero config? This is what I\'ve been manually scripting GitHub Actions for. Sign me up.', objection:'Wants GitHub Actions native integration.', mustHave:'GitHub Actions CI trigger for each PR.' },
  { id:'g03', name:'Tejas Kulkarni',  title:'Freelancer, Full-Stack Dev',   sector:'indie', budgetINR:8000, wtpINR:6000, skepticism:35, sentiment:95, decision:'BUY',         avatar:'TK', avatarBg:'from-emerald-500 to-teal-600',
    opinion:'Clients pay me to build, not test. QA Manager doing automated regression means I can take 2x as many clients. This is leverage I\'ve been searching for.', objection:'Needs client-branded test reports.', mustHave:'White-label test reports with client branding.' },
  { id:'g04', name:'Pallavi Nair',    title:'Part-time SaaS Builder',       sector:'indie', budgetINR:6000, wtpINR:5000, skepticism:45, sentiment:91, decision:'BUY',         avatar:'PN2', avatarBg:'from-cyan-500 to-sky-600',
    opinion:'Building on evenings and weekends means bugs get caught in production. QA Manager running overnight regression means I wake up to a clean build every day.', objection:'Needs scheduled overnight test runs.', mustHave:'Cron-scheduled test execution (daily/nightly).' },
  { id:'g05', name:'Neeraj Singhal',  title:'Solopreneur, No-code + AI',   sector:'indie', budgetINR:7000, wtpINR:5500, skepticism:50, sentiment:88, decision:'CONSIDERING', avatar:'NS', avatarBg:'from-violet-500 to-fuchsia-600',
    opinion:'I use Bubble and Webflow mostly. Does QA Manager test no-code apps or only traditional codebases? If it can test Bubble apps, that\'s a completely untapped market.', objection:'Needs no-code platform (Bubble/Webflow) test support.', mustHave:'No-code platform DOM/flow testing support.' },
  { id:'g06', name:'Shreya Agarwal',  title:'Side Project Developer',       sector:'indie', budgetINR:4000, wtpINR:3500, skepticism:38, sentiment:93, decision:'BUY',         avatar:'SA2', avatarBg:'from-pink-500 to-rose-600',
    opinion:'My side project earns ₹40k MRR. Spending ₹3.5k to eliminate the 5-6 hours I spend on manual testing every week is the easiest ROI decision ever.', objection:'Wants free tier for solo developers.', mustHave:'Free tier with 500 test runs/month.' },
  { id:'g07', name:'Mohit Tandon',    title:'Developer Turned Founder',     sector:'indie', budgetINR:15000, wtpINR:12000, skepticism:42, sentiment:91, decision:'BUY',         avatar:'MT', avatarBg:'from-sky-500 to-indigo-600',
    opinion:'I transitioned from dev to founder 6 months ago. QA Manager + Harvey is like getting my technical and sales infrastructure set up in one afternoon. I\'m sold.', objection:'Needs Notion integration for project management.', mustHave:'Notion + Linear integration.' },
  { id:'g08', name:'Kriti Sharma',    title:'Product Engineer, Solo Startup',sector:'indie', budgetINR:12000, wtpINR:10000, skepticism:48, sentiment:89, decision:'BUY',         avatar:'KS2', avatarBg:'from-teal-500 to-cyan-600',
    opinion:'Product engineers doing everything solo need multipliers. This is the most impactful ₹10k I could spend on my startup right now. Already mentally committing budget.', objection:'Wants mobile app test support.', mustHave:'React Native / Flutter test coverage.' },

  // ─── 8. Customer Support / CS (8) ────────────────────────────────────
  { id:'h01', name:'Rohini Das',      title:'Head of Support, SaaS Platform',sector:'support', budgetINR:90000, wtpINR:38000, skepticism:55, sentiment:86, decision:'BUY',         avatar:'RD', avatarBg:'from-amber-600 to-orange-700',
    opinion:'Sentinel-9 handling tier-1 ticket deflection means my team focuses on tier-2 and tier-3. If 60% of tickets auto-resolve, ROI is clear. I\'m recommending this to CTO.', objection:'Wants CSAT tracking for bot-resolved tickets.', mustHave:'CSAT/NPS tracking for auto-resolved tickets.' },
  { id:'h02', name:'Vivek Choudhary', title:'VP Customer Success, EdTech',  sector:'support', budgetINR:70000, wtpINR:32000, skepticism:50, sentiment:88, decision:'BUY',         avatar:'VC', avatarBg:'from-green-600 to-teal-700',
    opinion:'EdTech students raise the same 10 questions repeatedly. Sentinel-9 handling the FAQ deflection while my CS team focuses on retention calls is perfect segmentation.', objection:'Needs multilingual support (Hindi, Tamil, Bengali).', mustHave:'Hindi + regional language bot responses.' },
  { id:'h03', name:'Sunaina Kapoor',  title:'Customer Success Lead, FinTech',sector:'support', budgetINR:60000, wtpINR:28000, skepticism:58, sentiment:84, decision:'CONSIDERING', avatar:'SK2', avatarBg:'from-violet-600 to-purple-700',
    opinion:'Fintech CS requires empathy-first communication. I need to review Sentinel-9\'s response templates before deployment—autonomous bot sending wrong tax advice is a regulatory liability.', objection:'Needs manual template approval before bot goes live.', mustHave:'Template library + human approval before live deployment.' },
  { id:'h04', name:'Deepak Rao',      title:'Support Operations Manager',   sector:'support', budgetINR:50000, wtpINR:25000, skepticism:60, sentiment:82, decision:'CONSIDERING', avatar:'DR', avatarBg:'from-sky-600 to-blue-700',
    opinion:'Freshdesk is our CRM. If Sentinel-9 integrates natively and creates tickets from any channel—email, WhatsApp, Intercom—this replaces our manual triage team.', objection:'Needs Freshdesk + WhatsApp Business API integration.', mustHave:'Freshdesk + WhatsApp + Intercom native integration.' },
  { id:'h05', name:'Aishwarya Joshi', title:'Director, Customer Experience', sector:'support', budgetINR:120000, wtpINR:48000, skepticism:62, sentiment:80, decision:'CONSIDERING', avatar:'AJ', avatarBg:'from-rose-600 to-pink-700',
    opinion:'CX is increasingly AI-driven but customers still need to feel heard. Sentinel-9 needs advanced sentiment detection to escalate frustrated customers immediately.', objection:'Needs real-time sentiment escalation trigger.', mustHave:'Sentiment scoring + auto-escalate to human on negative sentiment.' },
  { id:'h06', name:'Rakesh Varma',    title:'Head of Technical Support',    sector:'support', budgetINR:80000, wtpINR:35000, skepticism:48, sentiment:87, decision:'BUY',         avatar:'RV', avatarBg:'from-indigo-600 to-violet-700',
    opinion:'Technical support tickets need contextual code snippets and docs links. If Sentinel-9 can pull from our Confluence knowledge base automatically, my L1 tickets reduce by 70%.', objection:'Needs Confluence KB integration.', mustHave:'Confluence + Notion knowledge base auto-pull.' },
  { id:'h07', name:'Pooja Gupta',     title:'Customer Success Manager, B2B', sector:'support', budgetINR:40000, wtpINR:22000, skepticism:42, sentiment:91, decision:'BUY',         avatar:'PG', avatarBg:'from-teal-600 to-cyan-700',
    opinion:'I run CS for 50 enterprise accounts. Sentinel-9 proactively reaching out to at-risk accounts based on product usage drops would be genuinely game-changing for retention.', objection:'Wants proactive churn-risk outreach capability.', mustHave:'Usage-based churn risk detection + proactive outreach.' },
  { id:'h08', name:'Shashank Mehta',  title:'VP Support, Logistics Platform',sector:'support', budgetINR:100000, wtpINR:42000, skepticism:52, sentiment:85, decision:'BUY',         avatar:'SM2', avatarBg:'from-orange-600 to-amber-700',
    opinion:'Logistics support has seasonal spikes (10x during Diwali / IPL). Sentinel-9 that auto-scales with ticket volume without hiring seasonal staff is exactly what we need.', objection:'Needs auto-scaling ticket handling during volume spikes.', mustHave:'Elastic ticket handling with no cap on concurrent tickets.' },
];

const INR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const DECISION_CONFIG = {
  BUY:        { label: 'Buy Signal',  cls: 'cs-badge-green',  icon: ThumbsUp },
  CONSIDERING:{ label: 'Evaluating', cls: 'cs-badge-blue',   icon: Activity },
  REJECT:     { label: 'Declined',   cls: 'cs-badge-red',    icon: ThumbsDown },
};

/* ═══════════════════════════════════════════════════════════
   AGENT CARD
   ═══════════════════════════════════════════════════════════ */
const AgentCard = ({ agent, sectorColor, sectorShort, idx, onClick }) => {
  const cfg = DECISION_CONFIG[agent.decision];
  const Icon = cfg.icon;
  return (
    <div
      onClick={() => onClick(agent)}
      className="cs-card p-4 flex flex-col gap-3 cursor-pointer agent-card-enter"
      style={{ animationDelay: `${(idx % 16) * 40}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="agent-avatar text-[12px] shrink-0"
          style={{ background: `linear-gradient(135deg, ${sectorColor}cc, ${sectorColor}66)` }}
        >
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--c-white)' }}>
            {agent.name}
          </p>
          <p className="text-[11px] truncate" style={{ color: 'var(--c-muted)' }}>
            {agent.title}
          </p>
        </div>
        <span className={`cs-badge ${cfg.cls} shrink-0`}>
          <Icon size={9} />
          {cfg.label}
        </span>
      </div>

      {/* Sentiment bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Sentiment</span>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--c-secondary)' }}>{agent.sentiment}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${agent.sentiment}%`, background: sectorColor }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>WTP</p>
          <p className="text-[12px] font-semibold" style={{ color: 'var(--c-primary)' }}>{INR(agent.wtpINR)}/mo</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-right" style={{ color: 'var(--c-muted)' }}>Skepticism</p>
          <p className="text-[12px] font-semibold text-right" style={{ color: agent.skepticism > 70 ? 'var(--c-red)' : agent.skepticism > 45 ? 'var(--c-amber)' : 'var(--c-green)' }}>
            {agent.skepticism}%
          </p>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: sectorColor }}
        >
          Chat <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   AGENT DETAIL PANEL (1-on-1 chat as Founder)
   ═══════════════════════════════════════════════════════════ */
const AgentDetailPanel = ({ agent, sectorColor, onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'agent', text: agent.opinion }
  ]);
  const [input, setInput] = useState('');
  const cfg = DECISION_CONFIG[agent.decision];

  const send = () => {
    if (!input.trim()) return;
    const founderMsg = input.trim();
    setMessages(m => [...m, { from: 'founder', text: founderMsg }]);
    setInput('');

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        `My main concern remains: ${agent.objection}. If you can address this, I move from evaluating to buying.`,
        `To close this for me, I need: ${agent.mustHave}. Can you confirm this is on your roadmap?`,
        `Honestly, the ROI math works. At ${INR(agent.wtpINR)}/mo my team saves more than that in engineering hours. It's the compliance piece that's blocking me.`,
        `That's a fair point. My team needs to validate this but I'm open to scheduling a proper eval.`,
        `If you can deliver ${agent.mustHave}, I'll be your biggest advocate internally.`,
      ];
      setMessages(m => [...m, { from: 'agent', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div
        className="relative w-full md:max-w-lg rounded-t-[20px] md:rounded-[18px] flex flex-col animate-slideUp md:animate-fadeIn"
        style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border)', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div
            className="agent-avatar text-[14px]"
            style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${sectorColor}cc, ${sectorColor}55)` }}
          >
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold" style={{ color: 'var(--c-white)' }}>{agent.name}</p>
            <p className="text-[12px]" style={{ color: 'var(--c-muted)' }}>{agent.title}</p>
          </div>
          <span className={`cs-badge ${DECISION_CONFIG[agent.decision].cls}`}>
            {DECISION_CONFIG[agent.decision].label}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer" style={{ color: 'var(--c-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 p-4 gap-3">
          {[
            { l: 'Budget', v: INR(agent.budgetINR) + '/mo' },
            { l: 'Will Pay', v: INR(agent.wtpINR) + '/mo' },
            { l: 'Skepticism', v: agent.skepticism + '%' },
          ].map((s, i) => (
            <div key={i} className="text-center py-2 rounded-[10px]" style={{ background: 'var(--c-raised)' }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--c-muted)' }}>{s.l}</p>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--c-primary)' }}>{s.v}</p>
            </div>
          ))}
        </div>

        {/* Key Objection */}
        <div className="mx-4 mb-3 p-3 rounded-[10px]" style={{ background: 'rgba(242,91,91,0.08)', border: '1px solid rgba(242,91,91,0.2)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--c-red)' }}>⚡ Key Objection</p>
          <p className="text-[12px]" style={{ color: 'var(--c-secondary)' }}>{agent.objection}</p>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.from === 'founder' ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: m.from === 'founder' ? '#6E7BFF' : `${sectorColor}55` }}
              >
                {m.from === 'founder' ? 'You' : agent.avatar.slice(0, 1)}
              </div>
              <div
                className="px-3 py-2 rounded-[12px] text-[12px] leading-relaxed max-w-[80%]"
                style={{
                  background: m.from === 'founder' ? 'rgba(110,123,255,0.18)' : 'var(--c-raised)',
                  color: 'var(--c-primary)',
                  border: `1px solid ${m.from === 'founder' ? 'rgba(110,123,255,0.3)' : 'var(--c-border)'}`,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 pt-2 flex gap-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <input
            className="cs-input flex-1"
            placeholder={`Reply as Founder to ${agent.name.split(' ')[0]}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="cs-btn-primary px-4 rounded-[10px] flex items-center gap-1.5"
            style={{ opacity: input.trim() ? 1 : 0.4 }}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN VIEW
   ═══════════════════════════════════════════════════════════ */
export const VirtualCustomerView = ({ currentUser }) => {
  const [productPitch, setProductPitch] = useState(
    'InfratechAI Autonomous QA Suite + Harvey Outbound SDR — zero-human test verification and verified B2B pipelines for ₹24,999/month.'
  );
  const [pricingINR, setPricingINR] = useState(24999);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [activeSector, setActiveSector] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const sectorMap = useMemo(() => Object.fromEntries(SECTORS.map(s => [s.id, s])), []);

  const filteredAgents = useMemo(() => {
    let list = ALL_AGENTS;
    if (activeSector !== 'all') list = list.filter(a => a.sector === activeSector);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.sector.includes(q)
      );
    }
    return list;
  }, [activeSector, searchQuery]);

  const stats = useMemo(() => {
    const buyers = ALL_AGENTS.filter(a => a.decision === 'BUY').length;
    const considering = ALL_AGENTS.filter(a => a.decision === 'CONSIDERING').length;
    const rejects = ALL_AGENTS.filter(a => a.decision === 'REJECT').length;
    const avgWTP = Math.round(ALL_AGENTS.reduce((s, a) => s + a.wtpINR, 0) / ALL_AGENTS.length);
    const avgSentiment = Math.round(ALL_AGENTS.reduce((s, a) => s + a.sentiment, 0) / ALL_AGENTS.length);
    return { buyers, considering, rejects, avgWTP, avgSentiment };
  }, []);

  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => { setIsSimulating(false); setSimulated(true); }, 2200);
  }, []);

  const selectedSector = selectedAgent ? sectorMap[selectedAgent.sector] : null;

  return (
    <div className="w-full min-h-full flex flex-col" style={{ background: 'var(--c-canvas)', color: 'var(--c-primary)' }}>

      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--c-border)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: 'var(--c-white)' }}>
              Virtual Customer Swarm
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--c-muted)' }}>
              64 autonomous agentic customers — 8 sectors × 8 named agents — all in ₹ INR
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="cs-btn-primary flex items-center gap-2 shrink-0"
          >
            {isSimulating ? (
              <><RefreshCw size={13} className="animate-spin" /> Simulating…</>
            ) : (
              <><Play size={13} /> Run 64-Agent Swarm</>
            )}
          </button>
        </div>

        {/* Product Pitch Input */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            className="cs-input flex-1"
            placeholder="Your product pitch / feature / pricing to simulate..."
            value={productPitch}
            onChange={e => setProductPitch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-[12px] shrink-0" style={{ color: 'var(--c-muted)' }}>Price:</span>
            <input
              type="number"
              className="cs-input w-32"
              value={pricingINR}
              onChange={e => setPricingINR(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      {simulated && (
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-3 border-b animate-fadeIn" style={{ borderColor: 'var(--c-border)', background: 'var(--c-surface)' }}>
          {[
            { l: 'Buy Signals', v: stats.buyers, color: 'var(--c-green)' },
            { l: 'Evaluating', v: stats.considering, color: 'var(--c-blue)' },
            { l: 'Declined', v: stats.rejects, color: 'var(--c-red)' },
            { l: 'Avg WTP', v: INR(stats.avgWTP) + '/mo', color: 'var(--c-primary)' },
            { l: 'Avg Sentiment', v: stats.avgSentiment + '%', color: 'var(--c-amber)' },
          ].map((s, i) => (
            <div key={i} className="cs-card-raised px-4 py-3 text-center rounded-[10px]">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--c-muted)' }}>{s.l}</p>
              <p className="text-[16px] font-bold" style={{ color: s.color }}>{s.v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-3 flex flex-wrap items-center gap-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-muted)' }} />
          <input
            className="cs-input pl-8 text-[12px]"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingTop: 8, paddingBottom: 8 }}
          />
        </div>

        {/* Sector filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSector('all')}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer"
            style={{
              background: activeSector === 'all' ? 'rgba(110,123,255,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeSector === 'all' ? 'rgba(110,123,255,0.35)' : 'var(--c-border)'}`,
              color: activeSector === 'all' ? '#A5B4FF' : 'var(--c-muted)',
            }}
          >
            All 64
          </button>
          {SECTORS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSector(s.id)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer"
              style={{
                background: activeSector === s.id ? `${s.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeSector === s.id ? `${s.color}55` : 'var(--c-border)'}`,
                color: activeSector === s.id ? s.color : 'var(--c-muted)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] ml-auto" style={{ color: 'var(--c-muted)' }}>
          {filteredAgents.length} agents shown
        </span>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!simulated && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{ background: 'rgba(110,123,255,0.1)', border: '1px solid rgba(110,123,255,0.2)' }}
            >
              <Sparkles size={28} style={{ color: '#6E7BFF' }} />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold" style={{ color: 'var(--c-white)' }}>64 Agents Ready</p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--c-muted)' }}>
                Run the swarm simulation to see all agents react to your pitch simultaneously
              </p>
            </div>
            <button onClick={runSimulation} className="cs-btn-primary flex items-center gap-2">
              <Play size={13} /> Launch 64-Agent Swarm
            </button>
          </div>
        )}

        {simulated && (
          <>
            {/* Sector sections */}
            {activeSector === 'all' ? (
              SECTORS.map(sector => {
                const agents = filteredAgents.filter(a => a.sector === sector.id);
                if (!agents.length) return null;
                return (
                  <div key={sector.id} className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: sector.color }} />
                      <h2 className="text-[13px] font-semibold" style={{ color: 'var(--c-white)' }}>{sector.label}</h2>
                      <span className="text-[11px]" style={{ color: 'var(--c-muted)' }}>· {agents.length} agents</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {agents.map((ag, idx) => (
                        <AgentCard
                          key={ag.id}
                          agent={ag}
                          sectorColor={sector.color}
                          sectorShort={sector.shortColor}
                          idx={idx}
                          onClick={setSelectedAgent}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredAgents.map((ag, idx) => {
                  const s = sectorMap[ag.sector];
                  return <AgentCard key={ag.id} agent={ag} sectorColor={s.color} sectorShort={s.shortColor} idx={idx} onClick={setSelectedAgent} />;
                })}
              </div>
            )}
          </>
        )}

        {simulated && filteredAgents.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--c-muted)' }}>
            No agents match your search.
          </div>
        )}
      </div>

      {/* Agent Chat Detail */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          sectorColor={sectorMap[selectedAgent.sector]?.color || '#6E7BFF'}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
};
