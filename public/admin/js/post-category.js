//handle btn-change-status
const btnChangeStatus = document.querySelectorAll("[btn-change-status]");
const formChangeStatus = document.querySelector("#form-change-status");
if (btnChangeStatus && formChangeStatus) {
  const path = formChangeStatus.getAttribute("data-path");
  btnChangeStatus.forEach((itemBtn) => {
    itemBtn.addEventListener("click", () => {
      const id = itemBtn.getAttribute("data-id");
      const status = itemBtn.getAttribute("data-status");
      const convertStatus = status === "active" ? "inactive" : "active";

      const actionPath = path + `/${convertStatus}/${id}?_method=PATCH`;
      formChangeStatus.action = actionPath;
      formChangeStatus.submit();
    });
  });
}
