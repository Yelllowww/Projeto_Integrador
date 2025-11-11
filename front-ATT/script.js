// Dados mockados
const metricsData = [
  { name: "Jan", views: 45000, subscribers: 1200 },
  { name: "Fev", views: 52000, subscribers: 1800 },
  { name: "Mar", views: 48000, subscribers: 1500 },
  { name: "Abr", views: 61000, subscribers: 2200 },
  { name: "Mai", views: 55000, subscribers: 1900 },
  { name: "Jun", views: 67000, subscribers: 2800 },
]

const peakHours = [
  { hour: "06:00", engagement: 15 },
  { hour: "09:00", engagement: 35 },
  { hour: "12:00", engagement: 60 },
  { hour: "15:00", engagement: 45 },
  { hour: "18:00", engagement: 85 },
  { hour: "21:00", engagement: 95 },
  { hour: "00:00", engagement: 25 },
]

const audienceData = [
  { name: "18-24", value: 35 },
  { name: "25-34", value: 45 },
  { name: "35-44", value: 15 },
  { name: "45+", value: 5 },
]

const Chart = window.Chart // Supondo que Chart.js esteja disponível globalmente

Chart.defaults.color = "#94a3b8"
Chart.defaults.borderColor = "#334155"

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeTabs()
  initializeCharts()
  initializeAnalyzeButton()
})

// Sistema de Tabs
function initializeTabs() {
  const tabTriggers = document.querySelectorAll(".tab-trigger")
  const tabContents = document.querySelectorAll(".tab-content")

  tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetTab = trigger.getAttribute("data-tab")

      // Remover classe ativa de todos os gatilhos e conteúdos
      tabTriggers.forEach((t) => t.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      // Adicionar classe ativa ao gatilho clicado e conteúdo correspondente
      trigger.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

// Inicialização dos gráficos
function initializeCharts() {
  createGrowthChart()
  createPeakHoursChart()
  createAgeChart()
}

// Gráfico de crescimento mensal
function createGrowthChart() {
  const ctx = document.getElementById("growthChart").getContext("2d")

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: metricsData.map((d) => d.name),
      datasets: [
        {
          label: "Visualizações",
          data: metricsData.map((d) => d.views),
          backgroundColor: "#374151",
          borderRadius: 4,
        },
        {
          label: "Inscritos",
          data: metricsData.map((d) => d.subscribers),
          backgroundColor: "#6b7280",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "#334155",
          },
        },
        x: {
          grid: {
            color: "#334155",
          },
        },
      },
    },
  })
}

// Gráfico de horários de pico
function createPeakHoursChart() {
  const ctx = document.getElementById("peakHoursChart").getContext("2d")

  new Chart(ctx, {
    type: "line",
    data: {
      labels: peakHours.map((d) => d.hour),
      datasets: [
        {
          label: "Engajamento (%)",
          data: peakHours.map((d) => d.engagement),
          borderColor: "#1f2937",
          backgroundColor: "rgba(31, 41, 55, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: "#334155",
          },
        },
        x: {
          grid: {
            color: "#334155",
          },
        },
      },
    },
  })
}

// Gráfico de faixa etária
function createAgeChart() {
  const ctx = document.getElementById("ageChart").getContext("2d")

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: audienceData.map((d) => d.name),
      datasets: [
        {
          data: audienceData.map((d) => d.value),
          backgroundColor: ["#1f2937", "#374151", "#4b5563", "#6b7280"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  })
}

// Botão de análise
function initializeAnalyzeButton() {
  const analyzeBtn = document.getElementById("analyzeBtn")
  const searchInput = document.getElementById("searchInput")
  const btnText = analyzeBtn.querySelector(".btn-text")
  const spinner = analyzeBtn.querySelector(".spinner")

  analyzeBtn.addEventListener("click", () => {
    if (!searchInput.value.trim()) return

    // Mostrar loading
    btnText.classList.add("hidden")
    spinner.classList.remove("hidden")
    analyzeBtn.disabled = true

    // Simular análise
    setTimeout(() => {
      btnText.classList.remove("hidden")
      spinner.classList.add("hidden")
      analyzeBtn.disabled = false

      // Aqui você poderia fazer uma chamada real para API
      console.log("Analisando canal:", searchInput.value)
    }, 2000)
  })

  // Habilitar/desabilitar botão baseado no input
  searchInput.addEventListener("input", () => {
    analyzeBtn.disabled = !searchInput.value.trim()
  })
}

function updateChannelData(channelUrl) {
  // Esta função seria chamada quando uma URL real fosse analisada
  console.log("Atualizando dados para:", channelUrl)

  // Aqui você faria uma chamada para sua API de scraping
  // e atualizaria os dados na interface
}
