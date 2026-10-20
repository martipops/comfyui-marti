// The Models sidebar tab: paste a link or search Civitai, pick a folder, download on the server.
import { getSetting } from "../shared/comfy";
import { h } from "../shared/dom";
import {
  CIVITAI_TOKEN,
  HF_TOKEN,
  type Job,
  type Resolved,
  type SearchItem,
  type Status,
  cancelDownload,
  clearDownloads,
  getStatus,
  resolveLink,
  searchCivitai,
  startDownload,
} from "./api";
import {
  CIVITAI_SORTS,
  CIVITAI_TYPES,
  civitaiLink,
  civitaiThumb,
  formatBytes,
  formatCount,
  isActive,
  isNsfwLevel,
  progressFraction,
  progressText,
} from "./format";

export const BLUR_NSFW = "Marti.Models.BlurNsfw";

const SOURCE_LABEL: Record<Resolved["source"], string> = { civitai: "Civitai", hf: "Hugging Face", url: "Direct link" };

const select = (options: [string, string][], label: string) =>
  h("select.md-select", { "aria-label": label }, ...options.map(([value, text]) => h("option", { value }, text)));

interface JobView {
  el: HTMLElement;
  bar: HTMLElement;
  text: HTMLElement;
  cancel: HTMLButtonElement;
}

export class ModelsPanel {
  readonly root = h("div.mt-root.md-panel");

  // link
  private readonly linkInput = h("input.md-input", {
    type: "text", placeholder: "Civitai or Hugging Face link", spellcheck: false, autocomplete: "off",
  });
  private readonly checkBtn = h("button.mt-btn", { type: "submit" }, "Check");
  private readonly tokens = h("div.md-tokens");
  private readonly preview = h("div.md-card.md-preview", { hidden: true });
  private readonly linkError = h("div.md-error", { hidden: true });

  // downloads
  private readonly jobsSection = h("section.md-section", { hidden: true });
  private readonly jobList = h("div.md-jobs");
  private readonly jobViews = new Map<string, JobView>();
  private readonly jobs = new Map<string, Job>();

  // search
  private readonly searchInput = h("input.md-input", {
    type: "search", placeholder: "Search Civitai", spellcheck: false, autocomplete: "off",
  });
  private readonly typeSelect = select(CIVITAI_TYPES, "Model type");
  private readonly sortSelect = select(CIVITAI_SORTS, "Sort");
  private readonly results = h("div.md-results");
  private readonly searchStatus = h("div.md-muted", { hidden: true });
  private readonly moreBtn = h("button.mt-btn.md-more", { type: "button", hidden: true }, "Load more");

  private status: Status | null = null;
  private lastFolder = "";
  private resolveSeq = 0;
  private searchSeq = 0;
  private nextCursor: string | null = null;
  private searched = false;

