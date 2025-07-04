"use client";

import { ChakraProvider, ColorModeScript, useColorMode } from "@chakra-ui/react";
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import chakraTheme from "./theme";
import getMuiTheme from "./mui-theme";
import { useMemo } from "react";

function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode();
  const muiTheme = useMemo(() => getMuiTheme(colorMode === 'dark' ? 'dark' : 'light'), [colorMode]);
  return <MUIThemeProvider theme={muiTheme}>{children}</MUIThemeProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ColorModeScript initialColorMode={chakraTheme.config.initialColorMode} />
            <ChakraProvider theme={chakraTheme}>
                <MuiThemeWrapper>
                    {children}
                </MuiThemeWrapper>
            </ChakraProvider>
        </>
    );
}