const colors = {
  background: "#F5F3EE",
  sand: "#E7DDCA",
  oliveDeep: "#5A604B",
  terracottaDeep: "#8A6240",
  ink: "#232824",
  white: "#FFFFFF",
  // Map palette (lib/map-style.ts): small labels must pass AA on every surface they sit on.
  mapLand: "#EEF2DC",
  mapResidential: "#E6EAD6",
  mapWood: "#CFE3AE",
  mapPark: "#C9E2A8",
  mapWater: "#B6DAEE",
  mapOcean: "#A8D3EC",
  mapLabel: "#2F352D",
  mapLabelSoft: "#4F5749",
  mapWaterLabel: "#22526B",
  mapPoi: "#5E6B4E",
  mapShieldText: "#3D4339",
};

function luminance(hex) {
  const channels = hex.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16) / 255);
  const linear = channels.map((part) => part <= 0.04045 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

const pairs = [
  ["ink", "background"],
  ["ink", "sand"],
  ["background", "ink"],
  ["white", "ink"],
  ["background", "oliveDeep"],
  ["oliveDeep", "background"],
  ["terracottaDeep", "background"],
  ["oliveDeep", "sand"],
  ["mapLabel", "mapPark"],
  ["mapLabelSoft", "mapLand"],
  ["mapLabelSoft", "mapResidential"],
  ["mapLabelSoft", "mapWood"],
  ["mapLabelSoft", "mapPark"],
  ["mapWaterLabel", "mapWater"],
  ["mapWaterLabel", "mapOcean"],
  ["mapPoi", "white"],
  ["mapShieldText", "white"],
];
let failed = false;
for (const [front, back] of pairs) {
  const values = [luminance(colors[front]), luminance(colors[back])].sort((a, b) => b - a);
  const ratio = (values[0] + 0.05) / (values[1] + 0.05);
  console.log(`${front} on ${back}: ${ratio.toFixed(2)}:1 ${ratio >= 4.5 ? "PASS" : "FAIL"}`);
  failed ||= ratio < 4.5;
}
// White text over the final image's 56% black scrim, assuming white pixels behind it.
const worstScrim = "#707070";
const scrimRatio = (luminance(colors.white) + 0.05) / (luminance(worstScrim) + 0.05);
console.log(`white on final-image scrim over white: ${scrimRatio.toFixed(2)}:1 ${scrimRatio >= 4.5 ? "PASS" : "FAIL"}`);
failed ||= scrimRatio < 4.5;
if (failed) process.exitCode = 1;
