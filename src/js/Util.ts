export function escapeHtml(str: string) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"}[
        tag
        ] || tag)
  );
}

export function replaceNewlineWithBr(str: string) {
  return str.replace(
    /\r\n|\r|\n/g,
    "<br>"
  );
}
