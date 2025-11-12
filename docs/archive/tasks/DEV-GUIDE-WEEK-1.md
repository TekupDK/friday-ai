# 🚀 UGE 1: Foundation Implementation Guide

## 📅 Dag 1-2: Code Splitting & Lazy Loading

### 🎯 Task 1.1: Add Lazy Loading

**File:** `client/src/pages/ChatInterface.tsx`

**Changes:**

```typescript
// ADD imports at top
import { lazy, Suspense } from 'react';

// REPLACE direct imports with lazy
const AIAssistantPanel = lazy(() => import('@/components/panels/AIAssistantPanel'));
const EmailCenterPanel = lazy(() => import('@/components/panels/EmailCenterPanel'));
const WorkflowPanel = lazy(() => import('@/components/panels/WorkflowPanel'));

// CREATE loading skeleton component
const PanelSkeleton = ({ name }: { name: string }) => (
  <div className="h-full flex items-center justify-center bg-muted/10">
    <div className="space-y-3 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 animate-pulse" />
      <p className="text-sm text-muted-foreground">Loading {name}...</p>
    </div>
  </div>
);

// WRAP each panel with Suspense
<ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
  <Suspense fallback={<PanelSkeleton name="AI Assistant" />}>
    <AIAssistantPanel />
  </Suspense>
</ResizablePanel>
```

**Test:**

```bash
npm run build
# Check bundle sizes in dist/assets
# AI chunk should be ~150KB
# Email chunk should be ~280KB
```

---

### 🎯 Task 1.2: Error Boundaries

**File:** `client/src/components/PanelErrorBoundary.tsx` (NEW)

```typescript
import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[${this.props.name} Panel Error]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">{this.props.name} Panel Error</h3>
              <p className="text-sm text-muted-foreground">
                This panel encountered an error. Other panels continue working.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
              <Button onClick={() => window.location.reload()} size="sm">
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage in ChatInterface.tsx:**

```typescript
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';

// Wrap each panel
<ResizablePanel>
  <Suspense fallback={<PanelSkeleton name="AI Assistant" />}>
    <PanelErrorBoundary name="AI Assistant">
      <AIAssistantPanel />
    </PanelErrorBoundary>
  </Suspense>
</ResizablePanel>
```

**Test:**

```typescript
// Simulate error in AIAssistantPanel
throw new Error("Test error");
// Should show error UI, other panels still work
```

---

## 📅 Dag 3-4: Testing Setup

### 🎯 Task 1.3: Unit Test Templates

**File:** `client/src/components/panels/__tests__/AIAssistantPanel.test.tsx` (NEW)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAssistantPanel from '../AIAssistantPanel';

describe('AIAssistantPanel', () => {
  it('renders chat mode by default', () => {
    render(<AIAssistantPanel />);
    const chatTab = screen.getByRole('tab', { name: /chat/i });
    expect(chatTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to voice mode on click', async () => {
    render(<AIAssistantPanel />);
    const voiceTab = screen.getByRole('tab', { name: /voice/i });

    await userEvent.click(voiceTab);

    expect(voiceTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/voice interface/i)).toBeInTheDocument();
  });

  it('shows agent management in agent mode', async () => {
    render(<AIAssistantPanel />);

    await userEvent.click(screen.getByRole('tab', { name: /agent/i }));

    expect(screen.getByText(/ai agents/i)).toBeInTheDocument();
  });
});
```

**Run tests:**

```bash
npm test -- AIAssistantPanel.test
```

---

### 🎯 Task 1.4: Integration Tests

**File:** `client/src/pages/__tests__/ChatInterface.integration.test.tsx` (NEW)

```typescript
import { render, screen } from '@testing-library/react';
import ChatInterface from '../ChatInterface';

// Mock panels to avoid heavy dependencies
jest.mock('@/components/panels/AIAssistantPanel', () => ({
  default: () => <div>AI Panel Mock</div>
}));

jest.mock('@/components/panels/EmailCenterPanel', () => ({
  default: () => <div>Email Panel Mock</div>
}));

jest.mock('@/components/panels/WorkflowPanel', () => ({
  default: () => <div>Workflow Panel Mock</div>
}));

describe('ChatInterface 3-Panel Layout', () => {
  it('renders all three panels on desktop', async () => {
    render(<ChatInterface />);

    await waitFor(() => {
      expect(screen.getByText('AI Panel Mock')).toBeInTheDocument();
      expect(screen.getByText('Email Panel Mock')).toBeInTheDocument();
      expect(screen.getByText('Workflow Panel Mock')).toBeInTheDocument();
    });
  });

  it('shows only AI panel on mobile', () => {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(<ChatInterface />);

    expect(screen.getByText('AI Panel Mock')).toBeVisible();
  });
});
```

---

## 📅 Dag 5: 50% Test Coverage

### 🎯 Task 1.5: Coverage Check

**Run coverage:**

```bash
npm test -- --coverage --watchAll=false
```

**Target Files:**

- AIAssistantPanel.tsx: 80%+
- EmailCenterPanel.tsx: 60%+
- WorkflowPanel.tsx: 50%+
- ChatInterface.tsx: 70%+
- PanelErrorBoundary.tsx: 90%+

**Coverage Report:**

```text
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
AIAssistantPanel.tsx          |   82.5  |   75.0   |   100   |   83.3
EmailCenterPanel.tsx          |   65.0  |   50.0   |   100   |   66.7
WorkflowPanel.tsx             |   55.0  |   40.0   |   75.0  |   57.1
ChatInterface.tsx             |   72.0  |   60.0   |   85.0  |   73.5
PanelErrorBoundary.tsx        |   95.0  |   100    |   100   |   95.0
------------------------------|---------|----------|---------|--------
TOTAL                         |   73.9  |   65.0   |   92.0  |   75.1
```

---

## ✅ Uge 1 Checklist

**Mandag-Tirsdag:**

- [ ] Lazy loading implemented
- [ ] Bundle size verified (<150KB initial)
- [ ] Loading skeletons working
- [ ] Panel memoization added

**Onsdag-Torsdag:**

- [ ] Error boundaries created
- [ ] Error recovery tested
- [ ] Logging configured
- [ ] Unit tests written

**Fredag:**

- [ ] Integration tests passing
- [ ] 50%+ coverage achieved
- [ ] Code review completed
- [ ] PR merged to main

---

## 📊 Success Criteria Uge 1

**Performance:**

- ✅ Initial bundle: <150KB
- ✅ Panel load time: <500ms
- ✅ No errors in console

**Testing:**

- ✅ 50%+ test coverage
- ✅ All critical paths tested
- ✅ CI/CD passing

**Quality:**

- ✅ No TypeScript errors
- ✅ No accessibility warnings
- ✅ Code review approved
