

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

fetch("http://127.0.0.1:8000/api/user", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.json())
.then(user => {

  document.getElementById("userName").innerText = user.name;
  document.getElementById("userEmail").innerText = user.email;
  document.getElementById("userPhone").innerText = user.telephone;
  document.getElementById("userRole").innerText = user.role;

})
.catch(() => {
  alert("Error loading profile");
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  });
}