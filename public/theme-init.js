try {
  if (localStorage.getItem("fundsim_dark_mode") === "light")
    document.documentElement.classList.add("light");
} catch (e) {}
