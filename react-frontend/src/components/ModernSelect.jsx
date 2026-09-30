'use client';

import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Portal,
  Box,
} from "@chakra-ui/react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export default function ModernSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  name,
  isRequired = false,
  isDisabled = false,
  size = "md",
  h = "42px",
  bg = "#FDFBFA",
  borderColor = "rgba(86, 117, 109, 0.22)",
  focusBorderColor = "#56756D",
  borderRadius = "14px",
  fontSize = "13.5px",
  w = "full",
  leftIcon,
  menuMaxH = "260px",
}) {
  // Normalize options to [{ value, label, icon? }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;

  return (
    <Box position="relative" w={w}>
      {/* Hidden input for native form serialization / FormData support */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ""}
          required={isRequired}
        />
      )}

      <Menu matchWidth autoSelect={false}>
        {({ isOpen }) => (
          <>
            <MenuButton
              as={Button}
              w="full"
              h={h}
              bg={bg}
              isDisabled={isDisabled}
              border="1px solid"
              borderColor={isOpen ? focusBorderColor : borderColor}
              borderRadius={borderRadius}
              px={3.5}
              py={0}
              fontWeight="normal"
              fontSize={fontSize}
              fontFamily="'Inter', var(--font-inter), sans-serif"
              textAlign="left"
              transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
              boxShadow={isOpen ? `0 0 0 1px ${focusBorderColor}, 0 4px 12px rgba(86, 117, 109, 0.1)` : "none"}
              _hover={{
                borderColor: isOpen ? focusBorderColor : "rgba(86, 117, 109, 0.4)",
                bg: "white",
              }}
              _active={{
                bg: "white",
                borderColor: focusBorderColor,
              }}
              _focus={{
                boxShadow: `0 0 0 1px ${focusBorderColor}`,
                borderColor: focusBorderColor,
              }}
            >
              <HStack justify="space-between" w="full" spacing={2}>
                <HStack spacing={2} minW={0} overflow="hidden">
                  {selectedOption?.colorDot && (
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={selectedOption.colorDot}
                      flexShrink={0}
                    />
                  )}
                  {leftIcon && (
                    <Icon
                      as={leftIcon}
                      boxSize="15px"
                      color={isPlaceholder ? "#718096" : "#56756D"}
                      flexShrink={0}
                    />
                  )}
                  <Text
                    isTruncated
                    color={isPlaceholder ? "#718096" : "#263A33"}
                    fontWeight={isPlaceholder ? "400" : "500"}
                  >
                    {displayText}
                  </Text>
                  {selectedOption?.badge && (
                    <Badge
                      fontSize="9.5px"
                      bg="rgba(86, 117, 109, 0.12)"
                      color="#56756D"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontWeight="600"
                    >
                      {selectedOption.badge}
                    </Badge>
                  )}
                </HStack>

                <Icon
                  as={FiChevronDown}
                  boxSize="15px"
                  color="#56756D"
                  transition="transform 0.25s ease"
                  transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                  flexShrink={0}
                />
              </HStack>
            </MenuButton>

            <Portal>
              <MenuList
                bg="white"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.16)"
                borderRadius="16px"
                boxShadow="0 18px 45px -8px rgba(38, 58, 51, 0.22), 0 6px 16px rgba(0, 0, 0, 0.06)"
                p={1.5}
                zIndex={9999}
                maxH={menuMaxH}
                overflowY="auto"
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "5px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(86, 117, 109, 0.2)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "rgba(86, 117, 109, 0.4)",
                  },
                }}
              >
                {normalizedOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <MenuItem
                      key={opt.value}
                      onClick={() => onChange && onChange(opt.value)}
                      borderRadius="10px"
                      py={2}
                      px={3}
                      mb={0.5}
                      bg={isSelected ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                      color="#263A33"
                      fontWeight={isSelected ? "600" : "450"}
                      fontSize={fontSize}
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      transition="all 0.15s ease"
                      _hover={{
                        bg: "rgba(86, 117, 109, 0.12)",
                        color: "#182722",
                      }}
                      _focus={{
                        bg: "rgba(86, 117, 109, 0.12)",
                      }}
                    >
                      <HStack justify="space-between" w="full" spacing={2}>
                        <HStack spacing={2.5} minW={0} overflow="hidden">
                          {opt.colorDot && (
                            <Box
                              w="8px"
                              h="8px"
                              borderRadius="full"
                              bg={opt.colorDot}
                              flexShrink={0}
                            />
                          )}
                          {opt.icon && (
                            <Icon
                              as={opt.icon}
                              boxSize="14px"
                              color={isSelected ? "#56756D" : "#7A8D86"}
                              flexShrink={0}
                            />
                          )}
                          <VStack align="start" spacing={0} minW={0}>
                            <Text isTruncated>{opt.label}</Text>
                            {opt.subtext && (
                              <Text fontSize="11px" color="#718096" isTruncated>
                                {opt.subtext}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                        <HStack spacing={1.5} flexShrink={0}>
                          {opt.badge && (
                            <Badge
                              fontSize="9.5px"
                              bg="rgba(86, 117, 109, 0.12)"
                              color="#56756D"
                              borderRadius="full"
                              px={2}
                              py={0.5}
                              fontWeight="600"
                            >
                              {opt.badge}
                            </Badge>
                          )}
                          {isSelected && (
                            <Icon
                              as={FiCheck}
                              boxSize="14px"
                              color="#56756D"
                              strokeWidth={2.5}
                            />
                          )}
                        </HStack>
                      </HStack>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Portal>
          </>
        )}
      </Menu>
    </Box>
  );
}
