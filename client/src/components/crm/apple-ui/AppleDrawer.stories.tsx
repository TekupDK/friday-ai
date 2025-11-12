import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AppleButton } from "./AppleButton";
import { AppleDrawer } from "./AppleDrawer";

const meta = {
  title: "CRM/Apple UI/AppleDrawer",
  component: AppleDrawer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppleDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ padding: "20px" }}>
          <AppleButton onClick={() => setIsOpen(true)}>Open Drawer</AppleButton>
        </div>
        <AppleDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Drawer Title"
        >
          <div style={{ padding: "20px" }}>
            <p>Drawer content goes here</p>
            <p>Click the backdrop or X button to close</p>
          </div>
        </AppleDrawer>
      </>
    );
  },
};

export const LeftSide: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ padding: "20px" }}>
          <AppleButton onClick={() => setIsOpen(true)}>
            Open Left Drawer
          </AppleButton>
        </div>
        <AppleDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Left Drawer"
          side="left"
        >
          <div style={{ padding: "20px" }}>
            <p>This drawer slides in from the left</p>
          </div>
        </AppleDrawer>
      </>
    );
  },
};

export const CustomWidth: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <div style={{ padding: "20px" }}>
          <AppleButton onClick={() => setIsOpen(true)}>
            Open Narrow Drawer
          </AppleButton>
        </div>
        <AppleDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Narrow Drawer"
          width={600}
        >
          <div style={{ padding: "20px" }}>
            <p>This drawer is only 600px wide</p>
          </div>
        </AppleDrawer>
      </>
    );
  },
};
