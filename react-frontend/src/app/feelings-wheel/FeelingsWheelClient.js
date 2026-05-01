'use client';

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Tag,
  Text,
  VStack,
  useToast,
  Flex
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import RelatedBlogs from '../../components/blog/RelatedBlogs';

/** Plain-language cues for self-reflection only — not diagnosis or treatment advice. */
const FEELING_MEANINGS = {
  Anxious:
    'Unease or dread about something uncertain ahead; your mind and body may feel keyed up or on alert.',
  Worried:
    'Repeated thoughts about what could go wrong; often focused on people, outcomes, or things you care about.',
  Insecure:
    'Doubt about your worth, skills, or belonging; you may compare yourself or fear being judged.',
  Helpless:
    'A sense that you cannot change or fix what hurts, even if you wish you could.',
  Nervous:
    'Activation before or during something that matters — performance, conflict, or a big decision.',
  Threatened:
    'Your system senses danger to safety, dignity, or stability — physical, emotional, or relational.',

  Frustrated:
    'Irritation when progress is blocked or needs are repeatedly unmet.',
  Resentful:
    'Bitterness that lingers after feeling wronged, unseen, or unfairly treated.',
  Irritated:
    'Low-grade anger from annoyances stacking up or boundaries being crossed.',
  Furious:
    'Very intense anger that can feel hot, urgent, or hard to contain.',
  Jealous:
    'Fear of losing attention, love, or status to someone else; often mixed with hurt.',
  Provoked:
    'Anger that spikes because something felt like a deliberate slight, disrespect, or attack.',

  Lonely:
    'The ache of wanting more closeness or understanding than you are experiencing right now.',
  Disappointed:
    'Sadness when reality falls short of what you hoped for or believed was possible.',
  Vulnerable:
    'Feeling emotionally exposed or unprotected; sensitivity without a sense of safety.',
  Empty:
    'A hollow or numb sense that something meaningful is missing inside or in your day-to-day life.',
  Grief:
    'Deep sorrow tied to loss, change, or letting go — not only death, but any important ending.',
  Hurt:
    'Emotional pain from feeling harmed, dismissed, or let down by someone or something that mattered.',

  Grateful:
    'Warm recognition of something good — a person, moment, or small relief you do not want to overlook.',
  Joyful:
    'Lifted, light energy — pleasure, delight, or aliveness in the present.',
  Hopeful:
    'A sense that improvement or relief might be possible, even if things are still hard.',
  Confident:
    'Trust in your ability to cope, choose, or show up for what is being asked.',
  Content:
    'Quiet satisfaction with how things are right now — not flashy, but steady.',
  Inspired:
    'Energy and curiosity sparked by meaning, beauty, possibility, or someone who moves you.',

  Amazed:
    'Wonder mixed with surprise — something feels bigger or more vivid than you expected.',
  Excited:
    'Pleasant anticipation or stimulation about what is coming or what you get to do next.',
  Curious:
    'Open interest in understanding more; leaning toward exploration instead of shutting down.',
  Startled:
    'A sudden surprise that interrupts your rhythm — quick spike, then you recalibrate.',
  Perplexed:
    'Mental friction: things do not add up yet and you are still searching for clarity.',
  Awe:
    'Being moved or humbled by something vast, powerful, beautiful, or beyond ordinary scale.',

  Disapproving:
    'A clear “this is not okay with me” reaction when something clashes with your values or boundaries.',
  Judgmental:
    'A critical stance — toward others or yourself — that sorts people or actions into good/bad.',
  Repelled:
    'A strong urge to push away what feels wrong, tainted, or morally off.',
  Appalled:
    'Shock mixed with revulsion — something violates a deep sense of what should never happen.',
  Uncomfortable:
    'Unease you want to escape or fix; the situation sits wrong in your body or mind.',
  Dismissive:
    'Pulling back from feeling by minimizing — “it does not matter” — sometimes to stay safe.',
};

