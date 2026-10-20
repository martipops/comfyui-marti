// "Models" sidebar tab: download models from Civitai, Hugging Face or any link into models/.
import { api, app, type ComfySetting } from "../shared/comfy";
import { refreshModelFolder } from "../shared/modelFolder";
import { CIVITAI_TOKEN, HF_TOKEN, type Job } from "./api";
import { BLUR_NSFW, ModelsPanel } from "./panel";
import styles from "./styles.css";

export { styles as downloaderStyles };

const TOKEN_TOOLTIP = (env: string) =>
  `Only used when the server has no ${env} environment variable (on Vast, set ${env} on the instance instead).`;

export const downloaderSettings: ComfySetting[] = [
  {
    id: CIVITAI_TOKEN,
    category: ["Marti", "Models", "Civitai token"],
    name: "Civitai API token",
    tooltip: TOKEN_TOOLTIP("CIVITAI_TOKEN"),
    type: "text",
    defaultValue: "",
  },
  {
    id: HF_TOKEN,
    category: ["Marti", "Models", "HF token"],
    name: "Hugging Face token",
    tooltip: TOKEN_TOOLTIP("HF_TOKEN"),
    type: "text",
    defaultValue: "",
  },
  {
    id: BLUR_NSFW,
    category: ["Marti", "Models", "Blur NSFW"],
    name: "Blur NSFW thumbnails in Civitai search",
    tooltip: "Click a thumbnail to reveal it.",
    type: "boolean",
    defaultValue: true,
  },
];

function finished(job: Job) {
  void app.refreshComboInNodes?.();
  refreshModelFolder(job.folder);
  app.extensionManager?.toast?.add({
    severity: "success",
    summary: "Model downloaded",
    detail: `models/${job.folder}/${job.filename}`,
    life: 5000,
  });
}

export function setupDownloader() {
  const panel = new ModelsPanel(finished);
  api.addEventListener("marti.download", (e) => {
    const job = e.detail as Job;
    panel.updateJob(job);
    if (job.status === "error") {
      app.extensionManager?.toast?.add({ severity: "error", summary: "Download failed", detail: `${job.filename}: ${job.error}`, life: 8000 });
    }
  });
  app.extensionManager?.registerSidebarTab?.({
    id: "marti-models",
    icon: "pi pi-download",
    title: "Models",
    tooltip: "Download models",
    type: "custom",
    render(container) {
      container.append(panel.root);
      void panel.refresh();
    },
  });
}
