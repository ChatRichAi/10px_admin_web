// 用于chakra-ui组件的样式
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: "light",
    useSystemColorMode: true,
};

const theme = extendTheme({ config });

export default theme;
