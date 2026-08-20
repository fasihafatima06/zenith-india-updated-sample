const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const LEADS_FILE = path.join(__dirname, "leads.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();

      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function isValidLead(lead) {
  return Boolean(
    lead &&
    typeof lead.name === "string" &&
    typeof lead.email === "string" &&
    typeof lead.interest === "string" &&
    lead.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)
  );
}

function saveLead(lead) {
  const existing = fs.existsSync(LEADS_FILE)
    ? JSON.parse(fs.readFileSync(LEADS_FILE, "utf8"))
    : [];

  const cleanLead = {
    name: lead.name.trim(),
    email: lead.email.trim().toLowerCase(),
    interest: lead.interest.trim(),
    company: String(lead.company || "").trim(),
    message: String(lead.message || "").trim(),
    createdAt: new Date().toISOString()
  };

  existing.push(cleanLead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(existing, null, 2));
  return cleanLead;
}

async function handleContact(request, response) {
  try {
    const payload = JSON.parse((await readBody(request)) || "{}");

    if (!isValidLead(payload)) {
      sendJson(response, 400, { error: "Please enter a valid name, email, and project interest." });
      return;
    }

    sendJson(response, 201, { ok: true, lead: saveLead(payload) });
  } catch (error) {
    sendJson(response, 500, { error: "Could not save this enquiry." });
  }
}

function serveStatic(request, response) {
  const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/contact") {
    handleContact(request, response);
    return;
  }

  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Zenith updated sample running at http://localhost:${PORT}`);
});
