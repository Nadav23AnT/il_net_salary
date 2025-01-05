window.deductionsChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [
      "נטו",
      "ניכוי נוסף",
      "מס הכנסה",
      "ביטוח לאומי",
      "ביטוח בריאות",
      "פנסיה",
      "קרן השתלמות",
    ],
    datasets: [
      {
        data: [
          neto,
          extra,
          tax,
          nationalInsurance,
          healthInsurance,
          pension,
          education,
        ],
        backgroundColor: [
          "#4CAF50",
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF9F40",
          "#BDB76B",
          "#8A2BE2",
        ],
      },
    ],
  },
  options: {
    responsive: true, // Enables responsiveness
    maintainAspectRatio: false, // Allows the chart to adjust to its container
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const percentage = ((context.raw / gross) * 100).toFixed(2);
            return `${context.label}: ₪${context.raw.toFixed(
              2
            )} (${percentage}%)`;
          },
        },
      },
    },
  },
});

window.annualSavingsChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["שנה 1", "שנתיים", "שלוש שנים", "חמש שנים"],
    datasets: [
      {
        label: "חסכונות שנתיים (₪)",
        data: [annualNeto, annualNeto * 2, annualNeto * 3, annualNeto * 5],
        borderColor: "#4CAF50",
        fill: false,
      },
    ],
  },
  options: {
    responsive: true, // Enables responsiveness
    maintainAspectRatio: false, // Allows the chart to adjust to its container
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  },
});
