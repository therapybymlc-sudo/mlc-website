import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  IconButton,
  Progress,
  Radio,
  RadioGroup,
  Checkbox,
  Stack,
  Input,
  Select,
  useToast,
  AnimatePresence,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { apiPost, apiGet } from "../api";
import TherapistCard from "../components/TherapistCard";

const MotionBox = motion(Box);

const CONCERNS = [
  "Anxiety & Panic Attacks",
  "Depression & Low Mood",
  "Relationship Issues",
  "Trauma & PTSD",
  "Work Stress & Burnout",
  "Self-Esteem & Confidence",
  "Grief & Loss",
  "Identity & LGBTQIA+ Issues",
  "Sleeping Disorders",
  "ADHD & Neurodivergence",
];

const GENDER_OPTIONS = ["Female", "Male", "Other", "No preference"];
const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Kannada", "Malayalam", "Bengali"];

export default function TherapistDiscovery() {
  const [view, setView] = useState("quiz"); // 'quiz' or 'results'
  const [step, setStep] = useState(0);
  const [quizData, setQuizData] = useState({
    concerns: [],
    gender_pref: "No preference",
    is_queer_preferred: false,
    languages: ["English"],
    location: "",
    religion: "No preference",
  });
  const [results, setResults] = useState({ matches: [], others: [] });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else handleFinishQuiz();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinishQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await apiPost("therapists/match/", quizData);
      setResults(res);
      setView("results");
      window.scrollTo(0, 0);
    } catch (err) {
      toast({ title: "Error finding matches", status: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuizStep = () => {
    switch (step) {
      case 0:
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Before we get started, what's on your mind?</Heading>
              <Text color="gray.600">Select all that apply to you today.</Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {CONCERNS.map((c) => (
                <Box
                  key={c}
                  p={4}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={quizData.concerns.includes(c) ? "mlc.green" : "gray.100"}
                  bg={quizData.concerns.includes(c) ? "#E9F2ED" : "white"}
                  cursor="pointer"
                  onClick={() => {
                    const current = quizData.concerns;
                    if (current.includes(c)) setQuizData({ ...quizData, concerns: current.filter(x => x !== c) });
                    else setQuizData({ ...quizData, concerns: [...current, c] });
                  }}
                  transition="all 0.2s"
                  _hover={{ borderColor: "mlc.green" }}
                >
                  <HStack justify="space-between">
                    <Text fontWeight="500">{c}</Text>
                    {quizData.concerns.includes(c) && <FiCheck color="#56756D" />}
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Do you have a therapist preference?</Heading>
              <Text color="gray.600">This helps us find someone you'll feel comfortable with.</Text>
            </VStack>
            <RadioGroup
              value={quizData.gender_pref}
              onChange={(val) => setQuizData({ ...quizData, gender_pref: val })}
            >
              <Stack direction="column" spacing={4}>
                {GENDER_OPTIONS.map((g) => (
                  <Radio key={g} value={g} colorScheme="teal" size="lg">
                    {g}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>

            <Box p={6} borderRadius="xl" bg="#FBF8F3" border="1px dashed" borderColor="mlc.gold">
              <Checkbox
                isChecked={quizData.is_queer_preferred}
                onChange={(e) => setQuizData({ ...quizData, is_queer_preferred: e.target.checked })}
                colorScheme="teal"
                size="lg"
              >
                <VStack align="flex-start" spacing={0}>
                  <Text fontWeight="600">I prefer a Queer-Affirmative therapist</Text>
                  <Text fontSize="xs" color="gray.500">Therapists who are specifically trained and sensitive to LGBTQIA+ experiences.</Text>
                </VStack>
              </Checkbox>
            </Box>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Which languages should they speak?</Heading>
              <Text color="gray.600">You can select multiple languages.</Text>
            </VStack>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
              {LANGUAGES.map((l) => (
                <Checkbox
                  key={l}
                  isChecked={quizData.languages.includes(l)}
                  onChange={(e) => {
                    const current = quizData.languages;
                    if (e.target.checked) setQuizData({ ...quizData, languages: [...current, l] });
                    else setQuizData({ ...quizData, languages: current.filter(x => x !== l) });
                  }}
                  colorScheme="teal"
                >
                  {l}
                </Checkbox>
              ))}
            </SimpleGrid>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Where are you located?</Heading>
              <Text color="gray.600">This helps us find therapists near you for possible in-person sessions.</Text>
            </VStack>
            <Input
              placeholder="City (e.g. Mumbai, Delhi, London)"
              size="lg"
              value={quizData.location}
              onChange={(e) => setQuizData({ ...quizData, location: e.target.value })}
              variant="outline"
              borderColor="gray.300"
              _focus={{ borderColor: "mlc.green" }}
            />
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={8} align="stretch">
            <VStack align="flex-start" spacing={2}>
              <Heading size="lg" color="mlc.greenDark">Any religious preferences?</Heading>
              <Text color="gray.600">We want to respect your cultural and spiritual background.</Text>
            </VStack>
            <Select
              placeholder="Select preference"
              size="lg"
              value={quizData.religion}
              onChange={(e) => setQuizData({ ...quizData, religion: e.target.value })}
            >
              <option value="No preference">No preference</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
              <option value="Sikh">Sikh</option>
              <option value="Buddhist">Buddhist</option>
              <option value="Atheist/Secular">Atheist/Secular</option>
              <option value="Other">Other</option>
            </Select>

            <Box mt={10} p={10} borderRadius="2xl" border="1px solid" borderColor="mlc.green" textAlign="center">
              <Heading size="md" color="mlc.greenDark" mb={2}>All set!</Heading>
              <Text mb={6}>We have enough information to find your ideal matches.</Text>
              <Button
                size="lg"
                bg="mlc.green"
                color="white"
                borderRadius="full"
                px={10}
                isLoading={isLoading}
                onClick={handleFinishQuiz}
                rightIcon={<FiArrowRight />}
              >
                Find My Therapist
              </Button>
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  if (view === "results") {
    return (
      <Box pt={24} pb={20} bg="#F9F9F9">
        <Container maxW="5xl">
          <VStack align="stretch" spacing={10}>
            <Box>
              <Button
                variant="link"
                color="mlc.greenDark"
                leftIcon={<FiArrowLeft />}
                onClick={() => setView("quiz")}
                mb={4}
              >
                Retake Quiz
              </Button>
              <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                Your Handpicked Matches
              </Heading>
              <Text color="gray.600" mt={2}>
                Based on your preferences, these therapists are the best fit for you.
              </Text>
            </Box>

            {results.matches && results.matches.length > 0 ? (
              <VStack align="stretch" spacing={6}>
                {results.matches.map((t) => (
                  <TherapistCard key={t.id} therapist={t} isMatch={true} />
                ))}
              </VStack>
            ) : (
              <Box p={10} bg="white" borderRadius="2xl" textAlign="center" border="1px dashed" borderColor="gray.300">
                <Text color="gray.500">No exact matches found for all your criteria, but here are some excellent therapists who might still be a great fit.</Text>
              </Box>
            )}

            {results.others && results.others.length > 0 && (
              <VStack align="stretch" spacing={6}>
                <Heading size="md" color="mlc.greenDark" mt={6} borderBottom="1px solid" borderColor="gray.200" pb={3}>
                  Other Verified Therapists
                </Heading>
                {results.others.map((t) => (
                  <TherapistCard key={t.id} therapist={t} />
                ))}
              </VStack>
            )}

            {results.matches.length === 0 && results.others.length === 0 && (
              <VStack py={20} textAlign="center">
                <Heading size="md" color="gray.400">No therapists available at the moment.</Heading>
                <Text color="gray.500">Please check back soon or connect with us directly.</Text>
                <Button as="a" href="/contactus" variant="link" mt={4} color="mlc.greenDark">Contact Us</Button>
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#FBF8F3" pt={32} pb={20}>
      <Container maxW="3xl">
        <VStack spacing={8} align="stretch">
          <Box position="relative">
            <Progress
              value={(step / (totalSteps - 1)) * 100}
              size="xs"
              colorScheme="teal"
              borderRadius="full"
              bg="gray.100"
              mb={8}
            />
            {step > 0 && (
              <IconButton
                aria-label="Previous step"
                icon={<FiArrowLeft />}
                variant="ghost"
                position="absolute"
                left="-60px"
                top="40px"
                display={{ base: "none", md: "flex" }}
                onClick={prevStep}
              />
            )}
          </Box>

          <MotionBox
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            bg="white"
            p={{ base: 6, md: 10 }}
            borderRadius="3xl"
            boxShadow="xl"
          >
            {renderQuizStep()}

            {step < totalSteps - 1 && (
              <HStack mt={10} justify="flex-end">
                <Button
                  size="lg"
                  bg="mlc.gold"
                  color="white"
                  borderRadius="full"
                  px={8}
                  rightIcon={<FiArrowRight />}
                  onClick={nextStep}
                  _hover={{ bg: "mlc.green" }}
                >
                  Next
                </Button>
              </HStack>
            )}
          </MotionBox>

          <Text textAlign="center" color="gray.500" fontSize="sm">
            Step {step + 1} of {totalSteps}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
