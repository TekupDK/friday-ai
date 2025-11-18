/**
 * AppleCard Stories
 */

import type { Meta, StoryObj } from "@storybook/react";

import { AppleCard } from "./AppleCard";

const meta = {
  title: "Apple UI/AppleCard",
  component: AppleCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["elevated", "filled", "glass", "outlined"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    hoverable: {
      control: "boolean",
    },
    pressable: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AppleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elevated: Story = {
  args: {
    variant: "elevated",
    hoverable: true,
    children: (
      <div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}>
          Elevated Card
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            color: "rgba(60, 60, 67, 0.6)",
          }}
        >
          Hover to see the lift effect with shadow
        </p>
      </div>
    ),
  },
};

export const Filled: Story = {
  args: {
    variant: "filled",
    hoverable: true,
    children: (
      <div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}>
          Filled Card
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            color: "rgba(60, 60, 67, 0.6)",
          }}
        >
          Solid background color
        </p>
      </div>
    ),
  },
};

export const Glass: Story = {
  args: {
    variant: "glass",
    hoverable: true,
    children: (
      <div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}>
          Glass Card
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            color: "rgba(60, 60, 67, 0.6)",
          }}
        >
          Frosted glass effect with backdrop-filter
        </p>
      </div>
    ),
  },
  parameters: {
    backgrounds: {
      default: "gray",
    },
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    hoverable: true,
    children: (
      <div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}>
          Outlined Card
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            color: "rgba(60, 60, 67, 0.6)",
          }}
        >
          Transparent with border
        </p>
      </div>
    ),
  },
};

export const AllVariants: Story = {
  args: {
    children: null,
  },
  render: (_args, context) => {
    const isDark = context.globals.theme === "dark";
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 250px)",
          gap: "16px",
          padding: "24px",
          background: isDark ? "#1c1c1e" : "#F5F5F7",
          borderRadius: "16px",
        }}
      >
        <AppleCard variant="elevated" hoverable>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "17px",
              fontWeight: 600,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Elevated
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: isDark
                ? "rgba(235, 235, 245, 0.6)"
                : "rgba(60, 60, 67, 0.6)",
            }}
          >
            With shadow
          </p>
        </AppleCard>
        <AppleCard variant="filled" hoverable>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "17px",
              fontWeight: 600,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Filled
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: isDark
                ? "rgba(235, 235, 245, 0.6)"
                : "rgba(60, 60, 67, 0.6)",
            }}
          >
            Solid background
          </p>
        </AppleCard>
        <AppleCard variant="glass" hoverable>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "17px",
              fontWeight: 600,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Glass
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: isDark
                ? "rgba(235, 235, 245, 0.6)"
                : "rgba(60, 60, 67, 0.6)",
            }}
          >
            Frosted glass
          </p>
        </AppleCard>
        <AppleCard variant="outlined" hoverable>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "17px",
              fontWeight: 600,
              color: isDark ? "#FFFFFF" : "#000000",
            }}
          >
            Outlined
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: isDark
                ? "rgba(235, 235, 245, 0.6)"
                : "rgba(60, 60, 67, 0.6)",
            }}
          >
            With border
          </p>
        </AppleCard>
      </div>
    );
  },
  parameters: {
    backgrounds: {
      default: "light",
    },
  },
};
