const body = document.querySelector("body");
const modal = document.querySelector(".modal");
const modalButton = document.querySelector(".modal-button");
const closeButton = document.querySelector(".close-button");
const scrollDown = document.querySelector(".scroll-down");
let isOpened = false;

const openModal = () => {
  modal.classList.add("is-open");
  body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-open");
  body.style.overflow = "initial";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > window.innerHeight / 3 && !isOpened) {
    isOpened = true;
    scrollDown.style.display = "none";
    openModal();
  }
});

modalButton.addEventListener("click", openModal);
closeButton.addEventListener("click", closeModal);

document.onkeydown = evt => {
  evt = evt || window.event;
  evt.keyCode === 27 ? closeModal() : false;
};


document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const password = document.getElementById('password').value;
  if (!name || !password) {
    alert('يرجى إدخال الاسم وكلمة المرور');
    return;
  }
  // إرسال البيانات للسيرفر
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  })
  
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/dashboard';
      localStorage.setItem('username', name); // just for display
    } else {
      alert('فشل تسجيل الدخول: ' + (data.message || 'بيانات خاطئة'));
    }
  })
  .catch(error => {
    console.error('Login Error:', error);
    alert('حدث خطأ أثناء محاولة تسجيل الدخول');
  });
});

