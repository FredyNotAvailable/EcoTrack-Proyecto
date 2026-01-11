import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

const colors = {
    eco: {
        50: '#e8f5e9',
        100: '#c8e6c9',
        200: '#a5d6a7',
        300: '#81c784',
        400: '#66bb6a',
        500: '#4caf50', // Success/Green
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
        heading: `'Inter', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.800',
            },
        },
    },
});

export default theme;
