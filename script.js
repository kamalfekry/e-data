const validUsernames = [
  "جني_السيد",
  "حسين_رشاد",
  "احمد_عبده",
  "اسراء_عبدالله",
  "دعاء_فاروق",
  "شمس_محمد",
  "محمد_ابراهيم",
  "يوسف_عبدالحي",
  "هاجر_صلاح",
  "ياسر_يوسف",
  "محمد_سعيد",
  "اسراء_ياسين",
  "شادية_حسنين",
  "محمود_ابراهيم",
  "محمود_عبدالجيد",
  "منة_عبدالرحمن",
  "هيام_حلمي",
  "مريم_احمد",
  "يوسف_حسن",
  "نورهان_عبدالرحمن",
  "محمد_شكري",
  "فاطمة_محمد",
  "رنا_محمد",
  "مريم_يوسف",
  "رشا_محمد",
  "ندا_جلال",
  "نيرة_عبدالخالق",
  "وفية_عبدالستار",
  "تقي_محمود",
  "ادهم_محمد",
  "محمد_شاهين",
  "فاطمة_محمد",
  "منى_علي",
]

const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const captureBtn = document.getElementById("captureBtn")
const retakeBtn = document.getElementById("retakeBtn")
const signInBtn = document.getElementById("signInBtn")
const signOutBtn = document.getElementById("signOutBtn")
const form = document.getElementById("signInOutForm")
const usernameInput = document.getElementById("username")
const cameraContainer = document.getElementById("cameraContainer")
const photoPreview = document.getElementById("photoPreview")
const previewImage = document.getElementById("previewImage")

let stream = null
let photoTaken = false

document.addEventListener("DOMContentLoaded", () => {
  initializeCamera()
  updateButtonStates()
})

function initializeCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((videoStream) => {
      stream = videoStream
      video.srcObject = stream
      video.play()
    })
    .catch((err) => {
      console.error("Error accessing the camera: ", err)
      alert("Unable to access camera. Please make sure you have granted camera permissions.")
    })
}

function updateButtonStates() {
  const isSignedIn = localStorage.getItem("username") !== null
  signInBtn.disabled = isSignedIn
  signOutBtn.disabled = !isSignedIn
}

captureBtn.addEventListener("click", () => {
  try {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const photoData = canvas.toDataURL("image/jpeg", 0.8)
      previewImage.src = photoData
      video.classList.add("d-none")
      photoPreview.classList.remove("d-none")
      photoTaken = true
      cameraContainer.classList.remove("is-invalid")
    }
  } catch (error) {
    console.error("Error capturing photo:", error)
    alert("Error capturing photo. Please try again.")
  }
})

retakeBtn.addEventListener("click", () => {
  video.classList.remove("d-none")
  photoPreview.classList.add("d-none")
  photoTaken = false
})

function validateForm(action) {
  let isValid = true
  form.classList.add("was-validated")

  // Validate username
  const username = usernameInput.value.trim()
  if (!username || !validUsernames.includes(username)) {
    isValid = false
    usernameInput.classList.add("is-invalid")
  } else {
    usernameInput.classList.remove("is-invalid")
  }

  // Validate photo
  if (!photoTaken) {
    isValid = false
    cameraContainer.classList.add("is-invalid")
  } else {
    cameraContainer.classList.remove("is-invalid")
  }

  // Validate sign-in/sign-out state
  const isSignedIn = localStorage.getItem("username") !== null
  if (action === "signin" && isSignedIn) {
    alert("You are already signed in. Please sign out first.")
    isValid = false
  } else if (action === "signout" && !isSignedIn) {
    alert("You are not signed in. Please sign in first.")
    isValid = false
  }

  return isValid
}

async function handleSignInOut(action) {
  try {
    if (!validateForm(action)) {
      return
    }

    const username = usernameInput.value.trim()
    const photoData = canvas.toDataURL("image/jpeg", 0.5)

    const payload = {
      username,
      photo: photoData,
      action,
    }

    console.log("Sending payload:", { ...payload, photo: "[PHOTO_DATA]" })

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbx4YgUaoFzg0D3_qvc6e98Yk8LdM6aBYBrQlMmqtWexaxP_8yqZ1WHaQ1XtbTqz7N9h/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    if (action === "signin") {
      localStorage.setItem("username", username)
      window.location.href = "welcome.html"
    } else {
      localStorage.removeItem("username")
      alert("Signed out successfully!")
      resetForm()
    }
    updateButtonStates()
  } catch (error) {
    console.error("Error:", error)
    alert("An error occurred. Please try again.")
  }
}

function resetForm() {
  form.reset()
  form.classList.remove("was-validated")
  video.classList.remove("d-none")
  photoPreview.classList.add("d-none")
  photoTaken = false
  cameraContainer.classList.remove("is-invalid")
}

signInBtn.addEventListener("click", (e) => {
  e.preventDefault()
  handleSignInOut("signin")
})

signOutBtn.addEventListener("click", (e) => {
  e.preventDefault()
  handleSignInOut("signout")
})

window.addEventListener("beforeunload", () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
})

