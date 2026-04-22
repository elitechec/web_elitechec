const WHATSAPP_PLACEHOLDER = "593000000000";
const EMAIL_PLACEHOLDER = "configura@tuempresa.com";
const LOGO_PATH_PLACEHOLDER = "/assets/logoV1.jpg";

const DEFAULT_CONFIG = {
  whatsappNumber: WHATSAPP_PLACEHOLDER,
  whatsappDefaultMessage: "Hola ELITECH_EC, deseo informacion sobre servicios y equipos.",
  whatsappSupportMessage: "Hola ELITECH_EC, necesito soporte tecnico y comercial.",
  contactEmail: EMAIL_PLACEHOLDER,
  logoPath: LOGO_PATH_PLACEHOLDER
};

const FALLBACK_CATALOG_ITEMS = [
  {
    name: "Switch Gestionable PoE 24 Puertos",
    category: "networking",
    group: "featured",
    brand: "Cisco Business",
    price: "Consulte precio",
    copy: "Backbone estable para redes empresariales con crecimiento modular.",
    tag: "LAN"
  },
  {
    name: "Access Point Wi-Fi 6 Empresarial",
    category: "networking",
    group: "featured",
    brand: "Ubiquiti",
    price: "Consulte precio",
    copy: "Cobertura inalambrica de alto rendimiento para oficinas y planta.",
    tag: "WLAN"
  },
  {
    name: "Kit CCTV IP 8 Canales",
    category: "seguridad",
    group: "featured",
    brand: "Hikvision",
    price: "Consulte precio",
    copy: "Videovigilancia de alta definicion con monitoreo remoto seguro.",
    tag: "CCTV"
  },
  {
    name: "Control de Acceso Biometrico",
    category: "seguridad",
    group: "featured",
    brand: "ZKTeco",
    price: "Consulte precio",
    copy: "Gestion de ingresos con historial de eventos y perfiles por usuario.",
    tag: "Access"
  },
  {
    name: "Radio Portatil Profesional UHF",
    category: "radio",
    group: "featured",
    brand: "Motorola",
    price: "Consulte precio",
    copy: "Comunicacion robusta para seguridad, eventos y operacion industrial.",
    tag: "UHF"
  },
  {
    name: "Landing Page Comercial Premium",
    category: "web",
    group: "discount",
    brand: "ELITECH_EC Studio",
    price: "Desde $320",
    oldPrice: "Desde $390",
    discount: "Oferta",
    copy: "Pagina orientada a conversion con arquitectura UX y copy estrategico.",
    tag: "UX"
  }
];

const featuredGrid = document.getElementById("featuredGrid");
const discountGrid = document.getElementById("discountGrid");
const catalogStatus = document.getElementById("catalogStatus");
const filterButtons = document.querySelectorAll(".filter-btn");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".main-nav a");
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const revealItems = document.querySelectorAll(".reveal");
const yearNode = document.getElementById("year");
const brandLogoNodes = document.querySelectorAll(".js-brand-logo");
const hasCatalogUi = Boolean(featuredGrid || discountGrid || catalogStatus || filterButtons.length);

let catalogItems = [...FALLBACK_CATALOG_ITEMS];
let activeFilter = "all";
let currentConfig = { ...DEFAULT_CONFIG };

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeLogoPath(value) {
  const path = String(value ?? "").trim();
  if (!path) {
    return "";
  }

  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path.replace(/^\.?\//, "")}`;
}

function isConfiguredWhatsAppNumber(number) {
  return number.length >= 10 && number !== WHATSAPP_PLACEHOLDER;
}

function isConfiguredEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== EMAIL_PLACEHOLDER;
}

function buildWhatsAppUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function buildContactPayload(form) {
  const formData = new FormData(form);
  const interestField = form.querySelector("#interest");
  const selectedOption = interestField instanceof HTMLSelectElement
    ? interestField.options[interestField.selectedIndex]
    : null;

  return {
    name: String(formData.get("name") || "").trim(),
    company: String(formData.get("company") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    interest: String(formData.get("interest") || "").trim(),
    interestLabel: selectedOption ? selectedOption.text.trim() : "",
    message: String(formData.get("message") || "").trim(),
    source: window.location.href
  };
}

function buildMailtoUrl(email, payload) {
  const subject = payload.interestLabel
    ? `Solicitud web ELITECH_EC - ${payload.interestLabel}`
    : `Solicitud web ELITECH_EC - ${payload.name}`;

  const bodyLines = [
    "Hola ELITECH_EC,",
    "",
    "Comparto mi solicitud desde la web:",
    "",
    `Nombre: ${payload.name}`,
    `Empresa: ${payload.company || "No especificada"}`,
    `Correo: ${payload.email}`,
    `Interes: ${payload.interestLabel || payload.interest || "No especificado"}`,
    "",
    "Detalle:",
    payload.message,
    "",
    `Pagina: ${payload.source}`
  ];

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
}

function applyBrandLogo(config) {
  const configuredPath = normalizeLogoPath(config.logoPath);
  const fallbackPath = LOGO_PATH_PLACEHOLDER;
  const resolvedPath = configuredPath || fallbackPath;

  brandLogoNodes.forEach((img) => {
    if (!(img instanceof HTMLImageElement)) {
      return;
    }

    img.setAttribute("src", resolvedPath);
    img.addEventListener(
      "error",
      () => {
        if (img.getAttribute("src") !== fallbackPath) {
          img.setAttribute("src", fallbackPath);
        }
      },
      { once: true }
    );
  });
}

function applyContactEmail(config) {
  const email = normalizeEmail(config.contactEmail);
  const links = document.querySelectorAll(".js-contact-email-link");
  const labels = document.querySelectorAll(".js-contact-email-text");

  if (!isConfiguredEmail(email)) {
    links.forEach((link) => {
      link.classList.add("disabled");
      link.setAttribute("aria-disabled", "true");
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.setAttribute("title", "Configura contactEmail en site-config.json");
    });

    labels.forEach((node) => {
      node.textContent = "Configura contactEmail en site-config.json";
    });

    return;
  }

  links.forEach((link) => {
    link.classList.remove("disabled");
    link.removeAttribute("aria-disabled");
    link.setAttribute("href", `mailto:${email}`);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.removeAttribute("title");
  });

  labels.forEach((node) => {
    node.textContent = email;
  });
}

function applyContactForm(config) {
  if (!contactForm) {
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const email = normalizeEmail(config.contactEmail);

  if (!isConfiguredEmail(email)) {
    contactForm.setAttribute("action", `mailto:${EMAIL_PLACEHOLDER}`);
    contactForm.dataset.contactEmail = "";

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.title = "Configura contactEmail en site-config.json";
    }

    if (formNote) {
      formNote.textContent = "Configura contactEmail en site-config.json para habilitar el formulario.";
      formNote.dataset.state = "error";
    }

    return;
  }

  contactForm.setAttribute("action", `mailto:${email}`);
  contactForm.dataset.contactEmail = email;
  contactForm.setAttribute("method", "get");

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = false;
    submitButton.removeAttribute("title");
  }

  if (formNote) {
    formNote.textContent = "El formulario abrira tu cliente de correo con la informacion completada.";
    formNote.dataset.state = "";
  }
}

function buildProductWhatsAppMessage(item) {
  const parts = [
    `Hola ELITECH_EC, quiero cotizar o comprar: ${item.name}`,
    item.brand ? `Marca: ${item.brand}` : "",
    item.sku ? `SKU: ${item.sku}` : "",
    item.partNumber ? `Parte: ${item.partNumber}` : "",
    item.price ? `Precio: ${item.price}` : ""
  ].filter(Boolean);

  return parts.join(" | ");
}

