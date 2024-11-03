document
  .getElementById("uploadForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Formun varsayılan gönderimini engelle

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please upload a MP3 file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Bekleme animasyonunu göster
    document.getElementById("loading").style.display = "block";
    document.getElementById("result").innerText = ""; // Butonu gizle

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      // Yanıtın durumunu kontrol et
      if (!response.ok) {
        throw new Error("An error occured: " + response.statusText);
      }

      const contentType = response.headers.get("Content-Type");

      // Yanıt JSON formatındaysa transkripti işle
      if (contentType.includes("application/json")) {
        const data = await response.json();

        // Gelen veriyi kontrol et
        console.log("Data from server:", data);

        document.getElementById("result").innerText =
          data.transcription || "Transcription can't be found.";

        // Eğer transkripsiyon başarılı geldiyse butonu göster
        if (data.transcription) {
          document.getElementById("assignButton").style.display =
            "inline-block";
        }
      } else if (contentType.includes("text/html")) {
        // Eğer yanıt HTML formatındaysa, HTML'yi göster
        const htmlResponse = await response.text();
        document.getElementById("result").innerHTML = htmlResponse;
      } else {
        throw new Error("Unexpected Content-Type: " + contentType);
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("result").innerText = "An error occured.";
    } finally {
      // Bekleme animasyonunu gizle
      document.getElementById("loading").style.display = "none";
    }
  });

  document.getElementById("assignButton").addEventListener("click", async function () {
    const transcription = document.getElementById("result").innerText;
    const classroomId = document.getElementById("classroom_id_input").value;
  
    if (classroomId && transcription) {
      try {
        // Call assignHomeworkByClassroom with classroomId and transcription
        assignHomeworkByClassroom(classroomId, transcription);
  
        document.getElementById("result").innerText = "Assigned Successfully";
        document.getElementById("result").style.color = "green";
        this.style.display = "none"; // Hide the button after success
      } catch (error) {
        console.error("Error in assignment:", error);
        document.getElementById("result").innerText = "Assignment failed.";
        document.getElementById("result").style.color = "red";
      }
    } else {
      alert("Please ensure both Classroom ID and transcription are available.");
    }
  });
  document.addEventListener("DOMContentLoaded", function() {
    const collapsibles = document.querySelectorAll(".collapsible");
    collapsibles.forEach(collapsible => {
      collapsible.addEventListener("click", function() {
        this.classList.toggle("active");
        
        // Toggle content display
        const content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    });
  });