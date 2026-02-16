// src/pages/dashboards/TherapistDashboard.jsx
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Divider,
  Icon,
  Input,
  useToast,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CalendarIcon,
  EditIcon,
  AttachmentIcon,
  ViewIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import { useAuth } from "../../context/AuthContext";
import Clients from "./Clients";
import ClientNotes from "./ClientNotes";
import ClientFiles from "./ClientFiles";
import Schedule from "./Schedule";
import NoteTemplates from "./NoteTemplates"; // ✅ added
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

export default function TherapistDashboard() {
  const { user, logout, isAdmin } = useAuth(); // ✅ now using isAdmin from AuthContext
  const toast = useToast();
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState("overview");
  const [preselectClientId, setPreselectClientId] = useState("");
  const [sessionLinks, setSessionLinks] = useState([]);
  const [newSessionLink, setNewSessionLink] = useState({ name: "", url: "", is_default: false });
  const location = useLocation();

  const renderContent = () => {
    switch (activeTab) {
      case "clients":
        return <Clients />;
      case "notes":
        return <ClientNotes />;
      case "files":
        return <ClientFiles />;
      case "schedule":
        return (
          <Schedule
            preselectClientId={preselectClientId}
            onPreselectConsumed={() => setPreselectClientId("")}
          />
        );
      case "noteTemplates": // ✅ new tab for Note Templates
        return <NoteTemplates />;
      default:
        return (
          <VStack align="start" spacing={4}>
            <Heading fontFamily="Playfair Display" color="#2E2E2E">
              Welcome, {user?.firstName || user?.username}
            </Heading>
            <Text color="gray.600" fontFamily="Lato" maxW="3xl">
              Manage your clients, write notes, track appointments, and organize files —
              all in one seamless space.
            </Text>
            <Box w="100%" bg="white" p={4} borderRadius="lg" border="1px solid #E2E8F0">
              <Heading size="sm" mb={3}>
                My current session links
              </Heading>
              <VStack align="stretch" spacing={3}>
                {sessionLinks.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No links saved yet.
                  </Text>
                ) : (
                  sessionLinks.map((link) => (
                    <Box key={link.id} p={3} border="1px solid #E2E8F0" borderRadius="md">
                      <HStack spacing={3}>
                        <Input
                          placeholder="Link name"
                          value={link.name || ""}
                          onChange={(e) =>
                            setSessionLinks((prev) =>
                              prev.map((l) => (l.id === link.id ? { ...l, name: e.target.value } : l))
                            )
                          }
                        />
                        <Input
                          placeholder="https://doxy.me/yourlink"
                          value={link.url || ""}
                          onChange={(e) =>
                            setSessionLinks((prev) =>
                              prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l))
                            )
                          }
                        />
                      </HStack>
                      <HStack mt={2} spacing={3}>
                        <Button
                          size="xs"
                          variant={link.is_default ? "solid" : "outline"}
                          colorScheme="teal"
                          onClick={() =>
                            setSessionLinks((prev) =>
                              prev.map((l) =>
                                l.id === link.id ? { ...l, is_default: true } : { ...l, is_default: false }
                              )
                            )
                          }
                        >
                          {link.is_default ? "Default" : "Make default"}
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={async () => {
                            await apiPut(`session-links/${link.id}/`, {
                              name: link.name,
                              url: link.url,
                              is_default: link.is_default,
                            });
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="red.500"
                          onClick={async () => {
                            await apiDelete(`session-links/${link.id}/`);
                            setSessionLinks((prev) => prev.filter((l) => l.id !== link.id));
                          }}
                        >
                          Remove
                        </Button>
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
              <Divider my={4} />
              <HStack spacing={3}>
                <Input
                  placeholder="Link name (e.g., Doxy room)"
                  value={newSessionLink.name}
                  onChange={(e) => setNewSessionLink((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="https://doxy.me/yourlink"
                  value={newSessionLink.url}
                  onChange={(e) => setNewSessionLink((p) => ({ ...p, url: e.target.value }))}
                />
                <Button
                  onClick={async () => {
                    if (!newSessionLink.url) {
                      toast({ status: "warning", title: "Please enter a session link URL" });
                      return;
                    }
                    try {
                      const normalizedUrl = /^https?:\/\//i.test(newSessionLink.url)
                        ? newSessionLink.url
                        : `https://${newSessionLink.url}`;
                      const created = await apiPost("session-links/", {
                        name: newSessionLink.name?.trim() || "Session link",
                        url: normalizedUrl,
                        is_default: !!newSessionLink.is_default,
                      });
                      setSessionLinks((prev) => [...prev, created]);
                      setNewSessionLink({ name: "", url: "", is_default: false });
                      toast({ status: "success", title: "Session link added" });
                    } catch (err) {
                      console.error(err);
                      const detail = err?.response?.data
                        ? JSON.stringify(err.response.data)
                        : "Couldn't add session link";
                      toast({ status: "error", title: "Couldn't add session link", description: detail });
                    }
                  }}
                >
                  Add
                </Button>
              </HStack>
            </Box>
          </VStack>
        );
    }
  };

  useEffect(() => {
    async function testProtected() {
      try {
        const res = await apiGet("../protected/");
        console.log("✅ Protected response:", res);
      } catch (err) {
        console.error("❌ Protected error:", err);
      }
    }
    testProtected();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("session-links/");
        const data = res.results ?? res;
        setSessionLinks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Session links load failed", err);
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const clientId = params.get("newAppointmentClientId");
    if (tab) setActiveTab(tab);
    if (clientId) {
      setPreselectClientId(String(clientId));
    }
  }, [location.search]);

  const sidebarContent = (
    <VStack align="start" spacing={5}>
      <Heading size="sm" color="#2E2E2E" mb={3} textTransform="uppercase">
        Dashboard
      </Heading>

      <SidebarButton
        label="Overview"
        active={activeTab === "overview"}
        onClick={() => {
          setActiveTab("overview");
          onSidebarClose();
        }}
        icon={<ViewIcon />}
      />
      <SidebarButton
        label="Clients"
        active={activeTab === "clients"}
        onClick={() => {
          setActiveTab("clients");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
      />
      <SidebarButton
        label="Notes"
        active={activeTab === "notes"}
        onClick={() => {
          setActiveTab("notes");
          onSidebarClose();
        }}
        icon={<EditIcon />}
      />
      <SidebarButton
        label="Files"
        active={activeTab === "files"}
        onClick={() => {
          setActiveTab("files");
          onSidebarClose();
        }}
        icon={<AttachmentIcon />}
      />
      <SidebarButton
        label="Schedule"
        active={activeTab === "schedule"}
        onClick={() => {
          setActiveTab("schedule");
          onSidebarClose();
        }}
        icon={<CalendarIcon />}
      />

      {/* ✅ Admin-only Note Templates tab */}
      {isAdmin && (
        <SidebarButton
          label="Note Templates"
          active={activeTab === "noteTemplates"}
          onClick={() => {
            setActiveTab("noteTemplates");
            onSidebarClose();
          }}
          icon={<EditIcon />}
        />
      )}

      <Divider my={4} />

      <Button
        bg="#A9CBB7"
        color="black"
        borderRadius="full"
        fontWeight="medium"
        _hover={{ bg: "#C9A960", color: "white" }}
        onClick={logout}
        w="full"
      >
        Logout
      </Button>
    </VStack>
  );

  return (
    <Flex minH="100vh" overflow="hidden" direction={{ base: "column", md: "row" }}>
      {/* Mobile Header */}
      <Flex
        display={{ base: "flex", md: "none" }}
        align="center"
        justify="space-between"
        px={4}
        py={3}
        bg="white"
        borderBottom="1px solid #E2E8F0"
      >
        <IconButton
          icon={<HamburgerIcon />}
          aria-label="Open menu"
          variant="ghost"
          onClick={onSidebarOpen}
        />
        <HStack spacing={2}>
          <Link to="/">
            <Image src="/logo_tra.png" alt="MLC Logo" boxSize="28px" />
          </Link>
          <Text fontWeight="semibold">Therapist Portal</Text>
        </HStack>
        <Box w="40px" />
      </Flex>

      {/* Desktop Sidebar */}
      <Box
        w="240px"
        bg="linear-gradient(180deg, rgba(169,203,183,0.25), rgba(169,203,183,0.1))"
        p={6}
        borderRight="1px solid #E2E8F0"
        display={{ base: "none", md: "block" }}
      >
        <HStack mb={6} spacing={3}>
          <Link to="/">
            <Image src="/logo_tra.png" alt="MLC Logo" boxSize="36px" />
          </Link>
          <Text fontWeight="semibold" fontSize="sm">
            MLC Health
          </Text>
        </HStack>
        {sidebarContent}
      </Box>

      {/* Mobile Sidebar Drawer */}
      <Drawer placement="left" onClose={onSidebarClose} isOpen={isSidebarOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Dashboard</DrawerHeader>
          <DrawerBody>{sidebarContent}</DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex="1" p={{ base: 4, md: 10 }} overflowY="auto" bg="#F9F9F9">
        {renderContent()}
      </Box>
    </Flex>
  );
}

function SidebarButton({ label, active, onClick, icon }) {
  return (
    <Button
      w="full"
      justifyContent="flex-start"
      leftIcon={<Icon as={() => icon} />}
      variant={active ? "solid" : "ghost"}
      bg={active ? "#A9CBB7" : "transparent"}
      color={active ? "#2E2E2E" : "#555"}
      _hover={{ bg: "#C9A960", color: "white" }}
      size="sm"
      fontFamily="Lato"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
