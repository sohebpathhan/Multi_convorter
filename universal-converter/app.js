const unitCategories = {
  length: {
    title: "Length",
    eyebrow: "Distance and size",
    icon: "ruler",
    units: {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      mile: 1609.344,
      yard: 0.9144,
      foot: 0.3048,
      inch: 0.0254,
      "nautical mile": 1852
    },
    defaults: ["meter", "foot"]
  },
  mass: {
    title: "Weight",
    eyebrow: "Mass and weight",
    icon: "scale",
    units: {
      kilogram: 1,
      gram: 0.001,
      milligram: 0.000001,
      metric_ton: 1000,
      pound: 0.45359237,
      ounce: 0.028349523125,
      stone: 6.35029318
    },
    labels: { metric_ton: "metric ton" },
    defaults: ["kilogram", "pound"]
  },
  temperature: {
    title: "Temperature",
    eyebrow: "Heat and weather",
    icon: "temp",
    units: {
      celsius: "Celsius",
      fahrenheit: "Fahrenheit",
      kelvin: "Kelvin"
    },
    defaults: ["celsius", "fahrenheit"],
    convert(value, from, to) {
      const celsius =
        from === "celsius" ? value : from === "fahrenheit" ? (value - 32) * (5 / 9) : value - 273.15;
      if (to === "celsius") return celsius;
      if (to === "fahrenheit") return celsius * (9 / 5) + 32;
      return celsius + 273.15;
    }
  },
  volume: {
    title: "Volume",
    eyebrow: "Liquid and capacity",
    icon: "beaker",
    units: {
      liter: 1,
      milliliter: 0.001,
      "cubic meter": 1000,
      "us gallon": 3.785411784,
      "us quart": 0.946352946,
      "us pint": 0.473176473,
      "us cup": 0.2365882365,
      "fluid ounce": 0.0295735295625
    },
    defaults: ["liter", "us gallon"]
  },
  area: {
    title: "Area",
    eyebrow: "Surface measure",
    icon: "area",
    units: {
      "square meter": 1,
      "square kilometer": 1000000,
      "square centimeter": 0.0001,
      "square foot": 0.09290304,
      "square inch": 0.00064516,
      acre: 4046.8564224,
      hectare: 10000
    },
    defaults: ["square meter", "square foot"]
  },
  speed: {
    title: "Speed",
    eyebrow: "Movement rate",
    icon: "speed",
    units: {
      "meter per second": 1,
      "kilometer per hour": 0.2777777778,
      "mile per hour": 0.44704,
      knot: 0.514444444,
      "foot per second": 0.3048
    },
    defaults: ["kilometer per hour", "mile per hour"]
  },
  time: {
    title: "Time",
    eyebrow: "Duration",
    icon: "clock",
    units: {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2629800,
      year: 31557600
    },
    defaults: ["hour", "minute"]
  },
  data: {
    title: "Data",
    eyebrow: "Digital storage",
    icon: "database",
    units: {
      bit: 0.125,
      byte: 1,
      kilobyte: 1000,
      megabyte: 1000000,
      gigabyte: 1000000000,
      terabyte: 1000000000000,
      kibibyte: 1024,
      mebibyte: 1048576,
      gibibyte: 1073741824,
      tebibyte: 1099511627776
    },
    defaults: ["megabyte", "mebibyte"]
  },
  currency: {
    title: "Currency",
    eyebrow: "Offline sample rates",
    icon: "currency",
    units: {
      USD: 1,
      EUR: 1.085,
      GBP: 1.27,
      INR: 0.012,
      JPY: 0.0064,
      CAD: 0.73,
      AUD: 0.66,
      SGD: 0.74,
      AED: 0.2723
    },
    defaults: ["USD", "INR"]
  }
};

const specialCategories = {
  color: { title: "Color", eyebrow: "HEX, RGB, HSL", icon: "palette" },
  number: { title: "Number Base", eyebrow: "Binary and hex", icon: "hash" },
  text: { title: "Text", eyebrow: "Case and encoding", icon: "text" },
  file: { title: "File", eyebrow: "Files and media", icon: "file" }
};

