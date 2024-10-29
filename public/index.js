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