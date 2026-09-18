const demoIssues = [
    { id: "CF1025", type: "Streetlight", location: "Station Road, Ward 4", 
        description: "Streetlight near the bus stop is not working.", status: "Under Review", 
        date: "17 Sep 2026" },
    { id: "CF1024", type: "Pothole", location: "Market Junction", 
        description: "Large pothole causing difficulty for two-wheelers.", status: "In Progress", 
        date: "16 Sep 2026" },
    { id: "CF1023", type: "Garbage", location: "Lake View Lane", 
        description: "Garbage collection was missed for two days.", status: "Resolved", 
        date: "15 Sep 2026" },
    { id: "CF1022", type: "Water", location: "Shivaji Nagar", 
        description: "Water is leaking from a roadside pipe.", status: "Pending", 
        date: "15 Sep 2026" },
    { id: "CF1021", type: "Traffic", location: "Main Circle", 
        description: "Traffic signal is intermittently switching off.", status: "Under Review", 
        date: "14 Sep 2026" },
    { id: "CF1020", type: "Fallen Tree", location: "Green Park Road", 
        description: "A fallen branch is blocking part of the footpath.", status: "Resolved", 
        date: "13 Sep 2026" }];

function allIssues() {
    const saved = JSON.parse(localStorage.getItem("civicfixIssues") || "[]");
    const deleted = JSON.parse(localStorage.getItem("deletedIssues") || "[]");

    return [...demoIssues]
        .filter(d => !deleted.includes(d.id))
        .map(d => saved.find(s => s.id === d.id) || d)
        .concat(saved.filter(s => !demoIssues.some(d => d.id === s.id)));
}
function makeId() { return "CF" + Math.floor(1000 + Math.random() * 9000) }
function statusClass(s) { return s.replaceAll(" ", "-").toLowerCase() }

const photo = document.getElementById("photo");
if (photo) photo.addEventListener("change", e => { 
    const f = e.target.files[0], img = document.getElementById("preview"); 
    if (f) { img.src = URL.createObjectURL(f); img.style.display = "block" } 
});

const form = document.getElementById("reportForm");
if (form) {
    const params = new URLSearchParams(location.search); 
    if (params.get("type")) document.getElementById("type").value = params.get("type");
    form.addEventListener("submit", e => {
        e.preventDefault();
        const id = makeId(); 
        const issue = { id, type: document.getElementById("type").value, 
            location: document.getElementById("location").value, 
            description: document.getElementById("description").value, status: "Pending", 
            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" 
            }) 
        };
        const saved = JSON.parse(localStorage.getItem("civicfixIssues") || "[]"); 
        saved.unshift(issue); localStorage.setItem("civicfixIssues", JSON.stringify(saved));
        const box = document.getElementById("success"); 
        box.classList.remove("hidden"); 
        box.innerHTML = `<b>✅ Complaint registered!</b><br>Your complaint ID is <strong>${id}</strong>. 
        <a href="track.html?id=${id}">Track it →</a>`; form.reset();
    });
}
const trackForm = document.getElementById("trackForm");
function renderTrack(id) {
    const box = document.getElementById("trackResult"); 
    if (!box) 
        return;
    const issue = allIssues().find(x => x.id.toUpperCase() === id.toUpperCase());
    if (!issue) { box.innerHTML = `<div class="result">❌ No complaint found for <b>${id}</b>. 
    Try CF1025, CF1024 or CF1023.</div>`; 
    return 
}
    const statuses = ["Pending", "Under Review", "In Progress", "Resolved"];
    let idx = statuses.indexOf(issue.status); 
    if (idx < 0) 
        idx = 0;
    box.innerHTML = `<div class="result"><div class="issue-head"><div>
    <div class="meta">${issue.id} · ${issue.date}</div><h2>${issue.type} issue</h2>
    <p>${issue.description}</p><div class="meta">📍 ${issue.location}</div></div>
    <span class="status">${issue.status}</span></div><div class="timeline">${statuses.map((s, i) => `
    <div class="${i <= idx ? "done" : ""}">${i <= idx ? "✓ " : ""}${s}</div>`).join("")}</div></div>`;
}
if (trackForm) {
    const p = new URLSearchParams(location.search); 
    if (p.get("id")) { 
        document.getElementById("trackId").value = p.get("id"); 
        renderTrack(p.get("id")) 
    }
    trackForm.addEventListener("submit", e => { 
        e.preventDefault(); 
        renderTrack(document.getElementById("trackId").value.trim()) 
    })
}
function renderIssues() {
    const grid = document.getElementById("issueGrid"); 
    if (!grid) 
        return;
    const q = (document.getElementById("issueSearch")?.value || "").toLowerCase(), 
    f = document.getElementById("issueFilter")?.value || "All";
    const arr = allIssues().filter(x => (f === "All" || x.status === f) && (`${x.type} 
    ${x.location} ${x.description}`).toLowerCase().includes(q));
    grid.innerHTML = arr.map(x => `<article class="issue"><div class="issue-head"><div><div class="meta">
    ${x.id} · ${x.date}</div><h3>${x.type}</h3></div><span class="status">${x.status}</span></div><p>${x.description}</p>
    <div class="meta">📍 ${x.location}</div></article>`).join("") || "<div class='info-box'>No matching issues.</div>";
}
if (document.getElementById("issueGrid")) { renderIssues(); 
    document.getElementById("issueSearch").addEventListener("input", renderIssues); 
    document.getElementById("issueFilter").addEventListener("change", renderIssues) }
function renderAdmin() {
    const rows = document.getElementById("adminRows"); 
    if (!rows) 
        return; 
    const arr = allIssues();
    document.getElementById("total").textContent = arr.length; 
    document.getElementById("pending").textContent = arr.filter(x => x.status === "Pending").length; 
    document.getElementById("progress").textContent = arr.filter(x => x.status === "In Progress").length; 
    document.getElementById("resolved").textContent = arr.filter(x => x.status === "Resolved").length;
    rows.innerHTML = arr.map(x => `<tr>
    <td><b>${x.id}</b></td>
    <td>${x.type}</td>
    <td>${x.location}</td>
    <td><span class="status">${x.status}</span></td>
    <td>
        <select onchange="changeStatus('${x.id}',this.value)">
            ${["Pending", "Under Review", "In Progress", "Resolved"]
                .map(s => `<option ${s === x.status ? "selected" : ""}>${s}</option>`)
                .join("")}
        </select>
    </td>
    <td>
        <button class="delete-btn" onclick="deleteIssue('${x.id}')">Delete</button>
    </td>
</tr>`).join("");
}
function changeStatus(id, status) {
    let saved = JSON.parse(localStorage.getItem("civicfixIssues") || "[]");

    const index = saved.findIndex(x => x.id === id);

    if (index >= 0) {
        saved[index].status = status;
    } else {
        const issue = demoIssues.find(x => x.id === id);
        if (issue) saved.push({ ...issue, status });
    }

    localStorage.setItem("civicfixIssues", JSON.stringify(saved));
    renderAdmin();
}
function deleteIssue(id) {
    if (!confirm("Are you sure you want to delete this complaint?")) return;

    let saved = JSON.parse(localStorage.getItem("civicfixIssues") || "[]");
    let deleted = JSON.parse(localStorage.getItem("deletedIssues") || "[]");

    saved = saved.filter(x => x.id !== id);

    if (!deleted.includes(id)) {
        deleted.push(id);
    }

    localStorage.setItem("civicfixIssues", JSON.stringify(saved));
    localStorage.setItem("deletedIssues", JSON.stringify(deleted));

    renderAdmin();
}
if (document.getElementById("adminRows")) renderAdmin();