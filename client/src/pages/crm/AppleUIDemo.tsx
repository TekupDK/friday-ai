/**
 * Apple UI Demo Page
 *
 * Showcase of Apple-inspired UI components
 */

import { ChevronRight, Mail, Plus, Search } from "lucide-react";
import React, { useState } from "react";

import {
  AppleButton,
  AppleCard,
  AppleInput,
  AppleSearchField,
} from "../../components/crm/apple-ui";

export const AppleUIDemo: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "34px",
          fontWeight: 700,
          marginBottom: "40px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'",
        }}
      >
        Apple UI Components Demo
      </h1>

      {/* Buttons Section */}
      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "24px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'",
          }}
        >
          Buttons
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <AppleButton variant="primary">Primary Button</AppleButton>
          <AppleButton variant="secondary">Secondary Button</AppleButton>
          <AppleButton variant="tertiary">Tertiary Button</AppleButton>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <AppleButton variant="primary" size="sm">
            Small
          </AppleButton>
          <AppleButton variant="primary" size="md">
            Medium
          </AppleButton>
          <AppleButton variant="primary" size="lg">
            Large
          </AppleButton>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <AppleButton variant="primary" leftIcon={<Plus size={16} />}>
            With Left Icon
          </AppleButton>
          <AppleButton variant="primary" rightIcon={<ChevronRight size={16} />}>
            With Right Icon
          </AppleButton>
          <AppleButton
            variant="primary"
            loading={loading}
            onClick={handleLoadingDemo}
          >
            {loading ? "Loading..." : "Click to Load"}
          </AppleButton>
          <AppleButton variant="primary" disabled>
            Disabled
          </AppleButton>
        </div>
      </section>

      {/* Cards Section */}
      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "24px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'",
          }}
        >
          Cards
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <AppleCard variant="elevated" hoverable>
            <h3
              style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}
            >
              Elevated Card
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "rgba(60, 60, 67, 0.6)",
              }}
            >
              Hover over me to see the lift effect
            </p>
          </AppleCard>

          <AppleCard variant="filled" hoverable>
            <h3
              style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}
            >
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
          </AppleCard>

          <AppleCard variant="glass" hoverable>
            <h3
              style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}
            >
              Glass Card
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "rgba(60, 60, 67, 0.6)",
              }}
            >
              Frosted glass effect
            </p>
          </AppleCard>

          <AppleCard variant="outlined" hoverable>
            <h3
              style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}
            >
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
          </AppleCard>
        </div>
      </section>

      {/* Inputs Section */}
      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "24px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'",
          }}
        >
          Inputs
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "400px",
          }}
        >
          <AppleInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail size={16} />}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            fullWidth
          />

          <AppleInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            helperText="Must be at least 8 characters"
            fullWidth
          />

          <AppleInput
            label="Error Example"
            type="text"
            placeholder="This field has an error"
            error="This field is required"
            fullWidth
          />

          <AppleSearchField
            placeholder="Search customers..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onClear={() => setSearchValue("")}
            fullWidth
          />
        </div>
      </section>

      {/* Interactive Demo */}
      <section>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "24px",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display'",
          }}
        >
          Interactive Demo
        </h2>

        <AppleCard variant="elevated" padding="lg">
          <h3
            style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: 600 }}
          >
            Customer Search
          </h3>

          <AppleSearchField
            placeholder="Search by name, email, or phone..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onClear={() => setSearchValue("")}
            fullWidth
          />

          {searchValue && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "15px", color: "rgba(60, 60, 67, 0.6)" }}>
                Searching for: <strong>{searchValue}</strong>
              </p>
            </div>
          )}

          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <AppleButton variant="primary" leftIcon={<Search size={16} />}>
              Search
            </AppleButton>
            <AppleButton variant="secondary" onClick={() => setSearchValue("")}>
              Clear
            </AppleButton>
          </div>
        </AppleCard>
      </section>
    </div>
  );
};