/** One reflection prompt per emotion to deepen journaling. */
const FEELING_PROMPTS = {
  Anxious: 'What uncertainty is my anxious part trying to protect me from right now?',
  Worried: 'What specific outcome am I worried about, and what is in my control today?',
  Insecure: 'Where am I doubting myself, and what evidence shows I have handled hard things before?',
  Helpless: 'What is one small action that could restore even 1% of agency right now?',
  Nervous: 'What matters deeply to me in this moment that might be making me nervous?',
  Threatened: 'What boundary feels at risk, and how can I name it clearly and safely?',

  Frustrated: 'What need of mine is blocked, and what would progress look like in one next step?',
  Resentful: 'What felt unfair, and what conversation or boundary might help me release this?',
  Irritated: 'What repeated pattern is wearing me down, and what adjustment would help?',
  Furious: 'What value of mine feels violated, and how can I respond without harming myself or others?',
  Jealous: 'What fear or longing is underneath this jealousy that needs attention?',
  Provoked: 'What specifically felt disrespectful, and how do I want to assert myself?',

  Lonely: 'What kind of connection do I need most right now: comfort, understanding, or presence?',
  Disappointed: 'What hope did I hold, and how can I grieve it while staying open to what is next?',
  Vulnerable: 'What part of me feels exposed, and what support would help me feel safer?',
  Empty: 'What has felt meaningless lately, and what usually helps me feel grounded?',
  Grief: 'What am I mourning, and what ritual or expression would honor this loss today?',
  Hurt: 'What happened that hurt me, and what do I need to feel repaired?',

  Grateful: 'What am I thankful for right now, and why does it matter to me personally?',
  Joyful: 'What is giving me joy, and how can I savor it for a few more moments?',
  Hopeful: 'What sign of possibility am I noticing, and how can I nurture it?',
  Confident: 'Where do I feel capable today, and how can I use that strength intentionally?',
  Content: 'What feels quietly enough right now that I might pause to appreciate?',
  Inspired: 'What is inspiring me, and what one action could I take to honor that energy?',

  Amazed: 'What surprised me in a positive way, and what did it reveal about me or life?',
  Excited: 'What am I looking forward to, and how can I channel this energy productively?',
  Curious: 'What question keeps pulling my attention, and where can I explore it further?',
  Startled: 'What caught me off guard, and what do I need to settle my nervous system now?',
  Perplexed: 'What feels unclear, and what information would help me make sense of it?',
  Awe: 'What felt bigger than me, and how did that shift my perspective?',

  Disapproving: 'What value of mine feels crossed, and how do I want to stand by it?',
  Judgmental: 'What fear or hurt might be underneath this critical lens right now?',
  Repelled: 'What feels deeply misaligned, and what distance or boundary do I need?',
  Appalled: 'What felt morally shocking, and where can I direct this energy constructively?',
  Uncomfortable: 'What exactly feels off, and what would help me feel more at ease?',
  Dismissive: 'What feeling might I be pushing away, and what happens if I stay curious for a moment?',
};

const WHEEL_GROUPS = [
  {
    id: 'fear',
    label: 'Fearful',
    color: '#4A4E69',
    items: ['Anxious', 'Worried', 'Insecure', 'Helpless', 'Nervous', 'Threatened'],
  },
  {
    id: 'angry',
    label: 'Angry',
    color: '#9A3412',
    items: ['Frustrated', 'Resentful', 'Irritated', 'Furious', 'Jealous', 'Provoked'],
  },
  {
    id: 'sad',
    label: 'Sad',
    color: '#475569',
    items: ['Lonely', 'Disappointed', 'Vulnerable', 'Empty', 'Grief', 'Hurt'],
  },
  {
    id: 'joyful',
    label: 'Happy',
    color: '#0F766E',
    items: ['Grateful', 'Joyful', 'Hopeful', 'Confident', 'Content', 'Inspired'],
  },
  {
    id: 'surprised',
    label: 'Surprised',
    color: '#7C3AED',
    items: ['Amazed', 'Excited', 'Curious', 'Startled', 'Perplexed', 'Awe'],
  },
  {
    id: 'disgusted',
    label: 'Disgusted',
    color: '#B91C1C',
    items: ['Disapproving', 'Judgmental', 'Repelled', 'Appalled', 'Uncomfortable', 'Dismissive'],
  },
];

const IMPACT_PROMPTS = [
  'What happened right before this feeling became strong?',
  'Where do you feel this emotion in your body?',
  'What need of yours might be asking for attention right now?',
  'What is one compassionate response you can offer yourself tonight?',
];

/** SVG angles in radians: 0 = right (+x), increasing = clockwise (standard SVG). */
function polar(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/** Annular sector from angle a0 → a1 (radians). */
function annularSectorPath(cx, cy, rInner, rOuter, a0, a1) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  const o0 = polar(cx, cy, rOuter, a0);
  const o1 = polar(cx, cy, rOuter, a1);
  const i1 = polar(cx, cy, rInner, a1);
  const i0 = polar(cx, cy, rInner, a0);
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${i0.x} ${i0.y}`,
    'Z',
  ].join(' ');
}

function mixColor(hex, amount) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgb(${lr},${lg},${lb})`;
}

function inferMoodLevelFromFeelings(selected) {
  const pleasant = ['Grateful', 'Joyful', 'Hopeful', 'Confident', 'Content', 'Inspired', 'Amazed', 'Excited'];
  if (!selected.length) return 3;
  const pleasantCount = selected.filter((x) => pleasant.includes(x)).length;
  const ratio = pleasantCount / selected.length;
  if (ratio >= 0.75) return 5;
  if (ratio >= 0.55) return 4;
  if (ratio >= 0.35) return 3;
  if (ratio >= 0.15) return 2;
  return 1;
}

