import { createTheme } from '@mui/material/styles';

const getMuiTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: { mode },
    spacing: (factor: number) => `${0.25 * factor}rem`,
    // 在这里添加其他主题配置
  });

export default getMuiTheme;