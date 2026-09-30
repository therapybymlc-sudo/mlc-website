'use client'

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Box,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Text,
  Icon,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  IconButton,
  Tooltip,
  Portal,
} from "@chakra-ui/react";
import { FiMessageSquare, FiSend, FiStar, FiInfo, FiLayout, FiZap, FiCheckCircle } from "react-icons/fi";
import { apiPost } from "../api";
import ModernSelect from "./ModernSelect.jsx";

const feedbackCategories = [
  { value: "general", label: "General Suggestion", icon: FiMessageSquare },
  { value: "ui_ux", label: "UI / UX Improvement", icon: FiLayout },
  { value: "feature", label: "New Feature Request", icon: FiZap },
  { value: "clinical", label: "Clinical Tool Improvement", icon: FiStar },
  { value: "bug", label: "Bug Report", icon: FiInfo },
];

export default function FeedbackWidget({ variant = "floating" }) {
  const pathname = usePathname();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await apiPost("feedback/", {
        content,
        category,
        page_path: pathname,
        user_type: pathname.includes("dashboard/therapist") ? "therapist" : "client",
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setContent("");
      }, 3000);
    } catch (error) {
      toast({ title: "Error", description: "Could not send feedback.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const widgetContent = (
    <VStack align="stretch" spacing={4} pt={1}>
      {!submitted ? (
        <>
          <FormControl>
            <FormLabel
              fontSize="13.5px"
              fontWeight="600"
              color="#263A33"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              letterSpacing="0.01em"
              mb={1.5}
              requiredIndicator={<></>}
            >
              Category
            </FormLabel>
            <ModernSelect 
              h="46px"
              fontSize="14.5px"
              borderRadius="12px"
              value={category} 
              onChange={setCategory}
              options={feedbackCategories}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              fontSize="13.5px"
              fontWeight="600"
              color="#263A33"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              letterSpacing="0.01em"
              mb={1.5}
              requiredIndicator={<></>}
            >
              How can we improve this page?
            </FormLabel>
            <Textarea 
              fontSize="14.5px"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              placeholder="Tell us what's missing, what felt clunky, or what could be better..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              borderRadius="12px"
              rows={4}
              minH="100px"
              bg="#FDFBFA"
              borderColor="rgba(86,117,109,0.22)"
              _focus={{ bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
              _hover={{ borderColor: "rgba(86,117,109,0.4)" }}
              _placeholder={{ color: "gray.400" }}
              transition="all 0.2s"
            />
          </FormControl>

          <Button 
            rightIcon={<FiSend />} 
            color="white"
            h="44px"
            fontSize="14px"
            fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
            fontWeight="600"
            borderRadius="full" 
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!content.trim()}
            bg="#4338CA"
            boxShadow="0 4px 14px rgba(67, 56, 202, 0.25)"
            _hover={{
              bg: "#3730A3",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 18px rgba(67, 56, 202, 0.35)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
              _hover: { bg: "#4338CA" },
            }}
            transition="all 0.2s ease"
          >
            Send Feedback
          </Button>
        </>
      ) : (
        <VStack py={6} spacing={3}>
          <Box
            w="46px"
            h="46px"
            borderRadius="full"
            bg="rgba(16, 185, 129, 0.14)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiCheckCircle} color="#059669" boxSize={5} />
          </Box>
          <Text
            fontWeight="700"
            fontSize="16px"
            color="#263A33"
            fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
          >
            Thank You for Your Feedback!
          </Text>
          <Text
            fontSize="13.5px"
            textAlign="center"
            color="rgba(46,46,46,0.75)"
            fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
            maxW="sm"
            lineHeight="1.6"
          >
            We review every suggestion personally to continually elevate the care experience on MLC.
          </Text>
        </VStack>
      )}
    </VStack>
  );

  if (variant === "inline") {
    return (
      <Box
        p={{ base: 6, md: 8 }}
        bg="rgba(255,255,255,0.92)"
        backdropFilter="blur(16px)"
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86,117,109,0.12)"
        boxShadow="0 16px 40px -10px rgba(86,117,109,0.08)"
      >
        <HStack mb={3} spacing={3} align="flex-start">
          <Box
            w="38px"
            h="38px"
            borderRadius="12px"
            bg="rgba(169,203,183,0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            mt={0.5}
          >
            <Icon as={FiMessageSquare} color="#56756D" boxSize="18px" />
          </Box>
          <Box>
            <Heading
              fontWeight="600"
              fontSize={{ base: "19px", md: "22px" }}
              color="#263A33"
              fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
              lineHeight="1.3"
            >
              Have a suggestion for us to improve?
            </Heading>
            <Text
              fontSize="13.5px"
              color="rgba(46,46,46,0.68)"
              fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
              mt={1}
            >
              Help us shape the future of MLC. Your feedback goes directly to our product and clinical care teams.
            </Text>
          </Box>
        </HStack>
        {widgetContent}
      </Box>
    );
  }

  return (
    <Box position="fixed" bottom="30px" right="30px" zIndex={1000}>
      <Popover 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        placement="top-end"
        closeOnBlur={false}
        strategy="fixed"
      >
        <PopoverTrigger>
          <Tooltip 
            label="Have a suggestion? Click here" 
            placement="left" 
            borderRadius="lg" 
            hasArrow
            bg="#1E293B"
            color="#F8FAFC"
            fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
            fontSize="12px"
            fontWeight="500"
            letterSpacing="0.01em"
            px={3.5}
            py={1.5}
            boxShadow="0 6px 20px -2px rgba(15, 23, 42, 0.3)"
          >
            <IconButton
              aria-label="Feedback button"
              icon={<FiMessageSquare />}
              bg="#4338CA"
              color="white"
              borderRadius="full"
              boxSize="48px"
              fontSize="19px"
              boxShadow="0 8px 20px -2px rgba(67, 56, 202, 0.35)"
              _hover={{ bg: "#3730A3", transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.96)" }}
              transition="all 0.2s ease"
              onClick={() => setIsOpen(!isOpen)}
            />
          </Tooltip>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            borderRadius="2xl"
            boxShadow="0 16px 40px -4px rgba(38, 58, 51, 0.15)"
            border="1px solid"
            borderColor="rgba(67, 56, 202, 0.2)"
            w={{ base: "320px", sm: "360px" }}
            p={2}
            fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
          >
            <PopoverHeader border="none" pt={3.5} px={3.5} pb={1}>
              <HStack spacing={2.5}>
                <Box
                  w="30px"
                  h="30px"
                  borderRadius="8px"
                  bg="rgba(67, 56, 202, 0.12)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiMessageSquare} color="#4338CA" boxSize="15px" />
                </Box>
                <Heading
                  fontSize="15px"
                  color="#263A33"
                  fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
                  fontWeight="600"
                  letterSpacing="-0.01em"
                >
                  Share Your Feedback
                </Heading>
              </HStack>
              <Text
                fontSize="12.5px"
                color="#5A6E65"
                fontFamily="'Inter', var(--font-inter), -apple-system, sans-serif"
                mt={1}
              >
                Help us improve your experience at MLC.
              </Text>
            </PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton mt={3} mr={3} />
            <PopoverBody px={3.5} pb={3.5} pt={1}>
              {widgetContent}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Box>
  );
}