const icons = {
  ruler: '<path d="m4 15 11-11 5 5L9 20z" /><path d="m14 5 1.5 1.5M11.5 7.5 13 9M9 10l1.5 1.5M6.5 12.5 8 14" />',
  scale: '<path d="M12 3v18M6 7h12M6 7l-3 6h6zM18 7l-3 6h6z" />',
  temp: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z" />',
  beaker: '<path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3" /><path d="M7 15h10" />',
  area: '<path d="M4 4h16v16H4z" /><path d="M8 4v16M16 4v16M4 8h16M4 16h16" />',
  speed: '<path d="M4 14a8 8 0 0 1 16 0" /><path d="m12 14 4-4" /><path d="M12 18h.01" />',
  clock: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M12 7v5l3 2" />',
  database: '<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />',
  currency: '<path d="M12 2v20M17 6.5c-1-1-2.7-1.5-5-1.5-3 0-5 1.4-5 3.5s2 3 5 3 5 .9 5 3-2 3.5-5 3.5c-2.4 0-4.2-.6-5.2-1.8" />',
  palette: '<path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.6c-.9 0-1.4 1-1 1.8l.3.6c.7 1.5-.4 3.1-2 3.4-.9.1-1.8.2-2.7.2Z" /><path d="M7 10h.01M10 7h.01M14 7h.01M17 10h.01" />',
  hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18" />',
  text: '<path d="M4 6V4h16v2M12 4v16M8 20h8" />',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" />'
};

const targetFormats = {
  image: ["png", "jpeg", "webp"],
  text: ["txt", "json", "csv", "html", "md"],
  audio: ["mp3", "wav", "aac", "ogg", "flac", "m4a"],
  video: ["mp4", "webm", "mov", "mkv", "avi", "gif", "mp3", "wav"],
  document: ["pdf", "docx", "html", "txt", "md", "odt", "rtf"],
  archive: ["pdf", "txt"],
  universal: ["pdf", "docx", "png", "jpeg", "webp", "mp4", "mp3", "wav", "txt"]
};

const state = {
  category: "length",
  inputSide: "from",
  numberBase: 10,
  selectedFile: null,
  history: JSON.parse(localStorage.getItem("converterHistory") || "[]")
};

const elements = {
  nav: document.querySelector("#categoryNav"),
  search: document.querySelector("#searchInput"),
  title: document.querySelector("#categoryTitle"),
  eyebrow: document.querySelector("#categoryEyebrow"),
  fromValue: document.querySelector("#fromValue"),
  toValue: document.querySelector("#toValue"),
  fromUnit: document.querySelector("#fromUnit"),
  toUnit: document.querySelector("#toUnit"),
  primaryResult: document.querySelector("#primaryResult"),
  formula: document.querySelector("#formulaText"),
  quickResults: document.querySelector("#quickResults"),
  historyList: document.querySelector("#historyList"),
  historyCount: document.querySelector("#historyCount"),
  currencyNote: document.querySelector("#currencyNote"),
  unitConverter: document.querySelector("#unitConverter"),
  colorConverter: document.querySelector("#colorConverter"),
  numberConverter: document.querySelector("#numberConverter"),
  textConverter: document.querySelector("#textConverter"),
  fileConverter: document.querySelector("#fileConverter"),
  colorInput: document.querySelector("#colorInput"),
  colorPreview: document.querySelector("#colorPreview"),
  colorResults: document.querySelector("#colorResults"),
  numberInput: document.querySelector("#numberInput"),
  numberResults: document.querySelector("#numberResults"),
  textInput: document.querySelector("#textInput"),
  textResults: document.querySelector("#textResults"),
  fileInput: document.querySelector("#fileInput"),
  fileSummary: document.querySelector("#fileSummary"),
  targetFormat: document.querySelector("#targetFormat"),
  apiEndpoint: document.querySelector("#apiEndpoint"),
  convertFileBtn: document.querySelector("#convertFileBtn"),
  downloadFileLink: document.querySelector("#downloadFileLink"),
  fileStatus: document.querySelector("#fileStatus"),
  toast: document.querySelector("#toast")
};

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Invalid";
  if (Math.abs(value) >= 1e9 || (Math.abs(value) > 0 && Math.abs(value) < 0.000001)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8
  }).format(Number(value.toPrecision(12)));
}

