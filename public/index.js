// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5UHH0OQQfQgKFRF3G6W9fyRIjiAZ19VU",
  authDomain: "hackathon-logic-team-140d8.firebaseapp.com",
  projectId: "hackathon-logic-team-140d8",
  storageBucket: "hackathon-logic-team-140d8.firebasestorage.app",
  messagingSenderId: "170299619975",
  appId: "1:170299619975:web:9fd0fa423b91618196d622",
  measurementId: "G-R8EGQXKC2C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize variables
const auth = firebase.auth();
const db = firebase.firestore(); // Firestore initialization

// Set up our register function
// Set up our register function
function register() {
  // Get all input fields
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const full_name = document.getElementById("full_name").value;
  const role = document.getElementById("role").value; // 1 for admin, 0 for user
  const classroom_id = document.getElementById("classroom_id").value; // Get classroom_id

  // Validate input fields
  if (!validate_email(email) || !validate_password(password)) {
    alert("Email or Password is Outta Line!!");
    return;
  }
  if (!validate_field(full_name) || !validate_field(classroom_id)) {
    alert("Full name and Classroom ID are required!");
    return;
  }

  // Register the user
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(function () {
      const user = auth.currentUser;

      // Create user data with role and classroom_id
      const user_data = {
        email: email,
        full_name: full_name,
        role: parseInt(role),
        classroom_id: classroom_id, // Include classroom_id
        last_login: Date.now(),
      };

      // Write user data to Firestore
      db.collection("user")
        .doc(user.uid)
        .set(user_data)
        .then(() => {
          alert("User Created!!");
          // Redirect based on role
          if (role == 1) {
            window.location.href = "admin.html";
          } else {
            window.location.href = "user.html";
          }
        })
        .catch((error) => {
          console.error("Error writing document to Firestore: ", error);
          alert("There was an error saving the user data.");
        });
    })
    .catch(function (error) {
      console.error("Error creating user with email/password: ", error);
      alert(error.message);
    });
}

// Set up our login function
// Set up our login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!validate_email(email) || !validate_password(password)) {
    alert("Email or Password is Outta Line!!");
    return;
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .then(function () {
      console.log("User logged in successfully.");
      const user = auth.currentUser;

      // Get user data from Firestore to check role and classroom_id
      db.collection("user")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();

            // Check if the classroom_id matches
              // Update last login
              db.collection("user")
                .doc(user.uid)
                .update({
                  last_login: Date.now(),
                })
                .then(() => {
                  alert("User Logged In!!");
                  // Redirect based on role
                  if (userData.role === 1) {
                    window.location.href = "admin.html";
                  } else {
                    window.location.href = "user.html";
                  }
                })
                .catch((error) => {
                  console.error(
                    "Error updating document in Firestore: ",
                    error
                  );
                  alert("There was an error updating the user data.");
                });
              }
          else {
            alert("User profile does not exist in Firestore.");
          }
        })
        .catch((error) => {
          console.error("Error fetching document from Firestore: ", error);
        });
    })
    .catch(function (error) {
      console.error("Error logging in: ", error);
      alert(error.message);
    });
}

// Function to get current user's data
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const user = firebase.auth().currentUser;

    if (user) {
      db.collection("user").doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            resolve(doc.data());
          } else {
            reject("No such user document!");
          }
        })
        .catch((error) => {
          reject("Error getting current user data: " + error);
        });
    } else {
      reject("No user is logged in");
    }
  });
}

// Function to load users with role 0 and matching classroom_id
const addedUserEmails = new Set();

