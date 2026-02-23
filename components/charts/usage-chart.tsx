"use client";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

type UsageChartProps = {
  labels: string[];
  values: number[];
};

export function UsageChart({ labels, values }: UsageChartProps) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Env commits",
            data: values,
            borderColor: "rgb(34, 211, 238)",
            backgroundColor: "rgba(34, 211, 238, 0.2)",
            tension: 0.35,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#d4d4d8" },
          },
        },
        scales: {
          x: {
            ticks: { color: "#a1a1aa" },
            grid: { color: "rgba(39,39,42,0.6)" },
          },
          y: {
            ticks: { color: "#a1a1aa" },
            grid: { color: "rgba(39,39,42,0.6)" },
          },
        },
      }}
    />
  );
}