function unitLabel(category, unit) {
  const config = unitCategories[category];
  return config.labels?.[unit] || unit;
}

function titleCase(text) {
  return text
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function unitToBase(category, value, from, to) {
  const config = unitCategories[category];
  if (config.convert) return config.convert(value, from, to);
  return (value * config.units[from]) / config.units[to];
}

function conversionFactor(category, from, to) {
  const config = unitCategories[category];
  if (config.convert) return null;
  return config.units[from] / config.units[to];
}

function renderNav() {
  const query = elements.search.value.trim().toLowerCase();
  const items = { ...unitCategories, ...specialCategories };
  elements.nav.innerHTML = "";

  Object.entries(items)
    .filter(([key, item]) => `${key} ${item.title} ${item.eyebrow}`.toLowerCase().includes(query))
    .forEach(([key, item]) => {
      const button = document.createElement("button");
      button.className = `nav-btn${state.category === key ? " active" : ""}`;
      button.type = "button";
      button.dataset.category = key;
      button.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 24 24">${icons[item.icon]}</svg>
        <span>${item.title}</span>
        <small>${item.eyebrow}</small>
      `;
      elements.nav.append(button);
    });
}

function setModeVisibility() {
  const modeMap = {
    color: elements.colorConverter,
    number: elements.numberConverter,
    text: elements.textConverter,
    file: elements.fileConverter
  };
  elements.unitConverter.classList.toggle("hidden", !unitCategories[state.category]);
  Object.entries(modeMap).forEach(([key, element]) => {
    element.classList.toggle("hidden", state.category !== key);
  });
}

function setCategory(category) {
  state.category = category;
  const config = unitCategories[category] || specialCategories[category];
  elements.title.textContent = config.title;
  elements.eyebrow.textContent = config.eyebrow;
  setModeVisibility();
  renderNav();

  if (unitCategories[category]) {
    populateUnits();
    convertUnits("from");
  } else if (category === "color") {
    convertColor();
  } else if (category === "number") {
    convertNumber();
  } else if (category === "text") {
    convertText();
  } else {
    prepareFileConverter();
  }
}

function populateUnits() {
  const config = unitCategories[state.category];
  const [fromDefault, toDefault] = config.defaults;
  const options = Object.keys(config.units)
    .map((unit) => `<option value="${unit}">${titleCase(unitLabel(state.category, unit))}</option>`)
    .join("");
  elements.fromUnit.innerHTML = options;
  elements.toUnit.innerHTML = options;
  elements.fromUnit.value = fromDefault;
  elements.toUnit.value = toDefault;
  elements.currencyNote.classList.toggle("hidden", state.category !== "currency");
}

function convertUnits(source = state.inputSide) {
  const from = elements.fromUnit.value;
  const to = elements.toUnit.value;
  const sourceInput = source === "from" ? elements.fromValue : elements.toValue;
  const targetInput = source === "from" ? elements.toValue : elements.fromValue;
  const sourceUnit = source === "from" ? from : to;
  const targetUnit = source === "from" ? to : from;
  const value = Number(sourceInput.value);

  if (!Number.isFinite(value)) {
    targetInput.value = "";
    return;
  }

  const converted = unitToBase(state.category, value, sourceUnit, targetUnit);
  targetInput.value = Number(converted.toPrecision(12));

  const forward = unitToBase(state.category, Number(elements.fromValue.value), from, to);
  const fromLabel = titleCase(unitLabel(state.category, from));
  const toLabel = titleCase(unitLabel(state.category, to));
  elements.primaryResult.value = `${formatNumber(Number(elements.fromValue.value))} ${fromLabel} = ${formatNumber(forward)} ${toLabel}`;

  const factor = conversionFactor(state.category, from, to);
  elements.formula.textContent = factor
    ? `Multiply by ${formatNumber(factor)}`
    : "Uses the standard temperature conversion formula";

  renderQuickConversions(Number(elements.fromValue.value), from);
  pushHistory(elements.primaryResult.value);
}

function renderQuickConversions(value, from) {
  const config = unitCategories[state.category];
  const entries = Object.keys(config.units)
    .filter((unit) => unit !== from)
    .slice(0, 5)
    .map((unit) => {
      const converted = unitToBase(state.category, value, from, unit);
      return `<div class="quick-item"><strong>${formatNumber(converted)}</strong><span>${titleCase(unitLabel(state.category, unit))}</span></div>`;
    });
  elements.quickResults.innerHTML = entries.join("");
}

function pushHistory(label) {
  if (!label || label.includes("Invalid")) return;
  const latest = state.history[0];
  if (latest?.label === label) return;
  state.history.unshift({ label, category: state.category, time: new Date().toLocaleTimeString() });
  state.history = state.history.slice(0, 8);
  localStorage.setItem("converterHistory", JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  elements.historyCount.textContent = state.history.length;
  elements.historyList.innerHTML =
    state.history
      .map(
        (item) =>
          `<button class="history-item" type="button" data-history="${item.label}"><strong>${item.label}</strong><span>${titleCase(item.category)} at ${item.time}</span></button>`
      )
      .join("") || '<div class="history-item"><strong>No conversions yet</strong><span>Recent results appear here</span></div>';
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const int = parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      max === rn
        ? (gn - bn) / d + (gn < bn ? 6 : 0)
        : max === gn
          ? (bn - rn) / d + 2
          : (rn - gn) / d + 4;
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function convertColor() {
  const hex = elements.colorInput.value.toUpperCase();
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  elements.colorPreview.style.background = hex;
  const rows = [
    ["HEX", hex],
    ["RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`],
    ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`]
  ];
  elements.colorResults.innerHTML = rows
    .map(([label, value]) => `<button class="result-item" type="button" data-copy="${value}"><strong>${value}</strong><span>${label}</span></button>`)
    .join("");
  elements.primaryResult.value = `${hex} converts to rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  elements.formula.textContent = "HEX channels are converted from base 16 to decimal";
  elements.quickResults.innerHTML = rows
    .map(([label, value]) => `<div class="quick-item"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
  pushHistory(elements.primaryResult.value);
}

function convertNumber() {
  const raw = elements.numberInput.value.trim();
  const parsed = parseInt(raw, state.numberBase);
  if (!raw || Number.isNaN(parsed)) {
    elements.numberResults.innerHTML = '<div class="result-item"><strong>Invalid number</strong><span>Check the selected input base</span></div>';
    elements.primaryResult.value = "Invalid number";
    return;
  }

  const rows = [
    ["Decimal", parsed.toString(10)],
    ["Binary", parsed.toString(2)],
    ["Octal", parsed.toString(8)],
    ["Hexadecimal", parsed.toString(16).toUpperCase()]
  ];
  elements.numberResults.innerHTML = rows
    .map(([label, value]) => `<button class="result-item" type="button" data-copy="${value}"><strong>${value}</strong><span>${label}</span></button>`)
    .join("");
  elements.primaryResult.value = `${raw} base ${state.numberBase} = ${parsed.toString(10)} decimal`;
  elements.formula.textContent = "Digits are parsed in the selected base and re-encoded";
  elements.quickResults.innerHTML = rows
    .map(([label, value]) => `<div class="quick-item"><strong>${value}</strong><span>${label}</span></div>`)
    .join("");
  pushHistory(elements.primaryResult.value);
}

function convertText() {
  const text = elements.textInput.value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const rows = [
    ["Uppercase", text.toUpperCase()],
    ["Lowercase", text.toLowerCase()],
    ["Title Case", text.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())],
    ["Base64", btoa(unescape(encodeURIComponent(text)))],
    ["URL Encoded", encodeURIComponent(text)]
  ];
  elements.textResults.innerHTML = rows
    .map(([label, value]) => `<button class="result-item" type="button" data-copy="${value}"><strong>${value || "Empty"}</strong><span>${label}</span></button>`)
    .join("");
  elements.primaryResult.value = `${text.length} characters, ${words} words`;
  elements.formula.textContent = "Text transforms run locally in your browser";
  elements.quickResults.innerHTML = [
    `<div class="quick-item"><strong>${text.length}</strong><span>Characters</span></div>`,
    `<div class="quick-item"><strong>${words}</strong><span>Words</span></div>`,
    `<div class="quick-item"><strong>${new Blob([text]).size}</strong><span>UTF-8 bytes</span></div>`
  ].join("");
  pushHistory(elements.primaryResult.value);
}

function fileKind(file) {
  if (!file) return "universal";
  const name = file.name.toLowerCase();
  const extension = name.split(".").pop() || "";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("text/") || ["txt", "csv", "json", "md", "html", "xml", "css", "js"].includes(extension)) {
    return "text";
  }
  if (["pdf", "doc", "docx", "odt", "rtf", "ppt", "pptx", "xls", "xlsx"].includes(extension)) return "document";
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) return "archive";
  return "universal";
}

function setFileStatus(message) {
  elements.fileStatus.textContent = message;
  elements.formula.textContent = message;
}

function prepareFileConverter() {
  const file = state.selectedFile;
  const kind = fileKind(file);
  const formats = targetFormats[kind] || targetFormats.universal;
  const previousFormat = elements.targetFormat.value;
  elements.targetFormat.innerHTML = formats.map((format) => `<option value="${format}">${format.toUpperCase()}</option>`).join("");
  if (formats.includes(previousFormat)) elements.targetFormat.value = previousFormat;
  elements.apiEndpoint.value = localStorage.getItem("converterApiEndpoint") || window.CONVERTER_API_URL || "";
  elements.downloadFileLink.classList.add("hidden");
  elements.downloadFileLink.removeAttribute("href");

  if (!file) {
    elements.fileSummary.textContent = "Images and text convert locally. Video, audio, and documents use the AWS API.";
    elements.primaryResult.value = "Choose a file to convert";
    setFileStatus("Select a file to see supported target formats.");
    elements.quickResults.innerHTML = [
      '<div class="quick-item"><strong>Images</strong><span>PNG, JPEG, WebP locally</span></div>',
      '<div class="quick-item"><strong>Media</strong><span>MP4, MP3, WAV, WebM through FFmpeg API</span></div>',
      '<div class="quick-item"><strong>Documents</strong><span>PDF, DOCX, HTML, TXT through conversion API</span></div>'
    ].join("");
    return;
  }

  const size = formatBytes(file.size);
  elements.fileSummary.textContent = `${file.name} - ${size} - detected as ${kind}`;
  elements.primaryResult.value = `${file.name} ready for ${elements.targetFormat.value.toUpperCase()}`;
  setFileStatus(kind === "image" || kind === "text" ? "This file can convert locally when possible." : "This file type will be sent to the configured AWS conversion API.");
  elements.quickResults.innerHTML = formats
    .slice(0, 6)
    .map((format) => `<div class="quick-item"><strong>${format.toUpperCase()}</strong><span>${kind} target</span></div>`)
    .join("");
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${formatNumber(bytes / 1024 ** index)} ${units[index]}`;
}

function outputName(file, format) {
  const base = file.name.replace(/\.[^.]+$/, "");
  return `${base}.${format}`;
}

function downloadBlob(blob, filename) {
  const previousUrl = elements.downloadFileLink.href;
  if (previousUrl && previousUrl.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
  const url = URL.createObjectURL(blob);
  elements.downloadFileLink.href = url;
  elements.downloadFileLink.download = filename;
  elements.downloadFileLink.classList.remove("hidden");
  elements.downloadFileLink.textContent = `Download ${filename}`;
  elements.primaryResult.value = `${filename} created`;
  pushHistory(elements.primaryResult.value);
}

async function convertImageLocally(file, format) {
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = imageUrl;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  URL.revokeObjectURL(imageUrl);
  const mime = format === "jpeg" ? "image/jpeg" : `image/${format}`;
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.92));
  if (!blob) throw new Error("The browser could not create that image format.");
  downloadBlob(blob, outputName(file, format));
}

async function convertTextFileLocally(file, format) {
  const text = await file.text();
  let output = text;
  let mime = "text/plain";

  if (format === "json") {
    output = JSON.stringify({ file: file.name, content: text }, null, 2);
    mime = "application/json";
  } else if (format === "csv") {
    output = text
      .split(/\r?\n/)
      .map((line) => `"${line.replaceAll('"', '""')}"`)
      .join("\n");
    mime = "text/csv";
  } else if (format === "html") {
    output = `<!doctype html><html><body><pre>${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</pre></body></html>`;
    mime = "text/html";
  } else if (format === "md") {
    output = `# ${file.name}\n\n\`\`\`\n${text}\n\`\`\`\n`;
    mime = "text/markdown";
  }

  downloadBlob(new Blob([output], { type: mime }), outputName(file, format));
}

async function convertFileWithApi(file, format, endpoint) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("targetFormat", format);

  const response = await fetch(`${endpoint.replace(/\/$/, "")}/convert`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Conversion API returned ${response.status}`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  downloadBlob(blob, match?.[1] || outputName(file, format));
}

async function convertSelectedFile() {
  const file = state.selectedFile;
  const format = elements.targetFormat.value;
  const kind = fileKind(file);
  const endpoint = elements.apiEndpoint.value.trim();

  if (!file) {
    showToast("Choose a file first");
    return;
  }

  localStorage.setItem("converterApiEndpoint", endpoint);
  elements.convertFileBtn.disabled = true;
  setFileStatus("Converting...");

  try {
    if (kind === "image" && targetFormats.image.includes(format)) {
      await convertImageLocally(file, format);
      setFileStatus("Converted locally in your browser.");
    } else if (kind === "text" && targetFormats.text.includes(format)) {
      await convertTextFileLocally(file, format);
      setFileStatus("Converted locally in your browser.");
    } else {
      if (!endpoint) throw new Error("Add your AWS conversion API endpoint for this file type.");
      await convertFileWithApi(file, format, endpoint);
      setFileStatus("Converted with the AWS conversion API.");
    }
    showToast("File converted");
  } catch (error) {
    setFileStatus(error.message);
    elements.primaryResult.value = "File conversion failed";
    showToast("Conversion failed");
  } finally {
    elements.convertFileBtn.disabled = false;
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    showToast("Copied to clipboard");
  } catch {
    showToast("Copy failed");
  }
}

elements.nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

elements.search.addEventListener("input", renderNav);

elements.fromValue.addEventListener("input", () => {
  state.inputSide = "from";
  convertUnits("from");
});
elements.toValue.addEventListener("input", () => {
  state.inputSide = "to";
  convertUnits("to");
});
elements.fromUnit.addEventListener("change", () => convertUnits(state.inputSide));
elements.toUnit.addEventListener("change", () => convertUnits(state.inputSide));

document.querySelector("#swapBtn").addEventListener("click", () => {
  if (!unitCategories[state.category]) return;
  [elements.fromUnit.value, elements.toUnit.value] = [elements.toUnit.value, elements.fromUnit.value];
  convertUnits("from");
});

document.querySelector("#copyBtn").addEventListener("click", () => copyText(elements.primaryResult.value));

document.querySelector("#themeBtn").addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem("converterTheme", isDark ? "light" : "dark");
});

document.querySelector("#clearHistoryBtn").addEventListener("click", () => {
  state.history = [];
  localStorage.removeItem("converterHistory");
  renderHistory();
});

elements.colorInput.addEventListener("input", convertColor);
elements.numberInput.addEventListener("input", convertNumber);
elements.textInput.addEventListener("input", convertText);
elements.fileInput.addEventListener("change", () => {
  state.selectedFile = elements.fileInput.files?.[0] || null;
  prepareFileConverter();
});
elements.targetFormat.addEventListener("change", prepareFileConverter);
elements.apiEndpoint.addEventListener("change", () => {
  localStorage.setItem("converterApiEndpoint", elements.apiEndpoint.value.trim());
});
elements.convertFileBtn.addEventListener("click", convertSelectedFile);

document.querySelector(".segmented").addEventListener("click", (event) => {
  const button = event.target.closest("[data-base]");
  if (!button) return;
  state.numberBase = Number(button.dataset.base);
  document.querySelectorAll(".segmented button").forEach((item) => item.classList.toggle("active", item === button));
  convertNumber();
});

document.addEventListener("click", (event) => {
  const copyTarget = event.target.closest("[data-copy]");
  if (copyTarget) copyText(copyTarget.dataset.copy);
});

document.documentElement.dataset.theme = localStorage.getItem("converterTheme") || "light";
renderHistory();
renderNav();
setCategory("length");
