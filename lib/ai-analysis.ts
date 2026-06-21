/* Multi-step AI pipeline that turns N user photos into a full MatchFrame report. */

import { openai, visionModel } from './openai';
import { buildPersonas, describePersonaBatch, Persona } from './voter-personas';

const SYSTEM_RULES = `You are a respectful, helpful dating-profile photo consultant.
You never insult the person's appearance. You never analyse race, ethnicity, religion, body shape, or sensitive traits.
You focus only on photo quality, lighting, framing, first impression, trustworthiness, naturalness, warmth, suitability for a dating profile, and likely female-audience reaction.
Be honest but kind — describe weaker photos as "better placed later in a profile", not as bad.
Always respond with strictly valid JSON matching the requested schema, no markdown, no commentary.`;

const BATCH_SIZE = 20; // 5 voting rounds × 20 personas = 100 votes.

export type PhotoInput = { id: string; url: string };

export type PhotoFinding = {
  photo_id: string;
  quality: number;        // 1-10
  face_clarity: number;
  lighting: number;
  first_impression: number;
  trust: number;
  naturalness: number;
  warmth: number;
  female_profile_fit: number;
  lead_photo_fit: number;
  strengths: string[];
  weaknesses: string[];
};

export type PhotoFindings = { findings: PhotoFinding[] };

export type Vote = { voter_id: number; photo_id: string; reason: string };

export type AggregatedRanking = {
  photo_id: string;
  rank: number;
  votes: number;
  badge: string;
  lead_photo_reason: string | null;
  final_rank_description: string;
};

export type ReportText = {
  overall_description: string;
  first_rank_explanation: string;
  second_rank_explanation: string;
  third_rank_explanation: string;
  next_steps: string[];
};

/* ---------- Step 1: Per-photo evaluation ---------- */

export async function analysePhotos(photos: PhotoInput[]): Promise<PhotoFindings> {
  const res = await openai().chat.completions.create({
    model: visionModel(),
    response_format: { type: 'json_object' },
    temperature: 0.4,
    messages: [
      { role: 'system', content: SYSTEM_RULES },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Evaluate each of the following photos individually. Return JSON of shape:
{
  "findings": [
    {
      "photo_id": "<id>",
      "quality": 1-10,
      "face_clarity": 1-10,
      "lighting": 1-10,
      "first_impression": 1-10,
      "trust": 1-10,
      "naturalness": 1-10,
      "warmth": 1-10,
      "female_profile_fit": 1-10,
      "lead_photo_fit": 1-10,
      "strengths": ["short string", ...],
      "weaknesses": ["short string", ...]
    }
  ]
}
Photos are listed below with their ids. Use the exact ids in the response.`,
          },
          ...photos.flatMap((p) => [
            { type: 'text' as const, text: `Photo id: ${p.id}` },
            { type: 'image_url' as const, image_url: { url: p.url, detail: 'low' as const } },
          ]),
        ],
      },
    ],
  });
  const content = res.choices[0]?.message.content ?? '{"findings":[]}';
  return JSON.parse(content) as PhotoFindings;
}

/* ---------- Step 2: 100 simulated female voters ---------- */

export async function runVotingRounds(
  photos: PhotoInput[],
  findings: PhotoFindings,
  minAge: number,
  maxAge: number,
): Promise<Vote[]> {
  const personas = buildPersonas(minAge, maxAge, 100);
  const batches: Persona[][] = [];
  for (let i = 0; i < personas.length; i += BATCH_SIZE) batches.push(personas.slice(i, i + BATCH_SIZE));

  const allVotes: Vote[] = [];
  for (const batch of batches) {
    const personaText = describePersonaBatch(batch);
    const findingDigest = findings.findings
      .map(
        (f) =>
          `Photo ${f.photo_id}: quality ${f.quality}, lighting ${f.lighting}, trust ${f.trust}, warmth ${f.warmth}, lead-fit ${f.lead_photo_fit}.`,
      )
      .join('\n');

    const res = await openai().chat.completions.create({
      model: visionModel(),
      response_format: { type: 'json_object' },
      temperature: 0.9,
      messages: [
        { role: 'system', content: SYSTEM_RULES },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are role-playing ${batch.length} different women looking at a man's dating-profile photos.
Each persona votes for the ONE photo she would tap on first.
Personas:
${personaText}

Per-photo summary from the prior review:
${findingDigest}

Photos are attached. Return JSON of shape:
{ "votes": [ { "voter_id": <persona id>, "photo_id": "<id>", "reason": "one short sentence" } ] }
Cover every persona id exactly once.`,
            },
            ...photos.flatMap((p) => [
              { type: 'text' as const, text: `Photo id: ${p.id}` },
              { type: 'image_url' as const, image_url: { url: p.url, detail: 'low' as const } },
            ]),
          ],
        },
      ],
    });
    const content = res.choices[0]?.message.content ?? '{"votes":[]}';
    const parsed = JSON.parse(content) as { votes?: Vote[] };
    if (Array.isArray(parsed.votes)) allVotes.push(...parsed.votes);
  }
  return allVotes;
}

