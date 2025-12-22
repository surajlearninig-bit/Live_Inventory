// LOAD COUNTS
fetch("/settings/info")
.then(r=>r.json())
.then(d=>{
 document.getElementById("liveCount").innerText = d.live;
 document.getElementById("userCount").innerText = d.users;
});

// LOAD USERS
function loadUsers(){
 fetch("/settings/users")
 .then(r=>r.json())
 .then(users=>{
   let h="";
   users.forEach(u=>{
     h+=`
     <tr>
       <td>${u.username}</td>
       <td>
         <select onchange="updateRole('${u.username}',this.value)">
           <option ${u.role=="viewer"?"selected":""}>viewer</option>
           <option ${u.role=="editor"?"selected":""}>editor</option>
           <option ${u.role=="admin"?"selected":""}>admin</option>
         </select>
       </td>
       <td>
         <button class="btn btn-sm btn-danger"
           onclick="deleteUser('${u.username}')">Delete</button>
       </td>
     </tr>`;
   });
   document.getElementById("userRows").innerHTML=h;
 });
}
loadUsers();

function createUser(){
 fetch("/settings/user/create",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    user:newUser.value,
    pass:newPass.value,
    role:newRole.value
  })
 }).then(()=>loadUsers());
}

function deleteUser(u){
 fetch("/settings/user/delete",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({user:u})
 }).then(()=>loadUsers());
}

function updateRole(u,r){
 fetch("/settings/user/role",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({user:u,role:r})
 });
}

function resetDB(){
 let p = document.getElementById("resetPass").value;
 if(p !== "258@jfpl"){
   alert("Wrong password");
   return;
 }
 fetch("/reset-db",{method:"POST"})
 .then(()=>alert("Database Reset"));
}
