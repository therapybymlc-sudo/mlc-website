'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Icon,
  Button,
  Center,
  Badge,
  useColorModeValue,
  Tag,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiX, FiDownload, FiBookOpen } from "react-icons/fi";
import { generateJournalEpub } from './epubExporter';

// Page component
const Page = forwardRef((props, ref) => {
  return (
    <Box
      ref={ref}
      bg="mlc.beige"
      p={8}
      boxShadow="inset -5px 0 15px rgba(0,0,0,0.05)"
      cursor={props.onClick ? "pointer" : "auto"}
      className="page"
      h="100%"
      w="100%"
      position="relative"
      borderRight="1px solid rgba(0,0,0,0.1)"
      display="flex"
      flexDirection="column"
    >
      <Box flex="1">
         {props.children}
      </Box>
      <Box position="absolute" bottom={4} textAlign="center" w="full" left="0">
         <Text fontSize="xs" color="gray.400" fontWeight="bold">- {props.number} -</Text>
      </Box>
    </Box>
  );
});

Page.displayName = 'Page';

export default function JournalBookView({ entries, onClose, userName }) {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 700 });

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setDimensions({ width: w - 40, height: (w - 40) * 1.4 });
      } else {
        setDimensions({ width: 500, height: 750 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await generateJournalEpub(entries, userName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `My_Therapeutic_Journey_${new Date().toLocaleDateString().replace(/\//g, '-')}.epub`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (!entries || entries.length === 0) return null;

  return (
    <Box 
      position="fixed" 
      top="0" 
      left="0" 
      w="100vw" 
      h="100vh" 
      bg="rgba(0,0,0,0.85)" 
      backdropFilter="blur(10px)"
      zIndex={2000}
      display="flex"
      flexDirection="column"
      sx={{
         "@media print": { display: 'none' }
      }}
    >
      {/* HUD / Header */}
      <HStack p={6} justify="space-between" w="full">
         <VStack align="start" spacing={0}>
            <Heading size="md" color="white" fontFamily="'Playfair Display', serif">Digital Manuscript</Heading>
            <Text color="gray.400" fontSize="xs">A collection of your evolution</Text>
         </VStack>
         
         <HStack spacing={4}>
            <Button 
                leftIcon={<FiDownload />} 
                size="sm" 
                borderRadius="full" 
                bg="mlc.greenDark" 
                color="white" 
                onClick={handleExport}
                isLoading={exporting}
                loadingText="Exporting..."
                _hover={{ bg: 'mlc.gold' }}
            >
                Export ePub
            </Button>
            <IconButton 
                icon={<FiX />} 
                onClick={onClose} 
                borderRadius="full" 
                variant="ghost" 
                color="white" 
                _hover={{ bg: 'whiteAlpha.200' }}
            />
         </HStack>
      </HStack>

      <Center flex="1" p={4} overflow="hidden">
        <Box position="relative">
          <HTMLFlipBook
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            minWidth={315}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1533}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={(e) => setCurrentPage(e.data)}
            ref={bookRef}
            className="mlc-book"
          >
            {/* 1. Cover Page */}
            <Page number={0}>
               <Center h="100%" flexDirection="column" textAlign="center" p={10} border="10px double" borderColor="mlc.gold">
                  <VStack spacing={8}>
                     <Icon as={FiBookOpen} boxSize={12} color="mlc.gold" />
                     <VStack spacing={2}>
                        <Text fontSize="sm" letterSpacing="0.2em" color="gray.500" fontWeight="800">MLC HEALTH</Text>
                        <Heading size="2xl" fontFamily="'Playfair Display', serif" color="mlc.black">My Therapeutic Journey</Heading>
                     </VStack>
                     <Divider w="50px" borderColor="mlc.gold" borderBottomWidth="2px" />
                     <VStack spacing={0}>
                        <Text fontStyle="italic" color="gray.600">Documented by</Text>
                        <Text fontWeight="800" fontSize="lg" color="mlc.black">{userName}</Text>
                     </VStack>
                     <Text fontSize="xs" color="gray.400" mt={10}>Generated on {new Date().toLocaleDateString()}</Text>
                  </VStack>
               </Center>
            </Page>

            {/* 2. Table of Contents */}
            <Page number={1}>
               <VStack align="start" spacing={6} p={4}>
                  <Heading size="lg" fontFamily="'Playfair Display', serif" mb={4}>Contents</Heading>
                  <VStack align="start" spacing={3} w="full">
                    {entries.slice(0, 15).map((entry, idx) => (
                      <HStack key={entry.id} justify="space-between" w="full" borderBottom="1px dotted" borderColor="gray.200">
                        <Text fontSize="sm" fontWeight="600">{new Date(entry.created_at).toLocaleDateString()}</Text>
                        <Text fontSize="xs" color="mlc.gold">Page {idx + 2}</Text>
                      </HStack>
                    ))}
                    {entries.length > 15 && <Text fontSize="xs" color="gray.400">... and {entries.length - 15} more reflections</Text>}
                  </VStack>
               </VStack>
            </Page>

            {/* 3. Entries Map */}
            {entries.map((entry, idx) => (
              <Page key={entry.id} number={idx + 2}>
                <VStack align="start" spacing={6} h="100%">
                   <HStack justify="space-between" w="full">
                      <Text color="gray.400" fontSize="xs" fontWeight="bold">{new Date(entry.created_at).toLocaleDateString()}</Text>
                      <Badge colorScheme="teal" variant="subtle" borderRadius="full">{entry.mood}</Badge>
                   </HStack>
                   
                   <Box 
                      className="book-content"
                      flex="1" 
                      w="full"
                      fontSize="md"
                      lineHeight="1.8"
                      color="mlc.black"
                      fontFamily="'Playfair Display', serif"
                      sx={{
                        "p": { mb: 4 },
                        "img": { borderRadius: "xl", my: 4, maxH: "200px", objectFit: "cover" },
                        "ul, ol": { ml: 4, mb: 4 },
                        "blockquote": { borderLeft: "4px solid", borderColor: "mlc.gold", pl: 4, fontStyle: "italic", color: "gray.600" }
                      }}
                      dangerouslySetInnerHTML={{ __html: entry.entry }}
                   />

                   {(entry.extra_data?.tags?.length > 0 || entry.extra_data?.impacts?.length > 0) && (
                      <HStack spacing={2} wrap="wrap">
                         {(entry.extra_data.tags || []).map(t => <Tag key={t} size="sm" variant="ghost" color="gray.400">#{t}</Tag>)}
                      </HStack>
                   )}
                </VStack>
              </Page>
            ))}

            {/* 4. Back Cover */}
            <Page number={entries.length + 2}>
               <Center h="100%" flexDirection="column" textAlign="center" p={10} bg="#F2F1ED">
                  <VStack spacing={4}>
                     <Heading size="md" fontFamily="'Playfair Display', serif" color="mlc.greenDark">The Path Continues</Heading>
                     <Text fontSize="sm" color="gray.500">Every word written is a step taken toward self-awareness.</Text>
                     <Box mt={20}>
                        <Text fontSize="xs" fontWeight="bold" letterSpacing="0.1em">MLC HEALTH</Text>
                        <Text fontSize="10px">Therapy & Growth Collective</Text>
                     </Box>
                  </VStack>
               </Center>
            </Page>
          </HTMLFlipBook>

          {/* Controls */}
          <HStack 
             position="absolute" 
             bottom="-60px" 
             left="0" 
             w="full" 
             justify="center" 
             spacing={6}
          >
             <IconButton 
                icon={<FiChevronLeft />} 
                isDisabled={currentPage === 0}
                onClick={() => bookRef.current.pageFlip().flipPrev()}
                borderRadius="full"
                bg="white"
                shadow="lg"
             />
             <Text color="white" fontWeight="bold" fontSize="sm">
                Page {currentPage + 1} of {entries.length + 3}
             </Text>
             <IconButton 
                icon={<FiChevronRight />} 
                isDisabled={currentPage >= entries.length + 2}
                onClick={() => bookRef.current.pageFlip().flipNext()}
                borderRadius="full"
                bg="white"
                shadow="lg"
             />
          </HStack>
        </Box>
      </Center>
      
      <Box as="style">
        {`
          .mlc-book {
             box-shadow: 0 50px 100px rgba(0,0,0,0.5);
          }
          .book-content::-webkit-scrollbar {
            width: 4px;
          }
          .book-content::-webkit-scrollbar-track {
            background: transparent;
          }
          .book-content::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border-radius: 10px;
          }
        `}
      </Box>
    </Box>
  );
}
