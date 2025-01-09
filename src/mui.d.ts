import { getGradient } from "@/utils/getGradient";

declare module '@mui/material/styles' {
    interface Theme {
        customBackground: {
            gradient: string;
            paperGradient: string;
        };
        customColors: {
            gradientStart: string;
            gradientEnd: string;
            paperGradientStart: string;
            paperGradientEnd: string;
        };
    }

    interface ThemeOptions {
        customBackground?: {
            gradient?: string;
            paperGradient?: string;
        };
        customColors?: {
            gradientStart?: string;
            gradientEnd?: string;
            paperGradientStart?: string;
            paperGradientEnd?: string;
        };
    }
}
