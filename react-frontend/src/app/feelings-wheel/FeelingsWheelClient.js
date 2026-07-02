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
  Flex,
  Icon,
  ScaleFade,
  Fade,
  SimpleGrid
} from '@chakra-ui/react';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import RelatedBlogs from '../../components/blog/RelatedBlogs';
import { FiRefreshCw, FiCheckCircle, FiInfo, FiArrowRight } from 'react-icons/fi';

const WHEEL_DATA = [
  {
      "name": "Fearful",
      "color": "#4A4E69",
      "children": [
          {
              "name": "Scared",
              "children": ["Helpless", "Frightened"]
          },
          {
              "name": "Anxious",
              "children": ["Overwhelmed", "Worried"]
          },
          {
              "name": "Insecure",
              "children": ["Inadequate", "Inferior"]
          },
          {
              "name": "Submissive",
              "children": ["Worthless", "Insignificant"]
          },
          {
              "name": "Rejected",
              "children": ["Excluded", "Persecuted"]
          },
          {
              "name": "Humiliated",
              "children": ["Disrespected", "Ridiculed"]
          }
      ]
  },
  {
      "name": "Angry",
      "color": "#9A3412",
      "children": [
          {
              "name": "Let down",
              "children": ["Betrayed", "Resentful"]
          },
          {
              "name": "Bitter",
              "children": ["Indignant", "Violated"]
          },
          {
              "name": "Mad",
              "children": ["Furious", "Jealous"]
          },
          {
              "name": "Aggressive",
              "children": ["Provoked", "Hostile"]
          },
          {
              "name": "Frustrated",
              "children": ["Infuriated", "Annoyed"]
          },
          {
              "name": "Distant",
              "children": ["Withdrawn", "Numb"]
          }
      ]
  },
  {
      "name": "Disgusted",
      "color": "#B91C1C",
      "children": [
          {
              "name": "Critical",
              "children": ["Skeptical", "Dismissive"]
          },
          {
              "name": "Disapproving",
              "children": ["Judgmental", "Condemned"]
          },
          {
              "name": "Disappointed",
              "children": ["Appalled", "Revolted"]
          },
          {
              "name": "Awful",
              "children": ["Nauseated", "Detestable"]
          },
          {
              "name": "Repelled",
              "children": ["Horrified", "Hesitant"]
          }
      ]
  },
  {
      "name": "Sad",
      "color": "#475569",
      "children": [
          {
              "name": "Hurt",
              "children": ["Embarrassed", "Disappointed"]
          },
          {
              "name": "Depressed",
              "children": ["Inferior", "Empty"]
          },
          {
              "name": "Guilty",
              "children": ["Remorseful", "Ashamed"]
          },
          {
              "name": "Despair",
              "children": ["Grief", "Powerless"]
          },
          {
              "name": "Vulnerable",
              "children": ["Victimized", "Fragile"]
          },
          {
              "name": "Lonely",
              "children": ["Isolated", "Abandoned"]
          }
      ]
  },
  {
      "name": "Happy",
      "color": "#0F766E",
      "children": [
          {
              "name": "Optimistic",
              "children": ["Inspired", "Hopeful"]
          },
          {
              "name": "Trusting",
              "children": ["Intimate", "Sensitive"]
          },
          {
              "name": "Peaceful",
              "children": ["Thankful", "Loving"]
          },
          {
              "name": "Powerful",
              "children": ["Creative", "Courageous"]
          },
          {
              "name": "Accepted",
              "children": ["Valued", "Respected"]
          },
          {
              "name": "Proud",
              "children": ["Confident", "Successful"]
          },
          {
              "name": "Interested",
              "children": ["Inquisitive", "Curious"]
          },
          {
              "name": "Content",
              "children": ["Joyful", "Free"]
          },
          {
              "name": "Playful",
              "children": ["Cheeky", "Aroused"]
          }
      ]
  },
  {
      "name": "Surprised",
      "color": "#7C3AED",
      "children": [
          {
              "name": "Excited",
              "children": ["Energetic", "Eager"]
          },
          {
              "name": "Amazed",
              "children": ["Awe", "Astonished"]
          },
          {
              "name": "Confused",
              "children": ["Perplexed", "Disillusioned"]
          },
          {
              "name": "Startled",
              "children": ["Dismayed", "Shocked"]
          }
      ]
  },
  {
      "name": "Bad",
      "color": "#1E3A8A",
      "children": [
          {
              "name": "Tired",
              "children": ["Unfocused", "Sleepy"]
          },
          {
              "name": "Stressed",
              "children": ["Out of control", "Overwhelmed"]
          },
          {
              "name": "Busy",
              "children": ["Rushed", "Pressured"]
          },
          {
              "name": "Bored",
              "children": ["Apathetic", "Indifferent"]
          }
      ]
  }
];

