import { AppHeader } from '@/components/header';
import { ReportView } from '@/components/report-view';
import { gradient } from '@/lib/format';

export const metadata = { title: 'Sample report — MatchFrame' };

export default function SampleReportPage() {
  const ranked = [
    {
      id: 's1',
      n: 3,
      url: null,
      rank: 1,
      badge: 'Best Main Profile Photo',
      lead_reason:
        'Natural light and a genuine, relaxed smile. Your eyes are clearly visible and the framing feels open and approachable — this is the photo that makes people want to know more.',
      description: 'Natural light, genuine smile, eyes clearly visible — your strongest first impression.',
      votes: 34,
      gradient: gradient(0),
    },
    {
      id: 's2',
      n: 1,
      url: null,
      rank: 2,
      badge: 'Strong Supporting Photo',
      lead_reason: null,
      description: 'A clear, friendly shot that works beautifully as your second image.',
      votes: 27,
      gradient: gradient(3),
    },
    {
      id: 's3',
      n: 5,
      url: null,
      rank: 3,
      badge: 'Strong Supporting Photo',
      lead_reason: null,
      description: 'Good warmth and context; nice as a follow-up to your main photo.',
      votes: 18,
      gradient: gradient(5),
    },
    {
      id: 's4',
      n: 2,
      url: null,
      rank: 4,
      badge: 'Good In A Set',
      lead_reason: null,
      description: 'Reads better alongside others than carrying the profile alone.',
      votes: 11,
      gradient: gradient(1),
    },
    {
      id: 's5',
      n: 6,
      url: null,
      rank: 5,
      badge: 'Lower Priority',
      lead_reason: null,
      description: 'A softer option — a brighter, closer shot would lift it.',
      votes: 6,
      gradient: gradient(4),
    },
    {
      id: 's6',
      n: 4,
      url: null,
      rank: 6,
      badge: 'Better Later In Profile',
      lead_reason: null,
      description: 'Works as support; the face is a little small to lead with.',
      votes: 4,
      gradient: gradient(2),
    },
  ];

  return (
    <>
      <AppHeader showNav={false} />
      <ReportView
        date="Jun 14, 2026"
        minAge={25}
        maxAge={34}
        photoCount={6}
        totalVotes={100}
        best={ranked[0]}
        ranked={ranked}
        top3={ranked.slice(0, 3)}
        explanations={{
          overall:
            'Your photos read as warm and genuine — that’s a real strength. The audience responded most to images where your face is clearly lit and you look relaxed. A couple of shots are framed a little far away, so your expression gets lost; those work better deeper in a profile than as a first impression.',
          first:
            'This is the one to open with. Clear light and an easy smile make people want to keep looking.',
          second:
            'A natural follow-up — same warmth, a slightly different setting that adds a bit of story.',
          third:
            'Good supporting energy; it rounds out the set without competing with your lead photo.',
        }}
        recommendations={[
          'Lead with Photo 3 — it’s your clearest, warmest shot.',
          'Follow it with Photo 1, then Photo 5, to keep the energy consistent.',
          'For your next set, try one more close-up in soft daylight.',
          'Move the farther-away shots to the end; they read better as context.',
        ]}
        testId="sample"
      />
    </>
  );
}
