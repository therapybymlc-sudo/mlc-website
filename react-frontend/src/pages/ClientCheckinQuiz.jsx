import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Button,
  Progress,
  HStack,
  RadioGroup,
  Radio,
  Textarea,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "How are you feeling today?",
    help: "There’s no right answer — this just helps you check in with yourself.",
    type: "radio",
    options: ["Calm", "Okay", "Overwhelmed", "Low", "Anxious"],
    key: "feeling",
  },
  {
    title: "What feels most heavy right now?",
    help: "Choose the area that’s weighing on you the most.",
    type: "radio",
    options: ["Stress", "Relationships", "Work/Study", "Family", "Sleep", "Identity"],
    key: "heavy",
  },
  {
    title: "How has your sleep been lately?",
    help: "Sleep often impacts how we cope day‑to‑day.",
    type: "radio",
    options: ["Restful", "Okay", "Not great", "Poor", "All over the place"],
    key: "sleep",
  },
  {
    title: "Do you feel ready to talk to someone?",
    help: "Therapy can help even if you’re unsure — this just helps guide the next step.",
    type: "radio",
    options: ["Yes", "Maybe", "Not yet"],
    key: "ready",
  },
  {
    title: "Anything you want to share in your own words?",
    help: "Optional — you can always share this later in your dashboard.",
    type: "text",
    key: "note",
  },
];

export default function ClientCheckinQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <Box bg="#F9F9F9" py={{ base: 12, md: 16 }}>
      <Helmet>
        <title>Client Check‑in | MLC Therapy</title>
        <meta
          name="description"
          content="A quick, gentle check‑in to help you understand your needs and decide your next step."
        />
      </Helmet>
      <Container maxW="3xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading fontFamily="'Playfair Display', serif" size="lg">
              A gentle check‑in
            </Heading>
            <Text color="gray.600" mt={2}>
              A few questions to help you understand what you need right now.
            </Text>
          </Box>

          <Progress value={progress} borderRadius="full" colorScheme="teal" />

          <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="2xl" boxShadow="md">
            <VStack spacing={4} align="stretch">
              <Heading size="md">{current.title}</Heading>
              <Text color="gray.600">{current.help}</Text>

              {current.type === "radio" && (
                <RadioGroup
                  value={answers[current.key] || ""}
                  onChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [current.key]: value }))
                  }
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {current.options.map((option) => (
                      <Radio key={option} value={option}>
                        {option}
                      </Radio>
                    ))}
                  </SimpleGrid>
                </RadioGroup>
              )}

              {current.type === "text" && (
                <Textarea
                  placeholder="Share anything you’d like..."
                  value={answers[current.key] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [current.key]: e.target.value }))
                  }
                  minH="140px"
                />
              )}
            </VStack>
          </Box>

          <HStack justify="space-between">
            <Button
              variant="ghost"
              isDisabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                colorScheme="teal"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                Next
              </Button>
            ) : (
              <Button as={Link} to="/signup/client" colorScheme="teal">
                See my dashboard options
              </Button>
            )}
          </HStack>

          {step === steps.length - 1 && (
            <Box bg="#F2F8F5" p={6} borderRadius="2xl">
              <Heading size="sm" mb={2}>
                Next step
              </Heading>
              <Text color="gray.600">
                Create a free client account to access your private dashboard,
                daily check‑ins, and notes. You can upgrade later if you want
                cloud‑synced journaling and tools.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
