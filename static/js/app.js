const $ = (id) => document.getElementById(id);
const toast = (message) => {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
};
const setStatus = (id, message) => { const el = $(id); if (el) el.textContent = message; };
const read = (id) => $(id).value;
const write = (id, value) => { $(id).value = value; };

const toolNames = {json:"JSON Studio",base64:"Base64 Converter",url:"URL Encoder",hash:"Hash Generator",uuid:"UUID Generator",jwt:"JWT Decoder",regex:"Regex Tester",api:"API Tester"};
function activateTool(name) {
  document.querySelectorAll(".tool-panel").forEach(p => p.classList.add("hidden"));
  $("tool-" + name).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.tool === name));
  $("crumb-current").textContent = toolNames[name]; $("page-title").innerHTML = `${toolNames[name].split(" ")[0]}<br><em>Developer tools.</em>`;
  $("page-subtitle").textContent = "A focused utility to help you build, inspect and debug faster.";
  $("sidebar").classList.remove("open");
}
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => activateTool(button.dataset.tool)));
$("mobile-menu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
$("theme-toggle").addEventListener("click", () => { document.body.classList.toggle("light"); localStorage.setItem("devtoolkit-theme", document.body.classList.contains("light") ? "light" : "dark"); });
if (localStorage.getItem("devtoolkit-theme") === "light") document.body.classList.add("light");

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast("Copied to clipboard"); }
  catch { toast("Clipboard unavailable — select and copy manually"); }
}
document.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) await copyText($(copyButton.dataset.copy).value);
  const copyTextButton = event.target.closest("[data-copy-text]");
  if (copyTextButton) await copyText($(copyTextButton.dataset.copyText).textContent.trim());
});

