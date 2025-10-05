import Plot from 'react-plotly.js'
import { useRandAOStats, getTimePeriodLabel, type TimePeriod } from '../../../../utils/randao'
import './RandomnessOverTimeSection.css'
import { useEffect, useRef } from 'react'

export function RandomnessOverTimeSection() {
    const {
        timeBasedData,
        selectedTimePeriod,
        loading: statsLoading,
        error: statsError,
        observableCompleted,
        setTimePeriod
    } = useRandAOStats()

    // Track if we've ever loaded data for the current period
    const hasLoadedDataRef = useRef<Set<TimePeriod>>(new Set())

    // Debug logging
    useEffect(() => {
        console.log('RandomnessOverTimeSection: Component state updated:', {
            timeBasedDataLength: timeBasedData.length,
            selectedTimePeriod,
            statsLoading,
            statsError,
            observableCompleted,
            timeBasedData: timeBasedData.slice(0, 3) // First 3 entries for debugging
        })
    }, [timeBasedData, selectedTimePeriod, statsLoading, statsError, observableCompleted])

    // Track when we've received data for a period
    useEffect(() => {
        if (timeBasedData.length > 0) {
            hasLoadedDataRef.current.add(selectedTimePeriod)
            console.log('RandomnessOverTimeSection: Marked period as loaded:', selectedTimePeriod)
        }
    }, [timeBasedData.length, selectedTimePeriod])

    // Create plot data for randomness over time
    const getRandomnessPlotData = () => {
        console.log('RandomnessOverTimeSection: Creating plot data, timeBasedData length:', timeBasedData.length)

        if (timeBasedData.length > 0) {
            // Filter out 0 values for cleaner visualization
            const filteredData = timeBasedData.filter(d => d.randomnessCreated > 0)
            console.log('RandomnessOverTimeSection: Filtered data (removed 0 values):', filteredData.length, 'remaining')

            if (filteredData.length === 0) {
                console.log('RandomnessOverTimeSection: No non-zero data available after filtering')
                return []
            }

            const plotData = [{
                x: filteredData.map(d => new Date(d.timestamp)),
                y: filteredData.map(d => Number(d.randomnessCreated)),
                name: `${getTimePeriodLabel(selectedTimePeriod)} Randomness Created`,
                type: 'bar' as const,
                marker: {
                    color: '#4a9eff', // Blue to match other charts
                    opacity: 0.8,
                    line: {
                        color: '#4a9eff',
                        width: 1
                    }
                },
                hovertemplate: `%{y} randomness<br>%{x|%Y-%m-%d}<extra></extra>`,
            }]

            console.log('RandomnessOverTimeSection: Bar chart data created:', plotData)
            return plotData
        }

        console.log('RandomnessOverTimeSection: No data available for plot')
        return []
    }

    const getRandomnessLayout = () => {
        // Determine tick format and interval based on selected period
        const getTickFormat = () => {
            switch (selectedTimePeriod) {
                case 'daily':
                    return '%Y-%m-%d'
                case 'weekly':
                    return '%Y-%m-%d'
                case 'monthly':
                    return '%Y-%m'
                case 'yearly':
                    return '%Y'
                default:
                    return '%Y-%m-%d'
            }
        }

        return {
            plot_bgcolor: 'transparent',
            paper_bgcolor: 'transparent',
            font: { color: 'rgba(255, 255, 255, 0.95)' },
            margin: { t: 80, r: 40, b: 80, l: 80 },
            showlegend: false,
            autosize: true,
            title: {
                text: `Randomness Created Over Time (${getTimePeriodLabel(selectedTimePeriod)})`,
                font: { color: '#4a9eff', size: 20 }
            },
            xaxis: {
                color: 'rgba(255, 255, 255, 0.7)',
                gridcolor: 'rgba(255, 255, 255, 0.1)',
                title: 'Time',
                type: 'date' as const,
                tickformat: getTickFormat(),
                tickangle: -45,
                showgrid: true,
                gridwidth: 1,
                dtick: selectedTimePeriod === 'monthly' ? 'M1' : undefined,
                ticklabelmode: 'period'
            },
            yaxis: {
                color: 'rgba(255, 255, 255, 0.7)',
                gridcolor: 'rgba(255, 255, 255, 0.1)',
                title: 'Randomness Created',
                showgrid: true,
                gridwidth: 1
            },
            bargap: 0.15,
            bargroupgap: 0.05
        }
    }

    const randomnessPlotData = getRandomnessPlotData()
    const randomnessLayout = getRandomnessLayout()

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        displaylogo: false,
    }

    const handleTimePeriodChange = (newPeriod: TimePeriod) => {
        console.log('RandomnessOverTimeSection: Time period changed to:', newPeriod)
        setTimePeriod(newPeriod)
    }

    // Calculate stats for display
    const filteredDataCount = timeBasedData.filter(d => d.randomnessCreated > 0).length

    // Show loading if: loading OR (no filtered data AND Observable not completed)
    const shouldShowLoading = statsLoading || (!observableCompleted && filteredDataCount === 0)

    return (
        <div className="randomness-time-section">
            <h2>Randomness Created Over Time</h2>

            <div className="graph-selector">
                <label htmlFor="time-period">Time Period:</label>
                <select
                    id="time-period"
                    value={selectedTimePeriod}
                    onChange={(e) => handleTimePeriodChange(e.target.value as TimePeriod)}
                    className="graph-dropdown"
                    aria-label="Select time period for randomness chart"
                    disabled={shouldShowLoading}
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>

                {/* Show loading indicator next to dropdown when updating existing data */}
                {statsLoading && filteredDataCount > 0 && (
                    <div className="updating-indicator">
                        <div className="mini-spinner"></div>
                        <span>Updating...</span>
                    </div>
                )}
            </div>

            <div className="randao-plot">
                {shouldShowLoading ? (
                    // Show smaller loading spinner in place of the graph
                    <div className="graph-loading-spinner" />
                ) : statsError ? (
                    <div className="error-message">
                        Error: {statsError}
                    </div>
                ) : randomnessPlotData.length > 0 ? (
                    // Show the chart with current data
                    <div className="chart-container">
                        <Plot
                            data={randomnessPlotData}
                            layout={randomnessLayout}
                            config={config}
                            useResizeHandler
                            style={{ width: '100%', height: '100%' }}
                        />
                        {/* Subtle overlay when loading new data on existing chart */}
                        {statsLoading && (
                            <div className="chart-loading-overlay">
                                <div className="loading-spinner-small"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Only show no-data if Observable completed and we truly have no displayable data
                    <div className="no-data">
                        No randomness data available for {selectedTimePeriod} period
                    </div>
                )}
            </div>
        </div>
    )
}