'use client'

import React, { useState, useMemo } from "react";
import {
  Box, VStack, HStack, Text, Heading, Button, Icon, Progress, RadioGroup, Radio, Stack, Divider, useColorModeValue, Center, Fade, ScaleFade, Circle
} from "@chakra-ui/react";
import { FiClock, FiFileText, FiArrowRight, FiCheckCircle, FiInfo, FiCalendar } from "react-icons/fi";

export default function AssessmentForm({ form, onSubmit, isLoading }) {
  const [step, setStep] = useState("intro"); // "intro", "questions", "review"
  const [responses, setResponses] = useState({});
  
  const schema = form.form_schema || {};
  const items = schema.items || [];
  const responseScale = schema.responseScale || [];
  const estimatedTime = schema.estimatedTime || "2-5 mins";

  const totalQuestions = items.length;
  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleResponse = (itemIndex, value) => {
    setResponses(prev => ({ ...prev, [itemIndex]: Number(value) }));
  };

  const handleNext = () => {
    if (step === "intro") setStep("questions");
    else if (step === "questions") {
      if (answeredCount < totalQuestions) {
        // Find first unanswered
        const firstUnanswered = items.find(item => responses[item.itemIndex] === undefined);
        if (firstUnanswered) {
          const el = document.getElementById(`item-${firstUnanswered.itemIndex}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setStep("review");
      }
    }
  };

  const handleSubmit = () => {
    const finalResponses = items.map(item => ({
      itemIndex: item.itemIndex,
      value: responses[item.itemIndex]
    }));
    onSubmit(finalResponses);
  };

  // Intro Screen
  if (step === "intro") {
    return (
      <ScaleFade initialScale={0.95} in={true}>
        <VStack spacing={8} align="stretch" py={6}>
          <Box 
            p={10} 
            bg="teal.50" 
            borderRadius="3xl" 
            border="1px solid" 
            borderColor="teal.100"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top="-20px" right="-20px" opacity={0.05}>
              <Icon as={FiFileText} boxSize={40} />
            </Box>
            
            <VStack align="start" spacing={6}>
              <HStack spacing={3}>
                <Icon as={FiCalendar} color="teal.500" />
                <Text fontSize="xs" fontWeight="bold" letterSpacing="0.1em" color="teal.600" textTransform="uppercase">
                  Clinical Assessment
                </Text>
              </HStack>
              
              <VStack align="start" spacing={3}>
                <Heading size="xl" fontFamily="'Playfair Display', serif" color="teal.900">
                  {form.title}
                </Heading>
                <Text fontSize="md" color="gray.600" lineHeight="tall">
                  {form.instructions || "Please complete this assessment to help your therapist understand your current state and progress."}
                </Text>
              </VStack>

              <HStack spacing={6} wrap="wrap">
                <HStack spacing={2}>
                  <Icon as={FiClock} color="teal.500" />
                  <Text fontSize="sm" fontWeight="600" color="teal.800">{estimatedTime}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiFileText} color="teal.500" />
                  <Text fontSize="sm" fontWeight="600" color="teal.800">{totalQuestions} Items</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} color="teal.500" />
                  <Text fontSize="sm" fontWeight="600" color="teal.800">Private & Secure</Text>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          <Box p={8} bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" shadow="sm">
            <VStack align="stretch" spacing={6}>
              <Text fontWeight="800" fontSize="sm" color="gray.400" textTransform="uppercase" letterSpacing="widest">Process</Text>
              <HStack spacing={8} align="start">
                <VStack align="center" spacing={2} flex={1}>
                  <Circle size="40px" bg="teal.600" color="white" fontWeight="bold">1</Circle>
                  <Text fontSize="xs" fontWeight="bold" textAlign="center">Review Instructions</Text>
                </VStack>
                <VStack align="center" spacing={2} flex={1}>
                  <Circle size="40px" bg="gray.100" color="gray.400" fontWeight="bold">2</Circle>
                  <Text fontSize="xs" fontWeight="bold" textAlign="center" color="gray.400">Answer {totalQuestions} Items</Text>
                </VStack>
                <VStack align="center" spacing={2} flex={1}>
                  <Circle size="40px" bg="gray.100" color="gray.400" fontWeight="bold">3</Circle>
                  <Text fontSize="xs" fontWeight="bold" textAlign="center" color="gray.400">Review & Submit</Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>

          <Box p={8} bg="orange.50" borderRadius="2xl" border="1px dashed" borderColor="orange.200">
            <HStack align="start" spacing={4}>
              <Icon as={FiInfo} color="orange.500" mt={1} />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="orange.900" fontSize="sm">A Note from MLC</Text>
                <Text fontSize="xs" color="orange.800" lineHeight="relaxed">
                  These assessments are tools for understanding, not diagnostic labels. Your responses are auto-interpreted for your therapist to review during your next session. Take your time and answer as honestly as you feel today.
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Button 
            size="lg" 
            h="70px" 
            bg="teal.600" 
            color="white" 
            borderRadius="2xl" 
            _hover={{ bg: 'teal.700', transform: 'translateY(-2px)', shadow: 'xl' }}
            rightIcon={<FiArrowRight />}
            onClick={() => setStep("questions")}
            fontSize="lg"
            fontWeight="bold"
          >
            Start Assessment
          </Button>
        </VStack>
      </ScaleFade>
    );
  }

  const isPHQ = form.title?.includes("PHQ") || form.form_schema?.abbreviation?.includes("PHQ");

  // Questions Screen
  return (
    <VStack spacing={8} align="stretch" py={6}>
      <Box position="sticky" top="0" bg="white" zIndex={10} py={4} borderBottom="1px solid" borderColor="gray.100">
        <VStack align="stretch" spacing={4}>
          {isPHQ && (
            <HStack bg="orange.50" p={3} borderRadius="xl" border="1px solid" borderColor="orange.100">
              <Icon as={FiClock} color="orange.500" />
              <Text fontSize="xs" fontWeight="bold" color="orange.800">
                TIME CUE: Please answer based on your experience over the LAST 2 WEEKS.
              </Text>
            </HStack>
          )}
          <HStack justify="space-between">
            <Text fontSize="xs" fontWeight="bold" color="gray.500">PROGRESS</Text>
            <Text fontSize="xs" fontWeight="bold" color="teal.600">{answeredCount} of {totalQuestions} answered</Text>
          </HStack>
          <Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" />
        </VStack>
      </Box>

      {step === "questions" ? (
        <>
          <VStack spacing={8} align="stretch">
            {items.map((item, idx) => {
              const isAnswered = responses[item.itemIndex] !== undefined;
              return (
                <Box 
                  key={item.itemIndex} 
                  id={`item-${item.itemIndex}`}
                  p={8} 
                  bg={isAnswered ? "white" : "gray.50"} 
                  borderRadius="2xl" 
                  border="1px solid" 
                  borderColor={isAnswered ? "teal.100" : "gray.200"}
                  shadow={isAnswered ? "sm" : "none"}
                  transition="all 0.3s"
                >
                  <VStack align="start" spacing={6}>
                    <HStack align="start" spacing={4}>
                      <Center boxSize="32px" bg="teal.600" color="white" borderRadius="full" fontSize="xs" fontWeight="bold" flexShrink={0}>
                        {idx + 1}
                      </Center>
                      <Text fontSize="md" fontWeight="700" color="teal.900" pt={1}>
                        {item.itemText}
                      </Text>
                    </HStack>

                    <RadioGroup 
                      w="full"
                      value={responses[item.itemIndex]?.toString()} 
                      onChange={(val) => handleResponse(item.itemIndex, val)}
                    >
                      <Stack spacing={3} w="full">
                        {responseScale.map((opt) => {
                          const isSelected = responses[item.itemIndex] === opt.value;
                          return (
                            <Box 
                              key={opt.value}
                              as="label"
                              cursor="pointer"
                              p={5}
                              borderRadius="2xl"
                              border="2px solid"
                              borderColor={isSelected ? "teal.500" : "gray.50"}
                              bg={isSelected ? "teal.50" : "white"}
                              _hover={{ bg: isSelected ? "teal.50" : "gray.100", transform: "translateX(4px)" }}
                              transition="all 0.2s cubic-bezier(.4,0,.2,1)"
                              shadow={isSelected ? "md" : "sm"}
                            >
                              <HStack spacing={4}>
                                <Radio 
                                  value={opt.value.toString()} 
                                  colorScheme="teal" 
                                  size="lg"
                                  isChecked={isSelected}
                                />
                                <Text 
                                  fontSize="sm" 
                                  fontWeight={isSelected ? "800" : "500"}
                                  color={isSelected ? "teal.900" : "gray.700"}
                                >
                                  {opt.label}
                                </Text>
                              </HStack>
                            </Box>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  </VStack>
                </Box>
              );
            })}
          </VStack>

          <Button 
            size="lg" 
            h="70px" 
            bg="teal.600" 
            color="white" 
            borderRadius="2xl" 
            isDisabled={answeredCount < totalQuestions}
            _hover={{ bg: 'teal.700', transform: 'translateY(-2px)', shadow: 'xl' }}
            onClick={() => setStep("review")}
            fontSize="lg"
            fontWeight="bold"
            mt={10}
          >
            Review & Finish
          </Button>
        </>
      ) : (
        <ScaleFade initialScale={0.95} in={true}>
          <VStack spacing={8} align="stretch" textAlign="center" py={10}>
            <Icon as={FiCheckCircle} color="teal.500" boxSize={20} mx="auto" />
            <VStack spacing={4}>
              <Heading size="lg" fontFamily="'Playfair Display', serif">Ready to submit?</Heading>
              <Text color="gray.600" maxW="400px" mx="auto">
                You've answered all {totalQuestions} items. Once submitted, your therapist will be notified and an automatic report will be generated.
              </Text>
            </VStack>
            
            <Divider />
            
            <HStack spacing={4} justify="center">
              <Button variant="ghost" size="lg" borderRadius="xl" onClick={() => setStep("questions")}>
                Go Back
              </Button>
              <Button 
                size="lg" 
                bg="teal.600" 
                color="white" 
                borderRadius="xl" 
                px={12}
                isLoading={isLoading}
                onClick={handleSubmit}
                _hover={{ bg: 'teal.700' }}
              >
                Submit Now
              </Button>
            </HStack>
          </VStack>
        </ScaleFade>
      )}
    </VStack>
  );
}
