# Work Time Manager — Design Ideas

## Chosen Approach: "Functional Clarity"

A clean, professional tool-first design that prioritizes usability across 16 languages and diverse scripts. The interface feels like a trusted government-grade tool — authoritative, clear, and accessible.

### Design Movement
Utility-first modernism — inspired by professional scheduling apps and public-service digital tools.

### Core Principles
1. **Clarity over decoration** — every element serves a function
2. **Accessible contrast** — works for all scripts (CJK, Devanagari, Myanmar, Sinhala, etc.)
3. **Mobile-first grid** — the schedule grid adapts gracefully to small screens
4. **Status-driven color** — green/red/blue communicate state at a glance

### Color Philosophy
- Primary: Deep blue `#1a6fc4` — trustworthy, professional
- OK state: Forest green `#1a8f4a` — safe, positive
- Over state: Alert red `#c0392b` — warning, urgent
- Background: Soft gray-blue `#eef2f7` — calm, non-distracting
- Cards: White with subtle shadow — clean separation

### Layout Paradigm
- Full-width header with gradient
- Max-width content container (960px)
- Card-based sections stacked vertically
- Horizontal-scroll grid for the schedule table
- 7-column daily breakdown cards at the bottom

### Signature Elements
1. Color-coded workplace tags (pill badges)
2. Per-cell time input cards (start/end/break)
3. Daily breakdown cards with mini progress bars

### Interaction Philosophy
- Real-time calculation on every input change
- Visual feedback: cell turns blue when complete, yellow when partial
- Status banner animates between OK (green) and over (red)

### Animation
- Fade-in on row add (0.18s ease)
- Progress bar width transition (0.4s)
- Status banner background transition (0.3s)

### Typography System
- System font stack: Segoe UI, Noto Sans JP, Noto Sans, Arial
- Covers all 16 language scripts natively
- Bold (800) for values, medium (600) for labels, regular for inputs

### Brand Essence
A reliable weekly work-hour tracker for foreign workers in Japan — multilingual, instant, offline-capable.

### Brand Voice
- Headlines: Direct and informative ("週28時間チェックツール")
- CTAs: Action-oriented ("勤務先を追加")
- Microcopy: Reassuring ("このツールは目安です")

### Wordmark & Logo
Calendar icon (📅) in a blue rounded square — simple, universal.

### Signature Brand Color
Deep blue `#1a6fc4`

## Style Decisions
- The app is a single-page tool, not a marketing site — no hero images needed
- The existing HTML/CSS/JS implementation is the source of truth
- Port it directly into React as a single Home page component
