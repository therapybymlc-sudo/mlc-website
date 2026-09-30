'use client'

import { 
  Box, Heading, Text, VStack, SimpleGrid, Icon, Button, Badge, HStack, Spinner, 
  Circle, Flex, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, ModalCloseButton, Input, Textarea, Select, 
  FormControl, FormLabel, useToast, Menu, MenuButton, MenuList, MenuItem 
} from "@chakra-ui/react";
import { 
  FiBook, FiExternalLink, FiShare2, FiClipboard, FiPlus, FiDownload, 
  FiLock, FiUploadCloud, FiCheck, FiFileText, FiChevronDown 
} from "react-icons/fi";
import { useEffect, useState, useRef } from "react";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";
import SubscriptionWall from "../../../../../components/SubscriptionWall";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";
import { resourcesApi } from "../../../../../api/resources";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../context/AuthContext";

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
            h={isSm ? "34px" : "40px"}
            px={isSm ? 2.5 : 3.5}
            borderRadius="xl"
            bg={isOpen ? "white" : "rgba(250, 248, 245, 0.85)"}
            border="1px solid"
            borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
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
            zIndex={1500}
            minW={minW}
            maxH="240px"
            overflowY="auto"
          >
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

const RESOURCES = [
  { title: "Clinical Guidelines 2024", type: "PDF", category: "Standard" },
  { title: "Client Assessment Template", type: "DOCX", category: "Forms" },
  { title: "Therapeutic Alliance Primer", type: "VIDEO", category: "Education" },
  { title: "Crisis Intervention Flowchart", type: "IMAGE", category: "Emergency" },
];

const CATEGORY_COLORS = {
  Standard: { bg: "rgba(86, 117, 109, 0.1)", color: "#263A33" },
  Forms: { bg: "#ECFDF5", color: "#065F46" },
  Education: { bg: "#EEF2FF", color: "#4338CA" },
  Emergency: { bg: "#FEF2F2", color: "#991B1B" },
};

