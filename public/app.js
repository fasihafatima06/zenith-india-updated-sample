const menuButton = document.querySelector("#menuButton");
const nav = document.querySelector("#primaryNav");
const tabs = document.querySelectorAll(".tab");
const productDemo = document.querySelector("#productDemo");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

const products = {
  fashion: {
    label: "Product lane",
    name: "Zenith Fashion",
    title: "AI fashion intelligence for styling and discovery.",
    body: "Sample journey for outfit guidance, occasion-based styling, palette recommendations, and shareable report cards.",
    audience: "Fashion shoppers and creators",
    output: "Style report and product suggestions",
    cta: "Try Zenith Fashion"
  },
  color: {
    label: "In-house AI system",
    name: "Colour Analysis AI",
    title: "Personal color analysis designed for Indian users.",
    body: "Sample flow for face scan, undertone detection, Western 12-season mapping, Korean 16-tone mapping, and Indian profile recommendations.",
    audience: "Creators, stylists, students, shoppers",
    output: "Palette report and shade guide",
    cta: "Generate my color report"
  },
  education: {
    label: "Learning product",
    name: "AIInsight and AI4Education",
    title: "AI learning systems for students, teachers, and institutions.",
    body: "Sample structure for course previews, certificates, AI literacy workshops, prompt engineering, and responsible AI training.",
    audience: "Students, educators, schools",
    output: "Courses, workshops, checklists",
    cta: "View learning programs"
  },
  automation: {
    label: "Business system",
    name: "AI automation",
    title: "Operational AI workflows for growing teams.",
    body: "Sample system for lead routing, workflow automation, internal AI assistants, dashboards, and measurable time savings.",
    audience: "Founders and operations teams",
    output: "Workflow map and dashboard",
    cta: "Book free consultation"
  }
};

function toggleMenu() {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

function renderProduct(key) {
  const product = products[key];

  productDemo.innerHTML = `
    <div class="demo-meta"><span>${product.label}</span><strong>${product.name}</strong></div>
    <h3>${product.title}</h3>
    <p>${product.body}</p>
    <dl>
      <div><dt>Audience</dt><dd>${product.audience}</dd></div>
      <div><dt>Output</dt><dd>${product.output}</dd></div>
      <div><dt>CTA</dt><dd>${product.cta}</dd></div>
    </dl>
  `;
}

async function submitLead(event) {
  event.preventDefault();
  formStatus.textContent = "Sending message...";

  const payload = Object.fromEntries(new FormData(contactForm).entries());

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Submission failed");
    }

    contactForm.reset();
    formStatus.textContent = "Message saved. The team can follow up from this lead.";
  } catch (error) {
    formStatus.textContent = error.message;
  }
}

menuButton.addEventListener("click", toggleMenu);
contactForm.addEventListener("submit", submitLead);

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    renderProduct(tab.dataset.system);
  });
});
