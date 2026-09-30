'use client';

import React from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
} from "@chakra-ui/react";

export function HomeEditor({ homeDraft, setHomeDraft, homeId, apiPut, apiPost, setHomeId, toast, fetchHomeContent, RichTextEditor }) {
  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid rgba(86, 117, 109, 0.14)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
    >
      <Heading size="md" mb={6} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
        Home Page CMS Editor
      </Heading>
      <VStack align="stretch" spacing={8}>
        {/* Hero Section */}
        <Box p={5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
          <Heading size="sm" mb={4} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
            Hero Section
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Title</FormLabel>
              <Input 
                value={homeDraft.hero.title} 
                onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} 
                borderRadius="xl"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                fontSize="13px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Tagline</FormLabel>
              <Input 
                value={homeDraft.hero.tagline} 
                onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, tagline: e.target.value } }))} 
                borderRadius="xl"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                fontSize="13px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Primary Button Label</FormLabel>
              <Input 
                value={homeDraft.hero.primary_label} 
                onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, primary_label: e.target.value } }))} 
                borderRadius="xl"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                fontSize="13px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Primary Link</FormLabel>
              <Input 
                value={homeDraft.hero.primary_link} 
                onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, primary_link: e.target.value } }))} 
                borderRadius="xl"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                fontSize="13px"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Portal Section */}
        <Box p={5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
          <Heading size="sm" mb={4} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
            Portal Section
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl gridColumn="1 / -1">
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Section Title</FormLabel>
              <Input 
                value={homeDraft.portal.title} 
                onChange={(e) => setHomeDraft(p => ({ ...p, portal: { ...p.portal, title: e.target.value } }))} 
                borderRadius="xl"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                fontSize="13px"
              />
            </FormControl>
            <FormControl gridColumn="1 / -1">
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Portal Body Copy</FormLabel>
              <RichTextEditor value={homeDraft.portal.body} onChange={(val) => setHomeDraft(p => ({ ...p, portal: { ...p.portal, body: val } }))} />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Bubbles */}
        <VStack align="stretch" spacing={4}>
          <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
            Reassurance Pillars
          </Heading>
          {homeDraft.bubbles.map((b, idx) => (
            <Box key={idx} p={4} border="1px solid rgba(86, 117, 109, 0.12)" borderRadius="xl" bg="white">
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="600" color="#263A33">Icon Name</FormLabel>
                    <Input 
                      value={b.icon} 
                      onChange={(e) => {
                        const next = [...homeDraft.bubbles];
                        next[idx].icon = e.target.value;
                        setHomeDraft(p => ({ ...p, bubbles: next }));
                      }} 
                      borderRadius="xl"
                      fontSize="13px"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="600" color="#263A33">Title</FormLabel>
                    <Input 
                      value={b.title} 
                      onChange={(e) => {
                        const next = [...homeDraft.bubbles];
                        next[idx].title = e.target.value;
                        setHomeDraft(p => ({ ...p, bubbles: next }));
                      }} 
                      borderRadius="xl"
                      fontSize="13px"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" fontWeight="600" color="#263A33">Body</FormLabel>
                    <Textarea 
                      value={b.body} 
                      onChange={(e) => {
                        const next = [...homeDraft.bubbles];
                        next[idx].body = e.target.value;
                        setHomeDraft(p => ({ ...p, bubbles: next }));
                      }} 
                      borderRadius="xl"
                      fontSize="13px"
                      rows={2}
                    />
                  </FormControl>
               </SimpleGrid>
            </Box>
          ))}
        </VStack>

        <HStack justify="flex-end">
          <Button 
            bg="#56756D" 
            color="white" 
            borderRadius="full"
            fontSize="13px"
            fontWeight="600"
            px={6}
            height="38px"
            boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
            _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
            onClick={async () => {
              try {
                if (homeId) await apiPut(`home-content/${homeId}/`, homeDraft);
                else await apiPost("home-content/", homeDraft);
                toast({ status: "success", title: "Home page updated" });
                fetchHomeContent();
              } catch { toast({ status: "error", title: "Update failed" }); }
            }}
          >
            Save Home Page Content
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export function AboutEditor({ aboutDraft, setAboutDraft, aboutId, apiPut, apiPost, toast, fetchAboutContent, RichTextEditor }) {
  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid rgba(86, 117, 109, 0.14)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
    >
      <Heading size="md" mb={6} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
        About Page CMS Editor
      </Heading>
      <VStack align="stretch" spacing={8}>
         <Box p={5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
           <Heading size="sm" mb={4} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
             Hero Section
           </Heading>
           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Title</FormLabel>
                <Input 
                  value={aboutDraft.hero.title} 
                  onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} 
                  borderRadius="xl"
                  bg="white"
                  fontSize="13px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">CTA Label</FormLabel>
                <Input 
                  value={aboutDraft.hero.cta_label} 
                  onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, cta_label: e.target.value } }))} 
                  borderRadius="xl"
                  bg="white"
                  fontSize="13px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">CTA Link</FormLabel>
                <Input 
                  value={aboutDraft.hero.cta_link} 
                  onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, cta_link: e.target.value } }))} 
                  borderRadius="xl"
                  bg="white"
                  fontSize="13px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Image URL</FormLabel>
                <Input 
                  value={aboutDraft.hero.image_url} 
                  onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, image_url: e.target.value } }))} 
                  borderRadius="xl"
                  bg="white"
                  fontSize="13px"
                />
              </FormControl>
           </SimpleGrid>
           <FormControl mt={4}>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Hero Body</FormLabel>
              <RichTextEditor value={aboutDraft.hero.body} onChange={(val) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, body: val } }))} />
           </FormControl>
         </Box>

         <Box p={5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
           <Heading size="sm" mb={4} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
             Our "Why" Mission
           </Heading>
           <FormControl mb={4}>
             <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Title</FormLabel>
             <Input 
               value={aboutDraft.why.title} 
               onChange={(e) => setAboutDraft(p => ({ ...p, why: { ...p.why, title: e.target.value } }))} 
               borderRadius="xl"
               bg="white"
               fontSize="13px"
             />
           </FormControl>
           <RichTextEditor value={aboutDraft.why.body} onChange={(val) => setAboutDraft(p => ({ ...p, why: { ...p.why, body: val } }))} />
         </Box>

         <HStack justify="flex-end">
           <Button 
             bg="#56756D" 
             color="white" 
             borderRadius="full"
             fontSize="13px"
             fontWeight="600"
             px={6}
             height="38px"
             boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
             _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
             onClick={async () => {
              try {
                if (aboutId) await apiPut(`about-content/${aboutId}/`, aboutDraft);
                else await apiPost("about-content/", aboutDraft);
                toast({ status: "success", title: "About page updated" });
                fetchAboutContent();
              } catch { toast({ status: "error", title: "Update failed" }); }
             }}
           >
             Save About Page
           </Button>
         </HStack>
      </VStack>
    </Box>
  );
}

