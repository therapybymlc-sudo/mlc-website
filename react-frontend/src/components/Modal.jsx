// src/components/Modal.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";

/**
 * Simple reusable modal component.
 * Example:
 * const { isOpen, onOpen, onClose } = useDisclosure();
 * <ModalWrapper
 *   title="Add Template"
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onSubmit={handleSave}
 * >
 *   <Input placeholder="Template Name" />
 * </ModalWrapper>
 */

export default function ModalWrapper({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  size = "lg",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontFamily="Playfair Display">{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button bg="#A9CBB7" color="#2E2E2E" _hover={{ bg: "#56756D", color: "white" }} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
