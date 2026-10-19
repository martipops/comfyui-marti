// Pings ntfy when a queued job finishes or fails. ComfyUI sends these events only
// to the client that queued the prompt, so multiple open tabs don't double-notify.
import { api, app, getSetting, type ComfySetting } from "../shared/comfy";
import { type JobReport, ntfyBody, ntfyParams, ntfyUrl } from "./message";

const TOPIC = "Marti.Ntfy.Topic";
const SERVER = "Marti.Ntfy.Server";
const ATTACH = "Marti.Ntfy.Attach";

export const ntfySettings: ComfySetting[] = [
  {
    id: TOPIC,
    category: ["Marti", "ntfy", "Topic"],
    name: "ntfy topic",
    tooltip: "Notify this topic when a job finishes or fails. Leave empty to disable.",
    type: "text",
    defaultValue: "",
  },
  {
    id: SERVER,
    category: ["Marti", "ntfy", "Server"],
    name: "ntfy server",
    type: "text",
    defaultValue: "https://ntfy.sh",
  },
  {
    id: ATTACH,
    category: ["Marti", "ntfy", "Attach"],
    name: "Attach the result image",
    tooltip: "Uploads the job's main saved output to ntfy. Anyone who knows the topic can see it.",
    type: "boolean",
    defaultValue: true,
  },
];

interface ExecutionDetail {
  prompt_id?: string;
  node_type?: string;
  exception_message?: string;
}

interface OutputFile {
  filename: string;
  subfolder?: string;
  type?: string;
  mediaType?: string;
}

/** The parts of /api/jobs/{id} we read. */
interface Job {
  status?: string;
  preview_output?: OutputFile;
  workflow_id?: string;
}

interface Tracked {
  start: number;
  /** Fallback name if the workflow can't be matched by id later. */
  workflow?: string;
}

const workflows = () => app.extensionManager?.workflow;

/** Same matching the frontend uses: open tab whose graph id equals the job's workflow id. */
function workflowName(id: string | undefined): string | undefined {
  if (!id) return undefined;
  const matches = (workflows()?.openWorkflows ?? []).filter((w) => (w.activeState?.id ?? w.initialState?.id) === id);
  return matches.length === 1 ? matches[0].filename : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** execution_success arrives just before the job is moved into history, so poll briefly. */
async function fetchJob(id: string): Promise<Job | undefined> {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const res = await api.fetchApi(`/jobs/${encodeURIComponent(id)}`);
      if (res.ok) {
        const job = (await res.json()) as Job;
        if (job.status !== "pending" && job.status !== "in_progress") return job;
      }
    } catch {
      // retry
    }
    await sleep(250);
  }
  return undefined;
}

const viewUrl = (f: OutputFile) =>
  `/view?${new URLSearchParams({ filename: f.filename, subfolder: f.subfolder ?? "", type: f.type ?? "output" })}`;

/** The job's thumbnail as ComfyUI picks it (saved outputs before previews), if it's a saved visual file. */
function attachment(job: Job | undefined): OutputFile | undefined {
  const preview = job?.preview_output;
  if (!preview || preview.type !== "output" || preview.mediaType === "text") return undefined;
  return preview;
}

async function publish(report: JobReport, file: OutputFile | undefined) {
  const server = String(getSetting(SERVER) ?? "");
  const topic = String(getSetting(TOPIC) ?? "");
  const params = ntfyParams(report);
  const message = ntfyBody(report);

  if (file && getSetting(ATTACH) !== false) {
    try {
      const image = await api.fetchApi(viewUrl(file));
      const url = ntfyUrl(server, topic, { ...params, message, filename: file.filename });
      if (url && image.ok) {
        const res = await fetch(url, { method: "PUT", body: await image.blob() });
        if (res.ok) return;
      }
    } catch (e) {
      console.warn("[marti] ntfy attachment failed, sending text only", e);
    }
  }

  const url = ntfyUrl(server, topic, params);
  if (url) await fetch(url, { method: "POST", body: message });
}

export function setupNtfy() {
  const tracked = new Map<string, Tracked>();
  const detailOf = (e: CustomEvent) => (e.detail ?? {}) as ExecutionDetail;

  const finish = async (detail: ExecutionDetail, ok: boolean) => {
    const id = detail.prompt_id ?? "";
    const info = tracked.get(id);
    tracked.delete(id);
    if (!String(getSetting(TOPIC) ?? "").trim()) return;

    const job = id ? await fetchJob(id) : undefined;
    const report: JobReport = {
      ok,
      workflow: workflowName(job?.workflow_id) ?? info?.workflow,
      durationMs: info ? Date.now() - info.start : undefined,
      nodeType: detail.node_type,
      error: detail.exception_message?.trim(),
    };
    await publish(report, ok ? attachment(job) : undefined);
  };

  const run = (fn: () => Promise<void>) => fn().catch((e) => console.warn("[marti] ntfy failed", e));

  api.addEventListener("execution_start", (e) => {
    const id = detailOf(e).prompt_id;
    if (id) tracked.set(id, { start: Date.now(), workflow: workflows()?.activeWorkflow?.filename });
  });
  api.addEventListener("execution_success", (e) => run(() => finish(detailOf(e), true)));
  api.addEventListener("execution_error", (e) => run(() => finish(detailOf(e), false)));
}