const CX = 200;
const CY = 200;
const R_OUTER = 178;
const R_INNER = 78;
const R_HUB = 52;
/** Start first core wedge at top (−90°). */
const TOP = -Math.PI / 2;
const GROUP_SW = (2 * Math.PI) / WHEEL_GROUPS.length;
const SLICE_SW = GROUP_SW / 6;

function meaningFor(feeling) {
  return FEELING_MEANINGS[feeling] || 'A nuanced emotional state — worth noticing with curiosity and self-compassion.';
}

function promptFor(feeling) {
  return FEELING_PROMPTS[feeling] || 'What is this feeling trying to tell me that deserves gentle attention?';
}

function FeelingsWheelSvg({ selectedFeelings, onToggleFeeling, hovered, setHovered }) {
  const segments = [];
  WHEEL_GROUPS.forEach((group, gi) => {
    group.items.forEach((feeling, fi) => {
      const a0 = TOP + gi * GROUP_SW + fi * SLICE_SW;
      const a1 = a0 + SLICE_SW;
      const stripe = fi % 2 === 0 ? 0.08 : 0;
      const fill = mixColor(group.color, stripe);
      const selected = selectedFeelings.includes(feeling);
      const isHover = hovered?.feeling === feeling;
      segments.push(
        <path
          key={`${group.id}-${feeling}`}
          d={annularSectorPath(CX, CY, R_INNER, R_OUTER, a0, a1)}
          fill={fill}
          stroke={selected ? '#0f766e' : isHover ? '#ffffff' : 'rgba(255,255,255,0.35)'}
          strokeWidth={selected ? 3.5 : isHover ? 2.5 : 0.9}
          opacity={selected ? 1 : isHover ? 0.98 : 0.92}
          cursor="pointer"
          role="button"
          tabIndex={0}
          aria-pressed={selected}
          aria-label={`${feeling}, ${group.label}`}
          onClick={() => onToggleFeeling(feeling)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleFeeling(feeling);
            }
          }}
          onMouseEnter={() =>
            setHovered({ feeling, group: group.label, meaning: meaningFor(feeling) })
          }
          onMouseLeave={() => setHovered(null)}
        >
          <title>{`${feeling} (${group.label}): ${meaningFor(feeling)}`}</title>
        </path>
      );
    });
  });

  return (
    <svg
      viewBox="0 0 400 400"
      width="100%"
      height="auto"
      maxWidth="420px"
      style={{ maxWidth: '420px', margin: '0 auto', display: 'block' }}
      aria-label="Interactive feelings wheel. Click a segment to select or deselect an emotion."
    >
      {segments}
      <circle cx={CX} cy={CY} r={R_HUB} fill="#ffffff" stroke="#E5E7EB" strokeWidth="1.5" />
      <text
        x={CX}
        y={CY - 6}
        textAnchor="middle"
        fill="#374151"
        fontSize="11"
        fontWeight="700"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {hovered ? hovered.feeling : 'Tap the wheel'}
      </text>
      <text
        x={CX}
        y={CY + 10}
        textAnchor="middle"
        fill="#6B7280"
        fontSize="9"
        fontWeight="600"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {hovered ? hovered.group : 'Core feeling → specific'}
      </text>
    </svg>
  );
}