export function ContactEditor({ contactDraft, setContactDraft, contactId, apiPut, apiPost, toast, fetchContactContent, RichTextEditor }) {
  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid rgba(86, 117, 109, 0.14)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
    >
      <Heading size="md" mb={6} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
        Contact Page CMS Editor
      </Heading>
      <VStack align="stretch" spacing={8}>
         <Box p={5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
            <Heading size="sm" mb={4} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
              Hero Section
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
               <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Title</FormLabel>
                  <Input 
                    value={contactDraft.hero.title} 
                    onChange={(e) => setContactDraft(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} 
                    borderRadius="xl"
                    bg="white"
                    fontSize="13px"
                  />
               </FormControl>
               <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Contact Email</FormLabel>
                  <Input 
                    value={contactDraft.hero.email} 
                    onChange={(e) => setContactDraft(p => ({ ...p, hero: { ...p.hero, email: e.target.value } }))} 
                    borderRadius="xl"
                    bg="white"
                    fontSize="13px"
                  />
               </FormControl>
            </SimpleGrid>
            <FormControl mt={4}>
               <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Body Copy</FormLabel>
               <RichTextEditor value={contactDraft.hero.body} onChange={(val) => setContactDraft(p => ({ ...p, hero: { ...p.hero, body: val } }))} />
            </FormControl>
         </Box>
         <HStack justify="flex-end">
           <Button 
             bg="#56756D" 
             color="white" 
             borderRadius="full"
             fontSize="13px"
             fontWeight="600"
             px={6}
             height="38px"
             boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
             _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
             onClick={async () => {
                try {
                  if (contactId) await apiPut(`contact-content/${contactId}/`, contactDraft);
                  else await apiPost("contact-content/", contactDraft);
                  toast({ status: "success", title: "Contact page updated" });
                  fetchContactContent();
                } catch { toast({ status: "error", title: "Update failed" }); }
             }}
           >
             Save Contact Page
           </Button>
         </HStack>
      </VStack>
    </Box>
  );
}
