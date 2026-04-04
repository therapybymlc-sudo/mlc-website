import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Playfair Display', serif`,
    body: `'Lato', sans-serif`,
  },
  colors: {
    mlc: {
      gold: "#C9A960",
      green: "#A9CBB7",
      black: "#2E2E2E",
      white: "#F9F9F9",
      grey: "#B5B5B5",
      sageTint: "#E9F2ED", // light green tint for subtle section backgrounds
      beige: "#F6F3EF", // optional soft beige for gradients or cards
    },
  },
  gradients: {
    soft: "linear(to-b, mlc.white, mlc.sageTint)",
  },
  radii: {
    none: "0",
    sm: "10px",
    md: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "28px",
    "3xl": "32px",
    full: "9999px",
  },
  styles: {
    global: {
      "html, body, #root": {
        width: "100%",
        minHeight: "100%",
      },
      body: {
        bg: "mlc.white",
        color: "mlc.black",
        fontFamily: "body",
        overflowX: "hidden",
      },
      "img, svg, video, canvas": {
        maxWidth: "100%",
        height: "auto",
      },
      "*": {
        wordBreak: "break-word",
      },
      a: {
        transition: "all 0.3s ease",
        _hover: { color: "mlc.gold" },
      },
      button: {
        transition: "all 0.3s ease",
      },
    },
  },
  components: {
    Modal: {
      baseStyle: {
        dialog: {
          maxW: "90vw",
          w: "90vw",
          maxH: "90vh",
          borderRadius: "3xl",
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "2xl",
        fontWeight: "medium",
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "2xl",
          bg: "white",
          borderColor: "gray.200",
          _hover: { borderColor: "gray.300" },
          _focus: { borderColor: "mlc.green", boxShadow: "0 0 0 1px #A9CBB7" },
        },
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: "2xl",
        bg: "white",
        borderColor: "gray.200",
        _hover: { borderColor: "gray.300" },
        _focus: { borderColor: "mlc.green", boxShadow: "0 0 0 1px #A9CBB7" },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "2xl",
          bg: "white",
          borderColor: "gray.200",
          _hover: { borderColor: "gray.300" },
          _focus: { borderColor: "mlc.green", boxShadow: "0 0 0 1px #A9CBB7" },
        },
      },
    },
    AccordionButton: {
      baseStyle: {
        borderRadius: "2xl",
      },
    },
  },
});

export default theme;