export default function FeelingsWheelClient() {
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [hovered, setHovered] = useState(null);
  const { isAuthenticated, isClient } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const reflectionPrompt = useMemo(() => {
    if (!selectedFeelings.length) return '';
    const line1 = `Today, I am feeling ${selectedFeelings.join(', ')}.`;
    const meaningsBlock =
      '\n\nWhat these words can mean (for self-reflection only — not medical advice):\n' +
      selectedFeelings.map((f) => `• ${f} — ${meaningFor(f)}`).join('\n');
    const guidedPrompts =
      '\n\nPrompts to explore these feelings more deeply:\n' +
      selectedFeelings.map((f) => `• ${f}: ${promptFor(f)}`).join('\n');
    const generalGuidance = '\n\n' + IMPACT_PROMPTS.map((p, i) => `${i + 1}. ${p}`).join('\n');
    return `${line1}${meaningsBlock}${guidedPrompts}${generalGuidance}`;
  }, [selectedFeelings]);

  function toggleFeeling(feeling) {
    setSelectedFeelings((prev) =>
      prev.includes(feeling) ? prev.filter((f) => f !== feeling) : [...prev, feeling]
    );
  }

  function continueToJournal() {
    if (!selectedFeelings.length) {
      toast({ status: 'info', title: 'Select at least one feeling first.' });
      return;
    }
    const payload = {
      source: 'feelings-wheel',
      createdAt: Date.now(),
      selectedFeelings,
      selectedFeelingPrompts: selectedFeelings.map((feeling) => ({
        feeling,
        prompt: promptFor(feeling),
      })),
      moodLevel: inferMoodLevelFromFeelings(selectedFeelings),
      prompt: reflectionPrompt,
    };
    localStorage.setItem('mlc_journal_prefill', JSON.stringify(payload));
    if (isAuthenticated && isClient) {
      router.push('/dashboard/client/journal?source=feelings-wheel');
      return;
    }
    toast({
      status: 'success',
      title: 'Great start. Let us save this to your journal next.',
      description: 'Create your client account to continue your reflection.',
      duration: 3500,
    });
    const target = encodeURIComponent('/dashboard/client/journal?source=feelings-wheel');
    router.push(`/signup/client?redirect_url=${target}`);
  }

  return (
    <Box bg="#F9FAFB" minH="100vh" py={{ base: 12, md: 20 }}>
      <Container maxW="7xl">
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box flex="1">
            <VStack spacing={8} align="stretch">
              <VStack spacing={3} textAlign="center">
                <Tag borderRadius="full" colorScheme="teal" px={4} py={2} fontWeight="700">
                  Emotional Check-In
                </Tag>
                <Heading color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                  Feelings Wheel
                </Heading>
                <Text color="gray.600" maxW="2xl" mx="auto">
                  Hover a segment to read what that emotion often represents. Click to select; selected emotions show a
                  teal outline. Then continue to your journal with meanings and guided prompts.
                </Text>
              </VStack>

              <Box
                bg="white"
                borderRadius="3xl"
                p={{ base: 4, md: 8 }}
                border="1px solid"
                borderColor="gray.100"
                boxShadow="0 20px 40px rgba(15, 118, 110, 0.06)"
              >
                <VStack spacing={6}>
                  <FeelingsWheelSvg
                    selectedFeelings={selectedFeelings}
                    onToggleFeeling={toggleFeeling}
                    hovered={hovered}
                    setHovered={setHovered}
                  />
                  <HStack spacing={3} justify="center" flexWrap="wrap">
                    {WHEEL_GROUPS.map((g) => (
                      <HStack key={g.id} spacing={2}>
                        <Center boxSize="8px" borderRadius="full" bg={g.color} />
                        <Text fontSize="xs" fontWeight="600" color="gray.600">
                          {g.label}
                        </Text>
                      </HStack>
                    ))}
                  </HStack>
                  {hovered ? (
                    <Box
                      w="full"
                      maxW="480px"
                      mx="auto"
                      bg="teal.50"
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="teal.100"
                      px={5}
                      py={4}
                      textAlign="left"
                    >
                      <Text fontSize="xs" fontWeight="800" color="teal.800" textTransform="uppercase" letterSpacing="wider">
                        {hovered.group}
                      </Text>
                      <Text fontWeight="800" color="gray.800" fontSize="md" mt={1}>
                        {hovered.feeling}
                      </Text>
                      <Text fontSize="sm" color="gray.700" mt={2} lineHeight="tall">
                        {hovered.meaning}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={3} fontStyle="italic">
                        General meaning for reflection — not a diagnosis. Your context matters.
                      </Text>
                    </Box>
                  ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md" mx="auto">
                      Hover any slice to see what that feeling often signals.
                    </Text>
                  )}
                </VStack>
              </Box>

              <Box bg="white" borderRadius="2xl" p={6} border="1px solid" borderColor="gray.100">
                <VStack align="start" spacing={4}>
                  <Text fontWeight="700" color="gray.700">
                    Selected feelings ({selectedFeelings.length})
                  </Text>
                  {selectedFeelings.length ? (
                    <VStack align="stretch" spacing={3} w="full">
                      {selectedFeelings.map((f) => (
                        <Box
                          key={f}
                          borderWidth="1px"
                          borderColor="gray.100"
                          borderRadius="xl"
                          p={4}
                          bg="gray.50"
                        >
                          <HStack justify="space-between" align="start" mb={2}>
                            <Tag borderRadius="full" colorScheme="teal" size="md">
                              {f}
                            </Tag>
                            <Button size="xs" variant="ghost" colorScheme="red" onClick={() => toggleFeeling(f)}>
                              Remove
                            </Button>
                          </HStack>
                          <Text fontSize="sm" color="gray.700" lineHeight="tall">
                            {meaningFor(f)}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">No feelings selected yet.</Text>
                  )}
                  <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
                    {reflectionPrompt || 'Your guided journal prompt will appear here.'}
                  </Text>
                  <Button colorScheme="teal" borderRadius="full" onClick={continueToJournal}>
                    Continue to Journal
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </Box>
          <Box w={{ base: 'full', lg: '320px' }}>
            <RelatedBlogs keywords={selectedFeelings.length > 0 ? selectedFeelings : ['emotion', 'feeling', 'mental health']} />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
