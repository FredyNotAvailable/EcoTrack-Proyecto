import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

const colors = {
    brand: {
        primary: "#357a62", // Muted forest green
        primaryHover: "#265c49",
        secondary: "#1f4037", // Dark green for footer/headings
        accent: "#6ab04c", // Brighter green for progress bars/icons
        bgBody: "#FDFCF8", // Warm off-white
        bgCardLight: "#F1F8F6", // Very light green tint for cards
        bgCardWhite: "#FFFFFF",
        textMain: "#1f4037",
        textMuted: "#636e72",
        textLight: "#ffffff",
        accentPurple: "#9b59b6",
        accentYellow: "#f1c40f",
        accentBlue: "#e3f2fd",
    },
    eco: {
        50: '#e8f5e9',
        100: '#c8e6c9',
        200: '#a5d6a7',
        300: '#81c784',
        400: '#66bb6a',
        500: '#4caf50',
        600: '#43a047',
        700: '#388e3c',
        800: '#2e7d32',
        900: '#1b5e20',
    },
    earth: {
        50: '#efebe9',
        100: '#d7ccc8',
        200: '#bcaaa4',
        300: '#a1887f',
        400: '#8d6e63',
        500: '#795548',
        600: '#6d4c41',
        700: '#5d4037',
        800: '#4e342e',
        900: '#3e2723',
    },
    water: {
        50: '#e0f2f1',
        100: '#b2dfdb',
        200: '#80cbc4',
        300: '#4db6ac',
        400: '#26a69a',
        500: '#009688',
        600: '#00897b',
        700: '#00796b',
        800: '#00695c',
        900: '#004d40',
    }
};

const theme = extendTheme({
    config,
    colors,
    fonts: {
        heading: `'Outfit', 'Inter', sans-serif`,
        body: `'Outfit', 'Inter', sans-serif`,
    },
    styles: {
        global: {
            body: {
                bg: 'brand.bgBody',
                color: 'brand.textMain',
            },
            html: {
                scrollBehavior: "smooth",
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: "600",
                borderRadius: "8px",
            },
            variants: {
                solid: {
                    bg: "brand.primary",
                    color: "white",
                    _hover: {
                        bg: "brand.primaryHover",
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                    },
                    _active: {
                        transform: "translateY(0)",
                    },
                },
            },
        },
    },
});

export default theme;
