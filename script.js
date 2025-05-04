const validUsernames = [
  "mo.ahmed",
  "ma.haitham",
  "h.ayman",
  "s.mohamed",
  "me.ahmed",
  "sh.sabry",
  "sh.wael",
  "y.adel",
  "b.nady",
  "h.tarek",
  "t.mahmoud",
  "e.khaled",
  "mo.atef",
  "y.ahmed",
  "j.mohamed",
  "sh.adel",
  "z.medhat",
  "kh.ashraf",
  "y.mahmoud",
  "n.abdelrahman",
  "mo.abdullah",
  "y.mohamed",
  "a.yasser",
  "r.saeed",
  "d.mohamed",
  "a.emad",
  "r.mahmoud",
  "a.hossam",
  "a.maher",
  "h.esam",
  "kamal"
];

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
let isRequestInProgress = false

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
  const currentUsername = usernameInput.value.trim()
  const signedInUser = localStorage.getItem("signedInUser")

  signInBtn.disabled = isRequestInProgress || signedInUser === currentUsername
  signOutBtn.disabled = isRequestInProgress || signedInUser !== currentUsername
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

  const username = usernameInput.value.trim()
  if (!username || !validUsernames.includes(username)) {
    isValid = false
    usernameInput.classList.add("is-invalid")
  } else {
    usernameInput.classList.remove("is-invalid")
  }

  if (!photoTaken) {
    isValid = false
    cameraContainer.classList.add("is-invalid")
  } else {
    cameraContainer.classList.remove("is-invalid")
  }

  const signedInUser = localStorage.getItem("signedInUser")
  if (action === "signin" && signedInUser === username) {
    alert("This user is already signed in.")
    isValid = false
  } else if (action === "signout" && signedInUser !== username) {
    alert("This user is not currently signed in.")
    isValid = false
  }

  return isValid
}

async function handleSignInOut(action) {
  console.log(`Starting ${action} process`)
  try {
    if (isRequestInProgress) {
      console.log("A request is already in progress. Please wait.")
      return
    }

    if (!validateForm(action)) {
      console.log(`Form validation failed for ${action}`)
      return
    }

    isRequestInProgress = true
    updateButtonStates()

    const username = usernameInput.value.trim()
    const photoData = canvas.toDataURL("image/jpeg", 0.5)

    const payload = {
      username,
      photo: photoData,
      action,
      timestamp: new Date().toISOString(),
    }

    console.log(`Sending ${action} payload:`, { ...payload, photo: "[PHOTO_DATA]" })

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

    console.log(`${action} response received:`, response)

    if (response.type === "opaque") {
      console.log(`${action} request sent successfully, but response is opaque due to CORS restrictions`)
    }

    if (action === "signin") {
      localStorage.setItem("signedInUser", username)
      localStorage.setItem("signInTime", new Date().toISOString())
      console.log(`User ${username} signed in successfully`)
      window.location.href = "welcome.html"
    } else {
      localStorage.removeItem("signedInUser")
      localStorage.removeItem("signInTime")
      console.log(`User ${username} signed out successfully`)
      alert("Signed out successfully!")
      resetForm()
    }
  } catch (error) {
    console.error(`Error during ${action}:`, error)
    alert(`An error occurred during ${action}. Please try again.`)
  } finally {
    isRequestInProgress = false
    updateButtonStates()
    console.log(`${action} process completed`)
  }
}

function resetForm() {
  form.reset()
  form.classList.remove("was-validated")
  video.classList.remove("d-none")
  photoPreview.classList.add("d-none")
  photoTaken = false
  cameraContainer.classList.remove("is-invalid")
  updateButtonStates()
}

usernameInput.addEventListener("input", updateButtonStates)

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

