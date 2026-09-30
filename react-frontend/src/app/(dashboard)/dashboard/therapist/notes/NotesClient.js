'use client'

import {
  Box, Heading, Text, VStack, HStack, Button,
  FormControl, FormLabel, Input, Textarea, useToast,
  Spinner, Divider, Badge, Stack, SimpleGrid,
  Flex, Center, Circle, Icon, IconButton,
  Menu, MenuButton, MenuList, MenuItem,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiSave, FiArrowLeft, FiClipboard,
  FiClock, FiCheckCircle, FiCopy, FiChevronDown, FiPlusCircle,
  FiList, FiCheck, FiFileText, FiLayers, FiChevronUp
} from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useRouter } from "next/navigation";

/* =========================================
   Modern Select Dropdown Component
========================================= */
function ModernSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  isDisabled = false,
  w = "full",
  minW = "160px",
  size = "md"
}) {
  const formattedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
  const selectedOption = formattedOptions.find((o) => String(o.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const hasValue = !!selectedOption && selectedOption.value !== "";
  const isSm = size === "sm";

  return (
    <Menu placement="bottom-start" matchWidth autoSelect={false}>
      {({ isOpen }) => (
        <Box w={w}>
          <MenuButton
            as={Button}
            isDisabled={isDisabled}
            w="full"
            h={isSm ? "32px" : "38px"}
            px={isSm ? 2.5 : 3.5}
            borderRadius="xl"
            bg={isOpen ? "white" : "rgba(250, 248, 245, 0.85)"}
            border="1px solid"
            borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
            boxShadow={isOpen ? "0 0 0 1px #56756D" : "none"}
            _hover={{ bg: "white", borderColor: "#56756D" }}
            _active={{ bg: "white" }}
            textAlign="left"
            rightIcon={
              <Icon
                as={FiChevronDown}
                transition="transform 0.2s"
                transform={isOpen ? "rotate(180deg)" : "none"}
                color="#56756D"
                boxSize={isSm ? "12px" : "14px"}
              />
            }
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text
              as="span"
              fontSize={isSm ? "12px" : "13px"}
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontWeight={hasValue ? "500" : "400"}
              color={hasValue ? "#263A33" : "#718096"}
              isTruncated
            >
              {displayText}
            </Text>
          </MenuButton>
          <MenuList
            bg="white"
            borderRadius="xl"
            p={1.5}
            border="1px solid rgba(86, 117, 109, 0.15)"
            boxShadow="0 12px 28px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
            zIndex={1400}
            minW={minW}
            maxH="240px"
            overflowY="auto"
          >
            {placeholder && (
              <MenuItem
                borderRadius="lg"
                px={3}
                py={2}
                fontSize="12.5px"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontWeight="500"
                color="#718096"
                _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
                onClick={() => onChange("")}
              >
                {placeholder}
              </MenuItem>
            )}
            {formattedOptions.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <MenuItem
                  key={opt.value}
                  borderRadius="lg"
                  px={3}
                  py={2}
                  fontSize="13px"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontWeight={active ? "600" : "500"}
                  color={active ? "#263A33" : "#5A6E65"}
                  bg={active ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                  _hover={{ bg: "rgba(86, 117, 109, 0.12)", color: "#263A33" }}
                  onClick={() => onChange(opt.value)}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text as="span" isTruncated>{opt.label}</Text>
                  {active && <Icon as={FiCheck} color="#56756D" boxSize="13px" />}
                </MenuItem>
              );
            })}
          </MenuList>
        </Box>
      )}
    </Menu>
  );
}

