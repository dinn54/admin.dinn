import * as all from "refractor";
console.log("Exports:", Object.keys(all));
try {
  const { refractor } = all;
  console.log("Named export refractor:", !!refractor);
} catch (e) {
  console.error(e);
}
try {
  console.log("Default export:", !!all.default);
} catch (e) {}
