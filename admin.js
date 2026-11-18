import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const ADMIN_UID = "eloqcoaGLMXNFPTMU90t5gA7lku2";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app), db = getFirestore(app), storage = getStorage(app);
const $ = id => document.getElementById(id);
const say = (id, msg) => { if ($(id)) $(id).textContent = msg; };

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault(); say("loginStatus", "Signing in…");
  try { await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value); say("loginStatus", ""); }
  catch (err) { say("loginStatus", err.message); }
});
$("logoutBtn").addEventListener("click", () => signOut(auth));
onAuthStateChanged(auth, async user => {
  const allowed = !!user && user.uid === ADMIN_UID;
  $("loginPanel").classList.toggle("hidden", allowed);
  $("dashboard").classList.toggle("hidden", !allowed);
  if (user && !allowed) { say("loginStatus", "This account is not authorised."); await signOut(auth); return; }
  if (allowed) { say("signedIn", "Signed in as " + user.email); await loadSite(); await loadItems(); }
});
async function loadSite() {
  try {
    const s = await getDoc(doc(db, "siteContent", "home"));
    const d = s.exists() ? s.data() : {};
    $("heroTitleInput").value = d.heroTitle || "Good food. Great moments.";
    $("heroSubtitleInput").value = d.heroSubtitle || "";
    $("storyHeadingInput").value = d.storyHeading || "";
    $("storyDescriptionInput").value = d.storyDescription || "";
    $("addressInput").value = d.address || "";
    $("phoneInput").value = d.phone || "";
  } catch(e) { say("siteStatus", "Could not load settings: " + e.message); }
}
$("siteForm").addEventListener("submit", async e => {
  e.preventDefault(); say("siteStatus", "Saving…");
  try {
    await setDoc(doc(db, "siteContent", "home"), {
      heroTitle: $("heroTitleInput").value.trim(), heroSubtitle: $("heroSubtitleInput").value.trim(),
      storyHeading: $("storyHeadingInput").value.trim(), storyDescription: $("storyDescriptionInput").value.trim(),
      address: $("addressInput").value.trim(), phone: $("phoneInput").value.trim(), updatedAt: serverTimestamp()
    }, {merge:true});
    say("siteStatus", "Saved. Changes will appear on the public website.");
  } catch(e) { say("siteStatus", "Save failed: " + e.message); }
});
$("menuForm").addEventListener("submit", async e => {
  e.preventDefault(); say("menuStatus", "Uploading and saving…");
  try {
    let imageUrl = "";
    const file = $("itemImage").files[0];
    if (file) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
      const path = "menu/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, {contentType:file.type});
      imageUrl = await getDownloadURL(fileRef);
    }
    await addDoc(collection(db, "menuItems"), {
      name: $("itemName").value.trim(), category: $("itemCategory").value.trim(),
      price: $("itemPrice").value.trim(), description: $("itemDescription").value.trim(),
      imageUrl, active: true, createdAt: serverTimestamp()
    });
    $("menuForm").reset(); say("menuStatus", "Menu item added."); await loadItems();
  } catch(e) { say("menuStatus", "Could not save: " + e.message); }
});
async function loadItems() {
  const list = $("menuList"); list.textContent = "Loading…";
  try {
    const snap = await getDocs(collection(db, "menuItems")); list.innerHTML = "";
    if (snap.empty) { list.textContent = "No live items yet. The sample menu remains visible until you add items."; return; }
    snap.forEach(s => {
      const d = s.data(), row = document.createElement("div"); row.className = "adminItem";
      const info = document.createElement("div"); info.textContent = d.name || "Untitled item";
      const meta = document.createElement("small"); meta.textContent = (d.category || "Uncategorised") + (d.price ? " · ₹" + d.price : "");
      info.appendChild(meta);
      const del = document.createElement("button"); del.className = "danger"; del.type = "button"; del.textContent = "Delete";
      del.addEventListener("click", async () => { if (!confirm("Delete " + (d.name || "this item") + "?")) return; try { await deleteDoc(doc(db,"menuItems",s.id)); await loadItems(); } catch(e) { say("globalStatus", e.message); } });
      row.append(info, del); list.appendChild(row);
    });
  } catch(e) { list.textContent = "Could not load items: " + e.message; }
}
