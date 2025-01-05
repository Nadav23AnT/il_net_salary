// Constants for Tax and Deductions
const TAX_CREDIT_VALUE = 235; // ₪ per tax credit point per month
const taxBrackets = [
  { limit: 77400, rate: 0.1 },
  { limit: 110880, rate: 0.14 },
  { limit: 178080, rate: 0.2 },
  { limit: 247440, rate: 0.31 },
  { limit: 514920, rate: 0.35 },
  { limit: Infinity, rate: 0.47 },
];

const deductions = {
  employee: { nationalInsurance: 0.07, healthInsurance: 0.05 },
  selfEmployed: { nationalInsurance: 0.115, healthInsurance: 0.07 },
};

// Toggle Extra Deduction Field for Self-Employed
document.getElementById("employmentType").addEventListener("change", () => {
  const employmentType = document.getElementById("employmentType").value;
  const extraDeductionContainer = document.getElementById(
    "extraDeductionContainer"
  );
  extraDeductionContainer.style.display =
    employmentType === "selfEmployed" ? "block" : "none";
});

// Calculate Neto Salary and Update Charts
function calculateNeto() {
  // Input Values
  const employmentType = document.getElementById("employmentType").value;
  const monthlyHours =
    parseFloat(document.getElementById("monthlyHours").value) || 0;
  const hourlyRate =
    parseFloat(document.getElementById("hourlyRate").value) || 0;
  const taxCreditPoints =
    parseFloat(document.getElementById("taxCreditPoints").value) || 0;
  const pensionPercentage =
    parseFloat(document.getElementById("pensionPercentage").value) || 0;
  const educationFundPercentage =
    parseFloat(document.getElementById("educationFundPercentage").value) || 0;
  const deductionScaling =
    parseFloat(document.getElementById("deductionPercentage").value) || 100;
  const extraDeductionPercentage =
    employmentType === "selfEmployed"
      ? parseFloat(document.getElementById("extraDeduction").value) || 0
      : 0;

  // Calculate Monthly Gross Salary
  const monthlyGross = monthlyHours * hourlyRate;

  // Step 1: Deduct Extra Deduction First (if applicable)
  const extraDeduction = (monthlyGross * extraDeductionPercentage) / 100;
  const grossAfterExtraDeduction = monthlyGross - extraDeduction;

  // Step 2: Calculate Taxable Income
  const annualGrossAfterExtraDeduction = grossAfterExtraDeduction * 12;
  let annualTax = calculateAnnualTax(annualGrossAfterExtraDeduction);
  const annualTaxCredits = taxCreditPoints * TAX_CREDIT_VALUE * 12;
  annualTax = Math.max(annualTax - annualTaxCredits, 0);
  const monthlyTax = annualTax / 12;

  // Step 3: Calculate National Insurance and Health Insurance
  const { nationalInsurance, healthInsurance } = deductions[employmentType];
  const nationalInsuranceDeduction =
    grossAfterExtraDeduction * nationalInsurance;
  const healthInsuranceDeduction = grossAfterExtraDeduction * healthInsurance;

  // Step 4: Pension and Education Fund Deductions
  const scaledPension = (pensionPercentage * deductionScaling) / 100;
  const scaledEducationFund =
    (educationFundPercentage * deductionScaling) / 100;
  const pensionDeduction = grossAfterExtraDeduction * (scaledPension / 100);
  const educationFundDeduction =
    grossAfterExtraDeduction * (scaledEducationFund / 100);

  // Total Deductions
  const totalDeductions =
    extraDeduction +
    monthlyTax +
    nationalInsuranceDeduction +
    healthInsuranceDeduction +
    pensionDeduction +
    educationFundDeduction;

  // Monthly Neto Salary
  const monthlyNeto = Math.max(monthlyGross - totalDeductions, 0);
  const annualNeto = monthlyNeto * 12;

  // Call the updateResults function to update the UI dynamically
  updateResults({
    monthlyNeto,
    monthlyTax,
    monthlyNationalInsurance: nationalInsuranceDeduction,
    monthlyHealthInsurance: healthInsuranceDeduction,
    monthlyPensionDeduction: pensionDeduction,
    monthlyEducationFundDeduction: educationFundDeduction,
    totalDeductions,
  });

  // Update Charts
  updateDeductionsChart(
    monthlyGross,
    extraDeduction,
    monthlyTax,
    nationalInsuranceDeduction,
    healthInsuranceDeduction,
    pensionDeduction,
    educationFundDeduction,
    monthlyNeto
  );

  updateAnnualSavingsChart(annualNeto);
}

// Calculate Annual Tax
function calculateAnnualTax(annualGross) {
  let tax = 0;
  let remaining = annualGross;

  for (const bracket of taxBrackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, bracket.limit);
    tax += taxable * bracket.rate;
    remaining -= taxable;
  }

  return tax;
}

function updateDeductionsChart(
  gross,
  extra,
  tax,
  nationalInsurance,
  healthInsurance,
  pension,
  education,
  neto
) {
  const ctx = document.getElementById("deductionsChart").getContext("2d");

  // בדיקה אם קיים גרף קודם ולהשמיד אותו אם קיים
  if (
    window.deductionsChart &&
    typeof window.deductionsChart.destroy === "function"
  ) {
    window.deductionsChart.destroy();
  }

  // יצירת גרף חדש
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
}

function updateAnnualSavingsChart(annualNeto) {
  const ctx = document.getElementById("annualSavingsChart").getContext("2d");

  // בדיקה אם קיים גרף קודם ולהשמיד אותו אם קיים
  if (
    window.annualSavingsChart &&
    typeof window.annualSavingsChart.destroy === "function"
  ) {
    window.annualSavingsChart.destroy();
  }

  // יצירת גרף חדש
  window.annualSavingsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["שנה ראשונה", "שנתיים", "שלוש שנים", "חמש שנים"],
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
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
    },
  });
}

function updateResults({
  monthlyNeto,
  monthlyTax,
  monthlyNationalInsurance,
  monthlyHealthInsurance,
  monthlyPensionDeduction,
  monthlyEducationFundDeduction,
  totalDeductions,
}) {
  // Update Neto Salary
  document.getElementById("monthlyNeto").textContent = `₪${monthlyNeto.toFixed(
    2
  )}`;

  // Update Breakdown
  document.getElementById("taxDeduction").textContent = `₪${monthlyTax.toFixed(
    2
  )}`;
  document.getElementById(
    "nationalInsurance"
  ).textContent = `₪${monthlyNationalInsurance.toFixed(2)}`;
  document.getElementById(
    "healthInsurance"
  ).textContent = `₪${monthlyHealthInsurance.toFixed(2)}`;
  document.getElementById(
    "pensionDeduction"
  ).textContent = `₪${monthlyPensionDeduction.toFixed(2)}`;
  document.getElementById(
    "educationFund"
  ).textContent = `₪${monthlyEducationFundDeduction.toFixed(2)}`;
  document.getElementById(
    "totalDeductions"
  ).textContent = `₪${totalDeductions.toFixed(2)}`;
}
