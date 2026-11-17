import { theme as baseTheme } from '@genai-fi/base';
import { createTheme } from '@mui/material/styles';

export const appFontFamily =
    "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const theme = createTheme(baseTheme, {
    typography: {
        fontFamily: appFontFamily,
        allVariants: {
            fontFamily: appFontFamily,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: appFontFamily,
                },
            },
        },
    },
});

export default theme;
