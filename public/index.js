require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const full_name = document.getElementById("full_name").value;
    const role = document.getElementById("role").value; // 1 admin, 0 user
    const classroom_id = document.getElementById("classroom_id").value;
  
    if (!validate_email(email) || !validate_password(password)) {
      alert("Email veya Şifre hatalı!");
      return;
    }
    if (!validate_field(full_name) || !validate_field(classroom_id)) {
      alert("Full name ve Classroom ID zorunludur!");
      return;
    }
  
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(function () {
        const user = auth.currentUser;

        const user_data = {
          email: email,
          full_name: full_name,
          role: parseInt(role),
          classroom_id: classroom_id,
          last_login: Date.now(),
        };
  
        db.collection("user")
          .doc(user.uid)
          .set(user_data)
          .then(() => {
            alert("Kullanıcı oluşturuldu!");
            if (role == 1) {
              window.location.href = "admin.html";
            } else {
              window.location.href = "user.html";
            }
          })
          .catch((error) => {
            console.error("Firestore yazdırırken hata: ", error);
            alert("Kullanıcı verisini kaydederken hata oluştu.");
          });
      })
      .catch(function (error) {
        console.error("Kullanıcı oluştururken email/password hatası: ", error);
        alert(error.message);
      });
  }
  
  function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const classroom_id = document.getElementById("classroom_id").value;
  
    if (!validate_email(email) || !validate_password(password)) {
      alert("Email veya Şifre hatalı!");
      return;
    }
    if (!validate_field(classroom_id)) {
      alert("Classroom ID zorunludur!");
      return;
    }
  
    auth
      .signInWithEmailAndPassword(email, password)
      .then(function () {
        console.log("Kullanıcı başarıyla giriş yaptı.");
        const user = auth.currentUser;
  
        db.collection("user")
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const userData = doc.data();
  
              if (userData.classroom_id === classroom_id) {
                db.collection("user")
                  .doc(user.uid)
                  .update({
                    last_login: Date.now(),
                  })
                  .then(() => {
                    alert("Kullanıcı giriş yaptı.");
                    if (userData.role === 1) {
                      window.location.href = "admin.html";
                    } else {
                      window.location.href = "user.html";
                    }
                  })
                  .catch((error) => {
                    console.error(
                      "Firestore'ı güncellerken hata: ",
                      error
                    );
                    alert("Kullanıcı verisini güncellerken hata oluştu.");
                  });
              } else {
                alert("Yanlış Classroom ID.");
                auth.signOut();
              }
            } else {
              alert("Kullanıcı Firestore'da yok.");
            }
          })
          .catch((error) => {
            console.error("Firestore'dan veri çekerken hata: ", error);
          });
      })
      .catch(function (error) {
        console.error("Giriş yaparken hata: ", error);
        alert(error.message);
      });
  }

  function loadUsersForAdmin() {
    const userListDiv = document.getElementById("user_list");
    userListDiv.innerHTML = "";
  
    db.collection("user")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const userDiv = document.createElement("div");
          userDiv.setAttribute("data-id", doc.id);

          userDiv.innerHTML = `
                  <p>Full Name: ${userData.full_name} ${
            userData.role === 1 ? "(Admin)" : ""
          }</p>
                  <p>Classroom ID: ${userData.classroom_id}</p>
                  <p>Homework: ${
                    userData.homework ? userData.homework : "Ödev atanmadı."
                  }</p>
                  <hr>
              `;
          userListDiv.appendChild(userDiv);
        });
      })
      .catch((error) => {
        console.error("Kullanıcılara erişirken hata: ", error);
      });
  }

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
                              : "Ödev atanmadı."
                          }</p>
                      `;
            }
          })
          .catch((error) => {
            console.error("Kullanıcılara erişirken hata: ", error);
          });
      } else {
        alert("Giriş yapılmadı.");
      }
    });
  }

function assignHomeworkByClassroom() {
    const classroom_id = document.getElementById("classroom_id_input").value;
    const homework = prompt("Ödev girin:");
  
    if (homework && classroom_id) {
      db.collection("user")
        .where("classroom_id", "==", classroom_id)
        .get()
        .then((querySnapshot) => {
          const batch = db.batch();
  
          querySnapshot.forEach((doc) => {
            batch.update(doc.ref, { homework: homework });
          });
  
          return batch.commit();
        })
        .then(() => {
          alert("Sınıftaki herkese ödeva atandı.");
        })
        .catch((error) => {
          console.error("Sınıfa ödev atamada hata: ", error);
        });
    } else {
      alert("Classroom ID ve ödev girin.");
    }
  }
  
function removeHomeworkByClassroom() {
    const classroom_id = document.getElementById(
      "classroom_id_input_remove"
    ).value;
  
    if (classroom_id) {
      db.collection("user")
        .where("classroom_id", "==", classroom_id)
        .get()
        .then((querySnapshot) => {
          const batch = db.batch();
  
          querySnapshot.forEach((doc) => {
            batch.update(doc.ref, {
              homework: firebase.firestore.FieldValue.delete(),
            });
          });
  
          return batch.commit();
        })
        .then(() => {
          alert("Sınıtaki herkesten ödev kaldırıldı.");
        })
        .catch((error) => {
          console.error("Sınıftan ödev kaldırırken hata: ", error);
        });
    } else {
      alert("Classroom ID girin.");
    }
  }

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