  constructor(private readonly onFinished: (job: Job) => void) {
    const linkForm = h("form.md-row", {}, this.linkInput, this.checkBtn);
    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      void this.check();
    });
    this.linkInput.addEventListener("paste", () => setTimeout(() => void this.check(), 0));

    const clearBtn = h("button.mt-btn", { type: "button" }, "Clear finished");
    clearBtn.addEventListener("click", async () => {
      const { jobs } = await clearDownloads();
      this.setJobs(jobs);
    });
    this.jobsSection.append(h("div.md-heading", {}, h("span", {}, "Downloads"), clearBtn), this.jobList);

    const searchForm = h("form.md-row", {}, this.searchInput, h("button.mt-btn", { type: "submit" }, "Search"));
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      void this.search(false);
    });
    for (const sel of [this.typeSelect, this.sortSelect]) {
      sel.addEventListener("change", () => this.searched && void this.search(false));
    }
    this.moreBtn.addEventListener("click", () => void this.search(true));

    this.root.append(
      h("section.md-section", {},
        h("div.md-heading", {}, h("span", {}, "Download a model")),
        linkForm, this.tokens, this.linkError, this.preview),
      this.jobsSection,
      h("section.md-section", {},
        h("div.md-heading", {}, h("span", {}, "Search Civitai")),
        searchForm,
        h("div.md-row", {}, this.typeSelect, this.sortSelect),
        this.results, this.searchStatus, this.moreBtn),
    );
  }

  /** Called whenever the tab opens: settings may have changed, and jobs may have finished meanwhile. */
  async refresh() {
    try {
      this.status = await getStatus();
      this.setJobs(this.status.jobs);
    } catch (e) {
      this.showLinkError(`Model download API unavailable: ${(e as Error).message}`);
    }
    this.renderTokens();
  }

  updateJob(job: Job) {
    const previous = this.jobs.get(job.id);
    this.jobs.set(job.id, job);
    this.renderJob(job);
    if (job.status === "done" && previous?.status !== "done") {
      this.onFinished(job);
      // the file now exists; the preview's "Already downloaded" state may be stale
      if (this.preview.dataset.filename === job.filename) void this.check();
    }
  }

  // ---- link --------------------------------------------------------------

  private renderTokens() {
    const env = this.status?.env;
    const describe = (label: string, inEnv: boolean | undefined, setting: string) => {
      const fromSettings = String(getSetting(setting) ?? "").trim() !== "";
      const state = inEnv ? "server token" : fromSettings ? "token from Settings" : "no token";
      return h(`span.md-token${inEnv || fromSettings ? ".md-ok" : ""}`,
        { title: inEnv ? "Read from the server's environment" : "Set one in Settings → Marti → Models" },
        `${label}: ${state}`);
    };
    this.tokens.replaceChildren(
      describe("Civitai", env?.civitai, CIVITAI_TOKEN),
      describe("HF", env?.hf, HF_TOKEN),
    );
  }

  private showLinkError(message: string | null) {
    this.linkError.textContent = message ?? "";
    this.linkError.hidden = !message;
  }

  private async check() {
    const url = this.linkInput.value.trim();
    if (!url) return;
    const seq = ++this.resolveSeq;
    this.checkBtn.disabled = true;
    this.showLinkError(null);
    this.preview.hidden = true;
    try {
      if (!this.status) await this.refresh();
      const item = await resolveLink(url);
      if (seq === this.resolveSeq) this.renderPreview(url, item);
    } catch (e) {
      if (seq === this.resolveSeq) this.showLinkError((e as Error).message);
    } finally {
      if (seq === this.resolveSeq) this.checkBtn.disabled = false;
    }
  }

  private renderPreview(url: string, item: Resolved) {
    const folders = this.status?.folders ?? [];
    const folder = h("select.md-select", { "aria-label": "Folder" },
      ...folders.map((f) => h("option", { value: f }, f)));
    folder.value = item.folder ?? (folders.includes(this.lastFolder) ? this.lastFolder : folders[0] ?? "");
    const filename = h("input.md-input", { type: "text", value: item.filename, spellcheck: false, "aria-label": "File name" });
    const note = h("div.md-note");
    const download = h("button.mt-btn.md-primary", { type: "button" }, "Download");

    const sync = () => {
      const exists = filename.value === item.filename && item.exists.includes(folder.value);
      note.textContent = exists ? `Already in models/${folder.value}` : "";
      note.hidden = !exists;
      download.disabled = exists || !filename.value.trim() || !folder.value;
    };
    folder.addEventListener("change", sync);
    filename.addEventListener("input", sync);
    sync();

    download.addEventListener("click", async () => {
      download.disabled = true;
      this.showLinkError(null);
      try {
        this.lastFolder = folder.value;
        this.updateJob(await startDownload(url, folder.value, filename.value.trim()));
        this.preview.hidden = true;
        this.linkInput.value = "";
      } catch (e) {
        this.showLinkError((e as Error).message);
        download.disabled = false;
      }
    });

    const title = item.page
      ? h("a.md-title", { href: item.page, target: "_blank", rel: "noopener noreferrer" }, item.name)
      : h("div.md-title", {}, item.name);
    const meta = [SOURCE_LABEL[item.source], formatBytes(item.size), item.sha256 ? "checksum ✓" : ""].filter(Boolean).join(" · ");

    this.preview.dataset.filename = item.filename;
    this.preview.replaceChildren(
      title,
      h("div.md-muted", {}, meta),
      h("label.md-field", {}, h("span", {}, "Folder"), folder),
      h("label.md-field", {}, h("span", {}, "Save as"), filename),
      note,
      download,
    );
    this.preview.hidden = false;
  }

  // ---- downloads -----------------------------------------------------------

  private setJobs(jobs: Job[]) {
    const ids = new Set(jobs.map((j) => j.id));
    for (const id of [...this.jobs.keys()]) {
      if (!ids.has(id)) {
        this.jobs.delete(id);
        this.jobViews.get(id)?.el.remove();
        this.jobViews.delete(id);
      }
    }
    for (const job of jobs) {
      this.jobs.set(job.id, job);
      this.renderJob(job);
    }
    this.jobsSection.hidden = this.jobs.size === 0;
  }

  private renderJob(job: Job) {
    let view = this.jobViews.get(job.id);
    if (!view) {
      const bar = h("div.md-bar-fill");
      const text = h("div.md-job-text");
      const cancel = h("button.mt-icon-btn", { type: "button", title: "Cancel", "aria-label": "Cancel download" }, "×");
      cancel.addEventListener("click", () => void cancelDownload(job.id));
      const el = h("div.md-job", {},
        h("div.md-job-head", {},
          h("div.md-job-name", { title: job.name }, job.name),
          cancel),
        h("div.md-muted.md-ellipsis", { title: `models/${job.folder}/${job.filename}` }, `${job.folder}/${job.filename}`),
        h("div.md-bar", {}, bar),
        text);
      view = { el, bar, text, cancel };
      this.jobViews.set(job.id, view);
      this.jobList.prepend(el);
    }
    const fraction = progressFraction(job);
    view.el.dataset.status = job.status;
    view.bar.style.width = fraction == null ? "100%" : `${fraction * 100}%`;
    view.bar.classList.toggle("md-indeterminate", fraction == null && isActive(job.status));
    view.text.textContent = progressText(job);
    view.cancel.hidden = !isActive(job.status);
    this.jobsSection.hidden = false;
  }

  // ---- search ----------------------------------------------------------------

  private async search(more: boolean) {
    const seq = ++this.searchSeq;
    this.searched = true;
    this.moreBtn.hidden = true;
    this.setSearchStatus("Searching…");
    if (!more) {
      this.nextCursor = null;
      this.results.replaceChildren();
    }
    try {
      const page = await searchCivitai(this.searchInput.value, this.typeSelect.value, this.sortSelect.value, more ? this.nextCursor ?? "" : "");
      if (seq !== this.searchSeq) return;
      this.results.append(...page.items.map((item) => this.renderResult(item)));
      this.nextCursor = page.nextCursor;
      this.moreBtn.hidden = !page.nextCursor;
      this.setSearchStatus(this.results.childElementCount ? "" : "No models found");
    } catch (e) {
      if (seq === this.searchSeq) this.setSearchStatus((e as Error).message);
    }
  }

  private setSearchStatus(text: string) {
    this.searchStatus.textContent = text;
    this.searchStatus.hidden = !text;
  }

  private renderResult(item: SearchItem): HTMLElement {
    const thumb = item.thumb
      ? h("img.md-thumb", { src: civitaiThumb(item.thumb.url), alt: "", loading: "lazy", referrerpolicy: "no-referrer" })
      : h("div.md-thumb");
    if (item.thumb && isNsfwLevel(item.thumb.nsfwLevel) && getSetting(BLUR_NSFW) !== false) {
      thumb.classList.add("md-blur");
      thumb.title = "Click to reveal";
      thumb.addEventListener("click", () => thumb.classList.remove("md-blur"), { once: true });
    }

    const version = h("select.md-select", { "aria-label": "Version" },
      ...item.versions.map((v) => h("option", { value: v.id }, [v.name, v.baseModel].filter(Boolean).join(" · "))));
    const sizeText = h("span", {}, formatBytes(item.versions[0]?.size));
    version.addEventListener("change", () => {
      sizeText.textContent = formatBytes(item.versions.find((v) => String(v.id) === version.value)?.size);
    });

    const use = h("button.mt-btn.md-primary", { type: "button" }, "Get");
    use.addEventListener("click", () => {
      this.linkInput.value = civitaiLink(item.id, Number(version.value));
      this.root.scrollTo({ top: 0, behavior: "smooth" });
      void this.check();
    });

    const page = civitaiLink(item.id, item.versions[0].id);
    return h("div.md-card.md-result", {},
      thumb,
      h("div.md-result-body", {},
        h("a.md-title", { href: page, target: "_blank", rel: "noopener noreferrer", title: item.name }, item.name),
        h("div.md-muted", {},
          [item.type, item.creator && `by ${item.creator}`, `↓ ${formatCount(item.downloads)}`].filter(Boolean).join(" · ")),
        item.versions.length > 1 ? version : h("div.md-muted", {}, version.options[0]?.textContent ?? ""),
        h("div.md-row.md-result-actions", {}, h("span.md-muted", {}, sizeText), use)));
  }
}
