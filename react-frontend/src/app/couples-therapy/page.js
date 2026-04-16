import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
} from "@chakra-ui/react";
import LinkButton from "@/components/LinkButton";

export const metadata = {
  title: 'Couples Therapy & Marriage Counselling | MLC Health',
  description: 'Online couples therapy across India for communication challenges, conflict resolution, rebuilding trust, and emotional reconnection. Secure virtual rooms for partners in Mumbai, Delhi and beyond.',
}

export default function CouplesTherapyPage() {
  return (
    <Box bg="#F9F9F9" py={20}>
      <Container maxW="6xl">
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/couples-therapy.jpg"
            alt="Couples Therapy"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E" fontWeight="600">
            Couples Therapy
          </Heading>
          <Text
            fontFamily="'Inter', var(--font-inter), sans-serif"
            color="#2E2E2E"
            maxW="3xl"
            fontSize="lg"
            lineHeight="1.8"
          >
            A safe and structured space for partners to reconnect, rebuild trust, and
            strengthen emotional bonds. We provide ethical therapy across India
            for married and unmarried partners navigating communication breakdowns,
            recurring conflicts, emotional distance, or trust concerns.
          </Text>
        </VStack>

        <VStack align="start" spacing={6} mb={12}>
          <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
            Common Reasons Couples Seek Therapy
          </Heading>
          <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
            • Frequent arguments or unresolved conflict <br/>
            • Emotional disconnection <br/>
            • Trust breaches <br/>
            • Pre-marital counselling <br/>
            • Intimacy challenges <br/>
            • Life transitions (relocation, career shifts, parenting)
          </Text>
          <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E" fontStyle="italic">
            Couples therapy is not about choosing sides. It is about understanding the patterns that exist between you.
          </Text>
        </VStack>

        <VStack align="start" spacing={6} mb={12}>
          <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
            What to Expect
          </Heading>
          <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
            Sessions focus on improving communication clarity, identifying recurring relational
            cycles, learning structured conflict resolution skills, rebuilding emotional safety,
            and strengthening intimacy. Therapists guide conversations with balance, ensuring
            both partners feel heard and respected.
          </Text>
        </VStack>

        <VStack align="start" spacing={6} mb={16}>
          <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
            Our Approach to Relationship Therapy
          </Heading>
          <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
            We combine structured frameworks with emotional depth through emotion-focused
            techniques, communication restructuring, conflict pattern analysis, and mindfulness
            in relationships. Sessions are collaborative, safe, and focused on sustainable growth.
          </Text>
        </VStack>

        {/* FAQ */}
        <Heading textAlign="center" mb={10} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
          Frequently Asked Questions
        </Heading>
        <Accordion allowToggle maxW="4xl" mx="auto">
          {[
            { q: "Do we both need to attend?", a: "Yes. Couples therapy is most effective when both partners participate in the sessions together." },
            { q: "How many sessions are typical?", a: "This varies depending on your specific goals. Some couples seek short-term skill building, while others work on long-term relational patterns." },
            { q: "Is this only for married couples?", a: "No. We work with married, engaged, and committed partners in all stages of their relationship." },
            { q: "Is online couples therapy effective?", a: "Yes. Our secure virtual rooms allow for balanced and effective sessions where both partners can engage comfortably from home." },
          ].map((item, i) => (
            <AccordionItem key={i} borderBottom="1px solid" borderColor="gray.100">
               <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontFamily="'Inter', var(--font-inter), sans-serif" fontWeight="500">
                  {item.q}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} color="gray.600" fontFamily="'Inter', var(--font-inter), sans-serif">
                {item.a}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <VStack mt={16} spacing={4}>
          <Text fontFamily="'Inter', var(--font-inter), sans-serif">Still have questions? Reach out to us anytime.</Text>
          <LinkButton 
            href="/contactus" 
            bg="#A9CBB7" 
            color="#2E2E2E" 
            borderRadius="full" 
            px={10}
            _hover={{ bg: "#C9A960", color: "white" }}
          >
            Contact Us
          </LinkButton>
        </VStack>
      </Container>
    </Box>
  );
}