/* ---------- Step 3: Rank + label ---------- */

export function aggregateRanking(
  photos: PhotoInput[],
  votes: Vote[],
  findings: PhotoFindings,
): AggregatedRanking[] {
  const counts = new Map<string, number>();
  photos.forEach((p) => counts.set(p.id, 0));
  votes.forEach((v) => counts.set(v.photo_id, (counts.get(v.photo_id) ?? 0) + 1));

  const findingsById = new Map(findings.findings.map((f) => [f.photo_id, f]));

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.map(([photo_id, votes], i) => {
    const f = findingsById.get(photo_id);
    const rank = i + 1;
    let badge: string;
    if (rank === 1) badge = 'Best Main Profile Photo';
    else if (rank <= 3) badge = 'Strong Supporting Photo';
    else if (rank <= Math.floor(photos.length / 2)) badge = 'Good In A Set';
    else if (rank < photos.length) badge = 'Better Later In Profile';
    else badge = 'Lower Priority';

    const description =
      rank === 1
        ? (f?.strengths[0] ?? 'A clear, warm shot that draws people in.')
        : rank <= 3
        ? `Reads as ${f?.strengths[0]?.toLowerCase() ?? 'a solid supporting photo'}.`
        : (f?.weaknesses[0] ?? 'Works better deeper in the profile.');

    return {
      photo_id,
      rank,
      votes,
      badge,
      lead_photo_reason:
        rank === 1
          ? `${f?.strengths.slice(0, 2).join(' · ') ?? 'Clear, warm, approachable.'} — your strongest first impression.`
          : null,
      final_rank_description: description,
    };
  });
}

/* ---------- Step 4: Generate human-readable report text ---------- */

export async function generateReportText(
  photos: PhotoInput[],
  ranking: AggregatedRanking[],
  findings: PhotoFindings,
): Promise<ReportText> {
  const rankSummary = ranking
    .map(
      (r) =>
        `Rank ${r.rank} — photo ${r.photo_id} — ${r.votes} votes — ${r.badge}: ${r.final_rank_description}`,
    )
    .join('\n');
  const findingSummary = findings.findings
    .map(
      (f) =>
        `Photo ${f.photo_id}: strengths ${f.strengths.join(', ')}; weaknesses ${f.weaknesses.join(', ')}.`,
    )
    .join('\n');

  const res = await openai().chat.completions.create({
    model: visionModel(),
    response_format: { type: 'json_object' },
    temperature: 0.6,
    messages: [
      { role: 'system', content: SYSTEM_RULES },
      {
        role: 'user',
        content: `Write the human-facing portion of a MatchFrame report.
Tone: a calm, kind dating-profile consultant. Never insult. Frame weak photos as "better placed later", never "bad".
Keep each block tight (2-4 sentences). Do not mention scores or numeric metrics.

Ranking:
${rankSummary}

Per-photo notes:
${findingSummary}

Return JSON:
{
  "overall_description": "...about the whole set...",
  "first_rank_explanation": "...why the #1 photo wins as the lead...",
  "second_rank_explanation": "...why #2 is a strong follow-up...",
  "third_rank_explanation": "...how #3 rounds the set out...",
  "next_steps": ["short, actionable, kind tip", "...", "..."]
}`,
      },
    ],
  });
  const content = res.choices[0]?.message.content ?? '{}';
  const parsed = JSON.parse(content) as Partial<ReportText>;
  return {
    overall_description: parsed.overall_description ?? '',
    first_rank_explanation: parsed.first_rank_explanation ?? '',
    second_rank_explanation: parsed.second_rank_explanation ?? '',
    third_rank_explanation: parsed.third_rank_explanation ?? '',
    next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps : [],
  };
}
