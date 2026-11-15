# Project memory

## Product intent & audience

- PROJECT SHUNYA — mobile-first educational space survival game (lunar colony management)
- Tagline: "Your Mission. Your Decisions. Your Survival."
- Audience: children 7–12, but enjoyable for older players; must work on Android, iPhone, tablets, computers
- Official name is PROJECT SHUNYA; never use "ASTRA"

## Brand personality & voice

- Futuristic NASA-inspired space exploration aesthetic
- Educational but playful; explains scientific concepts in simple language
- Clearly distinguishes real NASA facts from simplified gameplay assumptions
- No fake NASA data; never pretends simulated data is live

## Visual design & UX direction

- Palette: deep navy, black, cyan, electric blue
- Lunar surface backgrounds, animated starfield, floating moon
- Large touch-friendly buttons; smooth animations; polished interfaces
- Mobile-first responsive layout; iOS safe-area padding (viewport-fit=cover)
- Added custom `xs` breakpoint in Tailwind config for small-screen tab labels
- Icons from lucide-react; path alias `@/` → `src/`

## Decisions, constraints & rationale

- Stack: Vite + React + JavaScript + Tailwind CSS; no extra UI/theme packages
- Game state managed via reducer pattern; daily simulation + event logic in engine module
- Core resources: Oxygen, Water, Food, Electricity, Crew health
- Buildings: Lunar Habitat, Solar Panels, Hydroponic Farm, Water Recycling System, Radiation Shelter — each has resource cost + gameplay benefit + NASA fact
- Mission parameters: 4 crew (Commander Rex, Dr. Luna, Engineer Kai, Pilot Vega), 15 simulated days
- ~55% of days trigger random emergencies (solar storms, meteoroid impacts, equipment failures, dust storms, medical emergencies)
- Crew can die from starvation or event consequences; deaths tracked
- Screens: Landing → Mission Briefing → Colony Dashboard (Resources/Construct/Crew tabs) → Event Modal → Mission Report
- Mission Report includes star rating, final score, commander rank, crew report, buildings constructed, decision history, Artemis educational summary
- All controls functional; resource values change on build/advance; decisions logged for final report

## Open questions & assumptions

- Game balance tuning (resource consumption/production rates, event difficulty) may need playtesting
- Building benefit for `waterConsume` in habitat data referenced but not fully wired in engine — verify
- No persistence layer; game state resets on refresh (assumed acceptable for MVP)

I've crafted the memory file for PROJECT SHUNYA based on the context provided.