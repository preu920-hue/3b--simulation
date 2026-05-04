import React, { useContext } from "react";
import { SimulationContext } from "../../context/SimulationContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const lineOpts = (titleText) => ({
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: true },
    title: { display: true, text: titleText, font: { size: 13 } }
  },
  scales: {
    x: { title: { display: true, text: "Iterations" } },
    y: { title: { display: true, text: "Value" } }
  }
});

export const Exp3aGraph = () => {
  const { algoResults } = useContext(SimulationContext);
  if (!algoResults) return null;

  const { type, label, data } = algoResults;
  const iters = data.iterations;

  // MSE chart - common to all
  const mseChart = {
    labels: iters,
    datasets: [{
      label: "MSE",
      data: data.mse,
      borderColor: "red",
      borderWidth: 1,
      pointRadius: 0
    }]
  };

  // Weight convergence
  const colors = ["blue", "purple", "green", "orange", "teal"];
  const weightLabel = (type === "LMS_EQ" || type === "RLS_EQ") ? "w" : "w";
  const weightCharts = data.weights.slice(0, Math.min(data.weights.length, 3)).map((wArr, i) => ({
    labels: iters,
    datasets: [{
      label: `${weightLabel}${i + 1} (estimated)`,
      data: wArr,
      borderColor: colors[i % colors.length],
      borderWidth: 1,
      pointRadius: 0
    }]
  }));

  // Signal for prediction modes
  const showSignal = type === "LMS_PRED" || type === "RLS_PRED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", padding: "20px", background: "#fff", borderRadius: "8px", marginTop: "20px" }}>
      <h3 style={{ color: "#1D7480", margin: 0 }}>Algorithm Output — {label}</h3>

      {showSignal && data.signal && (
        <div style={{ height: "250px" }}>
          <Line
            data={{
              labels: Array.from({ length: data.signal.length }, (_, i) => i),
              datasets: [{ label: "AR Process Signal", data: data.signal, borderColor: "#1D7480", borderWidth: 1, pointRadius: 0 }]
            }}
            options={{ ...lineOpts("Generated AR Process Signal"), scales: { x: { title: { display: true, text: "Sample" } }, y: { title: { display: true, text: "Amplitude" } } } }}
          />
        </div>
      )}

      <div style={{ height: "280px" }}>
        <Line data={mseChart} options={lineOpts("Mean Square Error vs Iterations")} />
      </div>

      {weightCharts.map((wc, i) => (
        <div key={i} style={{ height: "260px" }}>
          <Line data={wc} options={lineOpts(`Weight w${i + 1} Convergence`)} />
        </div>
      ))}
    </div>
  );
};
