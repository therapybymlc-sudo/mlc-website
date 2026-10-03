'use client'

import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
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
  Circle,
  Badge,
  Tag,
  Divider,
  Spinner,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiX, FiDownload, FiBookOpen, FiArrowRight, FiChevronDown, FiFileText } from "react-icons/fi";
import { generateJournalPDF, triggerBlobDownload } from './journalPdfExporter';
import { generateJournalEpub } from './epubExporter';

// Page component
const Page = forwardRef((props, ref) => {
  return (
    <Box
      ref={ref}
      bg="#FAF8F5"
      p={{ base: 5, md: 8 }}
      boxShadow="inset -4px 0 12px rgba(38, 58, 51, 0.04)"
      cursor={props.onClick ? "pointer" : "default"}
      className="page"
      h="100%"
      w="100%"
      position="relative"
      borderRight="1px solid rgba(86, 117, 109, 0.12)"
      display="flex"
      flexDirection="column"
      onClick={props.onClick}
      fontFamily="'Inter', var(--font-inter), sans-serif"
    >
      <Box flex="1" overflowY="auto" className="book-page-body" pr={1}>
         {props.children}
      </Box>
      <Box position="absolute" bottom={3} textAlign="center" w="full" left="0" pointerEvents="none">
         <Text fontSize="11px" color="#718096" fontWeight="600">- {props.number} -</Text>
      </Box>
    </Box>
  );
});

Page.displayName = 'Page';

