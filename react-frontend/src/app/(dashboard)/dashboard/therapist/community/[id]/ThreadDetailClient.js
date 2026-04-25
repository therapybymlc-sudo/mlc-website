'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, Icon, 
  Avatar, Divider, Input, IconButton, useToast, Spinner, Center,
  Badge, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Textarea,
  FormControl, FormLabel, Flex
} from "@chakra-ui/react";
import { 
  FiArrowLeft, FiMessageSquare, FiSend, FiClock, FiUser,
  FiMoreVertical, FiShare2, FiHeart
} from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../../api.js";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const CommentCard = ({ comment, onReply }) => (
  <Box 
    pl={comment.parent ? 8 : 0} 
    borderLeft={comment.parent ? "2px solid" : "none"} 
    borderColor="teal.50"
    mt={4}
  >
    <VStack align="stretch" spacing={3} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.50">
      <HStack justify="space-between">
        <HStack spacing={3}>
          <Avatar size="sm" name={comment.author_name} src={comment.author_image} />
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="700" color="teal.900">{comment.author_name}</Text>
            <Text fontSize="xs" color="gray.400">{new Date(comment.created_at).toLocaleString()}</Text>
          </VStack>
        </HStack>
        <IconButton size="xs" variant="ghost" icon={<FiMoreVertical />} aria-label="options" />
      </HStack>
      <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{comment.content}</Text>
      <HStack spacing={4}>
        <Button size="xs" variant="ghost" leftIcon={<FiMessageSquare />} onClick={() => onReply(comment)}>Reply</Button>
        <Button size="xs" variant="ghost" leftIcon={<FiHeart />}>Helpful</Button>
      </HStack>
    </VStack>
    {comment.replies && comment.replies.map(reply => (
      <CommentCard key={reply.id} comment={reply} onReply={onReply} />
    ))}
  </Box>
);

export default function ThreadDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function fetchThread() {
      try {
        setLoading(true);
        const [threadData, commentsData] = await Promise.all([
          apiGet(`community/threads/${id}/`),
          apiGet(`community/comments/?thread=${id}`)
        ]);
        setThread(threadData);
        setComments(Array.isArray(commentsData) ? commentsData : commentsData.results || []);
        
        // Increment view count
        apiPost(`community/threads/${id}/increment_view/`, {});
      } catch (err) {
        toast({ title: "Failed to load thread", status: "error" });
        router.push("/dashboard/therapist/community");
      } finally {
        setLoading(false);
      }
    }
    fetchThread();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      const payload = {
        thread: id,
        content: newComment,
        parent: replyTo ? replyTo.id : null
      };
      const res = await apiPost("community/comments/", payload);
      
      // Refresh comments or append
      const updatedComments = await apiGet(`community/comments/?thread=${id}`);
      setComments(Array.isArray(updatedComments) ? updatedComments : updatedComments.results || []);
      
      setNewComment("");
      setReplyTo(null);
      toast({ title: "Comment posted", status: "success" });
    } catch (err) {
      toast({ title: "Failed to post comment", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Center py={40}><Spinner color="teal.500" size="xl" /></Center>;
  if (!thread) return null;

  return (
    <Container maxW="4xl" py={8}>
      <VStack align="stretch" spacing={8}>
        {/* Navigation */}
        <Breadcrumb fontSize="sm" color="gray.500">
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/dashboard/therapist/community">Community</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{thread.category_name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Button 
          variant="link" 
          leftIcon={<FiArrowLeft />} 
          onClick={() => router.back()} 
          color="gray.600" 
          w="fit-content"
        >
          Back to Discussions
        </Button>

        {/* Thread Content */}
        <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="teal.50">
          <VStack align="stretch" spacing={6}>
            <HStack justify="space-between">
              <Badge colorScheme="teal" borderRadius="full" px={3} variant="subtle">
                {thread.category_name}
              </Badge>
              <HStack color="gray.400" fontSize="xs">
                <Icon as={FiClock} />
                <Text>{new Date(thread.created_at).toLocaleString()}</Text>
              </HStack>
            </HStack>

            <Heading size="xl" color="teal.900" fontFamily="'Playfair Display', serif">{thread.title}</Heading>
            
            <HStack spacing={4}>
              <Avatar size="sm" name={thread.author_name} src={thread.author_image} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="800" color="gray.700">{thread.author_name}</Text>
                <Text fontSize="xs" color="gray.400">Verified Specialist</Text>
              </VStack>
            </HStack>

            <Divider />

            <Text color="gray.700" fontSize="lg" lineHeight="tall" whiteSpace="pre-wrap">
              {thread.content}
            </Text>

            <HStack spacing={6} pt={4}>
                <HStack spacing={2} color="gray.500">
                    <Icon as={FiMessageSquare} />
                    <Text fontWeight="700">{thread.comment_count} Comments</Text>
                </HStack>
                <HStack spacing={2} color="gray.500">
                    <Icon as={FiClock} />
                    <Text fontWeight="700">{thread.views_count} Views</Text>
                </HStack>
                <IconButton aria-label="share" icon={<FiShare2 />} variant="ghost" size="sm" />
            </HStack>
          </VStack>
        </Box>

        {/* Comments Section */}
        <VStack align="stretch" spacing={6}>
          <Heading size="md" color="teal.900">Discussion</Heading>
          
          <VStack align="stretch" spacing={0}>
            {comments.filter(c => !c.parent).map(comment => (
              <CommentCard key={comment.id} comment={comment} onReply={setReplyTo} />
            ))}
            {comments.length === 0 && (
              <Center py={10} bg="gray.50" borderRadius="2xl">
                <Text color="gray.400" fontStyle="italic">No comments yet. Start the conversation.</Text>
              </Center>
            )}
          </VStack>

          {/* New Comment Input */}
          <Box bg="white" p={6} borderRadius="3xl" shadow="lg" position="sticky" bottom={8} border="1px solid" borderColor="teal.100">
            <VStack align="stretch" spacing={4}>
              {replyTo && (
                <HStack bg="teal.50" p={2} borderRadius="lg" justify="space-between">
                  <Text fontSize="xs" color="teal.700">Replying to <b>{replyTo.author_name}</b></Text>
                  <IconButton size="xs" icon={<FiArrowLeft />} onClick={() => setReplyTo(null)} aria-label="cancel" />
                </HStack>
              )}
              <FormControl>
                <Textarea 
                  placeholder={replyTo ? "Write your reply..." : "Add your clinical perspective..."} 
                  borderRadius="2xl"
                  bg="gray.50"
                  border="none"
                  _focus={{ bg: "white", shadow: "inner" }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  minH="100px"
                />
              </FormControl>
              <Flex justify="flex-end">
                <Button 
                  rightIcon={<FiSend />} 
                  bg="teal.800" 
                  color="white" 
                  borderRadius="full" 
                  px={8}
                  isLoading={isSubmitting}
                  onClick={handleSubmitComment}
                  _hover={{ bg: "teal.900" }}
                >
                  Post {replyTo ? "Reply" : "Comment"}
                </Button>
              </Flex>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </Container>
  );
}
