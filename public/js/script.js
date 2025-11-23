//handle filterStatus
const filterStatus = document.querySelectorAll("[btn-status]");
if (filterStatus) {
  filterStatus.forEach((item) => {
    item.addEventListener("click", () => {
      const status = item.getAttribute("btn-status");
      const url = new URL(window.location.href);
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
    console.log(keyword);

    if (keyword) url.searchParams.set("keyword", keyword.trim());
    else url.searchParams.delete("keyword");

    window.location.href = url.href;
  });
}
