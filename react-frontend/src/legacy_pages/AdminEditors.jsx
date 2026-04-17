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
  Select,
  Divider,
} from "@chakra-ui/react";

export function HomeEditor({ homeDraft, setHomeDraft, homeId, apiPut, apiPost, setHomeId, toast, fetchHomeContent, RichTextEditor }) {
  return (
    <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
      <Heading size="md" mb={6}>Home Page Editor</Heading>
      <VStack align="stretch" spacing={10}>
        <Box>
          <Heading size="sm" mb={4}>Hero Section</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input value={homeDraft.hero.title} onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Tagline</FormLabel>
              <Input value={homeDraft.hero.tagline} onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, tagline: e.target.value } }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Primary Button</FormLabel>
              <Input value={homeDraft.hero.primary_label} onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, primary_label: e.target.value } }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Primary Link</FormLabel>
              <Input value={homeDraft.hero.primary_link} onChange={(e) => setHomeDraft(p => ({ ...p, hero: { ...p.hero, primary_link: e.target.value } }))} />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading size="sm" mb={4}>Portal Section</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl gridColumn="1 / -1">
              <FormLabel>Title</FormLabel>
              <Input value={homeDraft.portal.title} onChange={(e) => setHomeDraft(p => ({ ...p, portal: { ...p.portal, title: e.target.value } }))} />
            </FormControl>
            <FormControl gridColumn="1 / -1">
              <FormLabel>Body</FormLabel>
              <RichTextEditor value={homeDraft.portal.body} onChange={(val) => setHomeDraft(p => ({ ...p, portal: { ...p.portal, body: val } }))} />
            </FormControl>
          </SimpleGrid>
        </Box>

        <VStack align="stretch" spacing={4}>
          <Heading size="sm">Reassurance Bubbles</Heading>
          {homeDraft.bubbles.map((b, idx) => (
            <Box key={idx} p={4} border="1px solid" borderColor="gray.100" borderRadius="xl">
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Icon</FormLabel>
                    <Input value={b.icon} onChange={(e) => {
                      const next = [...homeDraft.bubbles];
                      next[idx].icon = e.target.value;
                      setHomeDraft(p => ({ ...p, bubbles: next }));
                    }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input value={b.title} onChange={(e) => {
                      const next = [...homeDraft.bubbles];
                      next[idx].title = e.target.value;
                      setHomeDraft(p => ({ ...p, bubbles: next }));
                    }} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Body</FormLabel>
                    <Textarea value={b.body} onChange={(e) => {
                      const next = [...homeDraft.bubbles];
                      next[idx].body = e.target.value;
                      setHomeDraft(p => ({ ...p, bubbles: next }));
                    }} />
                  </FormControl>
               </SimpleGrid>
            </Box>
          ))}
        </VStack>

        <Button bg="mlc.green" color="white" onClick={async () => {
          try {
            if (homeId) await apiPut(`home-content/${homeId}/`, homeDraft);
            else await apiPost("home-content/", homeDraft);
            toast({ status: "success", title: "Home page updated" });
            fetchHomeContent();
          } catch { toast({ status: "error", title: "Update failed" }); }
        }}>Save Home Page Content</Button>
      </VStack>
    </Box>
  );
}

export function AboutEditor({ aboutDraft, setAboutDraft, aboutId, apiPut, apiPost, toast, fetchAboutContent, RichTextEditor }) {
  return (
    <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
      <Heading size="md" mb={6}>About Page Editor</Heading>
      <VStack align="stretch" spacing={10}>
         <Box>
           <Heading size="sm" mb={4}>Hero Section</Heading>
           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input value={aboutDraft.hero.title} onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel>CTA Label</FormLabel>
                <Input value={aboutDraft.hero.cta_label} onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, cta_label: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel>CTA Link</FormLabel>
                <Input value={aboutDraft.hero.cta_link} onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, cta_link: e.target.value } }))} />
              </FormControl>
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input value={aboutDraft.hero.image_url} onChange={(e) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, image_url: e.target.value } }))} />
              </FormControl>
           </SimpleGrid>
           <FormControl mt={4}>
              <FormLabel>Hero Body</FormLabel>
              <RichTextEditor value={aboutDraft.hero.body} onChange={(val) => setAboutDraft(p => ({ ...p, hero: { ...p.hero, body: val } }))} />
           </FormControl>
         </Box>

         <Box>
           <Heading size="sm" mb={4}>Our "Why"</Heading>
           <FormControl mb={4}>
             <FormLabel>Title</FormLabel>
             <Input value={aboutDraft.why.title} onChange={(e) => setAboutDraft(p => ({ ...p, why: { ...p.why, title: e.target.value } }))} />
           </FormControl>
           <RichTextEditor value={aboutDraft.why.body} onChange={(val) => setAboutDraft(p => ({ ...p, why: { ...p.why, body: val } }))} />
         </Box>

         <Button bg="mlc.green" color="white" onClick={async () => {
          try {
            if (aboutId) await apiPut(`about-content/${aboutId}/`, aboutDraft);
            else await apiPost("about-content/", aboutDraft);
            toast({ status: "success", title: "About page updated" });
            fetchAboutContent();
          } catch { toast({ status: "error", title: "Update failed" }); }
         }}>Save About Page</Button>
      </VStack>
    </Box>
  );
}

export function ContactEditor({ contactDraft, setContactDraft, contactId, apiPut, apiPost, toast, fetchContactContent, RichTextEditor }) {
  return (
    <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm">
      <Heading size="md" mb={6}>Contact Page Editor</Heading>
      <VStack align="stretch" spacing={10}>
         <Box>
            <Heading size="sm" mb={4}>Hero Section</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
               <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input value={contactDraft.hero.title} onChange={(e) => setContactDraft(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} />
               </FormControl>
               <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={contactDraft.hero.email} onChange={(e) => setContactDraft(p => ({ ...p, hero: { ...p.hero, email: e.target.value } }))} />
               </FormControl>
            </SimpleGrid>
            <FormControl mt={4}>
               <FormLabel>Body</FormLabel>
               <RichTextEditor value={contactDraft.hero.body} onChange={(val) => setContactDraft(p => ({ ...p, hero: { ...p.hero, body: val } }))} />
            </FormControl>
         </Box>
         <Button bg="mlc.green" color="white" onClick={async () => {
            try {
              if (contactId) await apiPut(`contact-content/${contactId}/`, contactDraft);
              else await apiPost("contact-content/", contactDraft);
              toast({ status: "success", title: "Contact page updated" });
              fetchContactContent();
            } catch { toast({ status: "error", title: "Update failed" }); }
         }}>Save Contact Page</Button>
      </VStack>
    </Box>
  );
}
