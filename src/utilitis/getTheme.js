let primaryColor = null;
let secondaryColor = null;
let backgroundImage = null;

const updateThemeColors = () => {
  const savedTheme = JSON.parse(localStorage.getItem("theme"));
  primaryColor = savedTheme?.primary || null;
  secondaryColor = savedTheme?.secondary || null;
  backgroundImage = savedTheme?.bg || null;

  // Animate body background
  const body = document.body;
  body.style.transition = "background-image 0.5s ease-in-out";
  body.style.backgroundImage = `url(${backgroundImage})`;
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  body.style.backgroundRepeat = "no-repeat";
  body.style.backgroundAttachment = "fixed";
  body.style.minHeight = "100vh";
  body.style.maxWidth = "100vw";
};

updateThemeColors(); // Initial call

window.addEventListener("storage", updateThemeColors);

// Optional: 100ms fallback checker (for changes in the same tab)
setInterval(updateThemeColors, 100);

// Export getters
export { primaryColor, secondaryColor, backgroundImage };