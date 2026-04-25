'use client'

import React, { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Icon, Avatar, Badge, Input, InputGroup, InputLeftElement,
  useToast, Spinner, Center, Flex, Tag, Wrap, WrapItem,
  IconButton, Tooltip, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Textarea, Select, Checkbox
} from "@chakra-ui/react";
import { 
  FiSearch, FiMessageSquare, FiMapPin, FiBriefcase, 
  FiAward, FiExternalLink, FiShare2, FiUserPlus, FiCheckCircle
} from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../../api.js";
import NextLink from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

// ===========================
// 🔹 Referral Modal
// ===========================
const ReferralModal = ({ isOpen, onClose, peer, myClients }) => {
    const [formData, setFormData] = useState({
        client_name: "",
        client_email: "",
        client_phone: "",
        reason: "",
        is_internal_client: false,
        internal_client: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async () => {
        if (!formData.client_name || !formData.reason) {
            toast({ title: "Please fill required fields", status: "warning" });
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                receiving_therapist: peer.id
            };
            await apiPost("referrals/", payload);
            toast({ title: "Referral sent successfully", status: "success" });
            onClose();
        } catch (err) {
            toast({ title: "Failed to send referral", status: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClientSelect = (clientId) => {
        const client = myClients.find(c => String(c.id) === String(clientId));
        if (client) {
            setFormData({
                ...formData,
                client_name: client.name,
                client_email: client.email,
                internal_client: client.id,
                is_internal_client: true
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent borderRadius="3xl" p={4}>
                <ModalHeader>
                    <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">Send Referral</Heading>
                    <Text fontSize="sm" color="gray.500" fontWeight="400">Introduce a client to <b>{peer.name}</b></Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={6}>
                        <FormControl>
                            <FormLabel fontWeight="700" fontSize="sm">Link Existing Client (Optional)</FormLabel>
                            <Select 
                                placeholder="Select a client from your list" 
                                borderRadius="xl"
                                onChange={(e) => handleClientSelect(e.target.value)}
                            >
                                {myClients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider label="OR ENTER DETAILS" />

                        <FormControl isRequired>
                            <FormLabel fontWeight="700" fontSize="sm">Client Name</FormLabel>
                            <Input 
                                placeholder="Full Name" 
                                borderRadius="xl"
                                value={formData.client_name}
                                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                            />
                        </FormControl>

                        <HStack w="full">
                            <FormControl>
                                <FormLabel fontWeight="700" fontSize="sm">Email</FormLabel>
                                <Input 
                                    placeholder="email@example.com" 
                                    borderRadius="xl"
                                    value={formData.client_email}
                                    onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontWeight="700" fontSize="sm">Phone</FormLabel>
                                <Input 
                                    placeholder="+1..." 
                                    borderRadius="xl"
                                    value={formData.client_phone}
                                    onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                                />
                            </FormControl>
                        </HStack>

                        <FormControl isRequired>
                            <FormLabel fontWeight="700" fontSize="sm">Clinical Reason / Context</FormLabel>
                            <Textarea 
                                placeholder="Why are you referring this client? (e.g., specialized trauma needs)" 
                                borderRadius="xl"
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">Cancel</Button>
                    <Button 
                        bg="teal.800" 
                        color="white" 
                        borderRadius="full" 
                        px={10}
                        isLoading={isSubmitting}
                        onClick={handleSubmit}
                        _hover={{ bg: "teal.900" }}
                        leftIcon={<FiCheckCircle />}
                    >
                        Confirm Referral
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const Divider = ({ label }) => (
    <HStack w="full">
        <Box flex={1} h="1px" bg="gray.100" />
        <Text fontSize="2xs" fontWeight="800" color="gray.300" letterSpacing="widest">{label}</Text>
        <Box flex={1} h="1px" bg="gray.100" />
    </HStack>
);

// ===========================
// 🔹 Peer Card
// ===========================
const PeerCard = ({ peer, onRefer }) => (
  <MotionBox
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    bg="white"
    p={6}
    borderRadius="3xl"
    border="1px solid"
    borderColor="gray.100"
    shadow="sm"
    _hover={{ shadow: "md", borderColor: "teal.100" }}
    transition="all 0.2s"
  >
    <VStack align="center" spacing={4} textAlign="center">
      <Avatar size="xl" name={peer.name} src={peer.profile_image_url} border="4px solid" borderColor="teal.50" />
      <VStack spacing={1}>
        <Heading size="md" color="teal.900">{peer.name}</Heading>
        <Text fontSize="sm" color="gray.500" fontWeight="600">{peer.designation || "Clinical Specialist"}</Text>
      </VStack>

      <Wrap justify="center" spacing={2}>
        {(peer.specialization || "").split(",").slice(0, 3).map(spec => (
          <WrapItem key={spec}>
            <Tag size="sm" variant="subtle" colorScheme="teal" borderRadius="full">
              {spec.trim()}
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      <VStack spacing={2} w="full" pt={2}>
        <HStack spacing={2} color="gray.400" fontSize="xs">
          <Icon as={FiMapPin} />
          <Text>{peer.location || "Remote"}</Text>
        </HStack>
        <HStack spacing={2} color="gray.400" fontSize="xs">
          <Icon as={FiBriefcase} />
          <Text>{peer.years_experience}+ Years Experience</Text>
        </HStack>
      </VStack>

      <VStack w="full" spacing={2} pt={4}>
        <HStack w="full" spacing={2}>
            <Button 
                flex={1} 
                size="sm" 
                variant="solid" 
                bg="teal.50"
                color="teal.700" 
                borderRadius="full"
                leftIcon={<FiUserPlus />}
                _hover={{ bg: "teal.100" }}
                onClick={() => onRefer(peer)}
            >
                Refer Client
            </Button>
            <IconButton 
                size="sm" 
                variant="outline" 
                colorScheme="teal" 
                borderRadius="full"
                icon={<FiMessageSquare />}
                aria-label="Message"
            />
        </HStack>
        <Button 
            as={NextLink}
            href={`/therapists/directory/${peer.id}`}
            target="_blank"
            w="full"
            size="xs" 
            variant="ghost" 
            color="gray.400"
            rightIcon={<FiExternalLink />}
        >
            View Professional Profile
        </Button>
      </VStack>
    </VStack>
  </MotionBox>
);

// ===========================
// 🔹 Main Page
// ===========================
export default function PeerDirectoryClient() {
  const [peers, setPeers] = useState([]);
  const [myClients, setMyClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPeer, setSelectedPeer] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [peersRes, clientsRes] = await Promise.all([
          apiGet("therapists/"),
          apiGet("clients/")
        ]);
        setPeers(peersRes.results || peersRes || []);
        setMyClients(clientsRes.results || clientsRes || []);
      } catch (err) {
        toast({ title: "Failed to load directory", status: "error" });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleReferClick = (peer) => {
    setSelectedPeer(peer);
    onOpen();
  };

  const filteredPeers = peers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.specialization && p.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box maxW="7xl" mx="auto">
      <VStack align="stretch" spacing={8}>
        <Flex justify="space-between" align="end" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <HStack color="teal.600">
               <Icon as={FiShare2} />
               <Text fontWeight="800" fontSize="xs" letterSpacing="widest">INTERNAL NETWORKING</Text>
            </HStack>
            <Heading size="xl" color="teal.900" fontFamily="'Playfair Display', serif">Peer Directory</Heading>
            <Text color="gray.500">Connect with fellow clinicians for referrals, mentorship, and clinical collaboration.</Text>
          </VStack>
        </Flex>

        <InputGroup maxW="400px" bg="white" borderRadius="full" shadow="sm">
            <InputLeftElement><FiSearch color="gray.400" /></InputLeftElement>
            <Input 
                placeholder="Search by name or specialization..." 
                borderRadius="full" 
                border="1px solid"
                borderColor="gray.100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </InputGroup>

        {loading ? (
          <Center py={20}><Spinner color="teal.500" size="xl" /></Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {filteredPeers.map(peer => (
              <PeerCard key={peer.id} peer={peer} onRefer={handleReferClick} />
            ))}
          </SimpleGrid>
        )}

        {!loading && filteredPeers.length === 0 && (
            <Center py={20} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
                <Text color="gray.400">No peers found matching your search.</Text>
            </Center>
        )}
      </VStack>

      {selectedPeer && (
        <ReferralModal 
            isOpen={isOpen} 
            onClose={onClose} 
            peer={selectedPeer} 
            myClients={myClients} 
        />
      )}
    </Box>
  );
}