// Combine the meanings from before, plus generative defaults for the new ones
const FEELING_MEANINGS = {
  Anxious: 'Unease or dread about something uncertain ahead; your mind and body may feel keyed up or on alert.',
  Worried: 'Repeated thoughts about what could go wrong; often focused on people, outcomes, or things you care about.',
  Insecure: 'Doubt about your worth, skills, or belonging; you may compare yourself or fear being judged.',
  Helpless: 'A sense that you cannot change or fix what hurts, even if you wish you could.',
  Nervous: 'Activation before or during something that matters — performance, conflict, or a big decision.',
  Threatened: 'Your system senses danger to safety, dignity, or stability — physical, emotional, or relational.',
  Frustrated: 'Irritation when progress is blocked or needs are repeatedly unmet.',
  Resentful: 'Bitterness that lingers after feeling wronged, unseen, or unfairly treated.',
  Irritated: 'Low-grade anger from annoyances stacking up or boundaries being crossed.',
  Furious: 'Very intense anger that can feel hot, urgent, or hard to contain.',
  Jealous: 'Fear of losing attention, love, or status to someone else; often mixed with hurt.',
  Provoked: 'Anger that spikes because something felt like a deliberate slight, disrespect, or attack.',
  Lonely: 'The ache of wanting more closeness or understanding than you are experiencing right now.',
  Disappointed: 'Sadness when reality falls short of what you hoped for or believed was possible.',
  Vulnerable: 'Feeling emotionally exposed or unprotected; sensitivity without a sense of safety.',
  Empty: 'A hollow or numb sense that something meaningful is missing inside or in your day-to-day life.',
  Grief: 'Deep sorrow tied to loss, change, or letting go — not only death, but any important ending.',
  Hurt: 'Emotional pain from feeling harmed, dismissed, or let down by someone or something that mattered.',
  Grateful: 'Warm recognition of something good — a person, moment, or small relief you do not want to overlook.',
  Joyful: 'Lifted, light energy — pleasure, delight, or aliveness in the present.',
  Hopeful: 'A sense that improvement or relief might be possible, even if things are still hard.',
  Confident: 'Trust in your ability to cope, choose, or show up for what is being asked.',
  Content: 'Quiet satisfaction with how things are right now — not flashy, but steady.',
  Inspired: 'Energy and curiosity sparked by meaning, beauty, possibility, or someone who moves you.',
  Amazed: 'Wonder mixed with surprise — something feels bigger or more vivid than you expected.',
  Excited: 'Pleasant anticipation or stimulation about what is coming or what you get to do next.',
  Curious: 'Open interest in understanding more; leaning toward exploration instead of shutting down.',
  Startled: 'A sudden surprise that interrupts your rhythm — quick spike, then you recalibrate.',
  Perplexed: 'Mental friction: things do not add up yet and you are still searching for clarity.',
  Awe: 'Being moved or humbled by something vast, powerful, beautiful, or beyond ordinary scale.',
  Disapproving: 'A clear “this is not okay with me” reaction when something clashes with your values or boundaries.',
  Judgmental: 'A critical stance — toward others or yourself — that sorts people or actions into good/bad.',
  Repelled: 'A strong urge to push away what feels wrong, tainted, or morally off.',
  Appalled: 'Shock mixed with revulsion — something violates a deep sense of what should never happen.',
  Uncomfortable: 'Unease you want to escape or fix; the situation sits wrong in your body or mind.',
  Dismissive: 'Pulling back from feeling by minimizing — “it does not matter” — sometimes to stay safe.'
};

function getMeaning(feeling) {
  return FEELING_MEANINGS[feeling] || `A nuanced experience of feeling ${feeling.toLowerCase()}. Notice where it lives in your body and what it might be asking for.`;
}

