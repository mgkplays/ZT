// Complete merged script with Set B logic and [ZT] naming
const players = [
    { role: '職位 1', steam16: '1234567890123456', name: '[ZT] MGK', shift: 'morning' },
    { role: '職位 2', steam16: '1234567890123456', name: 'Player 2', shift: 'afternoon' },
    { role: '職位 3', steam16: '1234567890123456', name: '[ZT] 123', shift: 'evening' },
    { role: '職位 4', steam16: '1234567890123456', name: 'Player 4', shift: 'evening' },
    { role: '職位 5', steam16: '1234567890123456', name: 'Player 5', shift: 'night' },
    { role: '職位 7', steam16: '1234567890123456', name: 'Player 7', shift: 'midnight' },
    { role: '職位 8', steam16: '1234567890123456', name: 'Player 8', shift: 'morning' },
    { role: '職位 9', steam16: '1234567890123456', name: 'Player 9', shift: 'midnight' }
];

document.addEventListener("DOMContentLoaded", function () {
    fetch("data.txt")
        .then((response) => response.text())
        .then((text) => processText(text))
        .catch((error) => console.error("Error loading file:", error));

    showSection("shiftData");
    loadHistory();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});

function processText(text) {
    const lines = text.split('\n');
    let currentSender = null;
    let currentAmount = 0;
    let currentTime = null;

    players.forEach((player) => {
        player.total = 0;
        player.workingTimeTotal = 0;
        player.nonWorkingTimeTotal = 0;
    });

    lines.forEach((line) => {
        line = line.trim();
        if (line.startsWith("時間:")) currentTime = line.replace("時間:", "").trim();
        if (line.startsWith("發出:")) currentSender = line.replace("發出:", "").trim();

        if (line.startsWith("數量:") && currentSender && currentTime) {
            currentAmount = parseInt(line.replace("數量:", "").trim(), 10) || 0;
            const currentHour = parseInt(currentTime.split(":")[0], 10);

            players.forEach((player) => {
                if (player.name === currentSender) {
                    player.total += currentAmount;
                    if (isWithinShift(currentHour, player.shift)) {
                        player.workingTimeTotal += currentAmount;
                    } else {
                        player.nonWorkingTimeTotal += currentAmount;
                    }
                }
            });

            currentSender = null;
            currentTime = null;
        }
    });

    updateTable();
    updateMaterialsTable();
}

function isWithinShift(hour, shift) {
    const shiftHours = {
        morning: [6, 12],
        afternoon: [12, 18],
        evening: [18, 21],
        night: [21, 24],
        midnight: [0, 6],
    };
    const [start, end] = shiftHours[shift];
    return hour >= start && hour < end;
}

function updateTable() {
    const shifts = {
        morning: "🌅 早班 (6:00 AM - 12:00 PM)",
        afternoon: "☀️ 午班 (12:00 PM - 6:00 PM)",
        evening: "🌆 晚班 (6:00 PM - 9:00 PM)",
        night: "🌙 小夜班 (9:00 PM - 12:00 AM)",
        midnight: "🌌 大夜班 (12:00 AM - 6:00 AM)",
    };

    const shiftSections = document.getElementById("shiftSections");
    shiftSections.innerHTML = "";

    Object.keys(shifts).forEach((shift) => {
        const shiftPlayers = players.filter((player) => player.shift === shift);
        if (shiftPlayers.length > 0) {
            let tableHTML = `<div class="shift-section"><h3>${shifts[shift]}</h3><table><thead><tr>
                <th>職位</th><th>Steam16</th><th>姓名</th><th>上班單數</th><th>非上班單數</th><th>總數量</th>
            </tr></thead><tbody>`;
            shiftPlayers.forEach((player) => {
                tableHTML += `<tr><td>${player.role}</td><td>${player.steam16}</td><td>${player.name}</td>
                <td>${player.workingTimeTotal}</td><td>${player.nonWorkingTimeTotal}</td><td>${player.total}</td></tr>`;
            });
            tableHTML += `</tbody></table></div>`;
            shiftSections.innerHTML += tableHTML;
        }
    });
}

function updateMaterialsTable() {
    const materials = [
        { name: "鐵礦", price: 60000, amount: 0 },
        { name: "鉛礦", price: 30000, amount: 0 },
        { name: "高級金屬", price: 39000, amount: 0 },
    ];
    let tableHTML = `<h3>材料收購</h3><table><thead><tr>
        <th>材料</th><th>單價</th><th>數量</th><th>總計</th>
    </tr></thead><tbody>`;
    materials.forEach((material) => {
        tableHTML += `<tr><td>${material.name}</td><td>${material.price}</td>
            <td><input type="number" value="0" min="0" onchange="calculateTotal(this, ${material.price}, '${material.name}')"></td>
            <td id="total-${material.name}">0</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    document.getElementById("materialsSection").innerHTML = tableHTML;
}

function calculateTotal(input, price, materialName) {
    const amount = parseInt(input.value, 10) || 0;
    const totalCell = document.getElementById(`total-${materialName}`);
    totalCell.textContent = amount * price;
}

function showSection(section) {
    const sections = ["shiftData", "calculator", "announcements", "uploadSection"];
    sections.forEach((s) => {
        const el = document.getElementById(s);
        if (el) el.classList.add("hidden");
    });
    const target = document.getElementById(section);
    if (target) target.classList.remove("hidden");
}

// Set B: Upload, history, logout
const form = document.querySelector("form");
const results = document.getElementById("results");
const fileInput = document.getElementById("logFile");
const fileName = document.getElementById("fileName");
const modal = document.getElementById("historyModal");
const historyBtn = document.getElementById("historyBtn");
const closeBtn = document.querySelector(".close");
const logoutBtn = document.getElementById("logoutBtn");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch("process.php", { method: "POST", body: formData })
            .then((res) => res.json())
            .then((data) => displayResults(data))
            .catch(() => results.innerHTML = '<p class="error">處理過程中發生錯誤</p>');
    });
}

if (fileInput) {
    fileInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            fileName.textContent = "已選擇: " + this.files[0].name;
            fileName.classList.add("show");
        } else {
            fileName.textContent = "";
            fileName.classList.remove("show");
        }
    });
}

if (historyBtn) {
    historyBtn.addEventListener("click", () => {
        modal.style.display = "block";
        loadHistory();
    });
}
if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

function loadHistory() {
    fetch("get_history.php")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("historyList");
            list.innerHTML = "";
            data.forEach(item => {
                const el = document.createElement("div");
                el.className = "history-item";
                el.innerHTML = `<span class="filename">${item.filename}</span><span class="time">${item.uploadTime}</span>`;
                el.onclick = () => {
                    fetch("process.php", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ historyFile: item.path })
                    })
                        .then(res => res.json())
                        .then(data => {
                            displayResults(data);
                            modal.style.display = "none";
                        });
                };
                list.appendChild(el);
            });
        });
}

function displayResults(data) {
    let html = "<h2>分析結果</h2><table><tr><th>佐藤人員</th><th>接單數</th><th>完成數</th><th>完成率</th></tr>";
    data.forEach(p => {
        html += `<tr><td>${p.name}<br><span class="steam-id">${p.steamId}</span></td>
        <td>${p.accepted}</td><td>${p.completed}</td><td>${p.completion_rate}</td></tr>`;
    });
    html += "</table>";
    results.innerHTML = html;
}

if (logoutBtn) {
    logoutBtn.onclick = () => {
        sessionStorage.removeItem("isLoggedIn");
        location.reload();
    };
}
