import {VERT_SPACE, X_PAD, Y_PAD} from "../Constants";

// Converts a screen Y position to SVG units which have a viewBox transform
function screenYtoSVGUnits(val: number) {
  const svg = document.getElementById("chart1") as SVGSVGElement | null;
  if (!svg) {
    throw "Cannot find #chart1 svg element";
  }
  let pt = svg.createSVGPoint();
  pt.x = 0;
  pt.y = val;
  pt = pt.matrixTransform(svg.getCTM()?.inverse());
  return pt.y;
}

export function applyStickyScrollForClass(window: Window, css_class: string) {
  window.addEventListener("scroll", () => {
    Array.from(document.getElementsByClassName(css_class)).forEach(
      (element, i) => {
        const x = X_PAD + i * VERT_SPACE;
        let y = Y_PAD;
        if (window.scrollY > Y_PAD) {
          y = screenYtoSVGUnits(window.scrollY);
        }
        element.setAttribute("transform", `translate(${x}, ${y})`);
      }
    );
  });
}
