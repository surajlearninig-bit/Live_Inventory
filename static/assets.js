// ================= ASSETS.JS (LOCKED) =================

// Global state
let DATA = [];
let FILTER = "";

// Initial load
loadAssets();

// ---------------- LOAD DATA ----------------
function loadAssets(){
  fetch("/inventory/data")
    .then(r => r.json())
    .then(d => {
      DATA = d || [];
      updateCounts();
      renderTable();
    })
    .catch(() => {
      DATA = [];
      updateCounts();
      renderTable();
    });
}

// ---------------- COUNT CARDS ----------------
function updateCounts(){
  let counts = {
    Laptop: 0,
    Desktop: 0,
    Server: 0,
    Monitor: 0
  };

  DATA.forEach(x => {
    if (x.asset_type && counts[x.asset_type] !== undefined) {
      counts[x.asset_type]++;
    }
  });

  document.getElementById("c_total").innerText = DATA.length;
  document.getElementById("c_laptop").innerText = counts.Laptop;
  document.getElementById("c_desktop").innerText = counts.Desktop;
  document.getElementById("c_server").innerText = counts.Server;
  document.getElementById("c_monitor").innerText = counts.Monitor;
}

// ---------------- FILTER ----------------
function applyFilter(type){
  FILTER = type;
  renderTable();
}

// ---------------- TABLE RENDER ----------------
function renderTable(){
  let tbody = document.getElementById("assetRows");
  let html = "";

  DATA
    .filter(x => !FILTER || x.asset_type === FILTER)
    .forEach((d, i) => {
      html += `
        <tr>
          <td>${d.asset_type || "-"}</td>
          <td>${d.system_serial || "-"}</td>
          <td>${d.system_brand || "-"}</td>
          <td>${d.system_model || "-"}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="viewAsset(${i})">
              View
            </button>
          </td>
        </tr>
      `;
    });

  tbody.innerHTML = html || `
    <tr>
      <td colspan="5" class="text-center text-muted">
        No data available
      </td>
    </tr>
  `;
}

// ---------------- VIEW DETAILS MODAL ----------------
function viewAsset(index){
  const d = DATA[index];
  let rows = "";

  if (!d) {
    rows = `<tr><td class="text-muted">No details available</td></tr>`;
  } else {
    Object.keys(d).forEach(k => {
      rows += `
        <tr>
          <th width="35%">${k}</th>
          <td>${d[k] || "-"}</td>
        </tr>
      `;
    });
  }

  document.getElementById("detailBody").innerHTML = `
    <table class="table table-sm table-bordered">
      ${rows}
    </table>
  `;

  new bootstrap.Modal(document.getElementById("detailModal")).show();
}

// ====================================================
