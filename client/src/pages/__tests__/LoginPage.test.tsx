import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "../LoginPage";

import { ThemeProvider } from "@/contexts/ThemeContext";

const mutateAsyncSpy = vi.fn();
vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      login: {
        useMutation: (_opts: any) => ({
          mutateAsync: mutateAsyncSpy,
        }),
      },
    },
  },
}));

// Supabase client is optional; default to undefined in tests
vi.mock("@/lib/supabaseClient", () => ({ supabase: undefined }));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

// Stub canvas getContext to avoid jsdom not implemented errors
beforeAll(() => {
  // @ts-ignore
  global.HTMLCanvasElement.prototype.getContext = () => ({
    canvas:
      typeof document !== "undefined"
        ? document.createElement("canvas")
        : ({} as HTMLCanvasElement),
    save: () => {},
    restore: () => {},
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    shadowColor: "",
    shadowBlur: 0,
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    filter: "none",
  });
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsyncSpy.mockResolvedValueOnce(undefined);
  });

  it("renders and validates required fields", async () => {
    renderWithProviders(<LoginPage preview={false} />);

    // Trigger forgot password without email to surface validation
    fireEvent.click(screen.getByRole("button", { name: /Glemt adgangskode/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("submits with email/password and calls mutate", async () => {
    renderWithProviders(<LoginPage preview={false} />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/adgangskode/i), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^log ind$/i }));

    await waitFor(() => {
      expect(mutateAsyncSpy).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secret",
      });
    });
  });

  it("disables Google sign-in in preview mode", async () => {
    renderWithProviders(<LoginPage preview={true} />);

    const googleBtn = screen.getByRole("button", {
      name: /log ind med google/i,
    });
    expect(googleBtn).toBeDisabled();
  });
});
