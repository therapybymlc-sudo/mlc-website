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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Badge,
  Collapse,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiPlus, 
  FiTrash2, 
  FiTarget, 
  FiChevronDown, 
  FiChevronUp, 
  FiCalendar, 
  FiClock, 
  FiTrendingUp,
  FiEdit2,
  FiSave
} from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useAuth } from "../../../../../context/AuthContext";
import RichTextEditor from "../../../../../components/RichTextEditor";

const CATEGORIES = [
  { id: 'daily', label: 'Daily Goals', color: '#56756D', icon: FiClock },
  { id: 'short_term', label: 'Short Term', color: '#C9A960', icon: FiTrendingUp },
  { id: 'long_term', label: 'Long Term', color: '#B08968', icon: FiTarget },
];

export default function GoalsClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Goal State
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [activeCategory, setActiveCategory] = useState("short_term");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const cached = localStorage.getItem("mlc_goals_cache");
    if (cached) {
      try { setGoals(JSON.parse(cached)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchGoals();
    } else if (!authLoading && !isAuthenticated) {
        setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await apiGet("client-goals/");
      const data = Array.isArray(res) ? res : res.results || [];
      setGoals(data);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(data));
    } catch (err) {
      console.warn("Could not load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    setIsAdding(true);
    try {
      const saved = await apiPost("client-goals/", {
        title: newGoalTitle,
        description: newGoalDesc,
        category: activeCategory,
        color: CATEGORIES.find(c => c.id === activeCategory).color,
        is_completed: false,
      });
      const newGoals = [saved, ...goals];
      setGoals(newGoals);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(newGoals));
      setNewGoalTitle("");
      setNewGoalDesc("");
      setShowAddForm(false);
      toast({ title: "Goal anchored", status: "success" });
    } catch (err) {
      toast({ title: "Failed to anchor goal", status: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleGoal = async (goal) => {
    try {
      const updated = { ...goal, is_completed: !goal.is_completed };
      await apiPut(`client-goals/${goal.id}/`, updated);
      const newGoals = goals.map(g => g.id === goal.id ? updated : g);
      setGoals(newGoals);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(newGoals));
    } catch (err) {
      toast({ title: "Failed to update progress", status: "error" });
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await apiDelete(`client-goals/${id}/`);
      const newGoals = goals.filter(g => g.id !== id);
      setGoals(newGoals);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(newGoals));
      toast({ title: "Goal released", status: "info" });
    } catch (err) {
      toast({ title: "Could not remove goal", status: "error" });
    }
  };

  if (!isMounted) return null;

  const getProgress = (catId) => {
    const catGoals = goals.filter(g => g.category === catId);
    if (catGoals.length === 0) return 0;
    return (catGoals.filter(g => g.is_completed).length / catGoals.length) * 100;
  };

  return (
    <Box maxW="1000px" mx="auto" pb={20}>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'flex-end' }} mb={10} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">
            Your Healing Roadmap
          </Heading>
          <Text color="gray.500">Tiered intentions for your evolution.</Text>
        </VStack>
        <Button 
          leftIcon={<FiPlus />} 
          bg="#56756D" 
          color="white" 
          borderRadius="full" 
          px={8}
          onClick={() => setShowAddForm(!showAddForm)}
          _hover={{ bg: '#C9A960' }}
        >
          New Intention
        </Button>
      </Flex>

      {/* Stats Board */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        {CATEGORIES.map(cat => (
          <Box key={cat.id} bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between" mb={3}>
              <Text fontSize="xs" fontWeight="800" color="gray.400" letterSpacing="widest">{cat.label.toUpperCase()}</Text>
              <Icon as={cat.icon} color={cat.color} />
            </HStack>
            <Heading size="md" mb={3} color={cat.color}>{Math.round(getProgress(cat.id))}%</Heading>
            <Progress value={getProgress(cat.id)} size="sm" borderRadius="full" colorScheme="teal" bg="gray.50" />
          </Box>
        ))}
      </SimpleGrid>

      {/* Add Form Collapse */}
      <Collapse in={showAddForm}>
        <Box bg="white" p={8} borderRadius="3xl" shadow="md" mb={10} border="1px solid" borderColor="teal.50">
          <VStack spacing={6} align="stretch">
            <HStack spacing={4}>
              <Input 
                placeholder="What is your intention?" 
                variant="filled"
                bg="gray.50"
                borderRadius="xl"
                h="60px"
                fontSize="lg"
                fontWeight="600"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
              />
              <Menu>
                <MenuButton as={Button} rightIcon={<FiChevronDown />} h="60px" borderRadius="xl" px={6} bg="gray.50">
                  {CATEGORIES.find(c => c.id === activeCategory)?.label}
                </MenuButton>
                <MenuList borderRadius="xl" shadow="xl" border="none">
                  {CATEGORIES.map(c => (
                    <MenuItem key={c.id} onClick={() => setActiveCategory(c.id)} icon={<Icon as={c.icon} color={c.color} />}>
                      {c.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </HStack>
            
            <Box>
              <Text fontSize="sm" fontWeight="700" color="gray.500" mb={2}>Context / Details</Text>
              <RichTextEditor 
                content={newGoalDesc} 
                onChange={setNewGoalDesc} 
                placeholder="Dive deeper into why this matters..."
              />
            </Box>

            <Flex justify="flex-end" gap={3}>
               <Button variant="ghost" onClick={() => setShowAddForm(false)} borderRadius="full">Cancel</Button>
               <Button 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                px={10}
                onClick={handleAddGoal}
                isLoading={isAdding}
                loadingText="Anchoring..."
                _hover={{ bg: '#C9A960' }}
               >
                 Save Goal
               </Button>
            </Flex>
          </VStack>
        </Box>
      </Collapse>

      <Tabs variant="soft-rounded" colorScheme="teal">
        <TabList mb={8} bg="white" p={1} borderRadius="full" shadow="sm" w="fit-content">
          <Tab borderRadius="full" px={8} fontSize="sm" fontWeight="700">All Goals</Tab>
          {CATEGORIES.map(cat => (
            <Tab key={cat.id} borderRadius="full" px={8} fontSize="sm" fontWeight="700">{cat.label}</Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
             <GoalsListView goals={goals} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />
          </TabPanel>
          {CATEGORIES.map(cat => (
            <TabPanel key={cat.id} p={0}>
               <GoalsListView 
                goals={goals.filter(g => g.category === cat.id)} 
                onToggle={handleToggleGoal} 
                onDelete={handleDeleteGoal} 
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function GoalsListView({ goals, onToggle, onDelete }) {
  if (goals.length === 0) {
    return (
      <VStack py={20} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
        <Icon as={FiTarget} boxSize={10} color="gray.200" mb={4} />
        <Text color="gray.400">No intentions set in this category yet.</Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={4}>
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </VStack>
  );
}

function GoalItem({ goal, onToggle, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const catColor = CATEGORIES.find(c => c.id === goal.category)?.color || '#56756D';

  return (
    <Box 
      bg="white" 
      borderRadius="2xl" 
      shadow="sm" 
      border="1px solid" 
      borderColor={goal.is_completed ? 'teal.50' : 'gray.50'}
      overflow="hidden"
      transition="0.3s"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Box p={5}>
        <HStack justify="space-between">
          <HStack spacing={4} flex="1">
            <Checkbox 
              colorScheme="teal" 
              size="lg" 
              isChecked={goal.is_completed}
              onChange={() => onToggle(goal)}
            />
            <VStack align="start" spacing={0} onClick={() => setIsExpanded(!isExpanded)} cursor="pointer" flex="1">
              <HStack>
                <Text 
                  fontWeight="700" 
                  color={goal.is_completed ? 'gray.300' : '#2E2E2E'}
                  textDecoration={goal.is_completed ? 'line-through' : 'none'}
                  fontSize="lg"
                >
                  {goal.title}
                </Text>
                <Badge 
                  bg={catColor} 
                  color="white" 
                  fontSize="8px" 
                  borderRadius="full" 
                  px={2}
                  opacity={goal.is_completed ? 0.3 : 0.8}
                >
                  {goal.category?.replace('_', ' ').toUpperCase()}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.400">
                Created {new Date(goal.created_at).toLocaleDateString()}
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            {goal.description && (
              <IconButton 
                icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />} 
                variant="ghost" 
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              />
            )}
            <IconButton 
              icon={<FiTrash2 />} 
              variant="ghost" 
              size="sm" 
              color="gray.200" 
              _hover={{ color: 'red.500', bg: 'red.50' }}
              onClick={() => onDelete(goal.id)}
            />
          </HStack>
        </HStack>
      </Box>

      <Collapse in={isExpanded}>
        <Box px={14} pb={6} pt={0}>
          <Divider mb={4} opacity={0.5} />
          <Box 
            fontSize="sm" 
            color="gray.600" 
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: goal.description }} 
          />
        </Box>
      </Collapse>
    </Box>
  );
}
