import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
    accent: `'Playfair Display', serif`,
    // For legacy usages if they manually referenced Lato anywhere
    lato: `'Inter', sans-serif`,
  },
  fontSizes: {
    xs: "clamp(0.75rem, 0.70rem + 0.25vw, 0.875rem)",
    sm: "clamp(0.875rem, 0.80rem + 0.30vw, 1rem)",
    md: "clamp(1rem, 0.90rem + 0.40vw, 1.125rem)",
    lg: "clamp(1.125rem, 1.00rem + 0.50vw, 1.25rem)",
    xl: "clamp(1.25rem, 1.10rem + 0.60vw, 1.5rem)",
    "2xl": "clamp(1.5rem, 1.30rem + 0.80vw, 1.875rem)",
    "3xl": "clamp(1.875rem, 1.50rem + 1vw, 2.25rem)",
    "4xl": "clamp(2.25rem, 1.80rem + 1.20vw, 3rem)",
    "5xl": "clamp(3rem, 2.50rem + 1.50vw, 4rem)",
    "6xl": "clamp(3.75rem, 3.00rem + 2vw, 5rem)",
  },
  lineHeights: {
    normal: "normal",
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.6,
    tall: 1.75,
    taller: "2",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
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
