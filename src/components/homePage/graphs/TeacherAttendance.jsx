import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TeacherAttendance() {
  const [pmColor, setPmColor] = useState("#fff");
  const [key, setKey] = useState(0); // used to force re-render

  const getPmColor = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--pm-color")
      .trim() || "#fff";

  const updateColor = () => {
    setPmColor(getPmColor());
    setKey(prev => prev + 1); // force chart re-render
  };

  useEffect(() => {
    updateColor();

    // Listen for theme change across the app
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        setTimeout(() => updateColor(), 10); // wait for css variable to apply
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Also listen directly to internal theme switch (optional enhancement)
  useEffect(() => {
    const interval = setInterval(() => {
      const color = getPmColor();
      if (color !== pmColor) updateColor();
    }, 100); // check every 500ms

    return () => clearInterval(interval);
  }, [pmColor]);

  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Number of Teachers",
        data: [30, 2],
        backgroundColor: [pmColor, "#ffffff"],
      },
    ],
  };

  return (
    <div className="flex justify-center mt-1 mb-4">
      <div className="w-44 sm:w-52 md:w-48">
        <Doughnut data={data} key={key} />
      </div>
    </div>
  );
}
