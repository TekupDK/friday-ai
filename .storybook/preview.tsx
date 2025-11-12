import type { Preview } from "@storybook/react-vite";
import "../client/src/index.css";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light";
      return (
        <div
          data-theme={theme}
          style={{
            background: theme === "dark" ? "#000000" : "#FFFFFF",
            minHeight: "100vh",
            padding: "20px",
            colorScheme: theme,
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#FFFFFF",
        },
        {
          name: "dark",
          value: "#000000",
        },
        {
          name: "gray",
          value: "#F2F2F7",
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "iPhone 14 Pro",
          styles: {
            width: "393px",
            height: "852px",
          },
        },
        tablet: {
          name: "iPad Pro",
          styles: {
            width: "1024px",
            height: "1366px",
          },
        },
        desktop: {
          name: "Desktop",
          styles: {
            width: "1440px",
            height: "900px",
          },
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
