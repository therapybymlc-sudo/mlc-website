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
            bg="linear-gradient(135deg, #56756D 0%, #6B8B7B 100%)"
            color="white"
            h="46px"
            fontSize="14.5px"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontWeight="600"
            borderRadius="full" 
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!content.trim()}
            shadow="md"
            _hover={{
              bg: "linear-gradient(135deg, #C9A960 0%, #D4B872 100%)",
              transform: "translateY(-1px)",
              shadow: "lg",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
              _hover: { bg: "linear-gradient(135deg, #56756D 0%, #6B8B7B 100%)" },
            }}
            transition="all 0.25s ease"
          >
            Send Feedback
          </Button>
        </>
      ) : (
        <VStack py={6} spacing={3}>
          <Box
            w="50px"
            h="50px"
            borderRadius="full"
            bg="rgba(169,203,183,0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiCheckCircle} color="#56756D" boxSize={6} />
          </Box>
          <Text
            fontWeight="600"
            fontSize="18px"
            color="#263A33"
            fontFamily="'Playfair Display', var(--font-playfair), serif"
          >
            Thank You for Your Feedback!
          </Text>
          <Text
            fontSize="13.5px"
            textAlign="center"
            color="rgba(46,46,46,0.75)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
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
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              lineHeight="1.3"
            >
              Have a suggestion for us to improve?
            </Heading>
            <Text
              fontSize="13.5px"
              color="rgba(46,46,46,0.68)"
              fontFamily="'Inter', var(--font-inter), sans-serif"
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
          <Tooltip label="Have a suggestion? Click here" placement="left" borderRadius="lg" hasArrow>
            <IconButton
              aria-label="Feedback button"
              icon={<FiMessageSquare />}
              bg="#56756D"
              color="white"
              borderRadius="full"
              boxSize="56px"
              fontSize="22px"
              shadow="2xl"
              _hover={{ bg: "#C9A960", transform: "scale(1.08)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.3s"
              onClick={() => setIsOpen(!isOpen)}
            />
          </Tooltip>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            borderRadius="2xl"
            shadow="2xl"
            border="1px solid"
            borderColor="rgba(86,117,109,0.15)"
            w={{ base: "320px", sm: "360px" }}
            p={2}
          >
            <PopoverHeader border="none" pt={4} px={4} pb={1}>
              <HStack spacing={2.5}>
                <Box
                  w="30px"
                  h="30px"
                  borderRadius="8px"
                  bg="rgba(169,203,183,0.2)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiMessageSquare} color="#56756D" boxSize="15px" />
                </Box>
                <Heading
                  fontSize="16.5px"
                  color="#263A33"
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontWeight="600"
                >
                  Share Your Feedback
                </Heading>
              </HStack>
              <Text
                fontSize="12.5px"
                color="rgba(46,46,46,0.65)"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                mt={1}
              >
                Help us improve your experience at MLC.
              </Text>
            </PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton mt={3} mr={3} />
            <PopoverBody px={4} pb={4} pt={1}>
              {widgetContent}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Box>
  );
}
