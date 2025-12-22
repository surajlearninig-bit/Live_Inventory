let INVENTORY = [];

loadInventory();
setInterval(loadInventory, 30000);

function loadInventory(){
 fetch("/inventory/data")
 .then(r => r.json())
 .then(data => {
   INVENTORY = data;
   let html = "";

   data.forEach((i, idx) => {
     let ip = i.network_adapters?.[0]?.ip || "";

     html += `
     <tr>
       <td>${i.host_name || ""}</td>
       <td>${i.current_user || "-"}</td>
       <td>${ip}</td>
       <td>${i.os_name || ""}</td>
       <td>${i.last_seen || ""}</td>
       <td>
         <button class="btn btn-sm btn-primary" onclick="showDetails(${idx})">
           View
         </button>
       </td>
     </tr>`;
   });

   document.getElementById("inv").innerHTML = html;
 });
}

function showDetails(index){
 const d = INVENTORY[index];
 let html = "";

 html += section("System Information", table([
   ["Host Name", d.host_name],
   ["Current User", d.current_user],
   ["Asset Type", d.asset_type],
   ["System Serial Number", d.system_serial],
   ["System Brand", d.system_brand],
   ["System Model", d.system_model]
 ]));

 html += section("Operating System", table([
   ["OS Name", d.os_name],
   ["OS Version", d.os_version],
   ["Activation Status", d.os_activation_status]
 ]));

 html += section("CPU & Memory", table([
   ["CPU Name", d.cpu_name],
   ["CPU Cores", d.cpu_cores],
   ["Total RAM (GB)", d.total_ram_gb]
 ]));

 if(d.disks?.length){
   let rows = d.disks.map(x => [
     x.model, x.type, x.size_gb + " GB"
   ]);
   html += section("Storage",
     tableHeader(["Model","Type","Size"], rows)
   );
 }

 if(d.network_adapters?.length){
   let rows = d.network_adapters.map(x => [
     x.interface, x.ip, x.mac
   ]);
   html += section("Network",
     tableHeader(["Interface","IP","MAC"], rows)
   );
 }

 document.getElementById("detailBody").innerHTML = html;
 new bootstrap.Modal(document.getElementById("detailModal")).show();
}

/* ===== HELPERS (UNCHANGED) ===== */

function section(title, body){
 return `
 <div class="mb-4">
   <h6 class="text-primary">${title}</h6>
   ${body}
 </div>`;
}

function table(rows){
 let h = "<table class='table table-sm table-bordered'>";
 rows.forEach(r => {
   h += `<tr>
     <th width="35%">${r[0]}</th>
     <td>${r[1] || ""}</td>
   </tr>`;
 });
 return h + "</table>";
}

function tableHeader(headers, rows){
 let h = "<table class='table table-sm table-bordered'><thead><tr>";
 headers.forEach(x => h += `<th>${x}</th>`);
 h += "</tr></thead><tbody>";

 rows.forEach(r => {
   h += "<tr>";
   r.forEach(c => h += `<td>${c || ""}</td>`);
   h += "</tr>";
 });

 return h + "</tbody></table>";
}
