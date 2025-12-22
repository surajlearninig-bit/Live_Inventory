let USERS = [];

fetch("/users/data")
.then(r=>r.json())
.then(d=>{
 USERS = d;
 renderUsers();
 userCount.innerText = USERS.length;
});

function renderUsers(){
 let h="";
 USERS.forEach((u,i)=>{
  let ip = u.network_adapters?.[0]?.ip || "-";
  h+=`
  <tr>
    <td>${u.current_user || "-"}</td>
    <td>${u.host_name || "-"}</td>
    <td>${ip}</td>
    <td>
      <input class="form-control form-control-sm"
        value="${u.ext_no || ""}"
        onchange="saveExt(${i}, this.value)">
    </td>
	<td>
       <input type="date"
         class="form-control form-control-sm"
         value="${u.hedge_expire || ''}"
         onchange="saveHedge(${i}, this.value)">
    </td>
    <td>
      <button class="btn btn-sm btn-primary" onclick="viewUser(${i})">
        View
      </button>
    </td>
  </tr>`;
 });
 userRows.innerHTML = h;
}

function saveExt(i,val){
 fetch("/users/ext",{
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body:JSON.stringify({
    host_name: USERS[i].host_name,
    ext_no: val
  })
 });
 USERS[i].ext_no = val;
}

function saveHedge(i, val){
 fetch("/users/hedge",{
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body:JSON.stringify({
    host_name: USERS[i].host_name,
    hedge_expire: val
  })
 });
 USERS[i].hedge_expire = val;
}

function viewUser(i){
 let d = USERS[i];
 let rows="";
 for(let k in d){
  rows+=`<tr><th>${k}</th><td>${d[k] || ""}</td></tr>`;
 }
 detailBody.innerHTML =
  `<table class="table table-bordered table-sm">${rows}</table>`;
 new bootstrap.Modal(detailModal).show();
}
