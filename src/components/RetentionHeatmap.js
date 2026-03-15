'use client';
import React from 'react';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

// Static cohort data as instructed
const COHORT_DATA = [
  {
    name: 'Jan W1',
    values: [100, 68, 52, 44, 40, 38, 36, 35]
  },
  {
    name: 'Jan W2',
    values: [100, 71, 55, 47, 43, 41, 39, null]
  },
  {
    name: 'Jan W3',
    values: [100, 65, 49, 41, 37, 35, null, null]
  },
  {
    name: 'Feb W1',
    values: [100, 74, 58, 51, null, null, null, null]
  }
];

// Helpers
function getHeatmapColor(val) {
  if (val === null || val === undefined) return '#eeeeee';
  if (val >= 70) return '#138e48';      // dark green
  if (val >= 55) return '#43c276';      // medium green
  if (val >= 40) return '#a3e3c0';      // light green
  return '#e3fbe9';                     // very light
}

// TableView: plain HTML table
function TableView({ cohorts, onRowClick }) {
  // Get the maximum number of columns.
  const maxCols = Math.max(...cohorts.map(c => c.values.length));
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700 }}>Cohort</th>
            {Array.from({ length: maxCols }, (_, idx) => (
              <th key={idx} style={{ padding: '6px 8px', fontWeight: 500 }}>W{idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort, i) => (
            <tr key={cohort.name} style={{ cursor: 'pointer' }} onClick={() => onRowClick(cohort.name)}>
              <td style={{ padding: '6px 8px', fontWeight: 600 }}>{cohort.name}</td>
              {Array.from({ length: maxCols }, (_, idx) => (
                <td key={idx} style={{ padding: '6px 8px', textAlign: 'right', color: '#2e435b' }}>
                  {cohort.values[idx] !== null && cohort.values[idx] !== undefined ? `${cohort.values[idx]}%` : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// HeatmapView: table with color-coded cells. Shows '✨ New' label.
function HeatmapView({ cohorts, onRowClick }) {
  const maxCols = Math.max(...cohorts.map(c => c.values.length));
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ marginBottom: 6, fontSize: 15, fontWeight: 500 }}>
        <span role="img" aria-label="new" style={{ marginRight: 6 }}>✨</span>
        New
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700 }}>Cohort</th>
            {Array.from({ length: maxCols }, (_, idx) => (
              <th key={idx} style={{ padding: '6px 8px', fontWeight: 500 }}>W{idx + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.name} style={{ cursor: 'pointer' }} onClick={() => onRowClick(cohort.name)}>
              <td style={{ padding: '6px 8px', fontWeight: 600 }}>{cohort.name}</td>
              {Array.from({ length: maxCols }, (_, idx) => {
                const val = cohort.values[idx];
                return (
                  <td 
                    key={idx}
                    style={{
                      padding: '6px 8px',
                      textAlign: 'right',
                      background: getHeatmapColor(val),
                      color: val && val >= 55 ? '#fff' : '#165a37',
                      fontWeight: val && val >= 70 ? 700 : 400,
                      borderRadius: 3,
                      minWidth: 50,
                      opacity: val === null ? 0.25 : 1.0
                    }}
                  >
                    {val !== null && val !== undefined ? `${val}%` : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// SparklinesView: row with cohort name, first→last, check if last > 30%. 📈 Beta
function SparklinesView({ cohorts, onRowClick }) {
  return (
    <div>
      <div style={{ marginBottom: 6, fontSize: 15, fontWeight: 500 }}>
        <span role="img" aria-label="beta" style={{ marginRight: 6 }}>📈</span>
        Beta
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700 }}>Cohort</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>Trend</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => {
            const first = cohort.values.find(v => v !== null && v !== undefined);
            const lastVals = [...cohort.values].reverse();
            const last = lastVals.find(v => v !== null && v !== undefined);
            return (
              <tr key={cohort.name} style={{ cursor: 'pointer' }} onClick={() => onRowClick(cohort.name)}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{cohort.name}</td>
                <td style={{ padding: '6px 8px', color: '#255d4b', fontFamily: 'monospace' }}>
                  {first !== undefined && last !== undefined ? `${first}% → ${last}%` : ''}
                </td>
                <td style={{ padding: '6px 8px' }}>
                  {last > 30 ? (
                    <span style={{ color: '#18b26b', fontWeight: 700, fontSize: 15 }} title="Great retention">✅</span>
                  ) : (
                    <span style={{ color: '#c77c32', fontWeight: 700, fontSize: 15 }} title="Needs attention">⚠️</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RetentionHeatmap() {
  const { retentionHeatmapVariant } = useFlags();
  const ldClient = useLDClient();

  // Choose the view component based on flag. Default is TableView.
  let ViewComp, label;
  switch (retentionHeatmapVariant) {
    case 'heatmap':
      ViewComp = HeatmapView; label = 'heatmap'; break;
    case 'sparklines':
      ViewComp = SparklinesView; label = 'sparklines'; break;
    default:
      ViewComp = TableView; label = 'tableView'; break;
  }

  // Row click handler: tracks via LD
  function handleRowClick(cohortName) {
    if (ldClient && typeof ldClient.track === 'function') {
      ldClient.track('retention-viewed-detail', { cohort: cohortName });
    }
  }

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          color: '#666',
          fontFamily: 'monospace',
          marginBottom: 2,
          fontWeight: 500,
          letterSpacing: 0.4,
        }}
      >
        variant: <span style={{color: "#274d30"}}>{retentionHeatmapVariant || 'tableView'}</span>
      </div>
      <ViewComp cohorts={COHORT_DATA} onRowClick={handleRowClick} />
    </div>
  );
}