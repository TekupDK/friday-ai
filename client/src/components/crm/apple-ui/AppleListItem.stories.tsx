import type { Meta, StoryObj } from "@storybook/react";
import { Mail, MapPin, Phone } from "lucide-react";
import { AppleListItem } from "./AppleListItem";

const meta = {
  title: "CRM/Apple UI/AppleListItem",
  component: AppleListItem,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Settings Item",
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Email",
    subtitle: "user@example.com",
  },
};

export const WithIcon: Story = {
  args: {
    title: "Email",
    subtitle: "user@example.com",
    leftIcon: <Mail size={20} />,
    showChevron: true,
  },
};

export const NoChevron: Story = {
  args: {
    title: "Information",
    subtitle: "Read only",
    showChevron: false,
  },
};

export const Clickable: Story = {
  args: {
    title: "Tap to open",
    showChevron: true,
    onClick: () => alert("Item clicked!"),
  },
};

export const List: Story = {
  args: {
    title: "List",
  },
  render: () => (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <AppleListItem title="General" showChevron />
      <AppleListItem
        title="Email"
        subtitle="user@example.com"
        leftIcon={<Mail size={20} />}
        showChevron
      />
      <AppleListItem
        title="Phone"
        subtitle="+45 12 34 56 78"
        leftIcon={<Phone size={20} />}
        showChevron
      />
      <AppleListItem
        title="Location"
        subtitle="Copenhagen, Denmark"
        leftIcon={<MapPin size={20} />}
        showChevron={false}
      />
    </div>
  ),
};
