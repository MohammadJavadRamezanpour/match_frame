/* 100 lightweight female personas used as the audience.
   These are static archetypes — the AI fills in the per-photo reasoning. */

export type Persona = {
  id: number;
  age: number;
  vibe: string;        // short tag (e.g. "warm, intuitive")
  values: string[];    // what she pays attention to
  dating_goal: string; // long-term, casual, friends-first, etc.
  lifestyle: string;
};

const ARCHETYPES = [
  { vibe: 'warm, intuitive', values: ['trust', 'natural smile', 'eye contact'], dating_goal: 'long-term', lifestyle: 'community + coffee shops' },
  { vibe: 'sharp, ambitious', values: ['confidence', 'grooming', 'style'], dating_goal: 'long-term', lifestyle: 'career-focused' },
  { vibe: 'playful, creative', values: ['humour', 'expressive face', 'colour'], dating_goal: 'open', lifestyle: 'art + late dinners' },
  { vibe: 'quiet, grounded', values: ['kindness', 'soft eyes', 'natural light'], dating_goal: 'long-term', lifestyle: 'books + hikes' },
  { vibe: 'spontaneous, outdoor', values: ['energy', 'movement', 'sun'], dating_goal: 'serious but no rush', lifestyle: 'travel + sport' },
  { vibe: 'reserved, observant', values: ['composure', 'context', 'cleanliness'], dating_goal: 'long-term', lifestyle: 'minimalist' },
  { vibe: 'wholesome, family-leaning', values: ['warmth', 'maturity', 'safety'], dating_goal: 'marriage', lifestyle: 'home + family' },
  { vibe: 'curious, intellectual', values: ['depth', 'eye intelligence', 'subtle smile'], dating_goal: 'long-term', lifestyle: 'museums + reading' },
  { vibe: 'fitness-first, active', values: ['health', 'posture', 'discipline'], dating_goal: 'casual to serious', lifestyle: 'gym + brunch' },
  { vibe: 'artsy, alternative', values: ['individuality', 'texture', 'mood'], dating_goal: 'open', lifestyle: 'music + film' },
];

export function buildPersonas(minAge: number, maxAge: number, n = 100): Persona[] {
  const personas: Persona[] = [];
  const span = Math.max(1, maxAge - minAge);
  for (let i = 0; i < n; i++) {
    const arch = ARCHETYPES[i % ARCHETYPES.length];
    const age = minAge + (i % (span + 1));
    personas.push({ id: i + 1, age, ...arch });
  }
  return personas;
}

// A compact prompt-block description of a persona group, used to keep token count down
// when we ask the model to vote on behalf of a *batch* of personas at once.
export function describePersonaBatch(batch: Persona[]) {
  return batch
    .map(
      (p) =>
        `#${p.id} — age ${p.age}, ${p.vibe}; cares about ${p.values.join(', ')}; goal: ${p.dating_goal}; lifestyle: ${p.lifestyle}.`,
    )
    .join('\n');
}
