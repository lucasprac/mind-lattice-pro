import React from 'react'

// Optimized ML Prediction Dashboard for the Machine Learning sidebar session
// Goals:
// - Single glance KPIs
// - Clear primary actions
// - Live status and errors
// - Accessible keyboard-first UX
// - Empty states with guidance
// - Progressive disclosure of advanced controls

// Local UI primitives (shadcn-like) expected in project
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Progress } from "../ui/progress"
import { Switch } from "../ui/switch"

// If icons lib exists; otherwise replace with text labels
const Icon = ({ label }: { label: string }) => <span aria-hidden>{label}</span>

export type PredictionItem = {
  id: string
  patientId?: string
  createdAt: string
  model: string
  inputSummary: string
  prediction: string
  confidence?: number
  meta?: Record<string, unknown>
}

export interface MLPredictionDashboardProps {
  // data
  recent?: PredictionItem[]
  isLoading?: boolean
  error?: string | null

  // callbacks
  onRunPrediction?: (payload: { patientId?: string; text?: string; model: string }) => void
  onBulkPredict?: (payload: { scope: "all" | "visible" | "selection"; model: string }) => void
  onExport?: (format: "csv" | "json") => void
  onCancel?: () => void
}

const DEFAULT_MODELS = [
  { id: "clinical-v1", label: "Clinical v1" },
  { id: "temporal-v2", label: "Temporal v2" },
  { id: "graph-v1", label: "Graph v1" },
]

export default function MLPredictionDashboard({
  recent = [],
  isLoading,
  error,
  onRunPrediction,
  onBulkPredict,
  onExport,
  onCancel,
}: MLPredictionDashboardProps) {
  const [model, setModel] = React.useState<string>(DEFAULT_MODELS[0]?.id)
  const [patientId, setPatientId] = React.useState<string>("")
  const [text, setText] = React.useState<string>("")
  const [advanced, setAdvanced] = React.useState<boolean>(false)

  const canRun = !isLoading && (!!patientId || text.trim().length > 0)

  return (
    <div className="space-y-4 p-2 sm:p-3" aria-live="polite">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">ML Predictions</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport?.("csv")}>Export CSV</Button>
          <Button variant="outline" size="sm" onClick={() => onExport?.("json")}>Export JSON</Button>
        </div>
      </header>

      <Card className="p-3 space-y-3" role="region" aria-label="Run prediction">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="patientId">Patient ID (optional)</Label>
            <Input id="patientId" placeholder="ex: P-102" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="freeText">Free text (optional)</Label>
            <Input id="freeText" placeholder="Symptoms, notes or context" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger aria-label="Select model"><SelectValue placeholder="Choose model" /></SelectTrigger>
              <SelectContent>
                {DEFAULT_MODELS.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="advanced" checked={advanced} onCheckedChange={setAdvanced} />
            <Label htmlFor="advanced">Advanced</Label>
          </div>

          <div className="flex gap-2 justify-end sm:justify-start">
            {!isLoading ? (
              <Button disabled={!canRun} onClick={() => onRunPrediction?.({ patientId: patientId || undefined, text: text || undefined, model })}>
                <Icon label="▶" /> Run
              </Button>
            ) : (
              <>
                <Button variant="destructive" onClick={() => onCancel?.()}><Icon label="■" /> Cancel</Button>
                <div className="flex-1" />
              </>
            )}
          </div>
        </div>

        {advanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-3">
            <div className="space-y-1">
              <Label htmlFor="threshold">Confidence threshold</Label>
              <Input id="threshold" type="number" min={0} max={1} step={0.05} defaultValue={0.5} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="batchSize">Batch size</Label>
              <Input id="batchSize" type="number" min={1} max={256} defaultValue={16} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="scope">Bulk scope</Label>
              <Select onValueChange={(v) => onBulkPredict?.({ scope: v as any, model })}>
                <SelectTrigger aria-label="Bulk scope"><SelectValue placeholder="Select scope" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="selection">Selection</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2" role="status" aria-label="Running prediction">
            <Progress value={66} />
            <p className="text-xs text-muted-foreground">Running model {model}…</p>
          </div>
        )}

        {error && (
          <div role="alert" className="text-sm text-red-600">{String(error)}</div>
        )}
      </Card>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card className="p-3">
            {recent.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="divide-y">
                {recent.map(item => (
                  <li key={item.id} className="py-2 grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-12 sm:col-span-3">
                      <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                      <div className="text-sm font-medium">{item.model}</div>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <div className="text-sm line-clamp-2" title={item.inputSummary}>{item.inputSummary}</div>
                      <div className="text-sm mt-1"><span className="font-semibold">Prediction:</span> {item.prediction}</div>
                    </div>
                    <div className="col-span-12 sm:col-span-3 flex items-center justify-between gap-2">
                      {typeof item.confidence === 'number' && (
                        <ConfidencePill value={item.confidence} />
                      )}
                      <Button variant="ghost" size="sm">Copy</Button>
                      <Button variant="outline" size="sm">Details</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="p-3 space-y-2">
            <p className="text-sm text-muted-foreground">Select a prediction from Recent to see details here.</p>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="p-3 space-y-2">
            <KPIGrid recent={recent} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-sm text-muted-foreground py-6 flex items-center justify-between">
      <div>
        <p>No predictions yet.</p>
        <p>Enter a Patient ID or text and press Run.</p>
      </div>
      <Button size="sm">View guide</Button>
    </div>
  )
}

function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const tone = value >= 0.8 ? "text-green-700 bg-green-100" : value >= 0.6 ? "text-yellow-700 bg-yellow-100" : "text-red-700 bg-red-100"
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${tone}`} aria-label={`Confidence ${pct}%`}>{pct}%</span>
  )
}

function KPIGrid({ recent }: { recent: PredictionItem[] }) {
  const total = recent.length
  const avgConf = recent.length ? Math.round(100 * (recent.reduce((s, r) => s + (r.confidence ?? 0), 0) / recent.length)) : 0
  const today = recent.filter(r => new Date(r.createdAt).toDateString() === new Date().toDateString()).length
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <KPICard label="Predictions" value={total} />
      <KPICard label="Avg confidence" value={`${avgConf}%`} />
      <KPICard label="Today" value={today} />
    </div>
  )
}

function KPICard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}