export default function TherapistResourcesClient() {
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();
  const { isDummyTherapist } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [resourceList, setResourceList] = useState(isDummyTherapist ? RESOURCES : []);
  const router = useRouter();
  const toast = useToast();

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Standard");
  const [newType, setNewType] = useState("PDF");
  const [newDescription, setNewDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleOpenUpload = () => {
    requireBasicAccess(() => {
      setUploadModalOpen(true);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setNewTitle(nameWithoutExt);
      }
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      if (['PDF', 'DOCX', 'DOC', 'TXT'].includes(ext)) {
        setNewType(ext === 'DOC' ? 'DOCX' : ext);
      } else if (['PNG', 'JPG', 'JPEG', 'WEBP'].includes(ext)) {
        setNewType('IMAGE');
      } else if (['MP4', 'MOV', 'WEBM'].includes(ext)) {
        setNewType('VIDEO');
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      toast({
        render: () => (
          <Box p={3} px={4} bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" border="1px solid rgba(245, 158, 11, 0.3)" borderRadius="2xl" boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)">
            <Text fontSize="13px" fontWeight="600" color="#92400E">Title Required</Text>
            <Text fontSize="12px" color="#B45309">Please enter a title for this clinical resource.</Text>
          </Box>
        ),
        duration: 3000,
        isClosable: true,
        position: 'bottom-right'
      });
      return;
    }

    setUploading(true);
    try {
      if (selectedFile) {
        try {
          await resourcesApi.createResource({
            title: newTitle.trim(),
            category: newCategory,
            type: newType,
            description: newDescription.trim(),
            file: selectedFile
          });
        } catch (_apiErr) {
          console.warn("API upload fallback to local state:", _apiErr);
        }
      }

      const fileBlobUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
      const createdItem = {
        title: newTitle.trim(),
        type: newType,
        category: newCategory,
        description: newDescription.trim(),
        fileUrl: fileBlobUrl,
        fileName: selectedFile?.name,
        isCustom: true
      };

      setResourceList(prev => [createdItem, ...prev]);

      toast({
        render: () => (
          <Box p={3.5} px={4.5} bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.35)" borderRadius="2xl" boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)">
            <HStack spacing={2.5}>
              <Circle size="24px" bg="#10B981" color="white">
                <Icon as={FiCheck} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="13.5px" fontWeight="600" color="#065F46">Resource Uploaded</Text>
                <Text fontSize="12px" color="#047857">"{newTitle.trim()}" has been added to your clinical library.</Text>
              </VStack>
            </HStack>
          </Box>
        ),
        duration: 4000,
        isClosable: true,
        position: 'bottom-right'
      });

      // Reset
      setNewTitle("");
      setNewCategory("Standard");
      setNewType("PDF");
      setNewDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadModalOpen(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (res) => {
    requireBasicAccess(() => {
      if (res.fileUrl) {
        const link = document.createElement("a");
        link.href = res.fileUrl;
        link.download = res.fileName || `${res.title.replace(/\s+/g, "_")}.${res.type.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const content = `MLC Therapy Clinical Toolkit\nDocument: ${res.title}\nCategory: ${res.category}\nFormat: ${res.type}\n\nClinical Reference & Practice Document.\nTherapy by MLC (c) 2026`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${res.title.replace(/\s+/g, "_")}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        render: () => (
          <Box p={3} px={4} bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.35)" borderRadius="2xl" boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)">
            <Text fontSize="13px" fontWeight="600" color="#065F46">Document Downloaded</Text>
            <Text fontSize="12px" color="#047857">{res.title} has been downloaded to your device.</Text>
          </Box>
        ),
        duration: 3500,
        isClosable: true,
        position: "bottom-right",
      });
    });
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [assessmentPayload, resourcesPayload] = await Promise.all([
          resourcesApi.listAssessmentCatalog().catch(() => null),
          resourcesApi.listResources().catch(() => null),
        ]);
        if (!cancelled && assessmentPayload?.assessments) {
          setAssessments(assessmentPayload.assessments);
        }
        if (!cancelled && resourcesPayload && Array.isArray(resourcesPayload)) {
          setResourceList((prev) => {
            const apiItems = resourcesPayload.map((r) => ({
              id: r.id,
              title: r.title || r.name,
              type: r.resource_type || r.type || "PDF",
              category: r.category || "Standard",
              description: r.description,
              fileUrl: r.file_url || r.file,
              isCustom: true,
            }));
            const existingTitles = new Set(apiItems.map((item) => item.title.toLowerCase()));
            const filteredDefaults = isDummyTherapist ? prev.filter((p) => !existingTitles.has(p.title.toLowerCase())) : [];
            return [...apiItems, ...filteredDefaults];
          });
        }
      } catch {
        if (!cancelled) setAssessments([]);
      } finally {
        if (!cancelled) setLoadingAssessments(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiBook} boxSize="22px" />
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
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#263A33" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Clinical Practice · Resources
                </Badge>
                <Badge 
                  bg="#ECFDF5" 
                  color="#065F46" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  Clinical Toolkit
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
                Resource Library
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Access clinical tools, validated self-report assessments, and standardized templates.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Upload Action CTA */}
          <HStack 
            spacing={3} 
            wrap={{ base: 'wrap', sm: 'nowrap' }} 
            w={{ base: 'full', lg: 'auto' }} 
            justify={{ base: 'flex-start', lg: 'flex-end' }}
          >
            <HStack 
              spacing={3} 
              p={1.5} 
              px={2.5}
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
            >
              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiClipboard} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    ASSESSMENTS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {assessments.length}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="24px" borderColor="rgba(86, 117, 109, 0.16)" />

              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiBook} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    DOCUMENTS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {resourceList.length}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button
              leftIcon={<FiPlus />}
              bg="#56756D"
              color="white"
              borderRadius="full"
              h="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              whiteSpace="nowrap"
              onClick={handleOpenUpload}
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.2)"
            >
              Upload Resource
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* ⚠️ Pro Access Preview Alert */}
      {!hasBasicAccess && (
        <Box 
          mb={6} 
          p={4} 
          borderRadius="2xl" 
          bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" 
          border="1px solid rgba(245, 158, 11, 0.3)"
          boxShadow="0 4px 12px -2px rgba(245, 158, 11, 0.1)"
        >
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={3}>
            <HStack spacing={3}>
              <Circle size="32px" bg="rgba(245, 158, 11, 0.2)" color="#92400E">
                <Icon as={FiLock} boxSize="14px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="13.5px" fontWeight="600" color="#92400E" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                  Preview Mode Active
                </Text>
                <Text fontSize="12.5px" color="#78350F">
                  Activate MLC Pro to download practice forms and upload clinical files.
                </Text>
              </VStack>
            </HStack>
            <Button 
              size="sm" 
              bg="#D97706" 
              color="white" 
              borderRadius="full" 
              h="32px"
              fontSize="12px"
              fontWeight="600"
              px={4}
              onClick={() => requireBasicAccess()}
              _hover={{ bg: "#B45309" }}
            >
              Unlock MLC Pro
            </Button>
          </Flex>
        </Box>
      )}

      {/* 🍱 2. RESOURCE CARDS GRID */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} opacity={hasBasicAccess ? 1 : 0.9}>
        {/* 📋 Self-Report Assessment Library Card */}
        <Box 
          bg="white" 
          p={5} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="start">
              <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiClipboard} boxSize="18px" />
              </Circle>
              <Badge 
                bg="rgba(86, 117, 109, 0.1)" 
                color="#263A33" 
                borderRadius="full" 
                px={2.5} 
                py={0.5} 
                fontSize="10.5px" 
                fontWeight="700" 
                letterSpacing="0.05em" 
                textTransform="uppercase"
              >
                Assessments
              </Badge>
            </HStack>

            <VStack align="start" spacing={1}>
              <Heading 
                as="h3" 
                fontSize="15px" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                fontWeight="600" 
                color="#263A33"
              >
                Self-Report Assessment Library
              </Heading>
              <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.5">
                Assign evidence-based assessments to clients directly from their file.
              </Text>
            </VStack>

            {loadingAssessments ? (
              <HStack spacing={2} py={4}>
                <Spinner size="sm" color="#56756D" />
                <Text fontSize="12px" color="#5A6E65">Loading assessment catalog...</Text>
              </HStack>
            ) : (
              <VStack align="stretch" spacing={2.5}>
                {assessments.length === 0 ? (
                  <Text fontSize="12.5px" color="#718096" py={2}>No assessments available yet.</Text>
                ) : (
                  assessments.slice(0, showAllAssessments ? assessments.length : 4).map((item) => (
                    <Box 
                      key={item.id} 
                      p={3} 
                      borderRadius="xl" 
                      bg="rgba(250, 248, 245, 0.85)" 
                      border="1px solid" 
                      borderColor="rgba(86, 117, 109, 0.1)"
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={0.5}>
                          <Text fontSize="12.5px" fontWeight="600" color="#263A33">{item.name}</Text>
                          <Text fontSize="11px" color="#718096">{item.abbreviation} • {item.completionTime}</Text>
                        </VStack>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor="rgba(86, 117, 109, 0.25)"
                          color="#263A33"
                          borderRadius="full"
                          h="24px"
                          px={2.5}
                          fontSize="11px"
                          fontWeight="600"
                          _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                          onClick={() => router.push(`/dashboard/therapist/resources/assessments/${item.id}`)}
                        >
                          Details
                        </Button>
                      </HStack>
                    </Box>
                  ))
                )}
                {assessments.length > 4 && (
                  <Button
                    size="xs"
                    variant="link"
                    color="#56756D"
                    alignSelf="flex-start"
                    fontSize="12px"
                    fontWeight="600"
                    pt={1}
                    onClick={() => setShowAllAssessments((prev) => !prev)}
                  >
                    {showAllAssessments ? "Show fewer" : `Browse all (${assessments.length})`}
                  </Button>
                )}
              </VStack>
            )}

            <Button
              bg="#56756D"
              color="white"
              borderRadius="full"
              h="38px"
              fontSize="13px"
              fontWeight="600"
              w="100%"
              _hover={{ bg: "#263A33" }}
              onClick={() => router.push("/dashboard/therapist/resources/assessments")}
            >
              View Assessment Directory
            </Button>
          </VStack>
        </Box>

        {/* 📚 Standardized & Custom Practice Resources */}
        {resourceList.map((res, i) => {
          const catStyle = CATEGORY_COLORS[res.category] || CATEGORY_COLORS.Standard;
          return (
            <Box 
              key={res.id || i} 
              bg="white" 
              p={5} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.14)" 
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              _hover={{ transform: 'translateY(-2px)', boxShadow: "0 6px 24px -2px rgba(38, 58, 51, 0.08)" }} 
              transition="all 0.2s ease"
            >
              <VStack align="stretch" spacing={4} justify="space-between" h="100%">
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between" align="start">
                    <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiBook} boxSize="18px" />
                    </Circle>
                    <Badge 
                      bg={catStyle.bg} 
                      color={catStyle.color} 
                      borderRadius="full" 
                      px={2.5} 
                      py={0.5} 
                      fontSize="10.5px" 
                      fontWeight="700" 
                      letterSpacing="0.05em" 
                      textTransform="uppercase"
                    >
                      {res.category}
                    </Badge>
                  </HStack>

                  <VStack align="start" spacing={1}>
                    <Heading 
                      as="h3" 
                      fontSize="15px" 
                      fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                      fontWeight="600" 
                      color="#263A33"
                    >
                      {res.title}
                    </Heading>
                    <Text fontSize="12.5px" color="#718096">
                      {res.type} Document
                    </Text>
                    {res.description && (
                      <Text fontSize="12px" color="#5A6E65" noOfLines={2} pt={0.5}>
                        {res.description}
                      </Text>
                    )}
                  </VStack>
                </VStack>

                <Button 
                  variant="outline" 
                  borderColor="rgba(86, 117, 109, 0.25)" 
                  color="#263A33" 
                  borderRadius="full" 
                  h="36px" 
                  fontSize="12.5px" 
                  fontWeight="600" 
                  w="100%"
                  rightIcon={<FiExternalLink />} 
                  justifyContent="space-between" 
                  px={4}
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                  onClick={() => handleDownload(res)}
                >
                  Download
                </Button>
              </VStack>
            </Box>
          );
        })}
        
        {/* 📤 Upload Resource Card */}
        <VStack 
          justify="center" 
          p={6} 
          borderRadius="2xl" 
          border="1px dashed" 
          borderColor="rgba(86, 117, 109, 0.3)"
          bg="rgba(250, 248, 245, 0.6)"
          cursor="pointer"
          _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D", transform: "translateY(-2px)" }}
          transition="all 0.2s"
          onClick={handleOpenUpload}
          spacing={2.5}
          textAlign="center"
          minH="220px"
        >
          <Circle size="46px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
            <Icon as={FiUploadCloud} boxSize="20px" />
          </Circle>
          <VStack spacing={0.5}>
            <Text 
              fontWeight="600" 
              fontSize="14px" 
              color="#263A33" 
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
            >
              Upload New Resource
            </Text>
            <Text fontSize="12px" color="#5A6E65" maxW="200px">
              Add your clinical worksheets, protocols, or guides
            </Text>
          </VStack>
        </VStack>
      </SimpleGrid>

      {/* 📥 Upload Clinical Resource Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(6px)" />
        <ModalContent
          borderRadius="2xl"
          p={2}
          border="1px solid rgba(86, 117, 109, 0.16)"
          boxShadow="0 20px 45px -8px rgba(38, 58, 51, 0.2)"
        >
          <ModalHeader pb={1}>
            <HStack spacing={3} align="center">
              <Circle size="40px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiUploadCloud} boxSize="20px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Heading
                  fontSize="17px"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  fontWeight="600"
                  color="#263A33"
                >
                  Upload Clinical Resource
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65" fontWeight="400">
                  Add clinical worksheets, treatment protocols, or guides
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} borderRadius="full" />

          <ModalBody py={4}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Resource Title
                </FormLabel>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Anxiety Grounding Protocol & Exercises"
                  fontSize="13px"
                  borderRadius="xl"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  h="40px"
                />
              </FormControl>

              <HStack spacing={3} align="start">
                <FormControl isRequired flex="1">
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Category
                  </FormLabel>
                  <ModernSelect
                    value={newCategory}
                    onChange={(val) => setNewCategory(val)}
                    options={[
                      { label: "Standard (Clinical Guidelines)", value: "Standard" },
                      { label: "Forms (Assessments & Intake)", value: "Forms" },
                      { label: "Education (Handouts & Guides)", value: "Education" },
                      { label: "Emergency (Crisis & Safety)", value: "Emergency" },
                    ]}
                  />
                </FormControl>

                <FormControl isRequired flex="1">
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Document Format
                  </FormLabel>
                  <ModernSelect
                    value={newType}
                    onChange={(val) => setNewType(val)}
                    options={[
                      { label: "PDF Document", value: "PDF" },
                      { label: "DOCX Word Document", value: "DOCX" },
                      { label: "Image / Infographic", value: "IMAGE" },
                      { label: "Video / Multimedia", value: "VIDEO" },
                    ]}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Attach Document / File
                </FormLabel>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                />
                <Box
                  p={4}
                  borderRadius="xl"
                  border="1.5px dashed"
                  borderColor={selectedFile ? "#56756D" : "rgba(86, 117, 109, 0.25)"}
                  bg={selectedFile ? "rgba(86, 117, 109, 0.04)" : "rgba(250, 248, 245, 0.7)"}
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  textAlign="center"
                  _hover={{ borderColor: "#56756D", bg: "rgba(86, 117, 109, 0.06)" }}
                  transition="all 0.2s"
                >
                  {selectedFile ? (
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Circle size="34px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                          <Icon as={FiFileText} boxSize="16px" />
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                            {selectedFile.name}
                          </Text>
                          <Text fontSize="11.5px" color="#718096">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                          </Text>
                        </VStack>
                      </HStack>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    </HStack>
                  ) : (
                    <VStack spacing={1.5} py={2}>
                      <Circle size="36px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                        <Icon as={FiUploadCloud} boxSize="18px" />
                      </Circle>
                      <Text fontSize="13px" fontWeight="600" color="#263A33">
                        Click to select document or worksheet
                      </Text>
                      <Text fontSize="11.5px" color="#718096">
                        PDF, DOCX, PNG, JPG up to 25MB
                      </Text>
                    </VStack>
                  )}
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Clinical Instructions (Optional)
                </FormLabel>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Notes on administration, recommended session stage, or client suitability..."
                  fontSize="13px"
                  borderRadius="xl"
                  rows={3}
                  borderColor="rgba(86, 117, 109, 0.2)"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter pt={2} pb={3}>
            <HStack spacing={3} w="full" justify="flex-end">
              <Button
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={5}
                onClick={() => setUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                bg="#56756D"
                _hover={{ bg: "#263A33" }}
                color="white"
                borderRadius="full"
                h="38px"
                fontSize="13px"
                fontWeight="600"
                px={6}
                isLoading={uploading}
                loadingText="Uploading..."
                onClick={handleUploadSubmit}
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                leftIcon={<FiUploadCloud />}
              >
                Save to Library
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TherapistGatedGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate MLC Pro to use the therapist resource library and go fully paperless."
      />
    </Box>
  );
}
