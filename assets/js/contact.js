const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const subject = formData.get("subject").trim();
    const body = [
      `お名前：${formData.get("name").trim()}`,
      `メールアドレス：${formData.get("email").trim()}`,
      "",
      "お問い合わせ内容：",
      formData.get("message").trim(),
    ].join("\r\n");

    window.location.href = `mailto:kbc-2gm@kbcgroup.ac.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