export default function JournalBookView({ entries, onClose, userName }) {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 460, height: 640, isMobile: false });

  // Handle responsive sizing so book, header, and footer never clip
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Reserve 160px for HUD header + footer bar + padding
      const availableH = Math.max(380, h - 160);
      
      if (w < 768) {
        const bookW = Math.min(w - 32, 420);
        const bookH = Math.min(availableH, bookW * 1.38);
        setDimensions({ width: Math.round(bookW), height: Math.round(bookH), isMobile: true });
      } else {
        // Desktop: spread width max
        const maxSingleWidth = (w - 180) / 2;
        const targetH = Math.min(availableH, 650);
        const targetW = Math.min(maxSingleWidth, targetH * 0.72);
        setDimensions({ width: Math.round(targetW), height: Math.round(targetH), isMobile: false });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const flipNext = useCallback(() => {
    try {
      if (bookRef.current) {
        const pageFlip = bookRef.current.pageFlip ? bookRef.current.pageFlip() : bookRef.current;
        if (pageFlip && typeof pageFlip.flipNext === 'function') {
          pageFlip.flipNext();
        }
      }
    } catch (err) {
      console.warn("flipNext error:", err);
    }
  }, []);

  const flipPrev = useCallback(() => {
    try {
      if (bookRef.current) {
        const pageFlip = bookRef.current.pageFlip ? bookRef.current.pageFlip() : bookRef.current;
        if (pageFlip && typeof pageFlip.flipPrev === 'function') {
          pageFlip.flipPrev();
        }
      }
    } catch (err) {
      console.warn("flipPrev error:", err);
    }
  }, []);

  const turnToPage = useCallback((pageNum) => {
    try {
      if (bookRef.current) {
        const pageFlip = bookRef.current.pageFlip ? bookRef.current.pageFlip() : bookRef.current;
        if (pageFlip && typeof pageFlip.turnToPage === 'function') {
          pageFlip.turnToPage(pageNum);
        }
      }
    } catch (err) {
      console.warn("turnToPage error:", err);
    }
  }, []);

  // Keyboard navigation: Left/Right arrows and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        flipPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipNext, flipPrev, onClose]);

  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = async (format = 'pdf') => {
    setExporting(true);
    setExportFormat(format);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `My_Therapeutic_Journey_${dateStr}.${format}`;
      let blob;
      if (format === 'epub') {
        blob = await generateJournalEpub(entries, userName);
      } else {
        blob = await generateJournalPDF(entries, userName);
      }
      triggerBlobDownload(blob, filename);
    } catch (err) {
      console.error(`${format.toUpperCase()} export error:`, err);
    } finally {
      setExporting(false);
      setExportFormat('pdf');
    }
  };

  if (!entries || entries.length === 0) return null;

  const totalPages = entries.length + 3;

  return (
    <Box 
      position="fixed" 
      top="0" 
      left="0" 
      w="100vw" 
      h="100vh" 
      bg="rgba(14, 26, 22, 0.94)" 
      backdropFilter="blur(16px)"
      zIndex={2000}
      display="flex"
      flexDirection="column"
      sx={{
         "@media print": { display: 'none' }
      }}
    >
      {/* 🧭 Top HUD Header */}
      <HStack px={{ base: 4, md: 8 }} py={3.5} justify="space-between" w="full" borderBottom="1px solid rgba(255,255,255,0.08)">
         <VStack align="start" spacing={0}>
            <Heading 
              fontSize="16px" 
              fontWeight="600" 
              color="white" 
              letterSpacing="-0.015em"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
            >
              Digital Manuscript
            </Heading>
            <Text color="rgba(255,255,255,0.6)" fontSize="12px">
              A private collection of your evolution
            </Text>
         </VStack>
         
         <HStack spacing={3}>
            <Menu placement="bottom-end" autoSelect={false}>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    as={Button}
                    size="sm"
                    height="34px"
                    borderRadius="full"
                    bg="#56756D"
                    color="white"
                    fontSize="12.5px"
                    fontWeight="600"
                    px={4}
                    leftIcon={<Icon as={FiDownload} boxSize="13px" />}
                    rightIcon={
                      <Icon
                        as={FiChevronDown}
                        boxSize="13px"
                        transform={isOpen ? "rotate(180deg)" : "none"}
                        transition="transform 0.2s"
                      />
                    }
                    isLoading={exporting}
                    loadingText={exportFormat === 'epub' ? "Exporting ePub..." : "Exporting PDF..."}
                    _hover={{ bg: '#263A33' }}
                    _active={{ bg: '#182722' }}
                  >
                    Export
                  </MenuButton>
                  <MenuList
                    bg="white"
                    borderRadius="xl"
                    p={1.5}
                    border="1px solid rgba(86, 117, 109, 0.15)"
                    boxShadow="0 14px 34px -4px rgba(38, 58, 51, 0.2), 0 2px 8px rgba(0, 0, 0, 0.04)"
                    zIndex={2200}
                    minW="210px"
                  >
                    <MenuItem
                      borderRadius="lg"
                      px={3}
                      py={2.5}
                      fontSize="12.5px"
                      fontFamily="'Inter', sans-serif"
                      fontWeight="500"
                      color="#263A33"
                      _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                      onClick={() => handleExport('pdf')}
                    >
                      <HStack spacing={2.5}>
                        <Circle size="26px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                          <Icon as={FiFileText} boxSize="13px" />
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" fontSize="12.5px" color="#263A33">PDF Document</Text>
                          <Text fontSize="10.5px" color="#718096">Printable formatted archive (.pdf)</Text>
                        </VStack>
                      </HStack>
                    </MenuItem>
                    <MenuItem
                      borderRadius="lg"
                      px={3}
                      py={2.5}
                      fontSize="12.5px"
                      fontFamily="'Inter', sans-serif"
                      fontWeight="500"
                      color="#263A33"
                      _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                      onClick={() => handleExport('epub')}
                    >
                      <HStack spacing={2.5}>
                        <Circle size="26px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                          <Icon as={FiBookOpen} boxSize="13px" />
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" fontSize="12.5px" color="#263A33">ePub eBook</Text>
                          <Text fontSize="10.5px" color="#718096">E-reader and Apple Books (.epub)</Text>
                        </VStack>
                      </HStack>
                    </MenuItem>
                  </MenuList>
                </>
              )}
            </Menu>
            <IconButton 
                icon={<Icon as={FiX} boxSize="18px" />} 
                onClick={onClose} 
                borderRadius="full" 
                variant="ghost" 
                color="white" 
                size="sm"
                h="36px"
                w="36px"
                aria-label="Close book view"
                _hover={{ bg: 'rgba(255,255,255,0.15)' }}
            />
         </HStack>
      </HStack>

      {/* 📖 Book Viewport & Flanking Side Controls */}
      <Box position="relative" flex="1" display="flex" alignItems="center" justifyContent="center" overflow="hidden" px={2}>
        {/* Floating Left Arrow */}
        <IconButton 
          icon={<Icon as={FiChevronLeft} boxSize="20px" />} 
          position="absolute"
          left={{ base: "4px", md: "24px" }}
          zIndex={10}
          isDisabled={currentPage === 0}
          onClick={flipPrev}
          borderRadius="full"
          bg="white"
          color="#263A33"
          size="md"
          h="44px"
          w="44px"
          boxShadow="0 4px 20px rgba(0,0,0,0.3)"
          aria-label="Previous Page"
          _hover={{ bg: "#FAF8F5", transform: "scale(1.06)" }}
          _disabled={{ opacity: 0.25, cursor: "not-allowed" }}
          transition="all 0.2s"
        />

        {/* Floating Right Arrow */}
        <IconButton 
          icon={<Icon as={FiChevronRight} boxSize="20px" />} 
          position="absolute"
          right={{ base: "4px", md: "24px" }}
          zIndex={10}
          isDisabled={currentPage >= totalPages - 1}
          onClick={flipNext}
          borderRadius="full"
          bg="white"
          color="#263A33"
          size="md"
          h="44px"
          w="44px"
          boxShadow="0 4px 20px rgba(0,0,0,0.3)"
          aria-label="Next Page"
          _hover={{ bg: "#FAF8F5", transform: "scale(1.06)" }}
          _disabled={{ opacity: 0.25, cursor: "not-allowed" }}
          transition="all 0.2s"
        />

        {/* HTML Flip Book Container */}
        <Box position="relative">
          <HTMLFlipBook
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            minWidth={280}
            maxWidth={1000}
            minHeight={360}
            maxHeight={1400}
            maxShadowOpacity={0.4}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={(e) => setCurrentPage(e.data)}
            ref={bookRef}
            className="mlc-book"
          >
            {/* 1. Cover Page */}
            <Page number={0} onClick={flipNext}>
               <Center 
                  h="100%" 
                  flexDirection="column" 
                  textAlign="center" 
                  p={{ base: 4, md: 8 }} 
                  border="6px double rgba(86, 117, 109, 0.35)"
                  borderRadius="lg"
                  bg="white"
               >
                  <VStack spacing={5} maxW="340px">
                     <Circle size="52px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                       <Icon as={FiBookOpen} boxSize="22px" />
                     </Circle>
                     
                     <VStack spacing={1.5}>
                        <Text fontSize="11px" letterSpacing="0.12em" color="#718096" fontWeight="700" textTransform="uppercase">
                          MLC Therapy
                        </Text>
                        <Heading 
                          fontSize={{ base: "20px", md: "24px" }} 
                          fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                          fontWeight="600"
                          color="#263A33" 
                          letterSpacing="-0.015em"
                          lineHeight="1.3"
                        >
                          My Therapeutic Journey
                        </Heading>
                     </VStack>
                     
                     <Divider w="40px" borderColor="rgba(86, 117, 109, 0.35)" borderWidth="1px" />
                     
                     <VStack spacing={0.5}>
                        <Text color="#718096" fontSize="12px" fontWeight="500">Documented by</Text>
                        <Text fontWeight="600" fontSize="15px" color="#263A33">{userName}</Text>
                     </VStack>
                     
                     <Button
                        size="sm"
                        height="34px"
                        bg="#263A33"
                        color="white"
                        borderRadius="full"
                        fontSize="12px"
                        fontWeight="600"
                        px={5}
                        rightIcon={<Icon as={FiArrowRight} boxSize="12px" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          flipNext();
                        }}
                        _hover={{ bg: "#182722" }}
                        mt={3}
                     >
                        Open Manuscript
                     </Button>

                     <Text fontSize="11px" color="#A0AEC0" pt={2}>
                       Generated on {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </Text>
                  </VStack>
               </Center>
            </Page>

            {/* 2. Table of Contents */}
            <Page number={1}>
               <VStack align="start" spacing={4} p={2} h="100%">
                  <HStack justify="space-between" w="full" borderBottom="1px solid rgba(86, 117, 109, 0.15)" pb={2}>
                    <Heading 
                      fontSize="17px" 
                      fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                      fontWeight="600"
                      color="#263A33"
                    >
                      Contents
                    </Heading>
                    <Text fontSize="11px" color="#718096" fontWeight="600">
                      {entries.length} Reflections
                    </Text>
                  </HStack>

                  <VStack align="start" spacing={1.5} w="full" flex="1" overflowY="auto">
                    {entries.map((entry, idx) => (
                      <HStack 
                        key={entry.id} 
                        justify="space-between" 
                        w="full" 
                        p={2}
                        borderRadius="md"
                        borderBottom="1px dotted rgba(86, 117, 109, 0.15)"
                        cursor="pointer"
                        _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                        onClick={() => turnToPage(idx + 2)}
                        transition="all 0.15s"
                      >
                        <VStack align="start" spacing={0} maxW="70%">
                          <Text fontSize="12.5px" fontWeight="600" color="#263A33" noOfLines={1}>
                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                          <Text fontSize="11px" color="#718096" noOfLines={1}>
                            {entry.mood}
                          </Text>
                        </VStack>
                        <Badge 
                          bg="rgba(86, 117, 109, 0.1)" 
                          color="#263A33" 
                          borderRadius="full" 
                          fontSize="10px" 
                          fontWeight="700" 
                          px={2}
                        >
                          P. {idx + 2}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
               </VStack>
            </Page>

            {/* 3. Entries Map */}
            {entries.map((entry, idx) => (
              <Page key={entry.id} number={idx + 2}>
                <VStack align="start" spacing={3.5} h="100%">
                   <HStack justify="space-between" w="full" borderBottom="1px solid rgba(86, 117, 109, 0.1)" pb={2}>
                      <Text color="#718096" fontSize="11.5px" fontWeight="600">
                        {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      <Badge 
                        bg="rgba(16, 185, 129, 0.12)" 
                        color="#047857" 
                        borderRadius="full" 
                        fontSize="10px"
                        fontWeight="700"
                        px={2.5}
                        py={0.5}
                      >
                        {entry.mood}
                      </Badge>
                   </HStack>
                   
                   <Box 
                      className="book-content"
                      flex="1" 
                      w="full"
                      fontSize="13px"
                      lineHeight="1.65"
                      color="#263A33"
                      sx={{
                        "p": { mb: 3 },
                        "img": { borderRadius: "lg", my: 3, maxH: "180px", objectFit: "cover" },
                        "ul, ol": { ml: 4, mb: 3 },
                        "blockquote": { borderLeft: "3px solid #56756D", pl: 3, my: 3, color: "#5A6E65" }
                      }}
                      dangerouslySetInnerHTML={{ __html: entry.entry }}
                   />

                   {(entry.extra_data?.tags?.length > 0 || entry.extra_data?.impacts?.length > 0) && (
                      <HStack spacing={1.5} wrap="wrap" pt={1}>
                         {(entry.extra_data.tags || []).map(t => (
                           <Tag key={t} size="sm" borderRadius="full" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.15)" color="#5A6E65" fontSize="10px">
                             #{t}
                           </Tag>
                         ))}
                      </HStack>
                   )}
                </VStack>
              </Page>
            ))}

            {/* 4. Back Cover */}
            <Page number={entries.length + 2}>
               <Center h="100%" flexDirection="column" textAlign="center" p={8} bg="#FAF8F5">
                  <VStack spacing={3}>
                     <Heading 
                       fontSize="17px" 
                       fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                       fontWeight="600" 
                       color="#263A33"
                     >
                       The Path Continues
                     </Heading>
                     <Text fontSize="12.5px" color="#5A6E65" maxW="260px" lineHeight="1.5">
                       Every word written is a conscious step taken toward healing and self-awareness.
                     </Text>
                     <Box mt={12} pt={4} borderTop="1px solid rgba(86, 117, 109, 0.15)" w="180px">
                        <Text fontSize="11px" fontWeight="700" color="#263A33" letterSpacing="0.08em" textTransform="uppercase">
                          MLC Therapy
                        </Text>
                        <Text fontSize="10px" color="#718096">Therapy & Growth Collective</Text>
                     </Box>
                  </VStack>
               </Center>
            </Page>
          </HTMLFlipBook>
        </Box>
      </Box>

      {/* 🧭 Bottom Navigation Bar (Always Visible In Viewport) */}
      <HStack 
        py={3} 
        px={6} 
        w="full" 
        justify="center" 
        spacing={5} 
        borderTop="1px solid rgba(255,255,255,0.08)"
        bg="rgba(14, 26, 22, 0.6)"
      >
         <Button
            leftIcon={<Icon as={FiChevronLeft} boxSize="14px" />}
            size="sm"
            height="32px"
            borderRadius="full"
            bg="white"
            color="#263A33"
            fontSize="12px"
            fontWeight="600"
            px={4}
            isDisabled={currentPage === 0}
            onClick={flipPrev}
            _hover={{ bg: "#FAF8F5" }}
            _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
         >
            Previous
         </Button>

         <Badge
            bg="rgba(255,255,255,0.12)"
            color="white"
            borderRadius="full"
            px={3.5}
            py={1}
            fontSize="11.5px"
            fontWeight="600"
            letterSpacing="0.04em"
         >
            Page {currentPage + 1} of {totalPages}
         </Badge>

         <Button
            rightIcon={<Icon as={FiChevronRight} boxSize="14px" />}
            size="sm"
            height="32px"
            borderRadius="full"
            bg="white"
            color="#263A33"
            fontSize="12px"
            fontWeight="600"
            px={4}
            isDisabled={currentPage >= totalPages - 1}
            onClick={flipNext}
            _hover={{ bg: "#FAF8F5" }}
            _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
         >
            Next
         </Button>
      </HStack>
      
      <Box as="style">
        {`
          .mlc-book {
             box-shadow: 0 24px 70px rgba(0,0,0,0.55);
             border-radius: 8px;
          }
          .book-page-body::-webkit-scrollbar {
            width: 4px;
          }
          .book-page-body::-webkit-scrollbar-track {
            background: transparent;
          }
          .book-page-body::-webkit-scrollbar-thumb {
            background: rgba(86, 117, 109, 0.2);
            border-radius: 10px;
          }
        `}
      </Box>
    </Box>
  );
}
