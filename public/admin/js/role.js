// Check all permissions
function checkAllPermissions() {
  document.querySelectorAll('input[name="permissions"]').forEach((checkbox) => {
    checkbox.checked = true;
  });
}

// Uncheck all permissions
function uncheckAllPermissions() {
  document.querySelectorAll('input[name="permissions"]').forEach((checkbox) => {
    checkbox.checked = false;
  });
}

//update permission
const formPermission = document.querySelector("#form-update-permission");

if (formPermission) {
  formPermission.addEventListener("submit", (e) => {
    e.preventDefault();

    const tablePermission = document.querySelector("[table-permissions]");
    const input = formPermission.querySelector("input[type='text']");
    const roleIdList = tablePermission.querySelectorAll("[role-id]");
    const roles = [];
    roleIdList.forEach((item) => {
      const roleId = item.getAttribute("role-id");
      const role = {
        _id: roleId,
        permissions: [],
      };
      const checkedlist = tablePermission.querySelectorAll(
        `input[data-id="${roleId}"]:checked`
      );
      checkedlist.forEach((element) => {
        const dataName = element.getAttribute("data-name");
        role.permissions.push(dataName);
      });
      roles.push(role);
    });
    input.value = JSON.stringify(roles);
    console.log(input.value);

    formPermission.submit();
  });
}