$("json-input").addEventListener("input", () => setStatus("json-input-count", `${read("json-input").length} characters`));
function formatJSON(minify=false) {
  try {
    const parsed = JSON.parse(read("json-input"));
    write("json-output", JSON.stringify(parsed, null, minify ? 0 : 2));
    setStatus("json-status", "✓ Valid JSON"); toast(minify ? "JSON minified" : "JSON formatted");
  } catch (error) { setStatus("json-status", `Invalid JSON: ${error.message}`); toast("Please fix the JSON syntax"); }
}
function base64EncodeUnicode(value) { const bytes = new TextEncoder().encode(value); let binary = ""; bytes.forEach(b => binary += String.fromCharCode(b)); return btoa(binary); }
function base64DecodeUnicode(value) { const binary = atob(value.trim()); const bytes = Uint8Array.from(binary, c => c.charCodeAt(0)); return new TextDecoder("utf-8", {fatal:true}).decode(bytes); }
async function generateHashes() {
  if (!window.crypto?.subtle) { setStatus("hash-status","Web Crypto requires HTTPS or localhost."); return; }
  const data = new TextEncoder().encode(read("hash-input"));
  for (const algorithm of ["SHA-256","SHA-384","SHA-512"]) {
    const digest = await crypto.subtle.digest(algorithm, data);
    $("hash-" + algorithm.split("-")[1]).textContent = [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  setStatus("hash-status","Hashes generated locally.");
}
function generateUUIDs() {
  const count = Number(read("uuid-count"));
  if (!crypto.randomUUID) { setStatus("uuid-status","UUID generation is not supported in this browser."); return; }
  write("uuid-output", Array.from({length:count},()=>crypto.randomUUID()).join("\n"));
  setStatus("uuid-status",`${count} UUID v4 identifiers generated.`);
}
function decodeBase64Url(part) {
  const normalized = part.replace(/-/g,"+").replace(/_/g,"/");
  const padded = normalized + "=".repeat((4-normalized.length%4)%4);
  return JSON.parse(base64DecodeUnicode(padded));
}
function decodeJWT() {
  try {
    const parts = read("jwt-input").trim().split(".");
    if (parts.length !== 3) throw new Error("A JWT must contain three dot-separated parts.");
    const header = decodeBase64Url(parts[0]); const payload = decodeBase64Url(parts[1]);
    $("jwt-header").textContent = JSON.stringify(header,null,2);
    $("jwt-payload").textContent = JSON.stringify(payload,null,2);
    setStatus("jwt-status","Decoded only. Signature and claims have NOT been verified.");
  } catch (error) { setStatus("jwt-status",`Could not decode token: ${error.message}`); }
}
function runRegex() {
  try {
    const regex = new RegExp(read("regex-pattern"),read("regex-flags"));
    const text = read("regex-input");
    const matches = [...text.matchAll(regex)];
    $("regex-results").textContent = matches.length ? matches.map((m,i)=>`${i+1}. "${m[0]}" — index ${m.index}`).join("\n") : "No matches found.";
    setStatus("regex-status",`${matches.length} match(es) found.`);
  } catch(error) { $("regex-results").textContent = error.message; setStatus("regex-status","Invalid regular expression or flags."); }
}
async function sendAPIRequest(button) {
  const url = read("api-url").trim(); const method = read("api-method");
  if (!url) { setStatus("api-status","Enter a request URL."); return; }
  let parsedURL;
  try { parsedURL = new URL(url); if (!["http:","https:"].includes(parsedURL.protocol)) throw new Error("Only HTTP and HTTPS URLs are allowed."); }
  catch(error) { setStatus("api-status",`Invalid URL: ${error.message}`); return; }
  let headers;
  try { headers = JSON.parse(read("api-headers") || "{}"); if (!headers || Array.isArray(headers) || typeof headers !== "object") throw new Error("Headers must be a JSON object."); }
  catch(error) { setStatus("api-status",`Invalid headers JSON: ${error.message}`); return; }
  const options = {method, headers};
  if (!["GET","HEAD"].includes(method) && read("api-body").trim()) {
    try { JSON.parse(read("api-body")); } catch(error) { setStatus("api-status",`Request body must be valid JSON: ${error.message}`); return; }
    options.body = read("api-body");
    if (!Object.keys(headers).some(k=>k.toLowerCase()==="content-type")) headers["Content-Type"]="application/json";
  }
  button.disabled = true; button.textContent = "Sending…"; setStatus("api-status","Request in progress…"); $("api-response").textContent="Waiting for response…";
  const started = performance.now();
  try {
    const response = await fetch(parsedURL.href,options);
    const body = await response.text(); const elapsed = Math.round(performance.now()-started);
    let formatted = body; try { formatted = JSON.stringify(JSON.parse(body),null,2); } catch {}
    $("api-response").textContent = formatted || "(Empty response)";
    setStatus("api-status",`${response.status} ${response.statusText}`);
    $("api-time").textContent = `${elapsed} ms`;
  } catch(error) {
    $("api-response").textContent = `${error.name}: ${error.message}\n\nThe server may be unavailable, or the target may block cross-origin browser requests (CORS).`;
    setStatus("api-status","Request failed");
    $("api-time").textContent = `${Math.round(performance.now()-started)} ms`;
  } finally { button.disabled=false; button.textContent="Send ↗"; }
}

const actions = {
 "json-format":()=>formatJSON(false), "json-minify":()=>formatJSON(true),
 "json-sample":()=>{write("json-input",JSON.stringify({name:"Adarsh Gupta",role:"CSE AI/ML Student",skills:["Python","JavaScript","HTML","CSS"],active:true},null,2));formatJSON(false);},
 "base64-encode":()=>{try{write("base64-output",base64EncodeUnicode(read("base64-input")));setStatus("base64-status","Encoded successfully.");}catch(e){setStatus("base64-status",e.message);}},
 "base64-decode":()=>{try{write("base64-output",base64DecodeUnicode(read("base64-input")));setStatus("base64-status","Decoded successfully.");}catch(e){setStatus("base64-status","Invalid Base64 or unsupported text encoding.");}},
 "base64-sample":()=>write("base64-input","Hello, DevToolkit Pro! नमस्ते"),
 "clear-base64":()=>{write("base64-input","");write("base64-output","");setStatus("base64-status","Cleared.");},
 "url-encode":()=>{write("url-output",encodeURIComponent(read("url-input")));setStatus("url-status","Encoded successfully.");},
 "url-decode":()=>{try{write("url-output",decodeURIComponent(read("url-input")));setStatus("url-status","Decoded successfully.");}catch{setStatus("url-status","Invalid URL encoding.");}},
 "hash-generate":generateHashes,"uuid-generate":generateUUIDs,"jwt-decode":decodeJWT,"regex-test":runRegex,
 "api-send":(button)=>sendAPIRequest(button)
};
document.addEventListener("click",event=>{const button=event.target.closest("[data-action]");if(button){const fn=actions[button.dataset.action];if(fn)fn(button);}});
fetch("/api/health").then(r=>r.ok?r.json():Promise.reject()).then(data=>{setStatus("server-status",`Server online · ${data.version}`);}).catch(()=>setStatus("server-status","Server status unavailable"));
