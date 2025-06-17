// Modern color palette for FLPs
export const colors = [
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage
  '#FFBE0B', // Yellow
  '#9B5DE5', // Purple
  '#FF85EA', // Pink
  '#00B4D8', // Cyan
  '#2EC4B6', // Teal (backup color)
  '#FF9F1C', // Orange (backup color)
]

// Plot configuration
export const plotConfig = {
  responsive: true,
  displayModeBar: false,
  scrollZoom: false,
}

// Plot layout configuration
export const createPlotLayout = () => ({
  title: {
    text: 'Fair Launch Process Manual AO Yield',
    font: {
      size: 24,
      family: 'Inter, system-ui, sans-serif',
    },
    y: 0.95,
  },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: {
    color: 'var(--color-text)',
  },
  xaxis: {
    title: 'Date',
    gridcolor: 'rgba(128,128,128,0.2)',
    zerolinecolor: 'rgba(128,128,128,0.2)',
    type: 'date',
    tickformat: '%Y-%m-%d',
    hoverformat: '%Y-%m-%d',
    showgrid: true,
    fixedrange: true,
  },
  yaxis: {
    title: 'AO Yield Amount',
    gridcolor: 'rgba(128,128,128,0.2)',
    zerolinecolor: 'rgba(128,128,128,0.2)',
    showgrid: true,
    fixedrange: true,
    rangemode: 'tozero',
  },
  hoverlabel: {
    bgcolor: 'rgba(255, 255, 255, 0.95)',
    font: {
      family: 'Inter, system-ui, sans-serif',
      size: 14,
      color: '#213547'
    },
    bordercolor: 'rgba(0, 0, 0, 0.1)',
  },
  showlegend: true,
  legend: {
    bgcolor: 'rgba(0,0,0,0)',
    orientation: 'h',
    yanchor: 'bottom',
    y: -0.2,
    xanchor: 'center',
    x: 0.5,
    font: {
      size: 12,
    },
    borderwidth: 0,
  },
  autosize: true,
  margin: {
    l: 50,
    r: 50,
    b: 100,
    t: 50,
    pad: 4,
  },
})
