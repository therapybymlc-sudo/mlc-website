import { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Text,
  VStack,
  Box,
  Heading,
  SimpleGrid,
  useToast,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiCheckCircle, FiLock, FiTrash2, FiEdit3 } from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { schedulingApi } from "../../../api/scheduling";
import BusinessHoursForm from "../../../components/scheduling/BusinessHoursForm";
import "../../../styles/CalendarStyles.css";

const toLocalInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toISOFromLocal = (value) => {
  if (!value) return "";
  return new Date(value).toISOString();
};

export default function TherapistAvailability() {
  const toast = useToast();
  const calendarRef = useRef(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSlot, setEditingSlot] = useState(null);
  const [formState, setFormState] = useState({
    start_time: "",
    end_time: "",
    visible_to_clients: true,
  });
  const [profile, setProfile] = useState(null);

  const loadSlotsAndProfile = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import("../../../api");
      const profs = await apiGet("therapists/");
      if (profs && profs.length > 0) {
        setProfile(profs[0]);
      }
      const data = await schedulingApi.listAvailabilitySlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ status: "error", title: "Couldn't load availability data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlotsAndProfile();
  }, []);

  const businessHoursPreview = useMemo(() => {
    if (!profile?.business_hours) return undefined;
    const bh = [];
    Object.keys(profile.business_hours).forEach(day => {
      const dayOfWeek = parseInt(day, 10);
      profile.business_hours[day].forEach(block => {
        bh.push({
          daysOfWeek: [dayOfWeek],
          startTime: block.startTime,
          endTime: block.endTime
        });
      });
    });
    return bh;
  }, [profile]);

  const calendarEvents = useMemo(() => {
    return slots.map(slot => ({
      id: slot.id,
      title: slot.status_label || slot.status,
      start: slot.start_time,
      end: slot.end_time,
      backgroundColor: slot.status === 'blocked' ? '#CBD5E0' : '#A9CBB7',
      borderColor: slot.status === 'blocked' ? '#CBD5E0' : '#A9CBB7',
      extendedProps: { ...slot }
    }));
  }, [slots]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        start_time: toISOFromLocal(formState.start_time),
        end_time: toISOFromLocal(formState.end_time),
        visible_to_clients: formState.visible_to_clients,
      };

      if (editingSlot) {
        await schedulingApi.updateAvailabilitySlot(editingSlot.id, payload);
        toast({ status: "success", title: "Slot updated" });
      } else {
        await schedulingApi.createAvailabilitySlot(payload);
        toast({ status: "success", title: "Manual slot created" });
      }
      await loadSlotsAndProfile();
      resetForm();
    } catch (err) {
      toast({ status: "error", title: "Failed to save slot" });
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setFormState({ start_time: "", end_time: "", visible_to_clients: true });
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormState({
      start_time: toLocalInputValue(slot.start_time),
      end_time: toLocalInputValue(slot.end_time),
      visible_to_clients: slot.visible_to_clients,
    });
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Delete this availability slot?")) return;
    try {
      await schedulingApi.deleteAvailabilitySlot(slotId);
      await loadSlotsAndProfile();
      toast({ status: "success", title: "Slot deleted" });
    } catch (err) {
      toast({ status: "error", title: "Delete failed" });
    }
  };

  const handleToggleBlock = async (slot) => {
    try {
      if (slot.status === "blocked") {
        await schedulingApi.unblockAvailabilitySlot(slot.id);
      } else {
        await schedulingApi.blockAvailabilitySlot(slot.id);
      }
      await loadSlotsAndProfile();
    } catch (err) {
      toast({ status: "error", title: "Toggle block failed" });
    }
  };

  return (
    <VStack align="stretch" spacing={10} w="100%">
      <Box>
        <Heading size="lg" color="mlc.greenDark" mb={2} fontFamily="'Playfair Display', serif">
          Clinical Availability
        </Heading>
        <Text color="gray.500">Manage your business hours and live calendar slots.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
        {/* Left: Configuration */}
        <VStack align="stretch" spacing={8}>
          <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack mb={6}>
              <Icon as={FiClock} color="mlc.green" />
              <Heading size="md" color="mlc.black">Standard Weekly Hours</Heading>
            </HStack>
            <BusinessHoursForm profile={profile} onSlotsGenerated={loadSlotsAndProfile} />
          </Box>

          <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
             <HStack mb={6}>
              <Icon as={FiEdit3} color="mlc.gold" />
              <Heading size="md">Manual Overrides</Heading>
            </HStack>
            <form onSubmit={handleSubmit}>
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={2} spacing={4}>
                   <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="700">Start Time</FormLabel>
                    <Input
                      bg="gray.50"
                      border="none"
                      borderRadius="xl"
                      type="datetime-local"
                      value={formState.start_time}
                      onChange={(e) => setFormState(p => ({...p, start_time: e.target.value}))}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="700">End Time</FormLabel>
                    <Input
                      bg="gray.50"
                      border="none"
                      borderRadius="xl"
                      type="datetime-local"
                      value={formState.end_time}
                      onChange={(e) => setFormState(p => ({...p, end_time: e.target.value}))}
                    />
                  </FormControl>
                </SimpleGrid>
                <Checkbox
                  isChecked={formState.visible_to_clients}
                  onChange={(e) => setFormState(p => ({...p, visible_to_clients: e.target.checked}))}
                  colorScheme="teal"
                >
                  Visible to clients
                </Checkbox>
                <HStack pt={2}>
                  <Button
                    type="submit"
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    px={8}
                    _hover={{ bg: '#C9A960' }}
                  >
                    {editingSlot ? "Update Slot" : "Add Slot"}
                  </Button>
                  {editingSlot && <Button variant="ghost" onClick={resetForm}>Cancel</Button>}
                </HStack>
              </VStack>
            </form>
          </Box>
        </VStack>

        {/* Right: Live Preview */}
        <VStack align="stretch" spacing={6}>
           <Box bg="white" p={1} borderRadius="3xl" shadow="xl" overflow="hidden" border="1px solid" borderColor="gray.100" h="640px">
              <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <HStack justify="space-between">
                  <Heading size="xs" textTransform="uppercase" letterSpacing="0.1em" color="gray.500">Live Preview</Heading>
                  <Tag bg="green.100" color="green.700" size="sm" borderRadius="full">Sync Active</Tag>
                </HStack>
              </Box>
              <Box className="calendar-wrapper" p={2} h="calc(100% - 50px)">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
                  height="100%"
                  allDaySlot={false}
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  businessHours={businessHoursPreview}
                  events={calendarEvents}
                  nowIndicator={true}
                  slotLabelFormat={{
                    hour: 'numeric',
                    meridiem: 'short'
                  }}
                  dayHeaderFormat={{ weekday: 'short' }}
                />
              </Box>
           </Box>
        </VStack>
      </SimpleGrid>

      {/* List View for fine management */}
      <Box pt={4}>
        <HStack justify="space-between" mb={6}>
           <Heading size="md" fontFamily="'Playfair Display', serif">Manage Upcoming Slots</Heading>
           <Select 
            maxW="200px" 
            size="sm" 
            borderRadius="full" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
           >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="blocked">Blocked</option>
           </Select>
        </HStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
           {slots.filter(s => statusFilter === 'all' || s.status === statusFilter).map(slot => (
             <Box 
              key={slot.id} 
              bg="white" 
              p={5} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="gray.100"
              transition="all 0.2s"
              _hover={{ shadow: 'md', borderColor: 'mlc.green' }}
             >
                <HStack justify="space-between" mb={3}>
                   <Tag bg={slot.status === 'open' ? 'green.50' : 'gray.50'} color={slot.status === 'open' ? 'green.700' : 'gray.600'} borderRadius="full">
                      {slot.status_label || slot.status}
                   </Tag>
                   <HStack>
                      <IconButton icon={<FiEdit3 />} size="xs" variant="ghost" onClick={() => handleEdit(slot)} />
                      <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => handleDelete(slot.id)} />
                   </HStack>
                </HStack>
                <VStack align="start" spacing={1}>
                   <Text fontWeight="700" fontSize="sm">{new Date(slot.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                   <Text fontSize="xs" color="gray.500">
                    {new Date(slot.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(slot.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                   </Text>
                </VStack>
                <Button 
                  mt={4} 
                  size="xs" 
                  w="100%" 
                  variant="outline" 
                  leftIcon={slot.status === 'blocked' ? <FiCheckCircle /> : <FiLock />}
                  onClick={() => handleToggleBlock(slot)}
                >
                  {slot.status === 'blocked' ? "Unblock" : "Block"}
                </Button>
             </Box>
           ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}

const Tag = ({ children, bg, color, size, borderRadius }) => (
    <Box px={2} py={0.5} bg={bg} color={color} fontSize={size === 'sm' ? 'xs' : 'sm'} fontWeight="700" borderRadius={borderRadius} display="inline-block">
        {children}
    </Box>
);

const IconButton = ({ icon, onClick, size, variant, colorScheme }) => (
    <Button size={size} variant={variant} colorScheme={colorScheme} onClick={onClick} p={0} minW={8}>
        {icon}
    </Button>
);