/* =========================================
   Clinical Blueprints Hub
========================================= */
export default function NotesClient() {
  const router = useRouter();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list, builder
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Builder State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    event_type: "",
    fields: [{ label: "Section 1", field_type: "section", order: 0 }]
  });

  const [eventTypes, setEventTypes] = useState([]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [tpls, ets] = await Promise.all([
        apiGet("note-templates/"),
        apiGet("event-types/"),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : tpls.results || []);
      setEventTypes(Array.isArray(ets) ? ets : ets.results || []);
    } catch (e) {
      toast({ title: "Sync Error", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadTemplates();
  }, []);

  /* ---------- Architect Logic ---------- */
  const addField = (atIndex = -1) => {
    const newField = {
      label: "New Question",
      field_key: `f_${Math.random().toString(36).substr(2, 9)}`,
      field_type: "text",
      is_required: false,
      order: 0,
      options: { choices: [], allow_other: false, min: 1, max: 5 },
    };
    const fields = [...form.fields];
    if (atIndex === -1) fields.push(newField);
    else fields.splice(atIndex + 1, 0, newField);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const addSection = (atIndex = -1) => {
    const newSection = {
      label: "New Section",
      field_key: `s_${Math.random().toString(36).substr(2, 9)}`,
      field_type: "section",
      order: 0,
    };
    const fields = [...form.fields];
    if (atIndex === -1) fields.push(newSection);
    else fields.splice(atIndex + 1, 0, newSection);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const moveField = (index, direction) => {
    const fields = [...form.fields];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const removeField = (index) => {
    const fields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const updateField = (index, key, val) => {
    const fields = [...form.fields];
    fields[index][key] = val;
    setForm({ ...form, fields });
  };

  const saveTemplate = async () => {
    if (!form.name.trim()) return toast({ title: "Name Required", description: "Please enter a template name.", status: "warning" });
    try {
      const payload = {
        name: form.name,
        description: form.description,
        event_type: form.event_type || null,
        new_fields: form.fields
      };
      if (editingTemplate) await apiPut(`note-templates/${editingTemplate.id}/`, payload);
      else await apiPost("note-templates/", payload);
      toast({ title: "Template Saved", description: "Clinical blueprint configured successfully.", status: "success" });
      setViewMode("list");
      loadTemplates();
    } catch (e) {
      toast({ title: "Save Failed", status: "error" });
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Permanently delete this clinical blueprint?")) return;
    try {
      await apiDelete(`note-templates/${id}/`);
      toast({ title: "Template Removed", status: "info" });
      loadTemplates();
    } catch (e) {
      toast({ title: "Delete Failed", status: "error" });
    }
  };

  if (!mounted) return <Center py={20}><Spinner color="#56756D" size="xl" /></Center>;

  const totalDataPoints = templates.reduce((acc, t) => acc + (t.fields?.length || 0), 0);

  /* ---------- Renderers ---------- */

  const renderArchitect = () => (
    <VStack align="stretch" spacing={6} maxW="4xl" mx="auto">
      <Box
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      >
        <Heading
          fontSize="15px"
          fontFamily="'Outfit', var(--font-outfit), sans-serif"
          fontWeight="600"
          color="#263A33"
          mb={4}
          letterSpacing="-0.01em"
        >
          {editingTemplate ? "Edit Clinical Blueprint" : "Architect New Clinical Blueprint"}
        </Heading>
        <VStack spacing={5} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            <FormControl isRequired>
              <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
                Template Name
              </FormLabel>
              <Input
                placeholder="e.g., SOAP Progress Note"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.85)"
                border="1px solid rgba(86, 117, 109, 0.18)"
                fontSize="13px"
                h="38px"
                _focus={{ borderColor: "#56756D", bg: "white" }}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
                Associated Session Type
              </FormLabel>
              <ModernSelect
                value={form.event_type || ""}
                onChange={(val) => setForm({ ...form, event_type: val })}
                options={eventTypes.map(et => ({ label: et.name, value: et.id }))}
                placeholder="Generic (Universal for all sessions)"
              />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
              Clinical Intent & Documentation Instructions
            </FormLabel>
            <Textarea
              placeholder="Explain when and how this clinical blueprint should be utilized during care..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.85)"
              border="1px solid rgba(86, 117, 109, 0.18)"
              fontSize="13px"
              rows={3}
              _focus={{ borderColor: "#56756D", bg: "white" }}
            />
          </FormControl>
        </VStack>
      </Box>

      {/* Structured Fields & Sections */}
      <VStack align="stretch" spacing={3}>
        {form.fields.map((f, i) => {
          const isSection = f.field_type === "section";
          return (
            <Box key={i} position="relative">
              <Box
                bg={isSection ? "rgba(86, 117, 109, 0.08)" : "white"}
                p={4}
                borderRadius="xl"
                border="1px solid"
                borderColor={isSection ? "rgba(86, 117, 109, 0.22)" : "rgba(86, 117, 109, 0.14)"}
                boxShadow={isSection ? "none" : "0 2px 8px rgba(38, 58, 51, 0.03)"}
              >
                <HStack spacing={3.5} align="center">
                  <VStack spacing={0}>
                    <IconButton
                      icon={<Icon as={FiChevronUp} boxSize="13px" />}
                      aria-label="Move Up"
                      size="xs"
                      variant="ghost"
                      isDisabled={i === 0}
                      onClick={() => moveField(i, -1)}
                      _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                    />
                    <IconButton
                      icon={<Icon as={FiChevronDown} boxSize="13px" />}
                      aria-label="Move Down"
                      size="xs"
                      variant="ghost"
                      isDisabled={i === form.fields.length - 1}
                      onClick={() => moveField(i, 1)}
                      _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                    />
                  </VStack>
                  
                  <VStack align="stretch" flex="1" spacing={2}>
                    <HStack spacing={3}>
                      <Input
                        variant="unstyled"
                        fontWeight={isSection ? "700" : "600"}
                        fontSize={isSection ? "14px" : "13.5px"}
                        fontFamily={isSection ? "'Outfit', sans-serif" : "'Inter', sans-serif"}
                        color="#263A33"
                        letterSpacing={isSection ? "0.02em" : "normal"}
                        placeholder={isSection ? "SECTION TITLE (e.g., SUBJECTIVE FINDINGS)" : "Question Label / Prompt"}
                        value={f.label}
                        onChange={e => updateField(i, "label", e.target.value)}
                      />
                      {!isSection && (
                        <ModernSelect
                          size="sm"
                          w="140px"
                          value={f.field_type}
                          onChange={(val) => updateField(i, "field_type", val)}
                          options={[
                            { label: "Short Text", value: "text" },
                            { label: "Large Area", value: "textarea" },
                            { label: "Multi-Check", value: "checkboxes" },
                            { label: "Likert Scale", value: "likert" },
                          ]}
                          placeholder="Type"
                        />
                      )}
                      <IconButton
                        icon={<Icon as={FiTrash2} boxSize="13px" />}
                        aria-label="Remove"
                        size="xs"
                        variant="ghost"
                        color="#E53E3E"
                        borderRadius="md"
                        _hover={{ bg: "rgba(239, 68, 68, 0.1)" }}
                        onClick={() => removeField(i)}
                      />
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          );
        })}
      </VStack>

      {/* Insertion Controls */}
      <HStack justify="center" py={4} spacing={3}>
        <Button
          leftIcon={<FiPlus />}
          variant="outline"
          borderColor="rgba(86, 117, 109, 0.25)"
          color="#263A33"
          borderRadius="full"
          h="36px"
          fontSize="12.5px"
          fontWeight="600"
          px={4}
          _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
          onClick={() => addField()}
        >
          Add Question Field
        </Button>
        <Button
          leftIcon={<FiList />}
          variant="outline"
          borderColor="rgba(86, 117, 109, 0.25)"
          color="#263A33"
          borderRadius="full"
          h="36px"
          fontSize="12.5px"
          fontWeight="600"
          px={4}
          _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
          onClick={() => addSection()}
        >
          Add Section Header
        </Button>
      </HStack>

      {/* Footer Controls */}
      <Flex justify="flex-end" pt={4} borderTop="1px solid rgba(86, 117, 109, 0.12)">
        <HStack spacing={3}>
          <Button
            variant="outline"
            borderColor="rgba(86, 117, 109, 0.25)"
            color="#263A33"
            borderRadius="full"
            h="38px"
            fontSize="12.5px"
            fontWeight="600"
            px={4}
            onClick={() => setViewMode("list")}
          >
            Discard
          </Button>
          <Button
            bg="#56756D"
            color="white"
            px={6}
            borderRadius="full"
            h="38px"
            fontSize="13px"
            fontWeight="600"
            leftIcon={<FiSave />}
            onClick={saveTemplate}
            _hover={{ bg: "#263A33" }}
            _active={{ bg: "#263A33" }}
            boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
          >
            Finalize Blueprint
          </Button>
        </HStack>
      </Flex>
    </VStack>
  );

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* Golden Benchmark Hero Banner */}
      <Box
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "stretch", lg: "center" }}
          gap={4}
        >
          {/* Left: Icon Badge + Badges + Heading + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Circle size="46px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
              <Icon as={FiClipboard} boxSize="22px" />
            </Circle>
            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge
                  bg="rgba(169, 203, 183, 0.2)"
                  color="#263A33"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  CLINICAL PROTOCOLS 🌿
                </Badge>
                <Badge
                  bg="rgba(86, 117, 109, 0.08)"
                  color="#56756D"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                >
                  {templates.length} ACTIVE MODELS
                </Badge>
              </HStack>
              <Heading
                as="h1"
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33"
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Clinical Blueprints
              </Heading>
              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Configure structured session models, intake blueprints, and documentation standards.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Action Button */}
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={3}
            align={{ base: "stretch", md: "center" }}
            w={{ base: "full", lg: "auto" }}
          >
            <HStack
              spacing={{ base: 1.5, sm: 3 }}
              p={1.5}
              px={{ base: 2, sm: 2.5 }}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              w={{ base: "full", md: "auto" }}
              justify="space-between"
            >
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiLayers} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    BLUEPRINTS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {templates.length} Total
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiCheckCircle} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    DATA POINTS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {totalDataPoints} Fields
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(113, 128, 150, 0.12)" color="#718096" flexShrink={0}>
                  <Icon as={FiClock} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    STATUS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    Active
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {viewMode === "list" ? (
              <Menu>
                <MenuButton
                  as={Button}
                  bg="#56756D"
                  color="white"
                  _hover={{ bg: "#263A33" }}
                  _active={{ bg: "#263A33" }}
                  borderRadius="full"
                  px={5}
                  h="38px"
                  fontSize="13px"
                  fontWeight="600"
                  w={{ base: "full", md: "auto" }}
                  boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                >
                  <HStack spacing={2} align="center" justify="center">
                    <Text as="span">Template Actions</Text>
                    <Icon as={FiChevronDown} boxSize="15px" />
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="white"
                  borderRadius="xl"
                  p={1.5}
                  border="1px solid rgba(86, 117, 109, 0.15)"
                  boxShadow="0 12px 28px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
                  zIndex={1400}
                  minW="220px"
                >
                  <MenuItem
                    icon={<Icon as={FiPlusCircle} boxSize="15px" color="#56756D" />}
                    fontWeight="600"
                    fontSize="13px"
                    color="#263A33"
                    borderRadius="lg"
                    px={3}
                    py={2.5}
                    _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                    onClick={() => {
                      setEditingTemplate(null);
                      setForm({
                        name: "",
                        description: "",
                        event_type: "",
                        fields: [{ label: "Primary Assessment", field_type: "section", order: 0 }]
                      });
                      setViewMode("builder");
                    }}
                  >
                    Architect New Model
                  </MenuItem>
                  {templates.length > 0 && (
                    <>
                      <Box h="1px" bg="rgba(86, 117, 109, 0.1)" my={1.5} />
                      <Text px={3} py={1} fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                        CLINICAL STANDARDS
                      </Text>
                      {templates.slice(0, 5).map(t => (
                        <MenuItem
                          key={t.id}
                          icon={<Icon as={FiCopy} boxSize="14px" color="#718096" />}
                          fontSize="12.5px"
                          color="#263A33"
                          borderRadius="lg"
                          px={3}
                          py={2}
                          _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                          onClick={() => {
                            setEditingTemplate(null);
                            setForm({ ...t, name: `Copy of ${t.name}` });
                            setViewMode("builder");
                          }}
                        >
                          Clone {t.name}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </MenuList>
              </Menu>
            ) : (
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                onClick={() => setViewMode("list")}
                w={{ base: "full", md: "auto" }}
                whiteSpace="nowrap"
              >
                Back to Blueprints
              </Button>
            )}
          </Stack>
        </Flex>
      </Box>

      {/* Main Content Area */}
      {loading ? (
        <Center py={20}>
          <VStack spacing={3}>
            <Spinner color="#56756D" size="lg" />
            <Text fontSize="13px" color="#5A6E65">Syncing Clinical Blueprints...</Text>
          </VStack>
        </Center>
      ) : viewMode === "list" ? (
        <Box
          bg="white"
          p={{ base: 4, md: 5 }}
          borderRadius="2xl"
          border="1px solid rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          <HStack justify="space-between" mb={4}>
            <Heading
              fontSize="15px"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              color="#263A33"
              letterSpacing="-0.01em"
            >
              Active Session Models & Protocols
            </Heading>
            <Text fontSize="12px" color="#718096" fontWeight="500">
              {templates.length} Models Configured
            </Text>
          </HStack>

          <VStack align="stretch" spacing={3}>
            {templates.map((t) => {
              const dataPointsCount = t.fields?.length || 0;
              const matchedEventType = eventTypes.find(et => String(et.id) === String(t.event_type));

              return (
                <Flex
                  key={t.id}
                  p={4}
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  align={{ base: "start", sm: "center" }}
                  bg="rgba(250, 248, 245, 0.85)"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.1)"
                  borderRadius="xl"
                  gap={3.5}
                  transition="0.18s ease"
                  _hover={{
                    bg: "white",
                    borderColor: "rgba(86, 117, 109, 0.3)",
                    boxShadow: "0 4px 14px -2px rgba(38, 58, 51, 0.06)",
                    transform: "translateY(-1px)",
                  }}
                >
                  <HStack spacing={3.5} align="center" flex="1" minW={0}>
                    <Circle size="38px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
                      <Icon as={FiFileText} boxSize="17px" />
                    </Circle>
                    <VStack align="start" spacing={0.5} minW={0}>
                      <HStack spacing={2} wrap="wrap">
                        <Text
                          fontWeight="600"
                          color="#263A33"
                          fontSize="14.5px"
                          fontFamily="'Outfit', var(--font-outfit), sans-serif"
                          letterSpacing="-0.01em"
                        >
                          {t.name}
                        </Text>
                        {matchedEventType && (
                          <Badge
                            bg="rgba(86, 117, 109, 0.08)"
                            color="#56756D"
                            fontSize="10px"
                            fontWeight="600"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            {matchedEventType.name}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="12.5px" color="#5A6E65" noOfLines={1}>
                        {t.description || "Structured clinical session documentation standard."}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3} w={{ base: "full", sm: "auto" }} justify={{ base: "space-between", sm: "flex-end" }} flexShrink={0}>
                    <Badge
                      bg="rgba(86, 117, 109, 0.1)"
                      color="#263A33"
                      borderRadius="full"
                      px={3}
                      py="3px"
                      fontSize="11px"
                      fontWeight="700"
                      letterSpacing="0.04em"
                      whiteSpace="nowrap"
                    >
                      {dataPointsCount} DATA POINTS
                    </Badge>

                    <HStack spacing={1}>
                      <IconButton
                        icon={<Icon as={FiCopy} boxSize="14px" />}
                        aria-label="Clone"
                        size="sm"
                        variant="ghost"
                        color="#5A6E65"
                        borderRadius="lg"
                        _hover={{ bg: "rgba(86, 117, 109, 0.1)", color: "#263A33" }}
                        onClick={() => {
                          setEditingTemplate(null);
                          setForm({ ...t, name: `Copy of ${t.name}` });
                          setViewMode("builder");
                        }}
                      />
                      <IconButton
                        icon={<Icon as={FiEdit2} boxSize="14px" />}
                        aria-label="Edit"
                        size="sm"
                        variant="ghost"
                        color="#56756D"
                        borderRadius="lg"
                        _hover={{ bg: "rgba(86, 117, 109, 0.12)", color: "#263A33" }}
                        onClick={() => {
                          setEditingTemplate(t);
                          setForm(t);
                          setViewMode("builder");
                        }}
                      />
                      <IconButton
                        icon={<Icon as={FiTrash2} boxSize="14px" />}
                        aria-label="Delete"
                        size="sm"
                        variant="ghost"
                        color="#E53E3E"
                        borderRadius="lg"
                        _hover={{ bg: "rgba(239, 68, 68, 0.1)", color: "#DC2626" }}
                        onClick={() => deleteTemplate(t.id)}
                      />
                    </HStack>
                  </HStack>
                </Flex>
              );
            })}

            {templates.length === 0 && (
              <Center py={12}>
                <VStack spacing={3}>
                  <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                    <Icon as={FiClipboard} boxSize="22px" />
                  </Circle>
                  <Text fontSize="14px" fontWeight="600" color="#263A33">
                    No Clinical Blueprints Configured
                  </Text>
                  <Text fontSize="12.5px" color="#718096" maxW="360px" textAlign="center">
                    Create structured session models, assessments, and documentation standards for your practice.
                  </Text>
                  <Button
                    leftIcon={<FiPlus />}
                    bg="#263A33"
                    color="white"
                    borderRadius="full"
                    h="36px"
                    fontSize="12.5px"
                    fontWeight="600"
                    px={4}
                    _hover={{ bg: "#56756D" }}
                    onClick={() => {
                      setEditingTemplate(null);
                      setForm({
                        name: "",
                        description: "",
                        event_type: "",
                        fields: [{ label: "Primary Assessment", field_type: "section", order: 0 }]
                      });
                      setViewMode("builder");
                    }}
                  >
                    Architect New Blueprint
                  </Button>
                </VStack>
              </Center>
            )}
          </VStack>
        </Box>
      ) : (
        renderArchitect()
      )}
    </Box>
  );
}
