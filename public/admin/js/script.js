//handle filterStatus
const filterStatus = document.querySelectorAll("[btn-status]");
if (filterStatus) {
  filterStatus.forEach((item) => {
    item.addEventListener("click", () => {
      const status = item.getAttribute("btn-status");
      const url = new URL(window.location.href);
      url.searchParams.delete("page");
      if (status) url.searchParams.set("status", status);
      else url.searchParams.delete("status");
      window.location.href = url.href;
    });
  });
}

//handle search
const formSearch = document.querySelector("#form-search");

if (formSearch) {
  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = new URL(window.location.href);

    const keyword = e.target.elements.keyword.value;

    url.searchParams.delete("page");
    if (keyword) url.searchParams.set("keyword", keyword.trim());
    else url.searchParams.delete("keyword");
    window.location.href = url.href;
  });
}

//handle pagination
const pagination = document.querySelectorAll("[btn-page]");
if (pagination) {
  pagination.forEach((item) => {
    item.addEventListener("click", () => {
      const url = new URL(window.location.href);
      const page = item.getAttribute("btn-page");
      url.searchParams.set("page", page);
      window.location.href = url.href;
    });
  });
}

//handle check all (no request URL)
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
  const checkAll = checkboxMulti.querySelector(
    "input[name='check-change-all']"
  );
  const check = checkboxMulti.querySelectorAll("input[name='check-change']");
  if (checkAll) {
    checkAll.addEventListener("click", () => {
      if (checkAll.checked) {
        check.forEach((itemCheck) => {
          itemCheck.checked = true;
        });
      } else {
        check.forEach((itemCheck) => {
          itemCheck.checked = false;
        });
      }
    });
  }

  if (check) {
    check.forEach((itemCheck) => {
      itemCheck.addEventListener("click", () => {
        const countChecked = checkboxMulti.querySelectorAll(
          "input[name='check-change']:checked"
        ).length;

        if (countChecked === check.length) {
          checkAll.checked = true;
        } else checkAll.checked = false;
      });
    });
  }
}

//handle form change multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
  formChangeMulti.addEventListener("submit", (e) => {
    e.preventDefault();
    const boxChecked = checkboxMulti.querySelectorAll(
      "input[name='check-change']:checked"
    );
    const type = e.target.elements.type.value;

    if (boxChecked.length > 0 && type) {
      //comfirm xoa
      if (type === "delete") {
        if (!confirm("xác nhận xóa sản phẩm!")) return;
      }

      //gui req den server
      let listId = [];
      boxChecked.forEach((itemCheck) => {
        if (type === "Change position") {
          const inputPosition = itemCheck
            .closest("tr")
            .querySelector("input[name='position']");
          listId.push(itemCheck.value + "-" + inputPosition.value);
        } else listId.push(itemCheck.value);
      });

      const input = formChangeMulti.querySelector("input[type='text']");
      console.log(listId.join(", "));

      input.value = listId.join(", ");
      formChangeMulti.submit();
    } else alert("vui lòng chọn hoạt động và check vào box!");
  });
}

// handel Alert
const showAlert = document.querySelector("[alert-success]");
if (showAlert) {
  const timeShow = showAlert.getAttribute("data-time");
  setTimeout(() => {
    showAlert.classList.remove("show");
  }, timeShow);
}

//show image on upload image
const blockUploads = document.querySelectorAll(".upload-image");
console.log(blockUploads);

if (blockUploads) {
  blockUploads.forEach((element) => {
    const inputImg = element.querySelector("[upload-image-input]");
    const formImgPreview = element.querySelector(".form-imagePreview");
    const previewImg = element.querySelector("[upload-image-preview]");

    if (inputImg && previewImg) {
      inputImg.addEventListener("change", (e) => {
        formImgPreview.classList.remove("d-none");
        const [file] = e.target.files;
        previewImg.src = URL.createObjectURL(file);
      });
    }

    //handle click remove image upload
    const btnRemoveImg = element.querySelector("[btn-remove-imagePreview]");
    if (btnRemoveImg) {
      btnRemoveImg.addEventListener("click", (e) => {
        inputImg.value = "";
        formImgPreview.classList.add("d-none");
      });
    }
  });
}

//handle sort
const selectSort = document.querySelector("[select-sort]");
if (selectSort) {
  const btnSort = document.querySelector("[btn-sort]");
  const url = new URL(window.location.href);
  btnSort.addEventListener("click", (e) => {
    const valueSelected = selectSort.value.split("-");
    const [sortKey, sortValue] = valueSelected;
    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);
    window.location.href = url.href;
  });
}

//handle delete
const btnDelete = document.querySelectorAll("[btn-delete]");
const formDelete = document.querySelector("#form-delete");

if (formDelete && btnDelete) {
  btnDelete.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("xac nhan xoa san pham!")) {
        const id = btn.getAttribute("data-id");
        const path = formDelete.getAttribute("data-path");
        formDelete.action = path + `/${id}?_method=DELETE`;
        formDelete.submit();
      }
    });
  });
}
