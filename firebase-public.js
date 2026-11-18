import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadSiteContent() {
  try {
    const snap = await getDoc(doc(db, "siteContent", "home"));
    if (!snap.exists()) return;
    const d = snap.data();
    const set = (id, value) => { const el = document.getElementById(id); if (el && value) el.textContent = value; };
    set("heroTitle", d.heroTitle);
    set("heroSubtitle", d.heroSubtitle);
    set("storyHeading", d.storyHeading);
    set("storyDescription", d.storyDescription);
    set("restaurantAddress", d.address);
    set("restaurantPhoneText", d.phone);
    const phone = document.getElementById("restaurantPhone");
    if (phone && d.phone) phone.href = "tel:" + d.phone.replace(/[^+0-9]/g, "");
  } catch (e) { console.warn("Could not load site content:", e); }
}

async function loadMenu() {
  const grid = document.querySelector(".menuGrid");
  if (!grid) return;
  try {
    const snap = await getDocs(collection(db, "menuItems"));
    if (snap.empty) return; // Keep the existing sample menu until the owner adds live items.
    const items = snap.docs.map(x => ({ id: x.id, ...x.data() })).filter(x => x.active !== false);
    grid.innerHTML = "";
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "food";
      card.dataset.category = item.category || "Other";
      if (item.imageUrl) {
        const img = document.createElement("img");
        img.src = item.imageUrl; img.alt = item.name || "Menu item"; img.loading = "lazy";
        card.appendChild(img);
      }
      const body = document.createElement("div"); body.className = "foodBody";
      const line = document.createElement("div"); line.className = "foodLine";
      const h = document.createElement("h3"); h.textContent = item.name || "Menu item";
      line.appendChild(h);
      if (item.price !== undefined && item.price !== "") {
        const price = document.createElement("span"); price.className = "price"; price.textContent = "₹" + item.price; line.appendChild(price);
      }
      const p = document.createElement("p"); p.textContent = item.description || item.category || "";
      body.append(line, p); card.appendChild(body); grid.appendChild(card);
    }
  } catch (e) { console.warn("Could not load menu:", e); }
}
loadSiteContent();
loadMenu();
