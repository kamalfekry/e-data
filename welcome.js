document.addEventListener("DOMContentLoaded", () => {
    const welcomeUsername = document.getElementById("welcomeUsername")
    const username = localStorage.getItem("username")
  
    if (username) {
      welcomeUsername.textContent = username
    } else {
      window.location.href = "index.html"
    }
  })
  
  