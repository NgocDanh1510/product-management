// Form validation
document
  .getElementById("checkoutForm")
  .addEventListener("submit", function (e) {
    const requiredFields = this.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add("is-invalid");
      } else {
        field.classList.remove("is-invalid");
      }
    });

    if (!isValid) {
      e.preventDefault();
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
  });

// City/District/Ward cascade
const citySelect = document.getElementById("city");
const districtSelect = document.getElementById("district");
const wardSelect = document.getElementById("ward");

citySelect.addEventListener("change", function () {
  districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
  wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';

  // Simulate loading districts (replace with real API)
  if (this.value) {
    const districts = ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5"];
    districts.forEach((d) => {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      districtSelect.appendChild(option);
    });
  }
});

districtSelect.addEventListener("change", function () {
  wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';

  // Simulate loading wards (replace with real API)
  if (this.value) {
    const wards = ["Phường 1", "Phường 2", "Phường 3", "Phường 4"];
    wards.forEach((w) => {
      const option = document.createElement("option");
      option.value = w;
      option.textContent = w;
      wardSelect.appendChild(option);
    });
  }
});
