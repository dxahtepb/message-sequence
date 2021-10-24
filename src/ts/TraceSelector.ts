import { settings } from "./Settings";
import { UpdateEvent } from "./Events/Update";

export function initTraceSelectors(document: Document) {
  document.querySelector<HTMLButtonElement>("#clear-button")
    ?.addEventListener("click", () => {
      const file_selector = document.querySelector<HTMLInputElement>("#file-selector")
      if (file_selector) {
        file_selector.value = ""
      }
      settings.dataFilePath = "";
      settings.readableFilePath = "";
      settings.apply();
      window.dispatchEvent(new UpdateEvent(settings));
    });

  document.querySelector<HTMLInputElement>("#file-selector")
    ?.addEventListener("change", (e: Event) => {
      settings.apply();
      window.dispatchEvent(new UpdateEvent(settings));
      if ((e.target as HTMLInputElement)?.value !== undefined) {
        (e.target as HTMLInputElement).value = '';
      }
    });
}
