import * as React from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react"
import { groupApi } from "@/lib/api"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, formatFrequency } from "@/lib/circl-utils"
import { cn } from "@/lib/utils"
import type { GroupFrequency } from "@/types"

export const Route = createFileRoute("/_app/groups/create")({
  head: () => ({
    meta: [
      { title: "Create a Circle — Circl" },
      { name: "description", content: "Design a savings circle: set size, contribution, frequency, and trust rules." },
      { property: "og:title", content: "Create a Circle — Circl" },
      { property: "og:description", content: "Launch a new savings circle on Circl." },
    ],
  }),
  component: CreateGroupPage,
})

const schema = z.object({
  groupName: z.string().min(3, "Give your circle a name").max(60),
  groupSize: z.number().int().min(3).max(30),
  numberOfCycles: z.number().int().min(3).max(30),
  contributionAmount: z.number().int().min(10).max(10000),
  groupFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  riskThreshold: z.number().int().min(0).max(100),
})
type FormValues = z.infer<typeof schema>

const STEPS = ["Basics", "Rules", "Trust & Start", "Review"] as const

function CreateGroupPage() {
  const [step, setStep] = React.useState(0)
  const navigate = useNavigate()
  const qc = useQueryClient()



  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      groupName: "",
      groupSize: 10,
      numberOfCycles: 10,
      contributionAmount: 200,
      groupFrequency: "MONTHLY",
      riskThreshold: 50,
    },
  })

  const values = form.watch()

  const create = useMutation({
    mutationFn: (v: FormValues) => groupApi.create({ ...v }),
    onSuccess: (g) => {
      qc.invalidateQueries({ queryKey: ["groups"] })
      toast.success("Your circle is ready")
      navigate({ to: "/groups/$id", params: { id: String(g.id) } })
    },
    onError: (e) => toast.error((e as Error).message ?? "Could not create circle"),
  })

  const stepFields: Record<number, (keyof FormValues)[]> = {
    0: ["groupName", "groupSize", "numberOfCycles"],
    1: ["contributionAmount", "groupFrequency"],
    2: ["riskThreshold"],
    3: [],
  }

  const next = async () => {
    const ok = await form.trigger(stepFields[step])
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const submit = form.handleSubmit((v) => create.mutate(v))

  return (
    <>
      <PageHeader
        title="Create a new Circle"
        description="Four short steps: name it, set the rules, pick trust, and launch."
        actions={<Button asChild variant="ghost"><Link to="/groups"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>}
      />

      <Stepper step={step} />

      <Card className="mt-6">
        <CardContent className="p-6 md:p-8">
          {step === 0 && (
            <div className="grid gap-6">
              <Field label="Circle name" error={form.formState.errors.groupName?.message}>
                <Input {...form.register("groupName")} placeholder="e.g. Brooklyn Baristas Circle" />
              </Field>
              <Field label={`Members: ${values.groupSize}`} hint="How many people will contribute each cycle">
                <Controller
                  name="groupSize"
                  control={form.control}
                  render={({ field }) => (
                    <Slider min={3} max={30} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                  )}
                />
              </Field>
              <Field label={`Cycles: ${values.numberOfCycles}`} hint="Usually matches the number of members">
                <Controller
                  name="numberOfCycles"
                  control={form.control}
                  render={({ field }) => (
                    <Slider min={3} max={30} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                  )}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6">
              <Field label="Contribution per cycle" error={form.formState.errors.contributionAmount?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    step={10}
                    className="pl-7 font-serif text-xl tabular-nums"
                    {...form.register("contributionAmount", { valueAsNumber: true })}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Pool per cycle: {formatCurrency(values.contributionAmount * values.groupSize)}</p>
              </Field>
              <Field label="Cadence">
                <Controller
                  name="groupFrequency"
                  control={form.control}
                  render={({ field }) => (
                    <RadioGroup className="grid grid-cols-3 gap-3" value={field.value} onValueChange={field.onChange}>
                      {(["DAILY", "WEEKLY", "MONTHLY"] as GroupFrequency[]).map((f) => (
                        <label
                          key={f}
                          className={cn(
                            "cursor-pointer rounded-xl border border-border bg-background px-4 py-3 text-center transition-colors",
                            field.value === f && "border-primary bg-primary/5",
                          )}
                        >
                          <RadioGroupItem value={f} className="sr-only" />
                          <span className="block font-serif text-lg font-semibold">{formatFrequency(f)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {f === "DAILY" ? "Fast turnover" : f === "WEEKLY" ? "Steady rhythm" : "Traditional"}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <Field label={`Trust threshold: ${values.riskThreshold}`} hint="Members below this score can't join without approval">
                <Controller
                  name="riskThreshold"
                  control={form.control}
                  render={({ field }) => (
                    <Slider min={0} max={100} step={5} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                  )}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Open to all</span><span>Balanced</span><span>Strict</span>
                </div>
              </Field>

            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <h3 className="font-serif text-xl font-semibold">Review your circle</h3>
              <dl className="grid gap-3 rounded-xl border border-border bg-background p-4 text-sm">
                <Row k="Name" v={values.groupName} />
                <Row k="Members" v={String(values.groupSize)} />
                <Row k="Cycles" v={String(values.numberOfCycles)} />
                <Row k="Contribution" v={formatCurrency(values.contributionAmount)} />
                <Row k="Cadence" v={formatFrequency(values.groupFrequency)} />
                <Row k="Trust threshold" v={`${values.riskThreshold}/100`} />

                <Row k="Total pool per cycle" v={formatCurrency(values.contributionAmount * values.groupSize)} />
              </dl>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>Continue <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button type="button" onClick={submit} disabled={create.isPending}>
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Launch circle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <li
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5",
              i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
            )}
          >
            <span className="tabular-nums">{i + 1}</span>
            <span className="hidden sm:inline">{label}</span>
          </li>
          {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
        </React.Fragment>
      ))}
    </ol>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium tabular-nums">{v}</dd>
    </div>
  )
}