import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    mode: "light" | "dark";
    colors: {
      primary: {
        50: string;
        100: string;
        300: string;
        500: string;
        700: string;
        900: string;
      };
      secondary: {
        50: string;
        100: string;
        300: string;
        500: string;
        700: string;
        900: string;
      };
      gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
      semantic: {
        success: string;
        warning: string;
        error: string;
        info: string;
      };
      background: {
        default: string;
        paper: string;
        card: string;
        elevated: string;
      };
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
      };
      border: {
        default: string;
        light: string;
        focus: string;
        divider: string;
      };
      button: {
        primary: {
          background: string;
          text: string;
          hover: string;
          pressed: string;
          disabled: string;
        };
        secondary: {
          background: string;
          text: string;
          hover: string;
          pressed: string;
          disabled: string;
        };
        tertiary: {
          background: string;
          text: string;
          hover: string;
          pressed: string;
          disabled: string;
        };
      };
      status: {
        success: string;
        pending: string;
        failed: string;
        active: string;
        inactive: string;
      };
      badge: {
        primary: string;
        secondary: string;
        error: string;
        success: string;
        warning: string;
      };
    };
    typography: {
      family: string;
      weight: {
        regular: number;
        medium: number;
        bold: number;
      };
      size: {
        xs: string;
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
      };
      lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    spacing: {
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      8: string;
      10: string;
      12: string;
      16: string;
      20: string;
      24: string;
      32: string;
      40: string;
    };
    radius: {
      none: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    shadow: {
      none: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
    zIndex: {
      base: number;
      dropdown: number;
      sticky: number;
      fixed: number;
      modal: number;
      toast: number;
      tooltip: number;
    };
    transition: {
      fast: string;
      normal: string;
      slow: string;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}
