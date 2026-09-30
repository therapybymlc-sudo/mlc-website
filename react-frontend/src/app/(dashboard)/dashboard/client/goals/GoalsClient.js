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
  Stack,
  Circle,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiPlus, 
  FiTrash2, 
  FiTarget, 
  FiChevronDown, 
  FiChevronUp, 
  FiClock, 
  FiTrendingUp,
  FiCompass,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useAuth } from "../../../../../context/AuthContext";
import RichTextEditor from "../../../../../components/RichTextEditor";

const CATEGORIES = [
  { 
    id: 'daily', 
    label: 'Daily Goals', 
    color: '#56756D', 
    badgeBg: 'rgba(86, 117, 109, 0.12)',
    badgeColor: '#263A33',
    badgeBorder: 'rgba(86, 117, 109, 0.22)',
    icon: FiClock 
  },
  { 
    id: 'short_term', 
    label: 'Short Term', 
    color: '#C9A960', 
    badgeBg: 'rgba(201, 169, 96, 0.14)',
    badgeColor: '#8D6B21',
    badgeBorder: 'rgba(201, 169, 96, 0.28)',
    icon: FiTrendingUp 
  },
  { 
    id: 'long_term', 
    label: 'Long Term', 
    color: '#B08968', 
    badgeBg: 'rgba(176, 137, 104, 0.14)',
    badgeColor: '#7A5230',
    badgeBorder: 'rgba(176, 137, 104, 0.28)',
    icon: FiTarget 
  },
];

function normalizeRichTextHtml(html) {
  if (!html) return "";
  let out = String(html).trim();
  out = out.replace(/<!doctype[^>]*>/gi, "");
  out = out.replace(/<\/?(html|head|body)[^>]*>/gi, "");
  return out.trim();
}

