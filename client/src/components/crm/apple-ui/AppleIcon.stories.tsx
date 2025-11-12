import type { Meta, StoryObj } from "@storybook/react";
import { Heart, Mail, Search, Settings, Star, User } from "lucide-react";
import { AppleIcon } from "./AppleIcon";
import { Icons } from "./icons";

const meta = {
  title: "CRM/Apple UI/AppleIcon",
  component: AppleIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserIcon: Story = {
  args: {
    icon: User,
    size: "md",
  },
};

export const MailIcon: Story = {
  args: {
    icon: Mail,
    size: "md",
  },
};

export const SearchIcon: Story = {
  args: {
    icon: Search,
    size: "md",
  },
};

export const SettingsIcon: Story = {
  args: {
    icon: Settings,
    size: "md",
  },
};

export const LargeIcon: Story = {
  args: {
    icon: Star,
    size: "2xl",
  },
};

export const SmallIcon: Story = {
  args: {
    icon: Heart,
    size: "xs",
  },
};

export const AllIcons: Story = {
  args: {
    icon: User,
    size: "md",
  },
  render: () => (
    <div style={{ padding: "24px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "24px" }}>All Available Icons</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "16px",
        }}
      >
        {Object.entries(Icons).map(([iconName, IconComponent]) => (
          <div
            key={iconName}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "16px",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <AppleIcon icon={IconComponent} size="lg" />
            <span style={{ fontSize: "12px", textAlign: "center" }}>
              {iconName}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};
