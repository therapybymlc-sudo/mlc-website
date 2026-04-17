'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  useToast,
  Checkbox,
  IconButton,
  Icon,
  SimpleGrid,
  Progress,
  Tag,
  Divider,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiPlus, FiTrash2, FiTarget, FiCheck } from "react-icons/fi";
import { apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useClientData } from "../useClientData";

export default function GoalsClient() {
  const toast = useToast();
  const { goals, loading, refreshData } = useClientData();
  const [newGoal, setNewGoal] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    setIsAdding(true);
    try {
      await apiPost("client-goals/", {
        title: newGoal,
        is_completed: false,
      });
      setNewGoal("");
      refreshData();
      toast({ title: "Goal added", status: "success" });
    } catch (err) {
      toast({ title: "Failed to add goal", status: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleGoal = async (goal) => {
    try {
      await apiPut(`client-goals/${goal.id}/`, {
        ...goal,
        is_completed: !goal.is_completed,
      });
      refreshData();
    } catch (err) {
      toast({ title: "Failed to update goal", status: "error" });
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await apiDelete(`client-goals/${id}/`);
      refreshData();
      toast({ title: "Goal removed", status: "info" });
    } catch (err) {
      toast({ title: "Failed to remove goal", status: "error" });
    }
  };

  const completedCount = goals.filter(g => g.is_completed).length;
  const totalCount = goals.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Box maxW="900px" mx="auto">
      <VStack align="start" spacing={1} mb={10}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">
          My Healing Path
        </Heading>
        <Text color="gray.500">Define your intentions and track your evolution.</Text>
      </VStack>

      {/* Progress Header */}
      <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" mb={10}>
        <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold" color="gray.400">OVERALL PROGRESS</Text>
                <Heading size="md" color="#56756D">{completedCount} of {totalCount} Goals Achieved</Heading>
            </VStack>
            <Box bg="#E9F2ED" p={3} borderRadius="2xl">
                <Icon as={FiTarget} color="#56756D" boxSize={6} />
            </Box>
        </HStack>
        <Progress value={progress} colorScheme="teal" borderRadius="full" size="lg" mb={2} />
        <Text fontSize="xs" color="gray.500">Every small step is part of the larger journey.</Text>
      </Box>

      {/* Add Goal */}
      <HStack mb={10} spacing={4}>
        <Input 
            placeholder="What's a small objective for this week?" 
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            bg="white"
            borderRadius="2xl"
            h="60px"
            shadow="sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
        />
        <Button 
            bg="#56756D" 
            color="white" 
            h="60px" 
            px={8} 
            borderRadius="2xl" 
            leftIcon={<FiPlus />}
            onClick={handleAddGoal}
            isLoading={isAdding}
            _hover={{ bg: '#C9A960' }}
        >
            Add Goal
        </Button>
      </HStack>

      {/* Goals List */}
      <VStack align="stretch" spacing={4}>
        {goals.map((goal) => (
            <Box 
                key={goal.id} 
                p={5} 
                bg="white" 
                borderRadius="2xl" 
                shadow="sm" 
                border="1px solid" 
                borderColor={goal.is_completed ? 'teal.50' : 'gray.50'}
                opacity={goal.is_completed ? 0.7 : 1}
                transition="0.2s"
            >
                <HStack justify="space-between">
                    <HStack spacing={4}>
                        <Checkbox 
                            colorScheme="teal" 
                            size="lg" 
                            isChecked={goal.is_completed}
                            onChange={() => handleToggleGoal(goal)}
                        />
                        <VStack align="start" spacing={0}>
                            <Text 
                                fontWeight="700" 
                                color={goal.is_completed ? 'gray.400' : '#2E2E2E'}
                                textDecoration={goal.is_completed ? 'line-through' : 'none'}
                            >
                                {goal.title}
                            </Text>
                            <Text fontSize="xs" color="gray.400">Added on {new Date(goal.created_at).toLocaleDateString()}</Text>
                        </VStack>
                    </HStack>
                    <IconButton 
                        icon={<FiTrash2 />} 
                        variant="ghost" 
                        size="sm" 
                        color="gray.300" 
                        _hover={{ color: 'red.500', bg: 'red.50' }}
                        onClick={() => handleDeleteGoal(goal.id)}
                    />
                </HStack>
            </Box>
        ))}
        {goals.length === 0 && !loading && (
            <VStack py={20} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
                <Icon as={FiTarget} boxSize={10} color="gray.200" mb={4} />
                <Text color="gray.400">No goals set yet. Start with something small.</Text>
            </VStack>
        )}
      </VStack>
    </Box>
  );
}