export default function GoalsClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Goal State
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const handleGoalDescriptionChange = (payload) => {
    if (typeof payload === "string") {
      setNewGoalDesc(payload);
      return;
    }
    setNewGoalDesc(payload?.html || "");
  };

  const [activeCategory, setActiveCategory] = useState("short_term");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  async function fetchGoals() {
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
  }

  async function handleAddGoal() {
    if (!newGoalTitle.trim()) return;
    setIsAdding(true);
    try {
      const normalizedDescription = normalizeRichTextHtml(newGoalDesc);
      const saved = await apiPost("client-goals/", {
        title: newGoalTitle,
        description: normalizedDescription,
        category: activeCategory,
        color: CATEGORIES.find(c => c.id === activeCategory)?.color || '#56756D',
        is_completed: false,
      });
      const newGoals = [saved, ...goals];
      setGoals(newGoals);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(newGoals));
      setNewGoalTitle("");
      setNewGoalDesc("");
      setShowAddForm(false);
      toast({ 
        title: "Intention Anchored", 
        description: "Your goal has been added to your healing roadmap.",
        status: "success",
        duration: 3000
      });
    } catch (err) {
      toast({ 
        title: "Could not save goal", 
        description: "Please check your network and try again.",
        status: "error" 
      });
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggleGoal(goal) {
    try {
      const updated = { ...goal, is_completed: !goal.is_completed };
      await apiPut(`client-goals/${goal.id}/`, updated);
      const newGoals = goals.map(g => g.id === goal.id ? updated : g);
      setGoals(newGoals);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(newGoals));
    } catch (err) {
      toast({ title: "Failed to update progress", status: "error" });
    }
  }

  async function handleDeleteGoal(id) {
    try {
      await apiDelete(`client-goals/${id}/`);
      const newGoals = goals.filter(g => g.id !== id);
      setGoals(newGoals);
      localStorage.setItem("mlc_goals_cache", JSON.stringify(newGoals));
      toast({ title: "Goal removed", status: "info", duration: 2500 });
    } catch (err) {
      toast({ title: "Could not remove goal", status: "error" });
    }
  }

  useEffect(() => {
    setIsMounted(true);
    const cached = localStorage.getItem("mlc_goals_cache");
    if (cached) {
      try { 
        setGoals(JSON.parse(cached)); 
      } catch {
        // Ignore cache parse errors
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchGoals();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  if (!isMounted) return null;

  const getProgress = (catId) => {
    const catGoals = goals.filter(g => g.category === catId);
    if (catGoals.length === 0) return 0;
    return (catGoals.filter(g => g.is_completed).length / catGoals.length) * 100;
  };

  return (
    <Box maxW="1240px" mx="auto" pb={12} fontFamily="'Inter', var(--font-inter), sans-serif">
      {/* 🌿 Framed Header Card */}
      <Box 
        id="tour-goals-header"
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'start', md: 'center' }} 
          gap={4}
        >
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiCheckCircle} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0" 
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(86, 117, 109, 0.12)" 
                  color="#56756D" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5} 
                  textTransform="uppercase" 
                  letterSpacing="0.08em"
                >
                  Growth Intentions
                </Badge>
              </HStack>
              <Heading 
                as="h1"
                fontSize={{ base: "21px", sm: "25px" }} 
                fontWeight="600" 
                color="#263A33" 
                letterSpacing="-0.015em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                lineHeight="1.25"
              >
                Your Healing Roadmap
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                Tiered intentions and mindful milestones for your evolution.
              </Text>
            </VStack>
          </HStack>

          <Button 
            id="tour-goals-new"
            leftIcon={<Icon as={FiPlus} boxSize="13px" />} 
            bg="#56756D" 
            color="white" 
            borderRadius="full" 
            height="38px"
            fontSize="13px"
            fontWeight="600"
            px={5}
            w={{ base: "full", md: "auto" }}
            onClick={() => setShowAddForm(!showAddForm)}
            _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
            whiteSpace="nowrap"
            boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
          >
            {showAddForm ? "Close Form" : "New Intention"}
          </Button>
        </Flex>
      </Box>

      {/* 📊 Bento Stats Board */}
      <SimpleGrid id="tour-goals-stats" columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        {CATEGORIES.map(cat => {
          const prog = Math.round(getProgress(cat.id));
          return (
            <Box 
              key={cat.id} 
              bg="white" 
              p={5} 
              borderRadius="2xl" 
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.14)"
              transition="all 0.2s"
              _hover={{ borderColor: "rgba(86, 117, 109, 0.25)" }}
            >
              <HStack justify="space-between" mb={2}>
                <Text 
                  fontSize="11px" 
                  fontWeight="700" 
                  color="#718096" 
                  letterSpacing="0.08em" 
                  textTransform="uppercase"
                >
                  {cat.label}
                </Text>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                  <Icon as={cat.icon} boxSize="13px" />
                </Circle>
              </HStack>

              <Text 
                fontSize="26px" 
                fontWeight="600" 
                mb={3} 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.02em"
              >
                {prog}%
              </Text>

              <Box position="relative" w="100%" h="6px" bg="rgba(86, 117, 109, 0.1)" borderRadius="full" overflow="hidden">
                <Box 
                  h="100%" 
                  w={`${prog}%`} 
                  bg="#56756D" 
                  borderRadius="full" 
                  transition="width 0.4s ease"
                />
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* ✍️ Add New Intention Form */}
      <Collapse in={showAddForm} animateOpacity>
        <Box 
          bg="white" 
          p={{ base: 5, md: 7 }} 
          borderRadius="2xl" 
          boxShadow="0 8px 30px -4px rgba(38, 58, 51, 0.08)" 
          mb={8} 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.2)"
        >
          <VStack spacing={5} align="stretch">
            <HStack justify="space-between">
              <Heading 
                fontSize="16px" 
                fontWeight="600" 
                color="#263A33"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
              >
                Create New Intention
              </Heading>
              <Badge 
                bg="rgba(86, 117, 109, 0.1)" 
                color="#56756D" 
                borderRadius="full" 
                px={2.5} 
                py={0.5} 
                fontSize="10px" 
                fontWeight="700"
              >
                PERSONAL
              </Badge>
            </HStack>

            <Stack direction={{ base: "column", md: "row" }} spacing={3}>
              <Input 
                placeholder="What is your intention? (e.g., Daily Mindful Breathing)" 
                bg="#FAF8F5"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.2)"
                borderRadius="xl"
                h="44px"
                fontSize="14px"
                fontWeight="500"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D", bg: "white" }}
                flex={1}
              />
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<Icon as={FiChevronDown} boxSize="13px" />} 
                  h="44px" 
                  borderRadius="xl" 
                  px={5} 
                  bg="#FAF8F5" 
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  fontSize="13px"
                  fontWeight="600"
                  color="#263A33"
                  minW={{ base: "full", md: "160px" }}
                  _hover={{ bg: "white" }}
                >
                  {CATEGORIES.find(c => c.id === activeCategory)?.label}
                </MenuButton>
                <MenuList borderRadius="xl" shadow="lg" border="1px solid rgba(86, 117, 109, 0.15)" p={1}>
                  {CATEGORIES.map(c => (
                    <MenuItem 
                      key={c.id} 
                      onClick={() => setActiveCategory(c.id)} 
                      icon={<Icon as={c.icon} color="#56756D" boxSize="13px" />}
                      fontSize="13px"
                      fontWeight="500"
                      borderRadius="lg"
                    >
                      {c.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Stack>
            
            <Box>
              <Text fontSize="12px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={2}>
                Context & Personal Notes (Optional)
              </Text>
              <RichTextEditor 
                value={newGoalDesc}
                onChange={handleGoalDescriptionChange}
                placeholder="Describe why this intention is meaningful to your journey..."
              />
            </Box>

            <Flex justify="flex-end" gap={3} pt={2}>
              <Button 
                variant="ghost" 
                onClick={() => setShowAddForm(false)} 
                borderRadius="full"
                size="sm"
                height="34px"
                fontSize="12.5px"
                fontWeight="500"
                color="#718096"
                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
              >
                Cancel
              </Button>
              <Button 
                bg="#263A33" 
                color="white" 
                borderRadius="full" 
                size="sm"
                height="34px"
                px={6}
                fontSize="12.5px"
                fontWeight="600"
                onClick={handleAddGoal}
                isLoading={isAdding}
                loadingText="Anchoring..."
                _hover={{ bg: '#182722' }}
              >
                Anchor Intention
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Collapse>

      {/* 🏷️ Filter Pills & Content */}
      <Tabs id="tour-goals-tabs" variant="unstyled">
        <TabList 
          mb={6} 
          bg="rgba(86, 117, 109, 0.08)" 
          p="4px" 
          borderRadius="full" 
          w={{ base: "100%", md: "fit-content" }}
          overflowX="auto"
          flexWrap="nowrap"
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.12)"
          sx={{
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          <Tab 
            borderRadius="full" 
            px={{ base: 4, md: 6 }} 
            py={1.5}
            fontSize="12.5px" 
            fontWeight="600" 
            color="#5A6E65"
            flexShrink={0} 
            whiteSpace="nowrap"
            transition="all 0.2s"
            _hover={{ color: "#263A33" }}
            _selected={{ 
              bg: "#263A33", 
              color: "white", 
              boxShadow: "0 2px 8px rgba(38, 58, 51, 0.16)" 
            }}
          >
            All Goals
          </Tab>
          {CATEGORIES.map(cat => (
            <Tab 
              key={cat.id} 
              borderRadius="full" 
              px={{ base: 4, md: 6 }} 
              py={1.5}
              fontSize="12.5px" 
              fontWeight="600" 
              color="#5A6E65"
              flexShrink={0} 
              whiteSpace="nowrap"
              transition="all 0.2s"
              _hover={{ color: "#263A33" }}
              _selected={{ 
                bg: "#263A33", 
                color: "white", 
                boxShadow: "0 2px 8px rgba(38, 58, 51, 0.16)" 
              }}
            >
              {cat.label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
             <GoalsListView 
              goals={goals} 
              onToggle={handleToggleGoal} 
              onDelete={handleDeleteGoal} 
              onOpenAdd={() => setShowAddForm(true)}
            />
          </TabPanel>
          {CATEGORIES.map(cat => (
            <TabPanel key={cat.id} p={0}>
               <GoalsListView 
                goals={goals.filter(g => g.category === cat.id)} 
                onToggle={handleToggleGoal} 
                onDelete={handleDeleteGoal} 
                categoryLabel={cat.label}
                onOpenAdd={() => {
                  setActiveCategory(cat.id);
                  setShowAddForm(true);
                }}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function GoalsListView({ goals, onToggle, onDelete, categoryLabel, onOpenAdd }) {
  if (goals.length === 0) {
    return (
      <Box 
        bg="white" 
        p={{ base: 8, md: 12 }} 
        borderRadius="2xl" 
        border="1px solid" 
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        textAlign="center"
      >
        <VStack spacing={4} maxW="380px" mx="auto">
          <Circle size="50px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
            <Icon as={FiCompass} boxSize="22px" />
          </Circle>
          <VStack spacing={1}>
            <Heading 
              fontSize="16px" 
              fontWeight="600" 
              color="#263A33"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
            >
              {categoryLabel ? `No ${categoryLabel} Yet` : "No Intentions Set"}
            </Heading>
            <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
              Set actionable personal intentions to guide your therapeutic journey and track your mindful milestones.
            </Text>
          </VStack>
          {onOpenAdd && (
            <Button
              size="sm"
              height="34px"
              bg="#263A33"
              color="white"
              borderRadius="full"
              fontSize="12.5px"
              fontWeight="600"
              px={5}
              leftIcon={<Icon as={FiPlus} boxSize="12px" />}
              onClick={onOpenAdd}
              _hover={{ bg: "#182722", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              mt={1}
            >
              Set First Intention
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={3.5}>
      {goals.map((goal) => (
        <GoalItem key={goal.id} goal={goal} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </VStack>
  );
}

function GoalItem({ goal, onToggle, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const catMeta = CATEGORIES.find(c => c.id === goal.category) || CATEGORIES[0];
  const safeDescription = normalizeRichTextHtml(goal.description || "");

  return (
    <Box 
      bg="white" 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor={goal.is_completed ? 'rgba(86, 117, 109, 0.1)' : 'rgba(86, 117, 109, 0.15)'}
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ borderColor: 'rgba(86, 117, 109, 0.28)' }}
    >
      <Box p={{ base: 4, sm: 5 }}>
        <HStack justify="space-between" align="center" spacing={3}>
          <HStack spacing={3.5} flex="1" overflow="hidden">
            <Checkbox 
              colorScheme="green" 
              size="lg" 
              isChecked={goal.is_completed}
              onChange={() => onToggle(goal)}
              sx={{
                '[data-checked]': {
                  bg: '#263A33 !important',
                  borderColor: '#263A33 !important',
                },
                borderRadius: 'md',
              }}
            />
            
            <VStack 
              align="start" 
              spacing={0.5} 
              onClick={() => safeDescription && setIsExpanded(!isExpanded)} 
              cursor={safeDescription ? "pointer" : "default"} 
              flex="1" 
              overflow="hidden"
            >
              <HStack w="full" wrap="nowrap" spacing={2.5}>
                <Text 
                  fontWeight="600" 
                  color={goal.is_completed ? '#A0AEC0' : '#263A33'}
                  textDecoration={goal.is_completed ? 'line-through' : 'none'}
                  fontSize={{ base: "13.5px", md: "14.5px" }}
                  noOfLines={1}
                  flex={1}
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  {goal.title}
                </Text>
                
                <Badge 
                  bg={catMeta.badgeBg} 
                  color={catMeta.badgeColor} 
                  border="1px solid"
                  borderColor={catMeta.badgeBorder}
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  opacity={goal.is_completed ? 0.45 : 1}
                  whiteSpace="nowrap"
                  display={{ base: "none", sm: "block" }}
                >
                  {catMeta.label.toUpperCase()}
                </Badge>
              </HStack>
              
              <Text fontSize="11.5px" color="#718096">
                Created {new Date(goal.created_at || Date.now()).toLocaleDateString(undefined, {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={1} flexShrink={0}>
            {safeDescription && (
              <IconButton 
                icon={<Icon as={isExpanded ? FiChevronUp : FiChevronDown} boxSize="15px" />} 
                variant="ghost" 
                size="sm"
                borderRadius="full"
                color="#56756D"
                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                aria-label="Expand goal details"
                onClick={() => setIsExpanded(!isExpanded)}
              />
            )}
            <IconButton 
              icon={<Icon as={FiTrash2} boxSize="14px" />} 
              variant="ghost" 
              size="sm" 
              borderRadius="full"
              color="#A0AEC0" 
              _hover={{ color: '#E53E3E', bg: 'rgba(239, 68, 68, 0.08)' }}
              aria-label="Delete goal"
              onClick={() => onDelete(goal.id)}
            />
          </HStack>
        </HStack>
      </Box>

      {safeDescription && (
        <Collapse in={isExpanded} animateOpacity>
          <Box px={{ base: 5, md: 12 }} pb={5} pt={1}>
            <Box 
              bg="rgba(250, 248, 245, 0.8)" 
              p={4} 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.1)"
              fontSize="13px" 
              color="#263A33" 
              lineHeight="1.5"
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: safeDescription }} 
            />
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
