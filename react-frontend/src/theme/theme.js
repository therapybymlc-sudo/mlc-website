import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Playfair Display', var(--font-playfair), Georgia, serif`,
    body: `'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    accent: `'Playfair Display', var(--font-playfair), Georgia, serif`,
    serif: `'Playfair Display', var(--font-playfair), Georgia, serif`,
    forum: `'Playfair Display', var(--font-playfair), Georgia, serif`, // Harmonizes legacy Forum references
    sans: `'Inter', var(--font-inter), sans-serif`,
    lato: `'Inter', var(--font-inter), sans-serif`,
    plusJakarta: `'Plus Jakarta Sans', var(--font-plus-jakarta), 'Inter', var(--font-inter), -apple-system, sans-serif`,
    outfit: `'Outfit', var(--font-outfit), sans-serif`,
    dmSans: `'DM Sans', var(--font-dmsans), sans-serif`,
  },
  fontSizes: {
    xs: "clamp(0.75rem, 0.70rem + 0.25vw, 0.875rem)",
    sm: "clamp(0.875rem, 0.80rem + 0.30vw, 1rem)",
    md: "clamp(1rem, 0.92rem + 0.35vw, 1.125rem)",
    lg: "clamp(1.125rem, 1.02rem + 0.45vw, 1.25rem)",
    xl: "clamp(1.25rem, 1.12rem + 0.55vw, 1.5rem)",
    "2xl": "clamp(1.5rem, 1.30rem + 0.75vw, 1.875rem)",
    "3xl": "clamp(1.875rem, 1.55rem + 1vw, 2.25rem)",
    "4xl": "clamp(2.25rem, 1.85rem + 1.25vw, 3rem)",
    "5xl": "clamp(2.85rem, 2.40rem + 1.5vw, 3.85rem)",
    "6xl": "clamp(3.5rem, 2.80rem + 2vw, 4.75rem)",
  },
  lineHeights: {
    none: 1,
    tight: 1.15,
    shorter: 1.25,
    short: 1.375,
    base: 1.65,
    tall: 1.75,
    taller: "2",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  letterSpacings: {
    tighter: "-0.03em",
    tight: "-0.015em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.12em",
  },
  space: {
    sectionSm: "clamp(2.5rem, 2rem + 1.5vw, 3.5rem)",
    sectionMd: "clamp(3.5rem, 2.8rem + 2vw, 4.75rem)",
    sectionLg: "clamp(4.5rem, 3.5rem + 2.5vw, 6rem)",
  },
  colors: {
    mlc: {
      gold: "#C9A960",
      green: "#A9CBB7",
      greenDark: "#56756D",
      black: "#2E2E2E",
      blackSoft: "rgba(46, 46, 46, 0.9)",
      white: "#F9F9F9",
      grey: "#B5B5B5",
      sageTint: "#E9F2ED",
      beige: "#F6F3EF",
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
        color: "mlc.blackSoft",
        fontFamily: "body",
        fontWeight: "normal",
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
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
      },
      button: {
        transition: "all 0.3s ease",
      },
      "input, textarea, select, button": {
        fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      "a:not([class])": {
        color: "mlc.black",
        _hover: { color: "mlc.gold" },
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        fontFamily: "heading",
        fontWeight: "600",
        color: "inherit",
        lineHeight: "1.18",
        letterSpacing: "-0.015em",
      },
      sizes: {
        "4xl": { fontSize: "clamp(2.4rem, 1.8rem + 2vw, 3.75rem)", lineHeight: 1.1 },
        "3xl": { fontSize: "clamp(1.85rem, 1.5rem + 1.2vw, 2.5rem)", lineHeight: 1.15 },
        "2xl": { fontSize: "clamp(1.5rem, 1.25rem + 0.8vw, 2rem)", lineHeight: 1.2 },
        xl: { fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)", lineHeight: 1.25 },
        lg: { fontSize: "clamp(1.1rem, 1rem + 0.3vw, 1.25rem)", lineHeight: 1.3 },
        md: { fontSize: "1.125rem", lineHeight: 1.35 },
        sm: { fontSize: "1rem", lineHeight: 1.4 },
        xs: { fontSize: "0.875rem", lineHeight: 1.4 },
      },
    },
    Text: {
      baseStyle: {
        lineHeight: "base",
      },
    },
    Alert: {
      baseStyle: {
        container: {
          px: 4,
          py: 3.5,
          borderRadius: "2xl",
        },
      },
      variants: {
        subtle: (props) => {
          const s = props.status;
          const c = props.colorScheme;
          const isSuccess = s === "success" || c === "green" || c === "teal" || c === "emerald";
          const isError = s === "error" || c === "red";
          const isWarning = s === "warning" || c === "orange" || c === "yellow";

          if (isSuccess) {
            return {
              container: {
                bg: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                color: "#065F46",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderRadius: "2xl",
                boxShadow: "0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(16px)",
              },
              title: { 
                fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
                color: "#064E3B", 
                fontWeight: "600",
                fontSize: "14px",
              },
              description: { 
                fontFamily: "'Inter', var(--font-inter), sans-serif", 
                color: "#065F46", 
                fontWeight: "400",
                fontSize: "13px",
              },
              icon: { color: "#059669" },
            };
          }
          if (isError) {
            return {
              container: {
                bg: "linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)",
                color: "#991B1B",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "2xl",
                boxShadow: "0 14px 34px -4px rgba(153, 27, 27, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(16px)",
              },
              title: { 
                fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
                color: "#7F1D1D", 
                fontWeight: "600",
                fontSize: "14px",
              },
              description: { 
                fontFamily: "'Inter', var(--font-inter), sans-serif", 
                color: "#991B1B", 
                fontWeight: "400",
                fontSize: "13px",
              },
              icon: { color: "#DC2626" },
            };
          }
          if (isWarning) {
            return {
              container: {
                bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                color: "#92400E",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "2xl",
                boxShadow: "0 14px 34px -4px rgba(146, 64, 14, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(16px)",
              },
              title: { 
                fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
                color: "#78350F", 
                fontWeight: "600",
                fontSize: "14px",
              },
              description: { 
                fontFamily: "'Inter', var(--font-inter), sans-serif", 
                color: "#92400E", 
                fontWeight: "400",
                fontSize: "13px",
              },
              icon: { color: "#D97706" },
            };
          }
          return {
            container: {
              bg: "linear-gradient(135deg, #F0FDF4 0%, #FAF8F5 100%)",
              color: "#263A33",
              border: "1px solid rgba(86, 117, 109, 0.25)",
              borderRadius: "2xl",
              boxShadow: "0 14px 34px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)",
              backdropFilter: "blur(16px)",
            },
            title: { 
              fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
              color: "#263A33", 
              fontWeight: "600",
              fontSize: "14px",
            },
            description: { 
              fontFamily: "'Inter', var(--font-inter), sans-serif", 
              color: "#5A6E65", 
              fontWeight: "400",
              fontSize: "13px",
            },
            icon: { color: "#56756D" },
          };
        },
        solid: (props) => {
          // Fallback solid variant to the same soft wash style so useToast() solid default is styled identically
          const s = props.status;
          const c = props.colorScheme;
          const isSuccess = s === "success" || c === "green" || c === "teal" || c === "emerald";
          const isError = s === "error" || c === "red";
          const isWarning = s === "warning" || c === "orange" || c === "yellow";

          if (isSuccess) {
            return {
              container: {
                bg: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                color: "#065F46",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderRadius: "2xl",
                boxShadow: "0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(16px)",
              },
              title: { 
                fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
                color: "#064E3B", 
                fontWeight: "600",
                fontSize: "14px",
              },
              description: { 
                fontFamily: "'Inter', var(--font-inter), sans-serif", 
                color: "#065F46", 
                fontWeight: "400",
                fontSize: "13px",
              },
              icon: { color: "#059669" },
            };
          }
          if (isError) {
            return {
              container: {
                bg: "linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)",
                color: "#991B1B",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "2xl",
                boxShadow: "0 14px 34px -4px rgba(153, 27, 27, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(16px)",
              },
              title: { 
                fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
                color: "#7F1D1D", 
                fontWeight: "600",
                fontSize: "14px",
              },
              description: { 
                fontFamily: "'Inter', var(--font-inter), sans-serif", 
                color: "#991B1B", 
                fontWeight: "400",
                fontSize: "13px",
              },
              icon: { color: "#DC2626" },
            };
          }
          if (isWarning) {
            return {
              container: {
                bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                color: "#92400E",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "2xl",
                boxShadow: "0 14px 34px -4px rgba(146, 64, 14, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)",
                backdropFilter: "blur(16px)",
              },
              title: { 
                fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
                color: "#78350F", 
                fontWeight: "600",
                fontSize: "14px",
              },
              description: { 
                fontFamily: "'Inter', var(--font-inter), sans-serif", 
                color: "#92400E", 
                fontWeight: "400",
                fontSize: "13px",
              },
              icon: { color: "#D97706" },
            };
          }
          return {
            container: {
              bg: "linear-gradient(135deg, #F0FDF4 0%, #FAF8F5 100%)",
              color: "#263A33",
              border: "1px solid rgba(86, 117, 109, 0.25)",
              borderRadius: "2xl",
              boxShadow: "0 14px 34px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)",
              backdropFilter: "blur(16px)",
            },
            title: { 
              fontFamily: "'Outfit', var(--font-outfit), sans-serif", 
              color: "#263A33", 
              fontWeight: "600",
              fontSize: "14px",
            },
            description: { 
              fontFamily: "'Inter', var(--font-inter), sans-serif", 
              color: "#5A6E65", 
              fontWeight: "400",
              fontSize: "13px",
            },
            icon: { color: "#56756D" },
          };
        },
      },
    },
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
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: "13px",
          color: "#263A33",
          borderRadius: "xl",
          bg: "#FAF8F5",
          borderColor: "rgba(86, 117, 109, 0.2)",
          _placeholder: { color: "#8C9E96" },
          _hover: { borderColor: "#56756D" },
          _focus: { bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" },
        },
      },
    },
    Textarea: {
      baseStyle: {
        fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "13px",
        color: "#263A33",
        borderRadius: "xl",
        bg: "#FAF8F5",
        borderColor: "rgba(86, 117, 109, 0.2)",
        _placeholder: { color: "#8C9E96" },
        _hover: { borderColor: "#56756D" },
        _focus: { bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" },
      },
    },
    Select: {
      baseStyle: {
        field: {
          fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: "13px",
          color: "#263A33",
          borderRadius: "xl",
          bg: "#FAF8F5",
          borderColor: "rgba(86, 117, 109, 0.2)",
          _hover: { borderColor: "#56756D" },
          _focus: { bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "13px",
        fontWeight: "600",
        color: "#263A33",
        mb: "6px",
      },
    },
    AccordionButton: {
      baseStyle: {
        borderRadius: "2xl",
      },
    },
    Table: {
      baseStyle: {
        th: {
          fontFamily: "body",
          letterSpacing: "0.08em",
          fontWeight: "700",
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: "#263A33",
        color: "white",
        fontSize: "11.5px",
        fontWeight: "500",
        fontFamily: "'Inter', var(--font-inter), sans-serif",
        letterSpacing: "-0.01em",
        px: 2.5,
        py: 1,
        borderRadius: "md",
        boxShadow: "0 6px 18px -2px rgba(38, 58, 51, 0.25)",
        "--popper-arrow-bg": "#263A33",
      },
    },
  },
});

export default theme;
