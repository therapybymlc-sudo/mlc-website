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
  title: 'Adolescent Therapy | MLC Health & Wellness Centre',
  description: 'Online therapy for adolescents across India. Compassionate and structured support for teen anxiety, academic stress, peer relationships, and identity development in Mumbai, Delhi, Bangalore and beyond.',
}

export default function AdolescentTherapyPage() {
  return (
    <Box bg="#FFFFFF" py={20}>
      <Container maxW="6xl">
        <VStack spacing={6} textAlign="center" mb={16}>
          <Image
            src="/adolescent-therapy.jpg"
            alt="Adolescent Therapy"
            borderRadius="2xl"
            boxShadow="md"
          />
          <Heading fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E" fontWeight="600">
            Adolescent Therapy
          </Heading>
          <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E" maxW="3xl" fontSize="lg" lineHeight="1.8">
            A compassionate and structured space for teens to explore emotions, build
            confidence, and develop healthy coping skills. We provide ethical therapy across India for teenagers navigating anxiety, exam stress, peer
            relationships, family tension, and identity development.
          </Text>
        </VStack>

        <VStack align="start" spacing={6} mb={12}>
            <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
                Common Concerns
            </Heading>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                • Academic pressure and exam anxiety <br/>
                • Social anxiety and peer conflict <br/>
                • Low self-esteem <br/>
                • Emotional outbursts or withdrawal <br/>
                • Family communication challenges <br/>
                • Identity and self-discovery
            </Text>
        </VStack>

        <VStack align="start" spacing={6} mb={16}>
            <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
                How We Work with Teens
            </Heading>
            <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                Our approach balances empathy with structure. We create trust while empowering
                autonomy. Methods may include CBT for anxiety and thought patterns, art-based
                reflection, skill-building exercises, emotional regulation tools, and mindfulness
                for stress. Parental involvement is discussed collaboratively and ethically.
            </Text>
        </VStack>

        {/* FAQ */}
        <Heading textAlign="center" mb={10} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#2E2E2E">
          Frequently Asked Questions
        </Heading>
        <Accordion allowToggle maxW="4xl" mx="auto">
          {[
            { q: "Can parents attend sessions?", a: "In some cases yes. Parent involvement is discussed respectfully and based on therapeutic need." },
            { q: "Is this suitable for exam-related stress?", a: "Yes. We provide structured support for academic anxiety and performance stress." },
            { q: "Are sessions confidential?", a: "Yes. Within ethical and safety boundaries appropriate for minors." },
            { q: "Do you provide sessions across India?", a: "Yes. We serve families across Mumbai, Delhi, Bangalore, Hyderabad, Chennai and other cities through secure virtual platforms." },
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
          <Text fontFamily="'Inter', var(--font-inter), sans-serif">Still have questions?</Text>
          <LinkButton
            href="/contactus"
            bg="#A9CBB7"
            color="black"
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
