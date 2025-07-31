let primaryColor = null;
let secondaryColor = null;
let backgroundImage = null;
let languageCode = null;

const updateThemeColors = () => {
  const savedTheme = JSON.parse(localStorage.getItem("theme"));
  const savedLanguage = JSON.parse(localStorage.getItem("language"));

  primaryColor = savedTheme?.primary || null;
  secondaryColor = savedTheme?.secondary || null;
  backgroundImage = savedTheme?.bg || null;
  languageCode = savedLanguage?.code || null;

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

// Initial call
updateThemeColors();

// Re-run on every click anywhere in the document
document.addEventListener("click", updateThemeColors);

// Optional: Clean up if this is used inside a component
// Example (for React useEffect): return () => document.removeEventListener("click", updateThemeColors);

// Export getters
export { primaryColor, secondaryColor, backgroundImage, languageCode };
