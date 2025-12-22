let INVENTORY_FIELDS = [
 "host_name",
 "current_user",
 "asset_type",
 "os_name",
 "os_version",
 "os_activation_status",

 "system_brand",
 "system_model",
 "system_serial",

 "cpu_name",
 "cpu_cores",
 "total_ram_gb",

 "last_seen"
];


let USER_FIELDS = [
 "host_name",
 "current_user",

 "ext_no",
 "hedge_expire",

 "ip",
 "asset_type",
 "os"
];

const fieldList = document.getElementById("fieldList");
const dataSource = document.getElementById("dataSource");

dataSource.onchange = loadFields;
loadFields();

function loadFields(){
 fieldList.innerHTML = "";
 let fields = dataSource.value === "inventory"
   ? INVENTORY_FIELDS
   : USER_FIELDS;

 fields.forEach(f=>{
   fieldList.innerHTML += `
   <div class="col-md-3">
     <label>
       <input type="checkbox" value="${f}" checked>
       ${f.replaceAll("_"," ")}
     </label>
   </div>`;
 });
}

function downloadReport(){
 let fields = [...fieldList.querySelectorAll("input:checked")]
   .map(x=>x.value);

 if(!fields.length){
   alert("Select at least one field");
   return;
 }

 let payload = {
   source: dataSource.value,
   fields: fields,
   format: document.getElementById("format").value
 };

 fetch("/reports/download",{
   method:"POST",
   headers:{ "Content-Type":"application/json" },
   body: JSON.stringify(payload)
 })
 .then(r=>r.blob())
 .then(blob=>{
   let a = document.createElement("a");
   a.href = URL.createObjectURL(blob);
   a.download = `report.${payload.format}`;
   a.click();
 });
}