function getPrompt(feeling) {
  return `What is my feeling of ${feeling.toLowerCase()} trying to communicate to me right now?`;
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

/** Pre-compute the tree structure to calculate slice angles based on leaves */
function buildTree() {
  let totalLeaves = 0;
  WHEEL_DATA.forEach(core => {
    let coreLeaves = 0;
    core.children.forEach(mid => {
      let midLeaves = mid.children.length;
      mid.leaves = midLeaves;
      coreLeaves += midLeaves;
      totalLeaves += midLeaves;
    });
    core.leaves = coreLeaves;
  });
  
  let currentAngle = -Math.PI / 2; // start at top
  const nodes = [];

  WHEEL_DATA.forEach(core => {
    const coreAngleSpan = (core.leaves / totalLeaves) * (2 * Math.PI);
    nodes.push({
      id: core.name,
      name: core.name,
      level: 1,
      startAngle: currentAngle,
      endAngle: currentAngle + coreAngleSpan,
      color: core.color,
      parent: null,
      coreParent: core.name
    });

    let midAngle = currentAngle;
    core.children.forEach((mid, mi) => {
      const midAngleSpan = (mid.leaves / totalLeaves) * (2 * Math.PI);
      nodes.push({
        id: mid.name,
        name: mid.name,
        level: 2,
        startAngle: midAngle,
        endAngle: midAngle + midAngleSpan,
        color: mixColor(core.color, (mi % 2 === 0 ? 0.1 : 0.2)),
        parent: core.name,
        coreParent: core.name
      });

      let leafAngle = midAngle;
      const leafSpan = midAngleSpan / mid.children.length;
      mid.children.forEach((leaf, li) => {
        nodes.push({
          id: leaf,
          name: leaf,
          level: 3,
          startAngle: leafAngle,
          endAngle: leafAngle + leafSpan,
          color: mixColor(core.color, (li % 2 === 0 ? 0.3 : 0.4)),
          parent: mid.name,
          coreParent: core.name
        });
        leafAngle += leafSpan;
      });
      midAngle += midAngleSpan;
    });
    currentAngle += coreAngleSpan;
  });

  return nodes;
}

const WHEEL_NODES = buildTree();

function polar(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function annularSectorPath(cx, cy, rInner, rOuter, a0, a1) {
  // Add a tiny gap between slices
  const gap = 0.005;
  if (a1 - a0 > gap * 2) {
    a0 += gap;
    a1 -= gap;
  }
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

function getNodeOpacity(node, selectedCore, selectedMiddle, selectedFeelings, isHovered) {
  if (isHovered) return 1;

  if (node.level === 1) {
    if (!selectedCore) return 0.9;
    return selectedCore === node.id ? 1 : 0.15;
  }
  if (node.level === 2) {
    if (!selectedCore) return 0.1;
    if (selectedCore !== node.coreParent) return 0.1;
    if (!selectedMiddle) return 0.9;
    return selectedMiddle === node.id ? 1 : 0.2;
  }
  if (node.level === 3) {
    if (selectedFeelings.includes(node.id)) return 1;
    if (!selectedCore) return 0.05;
    if (selectedCore !== node.coreParent) return 0.05;
    if (!selectedMiddle) return 0.15;
    if (selectedMiddle !== node.parent) return 0.15;
    return 0.9;
  }
  return 1;
}

export default function FeelingsWheelClient() {
  const [selectedCore, setSelectedCore] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [hovered, setHovered] = useState(null);
  
  const { isAuthenticated, isClient } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleNodeClick = (node) => {
    if (node.level === 1) {
      setSelectedCore(node.id);
      setSelectedMiddle(null);
    } else if (node.level === 2) {
      if (selectedCore === node.coreParent) {
        setSelectedMiddle(node.id);
      } else {
        // If they click a middle node from a different core, switch to it
        setSelectedCore(node.coreParent);
        setSelectedMiddle(node.id);
      }
    } else if (node.level === 3) {
      if (selectedMiddle === node.parent) {
        setSelectedFeelings(prev => 
          prev.includes(node.id) ? prev.filter(f => f !== node.id) : [...prev, node.id]
        );
      } else {
        // Switch context and select
        setSelectedCore(node.coreParent);
        setSelectedMiddle(node.parent);
        setSelectedFeelings(prev => 
          prev.includes(node.id) ? prev.filter(f => f !== node.id) : [...prev, node.id]
        );
      }
    }
  };

  const reflectionPrompt = useMemo(() => {
    if (!selectedFeelings.length) return '';
    const line1 = `Today, I am feeling ${selectedFeelings.join(', ')}.`;
    const meaningsBlock =
      '\n\nWhat these words mean:\n' +
      selectedFeelings.map((f) => `• ${f} — ${getMeaning(f)}`).join('\n');
    const guidedPrompts =
      '\n\nReflective Questions:\n' +
      selectedFeelings.map((f) => `• ${getPrompt(f)}`).join('\n');
    return `${line1}${meaningsBlock}${guidedPrompts}`;
  }, [selectedFeelings]);

  function continueToJournal() {
    if (!selectedFeelings.length) {
      toast({ status: 'info', title: 'Select at least one specific feeling first.' });
      return;
    }
    const payload = {
      source: 'feelings-wheel',
      createdAt: Date.now(),
      selectedFeelings,
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
    router.push(`/signup/client?redirect_url=${encodeURIComponent('/dashboard/client/journal?source=feelings-wheel')}`);
  }

  const CX = 400;
  const CY = 400;
  const R1 = 145; // Hub to Core (increased from 120 to give Core layer 95px radial width)
  const R2 = 255; // Core to Middle (adjusted to keep Middle layer 110px radial width)
  const R3 = 370; // Middle to Outer (adjusted to keep Outer layer 115px radial width)

  return (
    <Box bg="#F9FAFB" minH="100vh" py={{ base: 6, md: 16 }}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={4} textAlign="center" mb={10}>
          <Tag borderRadius="full" colorScheme="teal" px={4} py={2} fontWeight="700">
            Emotional Check-In
          </Tag>
          <Heading color="mlc.greenDark" fontFamily="'Playfair Display', serif" size="2xl">
            Let's help you understand what you're feeling.
          </Heading>
          <Text color="gray.600" maxW="2xl" mx="auto" fontSize="lg">
            {!selectedCore && "Start by picking a core emotion from the center."}
            {selectedCore && !selectedMiddle && "Great. Now refine it by selecting a more specific secondary emotion."}
            {selectedMiddle && "Almost there. Select the exact words that resonate with your current experience."}
          </Text>
        </VStack>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={10} align="flex-start">
          
          {/* LEFT: THE WHEEL */}
          <Box 
            flex="1.2" 
            w="full"
            bg="white" 
            borderRadius="3xl" 
            p={{ base: 2, md: 8 }} 
            border="1px solid" 
            borderColor="gray.100" 
            boxShadow="0 20px 40px rgba(15, 118, 110, 0.05)"
            position="relative"
            overflow="hidden"
          >
            {selectedCore && (
              <Button 
                position="absolute" 
                top={6} 
                left={6} 
                variant="ghost" 
                colorScheme="teal" 
                size="sm"
                leftIcon={<FiRefreshCw />}
                onClick={() => { setSelectedCore(null); setSelectedMiddle(null); }}
                zIndex={10}
              >
                Feeling a different emotion?
              </Button>
            )}

            <Center w="full" position="relative" mt={{ base: 14, md: 0 }}>
              <svg
                viewBox="0 0 800 800"
                width="100%"
                height="auto"
                style={{ maxWidth: '750px', display: 'block', margin: '0 auto', transition: 'all 0.5s ease-in-out' }}
              >
                {WHEEL_NODES.map((node) => {
                  let rInner = node.level === 1 ? 50 : node.level === 2 ? R1 : R2;
                  let rOuter = node.level === 1 ? R1 : node.level === 2 ? R2 : R3;
                  
                  const isHovered = hovered?.id === node.id;
                  const isSelectedTertiary = node.level === 3 && selectedFeelings.includes(node.id);
                  const opacity = getNodeOpacity(node, selectedCore, selectedMiddle, selectedFeelings, isHovered);
                  
                  // Text placement calculation
                  const midAngle = (node.startAngle + node.endAngle) / 2;
                  const textR = (rInner + rOuter) / 2;
                  const deg = (midAngle * 180) / Math.PI;
                  const flip = deg > 90 && deg < 270;
                  const rotateStr = flip ? `rotate(180)` : ``;

                  // Slightly reduced font sizes to prevent overflow on narrow slices
                  const fontSize = node.level === 1 ? '14px' : node.level === 2 ? '12px' : '10px';
                  const fontWeight = (node.level === 1 || isHovered || isSelectedTertiary) ? '700' : '600';

                  return (
                    <g 
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      onMouseEnter={() => setHovered(node)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: opacity > 0.1 ? 'pointer' : 'default', transition: 'all 0.3s' }}
                    >
                      <path
                        d={annularSectorPath(CX, CY, rInner, rOuter, node.startAngle, node.endAngle)}
                        fill={node.color}
                        opacity={opacity}
                        stroke={isSelectedTertiary ? "#ffffff" : isHovered ? "#ffffff" : "rgba(255,255,255,0.3)"}
                        strokeWidth={isSelectedTertiary ? 4 : isHovered ? 2 : 1.5}
                        style={{ transition: 'all 0.4s ease' }}
                      />
                      <text
                        transform={`translate(${CX}, ${CY}) rotate(${deg}) translate(${textR}, 0) ${rotateStr}`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize={fontSize}
                        fontWeight={fontWeight}
                        opacity={opacity > 0.15 ? 1 : (opacity > 0 ? 0.3 : 0)}
                        style={{ transition: 'opacity 0.4s ease', pointerEvents: 'none', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.5px' }}
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}

                {/* Center Hub */}
                <circle cx={CX} cy={CY} r={45} fill="#ffffff" stroke="#E5E7EB" strokeWidth="2" />
                <text
                  x={CX}
                  y={CY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#374151"
                  fontSize="13"
                  fontWeight="700"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {selectedCore || "I feel..."}
                </text>
              </svg>

              {/* Hover Bubble / Tooltip */}
              <AnimatePresenceWrapper hovered={hovered} />
            </Center>
          </Box>

          {/* RIGHT: SELECTIONS & JOURNALING */}
          <Box w={{ base: 'full', lg: '400px' }} position="sticky" top="100px">
            <VStack align="stretch" spacing={6}>
              <Box bg="white" borderRadius="2xl" p={6} border="1px solid" borderColor="gray.100" boxShadow="sm">
                <Heading size="md" color="mlc.greenDark" mb={4}>Your Selected Feelings</Heading>
                
                {selectedFeelings.length === 0 ? (
                  <Flex direction="column" align="center" justify="center" py={10} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                    <Icon as={FiCheckCircle} size={24} color="gray.300" mb={3} />
                    <Text color="gray.500" fontSize="sm" textAlign="center" px={6}>
                      Dive deep into the wheel and select the specific emotions you are feeling.
                    </Text>
                  </Flex>
                ) : (
                  <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" pr={2}>
                    {selectedFeelings.map((f) => (
                      <ScaleFade initialScale={0.9} in={true} key={f}>
                        <Box
                          borderWidth="1px"
                          borderColor="teal.100"
                          borderRadius="xl"
                          p={4}
                          bg="teal.50"
                          position="relative"
                        >
                          <HStack justify="space-between" align="start" mb={2}>
                            <Tag borderRadius="full" colorScheme="teal" size="md" fontWeight="bold">
                              {f}
                            </Tag>
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              colorScheme="red" 
                              onClick={() => setSelectedFeelings(prev => prev.filter(x => x !== f))}
                              _hover={{ bg: "red.50" }}
                            >
                              Remove
                            </Button>
                          </HStack>
                          <Text fontSize="xs" color="gray.700" lineHeight="tall">
                            {getMeaning(f)}
                          </Text>
                        </Box>
                      </ScaleFade>
                    ))}
                  </VStack>
                )}

                {selectedFeelings.length > 0 && (
                  <Box mt={6}>
                    <Text fontSize="sm" color="gray.600" mb={4} fontStyle="italic">
                      "What is this combination of emotions trying to communicate to you today?"
                    </Text>
                    <Button 
                      w="full" 
                      colorScheme="teal" 
                      size="lg" 
                      borderRadius="full" 
                      rightIcon={<FiArrowRight />}
                      onClick={continueToJournal}
                    >
                      Journal these feelings
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Recommendation Widget */}
              <RelatedBlogs keywords={selectedFeelings.length > 0 ? selectedFeelings : ['emotion', 'feeling', 'mental health', 'therapy']} />

            </VStack>
          </Box>

        </Flex>
      </Container>
    </Box>
  );
}

// Separate component for the hover bubble to keep it clean
function AnimatePresenceWrapper({ hovered }) {
  if (!hovered) return null;
  return (
    <Box 
      position="absolute" 
      top="50%" 
      left="50%" 
      transform="translate(-50%, -50%) scale(1.1)"
      pointerEvents="none"
      zIndex={20}
    >
      <Fade in={!!hovered}>
        <Box 
          bg="rgba(255,255,255,0.95)" 
          backdropFilter="blur(10px)"
          boxShadow="0 20px 40px rgba(0,0,0,0.15)"
          borderRadius="xl" 
          p={4} 
          minW="220px"
          maxW="260px"
          textAlign="center"
          border="1px solid"
          borderColor="gray.100"
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
            {hovered.level === 1 ? 'Core Emotion' : hovered.level === 2 ? 'Secondary Emotion' : 'Specific Feeling'}
          </Text>
          <Heading size="md" color={hovered.color} mb={2}>{hovered.name}</Heading>
          {hovered.level === 3 && (
            <Text fontSize="xs" color="gray.600" lineHeight="tall">
              {getMeaning(hovered.name)}
            </Text>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