function applyWhatsAppLinks(config) {
  const links = document.querySelectorAll(".js-whatsapp-link");
  const number = normalizePhone(config.whatsappNumber);
  const defaultMessage = config.whatsappDefaultMessage || DEFAULT_CONFIG.whatsappDefaultMessage;
  const supportMessage = config.whatsappSupportMessage || DEFAULT_CONFIG.whatsappSupportMessage;
  const ready = isConfiguredWhatsAppNumber(number);

  links.forEach((link) => {
    const messageType = link.dataset.type || "default";
    const customMessage = link.dataset.message;
    const fallbackMessage = messageType === "support" ? supportMessage : defaultMessage;
    const message = customMessage || fallbackMessage;

    if (!ready) {
      link.classList.add("disabled");
      link.setAttribute("aria-disabled", "true");
      link.removeAttribute("href");
      link.setAttribute("title", "Configura tu numero de WhatsApp en site-config.json");
      return;
    }

    link.classList.remove("disabled");
    link.removeAttribute("aria-disabled");
    link.setAttribute("href", buildWhatsAppUrl(number, message));
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

async function fetchJson(path) {
  try {
    const response = await fetch(`${path}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function normalizeCategory(value) {
  const supported = ["general", "networking", "seguridad", "radio", "web"];
  if (supported.includes(value)) {
    return value;
  }
  return "general";
}

function normalizeImage(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return value;
}

function normalizeCatalogItem(raw, defaultGroup) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const name = String(raw.name || "").trim();
  if (!name) {
    return null;
  }

  const category = normalizeCategory(String(raw.category || "").toLowerCase());
  const group = raw.group === "discount" || raw.group === "featured" ? raw.group : defaultGroup;
  const price = String(raw.price || "Consulte precio").trim();
  const copy = String(raw.copy || "Producto disponible bajo cotizacion.").trim();
  const brand = String(raw.brand || "Tecnologia profesional").trim();
  const oldPrice = String(raw.oldPrice || "").trim();
  const discount = String(raw.discount || raw.badge || "").trim();
  const image = normalizeImage(raw.image);
  const sku = String(raw.sku || raw.id || "").trim();
  const partNumber = String(raw.partNumber || "").trim();

  const defaultTagByCategory = {
    general: "Tech",
    networking: "LAN",
    seguridad: "Security",
    radio: "Radio",
    web: "UX"
  };

  return {
    name,
    category,
    group,
    brand,
    sku,
    partNumber,
    price,
    copy,
    tag: String(raw.tag || defaultTagByCategory[category]).trim(),
    oldPrice: oldPrice || undefined,
    discount: discount || undefined,
    image
  };
}

function normalizeCatalogPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const featuredInput = Array.isArray(payload.featured) ? payload.featured : [];
  const discountInput = Array.isArray(payload.discount) ? payload.discount : [];

  const featured = featuredInput.map((item) => normalizeCatalogItem(item, "featured")).filter(Boolean);
  const discount = discountInput.map((item) => normalizeCatalogItem(item, "discount")).filter(Boolean);

  if (!featured.length && !discount.length) {
    return null;
  }

  return {
    featured,
    discount,
    syncedAt: typeof payload.syncedAt === "string" ? payload.syncedAt : ""
  };
}

async function loadSiteConfig() {
  const remoteConfig = await fetchJson("/site-config.json");
  if (!remoteConfig || typeof remoteConfig !== "object") {
    return { ...DEFAULT_CONFIG };
  }

  return {
    ...DEFAULT_CONFIG,
    ...remoteConfig
  };
}

async function loadCatalog() {
  const remotePayload = await fetchJson("/catalog.json");
  const normalized = normalizeCatalogPayload(remotePayload);

  if (normalized) {
    return normalized;
  }

  const fallbackFeatured = FALLBACK_CATALOG_ITEMS
    .filter((item) => item.group === "featured")
    .map((item) => normalizeCatalogItem(item, "featured"))
    .filter(Boolean);

  const fallbackDiscount = FALLBACK_CATALOG_ITEMS
    .filter((item) => item.group === "discount")
    .map((item) => normalizeCatalogItem(item, "discount"))
    .filter(Boolean);

  return {
    featured: fallbackFeatured,
    discount: fallbackDiscount,
    syncedAt: ""
  };
}

function createImageFallbackMarkup(name) {
  return `<span class="product-media-fallback-text">${escapeHtml(name)}</span>`;
}

function applyImageFallback(imageNode) {
  if (!imageNode) {
    return;
  }

  const mediaNode = imageNode.closest(".product-media");
  if (!mediaNode || mediaNode.dataset.fallbackApplied === "true") {
    return;
  }

  const name = mediaNode.dataset.productName || imageNode.getAttribute("alt") || "Producto";
  mediaNode.classList.add("is-fallback");
  mediaNode.dataset.fallbackApplied = "true";
  mediaNode.innerHTML = createImageFallbackMarkup(name);
}

document.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }

    if (!target.closest(".product-media")) {
      return;
    }

    applyImageFallback(target);
  },
  true
);

function createCard(item) {
  const discountMarkup = item.discount
    ? `<span class="discount-badge">${escapeHtml(item.discount)}</span>`
    : "";

  const oldPriceMarkup = item.oldPrice
    ? `<span class="product-old">${escapeHtml(item.oldPrice)}</span>`
    : "";

  const whatsappMessage = buildProductWhatsAppMessage(item);
  const whatsappMessageAttr = `data-message="${escapeHtml(whatsappMessage)}"`;

  const imageMarkup = item.image
    ? `
      <a class="product-media-link js-whatsapp-link" ${whatsappMessageAttr} href="#" aria-label="Cotizar ${escapeHtml(item.name)}">
        <div class="product-media" data-product-name="${escapeHtml(item.name)}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" referrerpolicy="no-referrer">
        </div>
      </a>
    `
    : "";

  return `
    <article class="product-card">
      ${imageMarkup}
      <div class="product-head">
        <span class="product-tag">${escapeHtml(item.tag)}</span>
        ${discountMarkup}
      </div>
      <div class="product-body">
        <h4 class="product-name">${escapeHtml(item.name)}</h4>
        <p class="product-brand">${escapeHtml(item.brand)}</p>
        <p class="product-copy">${escapeHtml(item.copy)}</p>
        <div class="product-meta">
          <div class="price-wrap">
            <span class="product-price">${escapeHtml(item.price)}</span>
            ${oldPriceMarkup}
          </div>
          <a class="product-cta js-whatsapp-link" ${whatsappMessageAttr} href="#">Cotizar por WhatsApp</a>
        </div>
      </div>
    </article>
  `;
}

function renderGroup(node, items) {
  if (!node) {
    return;
  }

  if (!items.length) {
    node.innerHTML = "<p class='product-empty'>No hay productos disponibles para este filtro en este momento.</p>";
    return;
  }

  node.innerHTML = items.map((item) => createCard(item)).join("");
}

function renderCatalog(filter = "all") {
  activeFilter = filter;

  const filtered = filter === "all"
    ? catalogItems
    : catalogItems.filter((item) => item.category === filter);

  const featured = filtered.filter((item) => item.group === "featured");
  const discount = filtered.filter((item) => item.group === "discount");

  renderGroup(featuredGrid, featured);
  renderGroup(discountGrid, discount);

  applyWhatsAppLinks(currentConfig);
}

function setCatalogStatus(message) {
  if (!catalogStatus) {
    return;
  }

  catalogStatus.textContent = message;
}

function formatSyncDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

async function initializeCatalog() {
  setCatalogStatus("Sincronizando catalogo...");

  const payload = await loadCatalog();
  catalogItems = [...payload.featured, ...payload.discount];
  renderCatalog(activeFilter);

  const syncDate = formatSyncDate(payload.syncedAt);
  if (syncDate) {
    setCatalogStatus(`Catalogo actualizado automaticamente: ${syncDate}.`);
    return;
  }

  setCatalogStatus("Catalogo activo en modo local. Ejecuta la sincronizacion para actualizarlo.");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetFilter = button.dataset.filter || "all";

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    renderCatalog(targetFilter);
  });
});

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (mainNav) {
      mainNav.classList.remove("open");
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) {
      return;
    }

    const email = normalizeEmail(contactForm.dataset.contactEmail || "");
    if (!isConfiguredEmail(email)) {
      formNote.textContent = "Configura contactEmail en site-config.json antes de enviar.";
      formNote.dataset.state = "error";
      return;
    }

    const payload = buildContactPayload(contactForm);
    const mailtoUrl = buildMailtoUrl(email, payload);

    contactForm.setAttribute("action", mailtoUrl);
    formNote.textContent = "Se abrira tu cliente de correo para completar el envio desde tu cuenta.";
    formNote.dataset.state = "success";
    window.location.href = mailtoUrl;
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

async function init() {
  const tasks = [loadSiteConfig()];
  if (hasCatalogUi) {
    tasks.push(initializeCatalog());
  }

  const [config] = await Promise.all(tasks);
  currentConfig = config;
  applyBrandLogo(config);
  applyWhatsAppLinks(config);
  applyContactEmail(config);
  applyContactForm(config);
}

init().catch(() => {
  if (hasCatalogUi) {
    renderCatalog();
  }
  currentConfig = DEFAULT_CONFIG;
  applyBrandLogo(DEFAULT_CONFIG);
  applyWhatsAppLinks(DEFAULT_CONFIG);
  applyContactEmail(DEFAULT_CONFIG);
  applyContactForm(DEFAULT_CONFIG);
  if (hasCatalogUi) {
    setCatalogStatus("No se pudo sincronizar ahora. Se muestra catalogo local temporal.");
  }
});

