import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentAttendance() {
  const [chartColor, setChartColor] = useState("#000");
  const [key, setKey] = useState(0); // trigger rerender

  const getPmColor = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--pm-color")
      .trim() || "#000";

  const updateColor = () => {
    setChartColor(getPmColor());
    setKey((prev) => prev + 1); // force re-render
  };

  useEffect(() => {
    updateColor();

    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        setTimeout(() => updateColor(), 10);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Optional polling to detect direct changes
  useEffect(() => {
    const interval = setInterval(() => {
      const color = getPmColor();
      if (color !== chartColor) updateColor();
    }, 100);
    return () => clearInterval(interval);
  }, [chartColor]);

  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Number of Students",
        data: [300, 50],
        backgroundColor: [chartColor, "#ffffff"],
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
