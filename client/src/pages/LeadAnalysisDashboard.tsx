import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

type Thread = {
  id: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
  messages: Array<{ id: string; threadId: string; from: string; to: string; subject: string; body: string; bodyText?: string; date: string }>;
};

function normalizeText(s: string) {
  return (s || "").toLowerCase();
}

function isOurAddress(addr: string) {
  const a = normalizeText(addr);
  return a.includes("@rendetalje.dk") || a.includes("info@rendetalje.dk");
}

function daysSince(dateIso: string) {
  const d = new Date(dateIso);
  const ms = Date.now() - d.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function extractSquareMeters(text: string) {
  const m = text.match(/(\d{2,4})\s*(?:m2|m²|kvadratmeter)/i);
  return m ? parseInt(m[1], 10) : undefined;
}

function extractFrequency(text: string) {
  const t = normalizeText(text);
  if (/ugentlig|hver uge/.test(t)) return "Ugentlig";
  if (/hver\s*14\s*dage|hver anden uge|biugentlig/.test(t)) return "Hver 14. dag";
  if (/månedlig|hver måned/.test(t)) return "Månedlig";
  if (/engangs|hovedrengøring/.test(t)) return "Engangs/Hovedrengøring";
  return undefined;
}

function determineTypeHeuristic(thread: Thread) {
  const text = thread.messages.map(m => normalizeText(m.bodyText || m.body || "")).join("\n");
  const fast = /fast\s*rengøring|løbende\s*rengøring|ugentlig/.test(text);
  const hoved = /hovedrengøring|engangs\s*rengøring/.test(text);
  if (fast && hoved) return "Begge";
  if (fast) return "Fast rengøring";
  if (hoved) return "Hovedrengøring";
  return "Ukendt";
}

function determineStatus(thread: Thread) {
  const msgs = thread.messages;
  if (msgs.length === 0) return "Inaktiv";
  const last = msgs[msgs.length - 1];
  const lastFromUs = isOurAddress(last.from || "");
  const d = daysSince(last.date);
  const declined = /ikke\s*interesseret|nej\s*tak|afviser/i.test(normalizeText(last.bodyText || last.body || ""));
  if (declined) return "Afvist/Ikke interesseret";
  if (!lastFromUs) return d > 14 ? "Inaktiv" : "Afventer svar fra os";
  return d > 14 ? "Inaktiv" : "Afventer svar fra kunde";
}

function estimateEnergy(squareMeters?: number, frequency?: string) {
  const w = frequency === "Ugentlig" ? 4 : frequency === "Hver 14. dag" ? 2 : frequency === "Månedlig" ? 1 : frequency === "Engangs/Hovedrengøring" ? 0.5 : 0.75;
  const m2 = squareMeters || 0;
  return Math.max(0.1, (m2 / 100) * w);
}

function trainNaiveBayes(samples: Array<{ text: string; label: string }>) {
  const vocab = new Map<string, number>();
  const labelCounts = new Map<string, number>();
  const wordLabelCounts = new Map<string, Map<string, number>>();
  samples.forEach(s => {
    labelCounts.set(s.label, (labelCounts.get(s.label) || 0) + 1);
    const tokens = s.text.split(/[^a-zæøå]+/);
    tokens.forEach(t => {
      if (!t) return;
      vocab.set(t, (vocab.get(t) || 0) + 1);
      const map = wordLabelCounts.get(t) || new Map<string, number>();
      map.set(s.label, (map.get(s.label) || 0) + 1);
      wordLabelCounts.set(t, map);
    });
  });
  const labels = Array.from(labelCounts.keys());
  const total = samples.length;
  return function classify(text: string) {
    const tokens = text.split(/[^a-zæøå]+/).filter(Boolean);
    const scores: Record<string, number> = {};
    labels.forEach(label => {
      let score = Math.log((labelCounts.get(label) || 1) / total);
      tokens.forEach(t => {
        const wl = wordLabelCounts.get(t);
        const count = wl?.get(label) || 0;
        const denom = (labelCounts.get(label) || 1) + vocab.size;
        const prob = (count + 1) / denom;
        score += Math.log(prob);
      });
      scores[label] = score;
    });
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : "Ukendt";
  };
}

export default function LeadAnalysisDashboard() {
  usePageTitle("Lead Analysis Dashboard");
  const [months, setMonths] = useState(3);
  const [keywords, setKeywords] = useState("rengøring \"fast rengøring\" hovedrengøring tilbud pris");
  const { start, end, query } = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - months);
    const toUnix = (d: Date) => Math.floor(d.getTime() / 1000);
    const q = `in:anywhere (${keywords.split(/\s+/).map(k => k).join(" OR ")}) after:${toUnix(start)} before:${toUnix(end)}`;
    return { start, end, query: q };
  }, [months, keywords]);

  const { data: threads = [], isFetching, refetch } = trpc.inbox.email.search.useQuery({ query, }, { refetchOnWindowFocus: false });

  const processed = useMemo(() => {
    const rows = threads.map(t => {
      const text = t.messages.map(m => normalizeText(m.bodyText || m.body || "")).join(" ");
      const typeHeu = determineTypeHeuristic(t as Thread);
      const bayes = trainNaiveBayes(threads.map(tt => ({ text: tt.messages.map(m => normalizeText(m.bodyText || m.body || "")).join(" "), label: determineTypeHeuristic(tt as Thread) })));
      const typeML = bayes(text);
      const status = determineStatus(t as Thread);
      const last = t.messages[t.messages.length - 1];
      const days = last ? daysSince(last.date) : 0;
      const sq = extractSquareMeters(text);
      const freq = extractFrequency(text);
      const energy = estimateEnergy(sq, freq);
      return { typeHeu, typeML, status, days, m2: sq || 0, freq: freq || "Ukendt", energy };
    });
    return rows;
  }, [threads]);

  const typeData = useMemo(() => {
    const groups: Record<string, number> = {};
    processed.forEach(r => {
      const k = r.typeML || r.typeHeu;
      groups[k] = (groups[k] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [processed]);

  const statusHistogram = useMemo(() => {
    const buckets: Record<string, number> = {};
    processed.forEach(r => {
      const b = r.days >= 28 ? ">=28" : r.days >= 21 ? "21-27" : r.days >= 14 ? "14-20" : r.days >= 7 ? "7-13" : "0-6";
      const key = `${r.status}:${b}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    const out = Object.entries(buckets).map(([key, value]) => {
      const [status, bucket] = key.split(":");
      return { status, bucket, value };
    });
    return out;
  }, [processed]);

  const scatterData = useMemo(() => {
    return processed.map(r => ({ x: r.m2, y: r.days, z: r.energy, status: r.status, type: r.typeML || r.typeHeu }));
  }, [processed]);

  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7", "#f59e0b", "#14b8a6"]; 

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <p className="text-sm">Måneder</p>
          <Input type="number" value={months} onChange={e => setMonths(Math.max(1, parseInt(e.target.value || "3", 10)))} />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm">Søgeord</p>
          <Input value={keywords} onChange={e => setKeywords(e.target.value)} />
        </div>
        <Button onClick={() => refetch()} disabled={isFetching}>Opdater</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategorisering (ML + heuristik)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="lead-type" config={{}} className="bg-muted rounded-xl">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statusfordeling pr. tidsbucket</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="lead-status" config={{}} className="bg-muted rounded-xl">
            <ResponsiveContainer>
              <BarChart data={statusHistogram}>
                <XAxis dataKey="bucket" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {Array.from(new Set(statusHistogram.map(d => d.status))).map((status, i) => (
                  <Bar key={status} dataKey="value" name={status} stackId={status} fill={colors[i % colors.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Energidimension: m² vs dage med energi som størrelse</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer id="lead-energy" config={{}} className="bg-muted rounded-xl">
            <ResponsiveContainer>
              <ScatterChart>
                <XAxis dataKey="x" name="m²" />
                <YAxis dataKey="y" name="dage" />
                <ZAxis dataKey="z" range={[60, 400]} />
                <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                <Scatter data={scatterData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

