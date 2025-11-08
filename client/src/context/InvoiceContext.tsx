import type { BillyInvoice } from "@/../../shared/types";
import { createContext, ReactNode, useContext, useState } from "react";

export interface InvoiceContextType {
  selectedInvoice: BillyInvoice | null;
  setSelectedInvoice: (invoice: BillyInvoice | null) => void;
  aiAnalysis: string;
  setAiAnalysis: (analysis: string) => void;
  analyzingInvoice: boolean;
  setAnalyzingInvoice: (analyzing: boolean) => void;
  currentAnalysisId: string | null;
  setCurrentAnalysisId: (id: string | null) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<BillyInvoice | null>(
    null
  );
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzingInvoice, setAnalyzingInvoice] = useState<boolean>(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null
  );

  return (
    <InvoiceContext.Provider
      value={{
        selectedInvoice,
        setSelectedInvoice,
        aiAnalysis,
        setAiAnalysis,
        analyzingInvoice,
        setAnalyzingInvoice,
        currentAnalysisId,
        setCurrentAnalysisId,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoiceContext must be used within an InvoiceProvider");
  }
  return context;
};
