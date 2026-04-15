import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { apiGet, apiPatch } from "../../api";

const blankProfile = {
  id: null,
  name: "",
  email: "",
  bio: "",
  profile_image_url: "",
  specialties: [],
};

export default function TherapistProfileSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(blankProfile);
  const [specialtyDraft, setSpecialtyDraft] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGet("therapists/");
        const list = Array.isArray(res) ? res : res?.results || [];
        const current = list[0];
        if (!mounted || !current) return;
        setProfile({
          id: current.id,
          name: current.name || "",
          email: current.email || "",
          bio: current.bio || "",
          profile_image_url: current.profile_image_url || "",
          specialties: Array.isArray(current.specialties) ? current.specialties : [],
        });
      } catch {
        if (!mounted) return;
        toast({
          status: "error",
          title: "Could not load therapist profile",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const addSpecialty = () => {
    const value = specialtyDraft.trim();
    if (!value) return;
    if (profile.specialties.includes(value)) {
      setSpecialtyDraft("");
      return;
    }
    setProfile((prev) => ({ ...prev, specialties: [...prev.specialties, value] }));
    setSpecialtyDraft("");
  };

  const removeSpecialty = (value) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((specialty) => specialty !== value),
    }));
  };

  const saveProfile = async () => {
    if (!profile.id) return;
    setSaving(true);
    try {
      const payload = {
        name: profile.name?.trim(),
        bio: profile.bio || "",
        profile_image_url: profile.profile_image_url || "",
        specialties: profile.specialties || [],
      };
      const updated = await apiPatch(`therapists/${profile.id}/`, payload);
      setProfile((prev) => ({
        ...prev,
        name: updated?.name || prev.name,
        bio: updated?.bio || "",
        profile_image_url: updated?.profile_image_url || "",
        specialties: Array.isArray(updated?.specialties) ? updated.specialties : prev.specialties,
      }));
      toast({
        status: "success",
        title: "Profile settings saved",
      });
    } catch {
      toast({
        status: "error",
        title: "Could not save profile settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Text color="gray.600">Loading profile settings...</Text>;
  }

  if (!profile.id) {
    return (
      <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
        <Heading size="md" mb={2}>
          Profile settings
        </Heading>
        <Text color="gray.600">
          Complete onboarding first so we can create your therapist profile.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Heading fontFamily="Playfair Display">Therapist Profile Settings</Heading>
      <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              value={profile.name}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </FormControl>
          <FormControl isReadOnly>
            <FormLabel>Email</FormLabel>
            <Input value={profile.email} />
          </FormControl>
        </SimpleGrid>
        <FormControl mt={4}>
          <FormLabel>Profile image URL</FormLabel>
          <Input
            placeholder="https://example.com/profile.jpg"
            value={profile.profile_image_url}
            onChange={(event) =>
              setProfile((prev) => ({ ...prev, profile_image_url: event.target.value }))
            }
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Bio</FormLabel>
          <Textarea
            value={profile.bio}
            onChange={(event) =>
              setProfile((prev) => ({ ...prev, bio: event.target.value }))
            }
            minH="140px"
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Specialties</FormLabel>
          <Input
            placeholder="Add a specialty and press Enter"
            value={specialtyDraft}
            onChange={(event) => setSpecialtyDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSpecialty();
              }
            }}
          />
        </FormControl>
        <Box mt={3}>
          {profile.specialties.map((specialty) => (
            <Tag key={specialty} mr={2} mb={2} borderRadius="full" colorScheme="teal">
              <TagLabel>{specialty}</TagLabel>
              <TagCloseButton onClick={() => removeSpecialty(specialty)} />
            </Tag>
          ))}
        </Box>
        <Button
          mt={6}
          colorScheme="teal"
          borderRadius="full"
          onClick={saveProfile}
          isLoading={saving}
        >
          Save profile
        </Button>
      </Box>
    </VStack>
  );
}
