'use client'

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Box, Button, FormControl, FormLabel, Textarea, VStack, HStack, Text, Icon, useToast, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton, Select, IconButton, Badge, Tooltip, Portal
} from "@chakra-ui/react";
import { FiMessageSquare, FiSend, FiStar, FiInfo, FiLayout, FiZap, FiCheckCircle } from "react-icons/fi";
import { apiPost } from "../api";

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
        user_type: pathname.includes("dashboard/therapist") ? "therapist" : "client"
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
    <VStack align="stretch" spacing={4} p={2}>
      {!submitted ? (
        <>
          <Text fontSize="xs" color="gray.500" fontWeight="500">
            Help us shape the future of MLC. Your feedback goes directly to our product team.
          </Text>
          <FormControl>
            <FormLabel fontSize="xs" fontWeight="bold">Category</FormLabel>
            <Select 
              size="sm" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              borderRadius="lg"
            >
              <option value="ui_ux">UI/UX Improvement</option>
              <option value="feature">New Feature Request</option>
              <option value="clinical">Clinical Tool Improvement</option>
              <option value="bug">Bug Report</option>
              <option value="general">General Suggestion</option>
            </Select>
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="xs" fontWeight="bold">How can we improve this page?</FormLabel>
            <Textarea 
              size="sm"
              placeholder="Tell us what's missing or what could be better..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              borderRadius="xl"
              minH="100px"
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "teal.400" }}
            />
          </FormControl>
          <Button 
            leftIcon={<FiSend />} 
            colorScheme="teal" 
            size="sm" 
            borderRadius="full" 
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!content.trim()}
          >
            Send Feedback
          </Button>
        </>
      ) : (
        <VStack py={4} spacing={3}>
          <Icon as={FiCheckCircle} color="green.400" boxSize={10} />
          <Text fontWeight="bold" color="teal.800">Thank you!</Text>
          <Text fontSize="xs" textAlign="center" color="gray.600">
            We've received your suggestion. We review every piece of feedback to improve the platform.
          </Text>
        </VStack>
      )}
    </VStack>
  );

  if (variant === "inline") {
    return (
      <Box p={6} bg="white" borderRadius="2xl" border="1px solid" borderColor="teal.100" shadow="sm">
        <HStack mb={4}>
          <Icon as={FiMessageSquare} color="teal.500" />
          <Text fontWeight="bold" fontSize="sm">Have a suggestion for us to improve?</Text>
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
              icon={<FiMessageSquare />}
              bg="#56756D"
              color="white"
              borderRadius="full"
              boxSize="60px"
              fontSize="24px"
              shadow="2xl"
              _hover={{ bg: "#C9A960", transform: "scale(1.1)" }}
              _active={{ transform: "scale(0.9)" }}
              transition="all 0.3s"
              onClick={() => setIsOpen(!isOpen)}
            />
          </Tooltip>
        </PopoverTrigger>
        <Portal>
          <PopoverContent borderRadius="2xl" shadow="2xl" border="none" w="320px">
            <PopoverHeader border="none" pt={5} px={5}>
              <HStack>
                <Icon as={FiZap} color="orange.400" />
                <Text fontWeight="900" fontSize="md" color="teal.900" fontFamily="'Playfair Display', serif">Improvement Architect</Text>
              </HStack>
            </PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton mt={2} mr={2} />
            <PopoverBody p={5}>
              {widgetContent}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Box>
  );
}
