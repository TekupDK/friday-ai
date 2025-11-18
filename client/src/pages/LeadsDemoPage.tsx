/**
 * Leads Demo Page - Customer Cards V5.1
 *
 * Demo page showcasing customer cards with live ChromaDB data
 */

import {
  Search,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { CustomerCard } from "@/components/leads/CustomerCardClean";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function LeadsDemoPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
    loadSampleLeads();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch("/api/leads/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }

  async function loadSampleLeads() {
    try {
      // Load some hot leads by default
      const response = await fetch("/api/leads/classify");
      const data = await response.json();
      const hotLeads = data.leads
        .filter((l: any) => l.classification === "hot")
        .slice(0, 10);
      setLeads(hotLeads);
      if (hotLeads.length > 0) {
        await selectLead(hotLeads[0].id);
      }
    } catch (error) {
      console.error("Failed to load leads:", error);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadSampleLeads();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/leads/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      const data = await response.json();
      setLeads(data.leads);
      if (data.leads.length > 0) {
        await selectLead(data.leads[0].id);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function selectLead(leadId: string) {
    try {
      // Fetch similar leads
      const similarResponse = await fetch(
        `/api/leads/${leadId}/similar?limit=3`
      );
      const similarData = await similarResponse.json();

      // Fetch classification
      const classifyResponse = await fetch("/api/leads/classify");
      const classifyData = await classifyResponse.json();
      const classification = classifyData.leads.find(
        (l: any) => l.id === leadId
      );

      setSelectedLead({
        lead: similarData.reference,
        similarLeads: similarData.similarLeads,
        winProbability: classification?.winProbability,
        recommendations: [
          "🔥 Priority follow-up within 24h",
          "📞 Schedule call to discuss service",
          "💰 Send quote with 10% discount offer",
          "📧 Add to weekly newsletter",
        ],
      });
    } catch (error) {
      console.error("Failed to select lead:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Cards V5.1 - AI-Powered Lead Intelligence
          </h1>
          <p className="text-gray-600">
            Complete lead overview with ChromaDB semantic search and AI
            recommendations
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("da-DK", {
                        style: "currency",
                        currency: "DKK",
                        minimumFractionDigits: 0,
                      }).format(stats.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Revenue</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("da-DK", {
                        style: "currency",
                        currency: "DKK",
                        minimumFractionDigits: 0,
                      }).format(stats.avgRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Data Quality</p>
                    <p className="text-2xl font-bold">
                      {stats.dataQuality.avgCompleteness.toFixed(0)}%
                    </p>
                  </div>
                  <Search className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Semantic Lead Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for leads... (e.g., 'villa flytterengøring', 'erhverv kontor')"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Lead List */}
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Leads ({leads.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {leads.map(lead => (
                    <button
                      key={lead.id}
                      onClick={() => selectLead(lead.id)}
                      className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                        selectedLead?.lead?.id === lead.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="font-medium">{lead.customerName}</div>
                      <div className="text-sm text-gray-600">{lead.status}</div>
                      {lead.winProbability && (
                        <div className="text-xs text-gray-500 mt-1">
                          Win Probability: {lead.winProbability}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Card */}
          <div className="col-span-8">
            {selectedLead ? (
              <CustomerCard {...selectedLead} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a lead to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadsDemoPage;