function loadUsersForAdmin() {
  const userListDiv = document.getElementById("user_list");

  // Eğer kullanıcılar zaten listelenmişse, fonksiyonu sonlandır
  if (userListDiv.childElementCount > 0) {
    return;
  }

  // Clear existing users
  userListDiv.innerHTML = "";

  getCurrentUser().then((currentUser) => {
    if (!currentUser || !currentUser.classroom_id) {
      console.error("Current user or classroom_id is missing.");
      return;
    }

    const currentUserClassroomId = currentUser.classroom_id;
    console.log("Current User Classroom ID:", currentUserClassroomId);

    db.collection("user")
      .where("role", "==", 0) // Sadece role 0 olan kullanıcıları filtrele
      .where("classroom_id", "==", currentUserClassroomId) // Aynı classroom_id'ye sahip olanlar
      .get()
      .then((querySnapshot) => {
        // Eğer hiç kullanıcı yoksa mesaj göster
        if (querySnapshot.empty) {
          userListDiv.innerHTML = "<p>No users found with role 0 and matching classroom.</p>";
          return;
        }

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const userEmail = userData.email;

          // Eğer kullanıcı daha önce eklendiyse, bu kullanıcıyı atla
          if (addedUserEmails.has(userEmail)) {
            return;
          }

          // Add user email to the set to avoid duplicates
          addedUserEmails.add(userEmail);

          // Yeni bir div oluştur ve kullanıcı bilgilerini ekle
          const userDiv = document.createElement("div");
          userDiv.setAttribute("data-id", doc.id);

          userDiv.innerHTML = `
            <p>Full Name: ${userData.full_name}</p>
            <p>Email: ${userEmail}</p>
            <p>Classroom ID: ${userData.classroom_id}</p>
          `;
          
          userListDiv.appendChild(userDiv);
        });
      })
      .catch((error) => {
        console.error("Error fetching users: ", error);
      });
  }).catch((error) => {
    console.error("Error getting current user: ", error);
  });
}
// Function to assign homework to all users in a specific classroom
function assignHomeworkByClassroom(classroom_id, homework) {
  if (homework && classroom_id) {
    db.collection("user")
      .where("classroom_id", "==", classroom_id)
      .where("role", "==", 0)
      .get()
      .then((querySnapshot) => {
        const batch = db.batch();

        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { homework: homework });
        });

        return batch.commit();
      })
      .then(() => {
        alert("Homework assigned to all students in the classroom!");
      })
      .catch((error) => {
        console.error("Error assigning homework to classroom: ", error);
      });
  } else {
    alert("Please enter a Classroom ID and homework assignment.");
  }
}
// Function to remove homework from all users in a specific classroom
function removeHomeworkByClassroom() {
  const classroom_id = document.getElementById(
    "classroom_id_input_remove"
  ).value;

  if (classroom_id) {
    db.collection("user")
      .where("classroom_id", "==", classroom_id)
      .get()
      .then((querySnapshot) => {
        const batch = db.batch(); // Use a batch for multiple writes

        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, {
            homework: firebase.firestore.FieldValue.delete(),
          });
        });

        return batch.commit(); // Commit all updates
      })
      .then(() => {
        alert("Homework removed from all students in the classroom!");
      })
      .catch((error) => {
        console.error("Error removing homework from classroom: ", error);
      });
  } else {
    alert("Please enter a Classroom ID.");
  }
}
// Function to load and display user profile data
function loadUserProfile() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      db.collection("user")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            document.getElementById("user_profile").innerHTML = `
                        <p>Full Name: ${userData.full_name}</p>
                        <p>Email: ${userData.email}</p>
                        <p>Classroom ID: ${userData.classroom_id}</p>
                        <p>Homework: ${
                          userData.homework
                            ? userData.homework
                            : "No homework assigned"
                        }</p>
                    `;
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      alert("No user is signed in.");
    }
  });
}

// Validate Functions
function validate_email(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function validate_password(password) {
  return password.length >= 6;
}

function validate_field(field) {
  return field != null && field.length > 0;
}
function logout() {
  auth.signOut().then(function() {
      alert("Logged out succesfully.");
      window.location.href = 'login.html';
  }).catch(function(error) {
      console.error("Log out error:", error);
  });
}

function if_logged_in() {
  const auth = firebase.auth();
        // Check if the user is logged in
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // If user is not logged in, redirect to login page
      window.location.href = "login.html";
    }
  });
}
function displayUserNameforUser() {
  if_logged_in();
  // Reference to the div where the user's name will be displayed
  const usernameDiv = document.getElementById("user");

  // Ensure the usernameDiv element exists
  if (!usernameDiv) {
    console.error("Element with id 'user' not found in the DOM.");
    return;
  }
  // Wait for auth.currentUser to be available
  auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
      const userId = currentUser.uid;

      // Get user data from Firestore
      db.collection("user")
        .doc(userId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if(userData.role == 0){ // eğer kullanıcı öğrenci rolüne sahipse ismi görüntüle
              usernameDiv.innerHTML = `<p>Kullanıcı: ${userData.full_name}</p>`;
            }
            else{ // değilse öğretmen sayfasına yönlendir
              alert("You do not have access to this page.");
              window.location.href = "admin.html";
            }
            
          } else {
            console.error("No such user document in Firestore.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      console.error("No authenticated user found.");
    }
  });
}
function displayUserNameforAdmin() {
  if_logged_in();
  // Reference to the div where the user's name will be displayed
  const usernameDiv = document.getElementById("user");

  // Ensure the usernameDiv element exists
  if (!usernameDiv) {
    console.error("Element with id 'user' not found in the DOM.");
    return;
  }
  // Wait for auth.currentUser to be available
  auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
      const userId = currentUser.uid;

      // Get user data from Firestore
      db.collection("user")
        .doc(userId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if(userData.role == 1){ // eğer kullanıcı öğretmen rolüne sahipse ismi görüntüle
              usernameDiv.innerHTML = `<p>Kullanıcı: ${userData.full_name}</p>`;
            }
            else{ // değilse öğrenci sayfasına yönlendir
              alert("You do not have access to this page.");
              window.location.href = "user.html";
            }
            
          } else {
            console.error("No such user document in Firestore.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      console.error("No authenticated user found.");
    }
  });
}
function loadHwforUser() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      db.collection("user")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const homeworkText = userData.homework || "No homework assigned";
            const truncatedText = homeworkText.length > 100 ? homeworkText.substring(0, 100) + "..." : homeworkText;

            // Render homework text with a Read More option if it's too long
            document.getElementById("user_hw").innerHTML = `
              <p>Homework: <span id="homework-content">${truncatedText}</span></p>
              ${homeworkText.length > 100 ? `<button id="read-more-btn">Read More</button>` : ""}
            `;

            // Add event listener to the Read More button if it's present
            const readMoreBtn = document.getElementById("read-more-btn");
            if (readMoreBtn) {
              readMoreBtn.addEventListener("click", function () {
                document.getElementById("homework-content").textContent = homeworkText;
                readMoreBtn.style.display = "none"; // Hide the Read More button
              });
            }
          }
        });
    }
  });
}
