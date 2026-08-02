"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { clearLocalDemoState, downloadDemoState, importDemoState, type DemoImportSummary } from "@/lib/demo-state-transfer";

function summaryText(summary: DemoImportSummary) { return `Imported ${summary.researchSnapshots} research, ${summary.orderAttempts} orders, ${summary.verificationEvents} verification events, ${summary.merchantPassport} merchant records, ${summary.savedItems} saved items, and ${summary.preferences} preference set.`; }

export function DemoStateTransferControls({ allowReset = false, compact = false }: { allowReset?: boolean; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [importing, setImporting] = useState(false);
  const chooseFile = () => input.current?.click();
  const importFile = async (file?: File) => { if (!file) return; setImporting(true); setError(undefined); setMessage(undefined); try { setMessage(summaryText(await importDemoState(file))); } catch (caught) { setError(caught instanceof Error ? caught.message : "Demo state could not be imported."); } finally { setImporting(false); if (input.current) input.current.value = ""; } };
  const reset = () => { if (!window.confirm("Clear all local TrustLane demo activity from this browser? This cannot be undone.")) return; clearLocalDemoState(); setError(undefined); setMessage("Local demo activity was cleared from this browser."); };
  return <div className={compact ? "" : "mt-4"}><div className="flex flex-wrap gap-2"><Button onClick={downloadDemoState} size={compact ? "sm" : "default"} type="button" variant="outline"><Download className="mr-2 size-4" />Export Demo State</Button><Button disabled={importing} onClick={chooseFile} size={compact ? "sm" : "default"} type="button" variant="outline"><Upload className="mr-2 size-4" />{importing ? "Importing…" : "Import Demo State"}</Button></div><input accept="application/json,.json" className="sr-only" onChange={(event) => void importFile(event.target.files?.[0])} ref={input} type="file" />{message && <p aria-live="polite" className="mt-3 text-xs leading-5 text-primary">{message}</p>}{error && <p aria-live="assertive" className="mt-3 text-xs leading-5 text-red-300">{error}</p>}{allowReset && <button className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:text-red-300 hover:underline" onClick={reset} type="button">Clear Local Demo Data</button>}</div>;
}
