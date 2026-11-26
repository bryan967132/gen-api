export const getStyle = () => `* {
    box-sizing: border-box;
}
body {
    font-family: Inter, Arial, sans-serif;
    background: #111827;
    color: #e5e7eb;
    margin: 0;
    padding: 30px;
}
main {
    max-width: none;
    margin: auto;
}
h1 {
    color: #f9fafb;
    font-size: 25px;
    margin-bottom: 5px;
}
h2 {
    color: #f3f4f6;
    font-size: 19px;
}
p {
    color: #9ca3af;
}
.header {
    margin-bottom: 25px;
}
.navigation {
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #374151;
    margin-bottom: 25px;
}
.nav-button {
    background: transparent;
    color: #9ca3af;
    border: none;
    padding: 12px 16px;
    cursor: pointer;
    font-size: 13px;
    border-bottom: 2px solid transparent;
}
.nav-button.active {
    color: #60a5fa;
    border-bottom-color: #60a5fa;
}
.view[hidden],
.test-panel[hidden],
#sidebar-tests[hidden] {
    display: none;
}
.summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin: 25px 0;
}
.card {
    background: #1f2937;
    border: 1px solid #374151;
    padding: 20px;
    border-radius: 9px;
}
.card h3 {
    color: #9ca3af;
    font-size: 12px;
    font-weight: 500;
    margin: 0 0 12px;
}
.card strong {
    font-size: 27px;
}
.passed-text {
    color: #4ade80;
}
.failed-text {
    color: #f87171;
}
.skipped-text {
    color: #fbbf24;
}
.tests-layout {
    display: block;
}
.test-menu {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
}
.test-menu h3 {
    color: #9ca3af;
    font-size: 12px;
    margin: 5px 8px 12px;
}
.test-button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    background: transparent;
    color: #d1d5db;
    border: none;
    border-radius: 6px;
    padding: 11px;
    text-align: left;
    font-size: 12px;
    cursor: pointer;
    overflow-wrap: anywhere;
}
.test-button:hover {
    background: #374151;
}
.test-button.selected {
    background: #263b59;
    color: #60a5fa;
}
.test-button span {
    color: #9ca3af;
    flex-shrink: 0;
}
.test-content {
    min-width: 0;
}
.test-description {
    font-size: 12px;
}
.scenario {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    margin: 12px 0;
    overflow: hidden;
}
.scenario > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 15px;
    cursor: pointer;
    font-size: 13px;
    color: #f3f4f6;
    list-style: none;
}
.scenario > summary::-webkit-details-marker {
    display: none;
}
.scenario > summary::before {
    content: '+';
    color: #9ca3af;
    font-size: 17px;
}
.scenario[open] > summary::before {
    content: '−';
}
.scenario > summary > span:first-of-type {
    flex: 1;
}
.scenario-content {
    padding: 0 15px 15px;
}
.scenario-status {
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 5px;
    flex-shrink: 0;
}
.screenshot-label,
summary,
.nav-button {
    outline: none;
}
.screenshot-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 18px;
    padding: 0;
    background: transparent;
    color: #93c5fd;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.15s ease, filter 0.15s ease;
}
.screenshot-label:hover {
    color: #60a5fa;
    filter: drop-shadow(0 0 5px #3b82f688);
}
.screenshot-label:focus-visible {
    outline: 1px solid #60a5fa;
    outline-offset: 2px;
}
.screenshot-label svg {
    display: block;
}
.passed,
.failed,
.warning,
.info,
.component-name,
.action,
.completed {
    display: inline-block;
    border: none;
    box-shadow: none;
    border-radius: 4px;
    padding: 3px 7px;
    font-size: 10px;
    font-weight: 500;
    flex-shrink: 0;
    color: #ffffff;
}
.passed {
    background: #168447;
}
.failed {
    background: #C43E4D;
}
.warning {
    background: #BD602B;
}
.info {
    background: #3068BD;
}
.component-name {
    background: #7950BD;
}
.action {
    background: #A68000;
}
.completed {
    background: #008477;
}
.event {
    border-top: 1px solid #374151;
}
.event-description {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    padding: 5px 2px;
    padding-left: 24px;
}
.event-text {
    flex: 1;
    min-width: 0;
}
.event-description > .screenshot-label {
    margin-left: auto;
}
.error {
    color: #fca5a5;
    font-size: 12px;
    white-space: pre-wrap;
    margin: 8px 0;
    overflow-wrap: anywhere;
}
.screenshot {
    display: block;
    width: 100%;
    height: auto;
    margin-top: 12px;
    border: 1px solid #374151;
    border-radius: 7px;
}
.empty {
    color: #9ca3af;
    font-size: 13px;
    padding: 20px;
    background: #1f2937;
    border-radius: 8px;
}
.image-modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.59);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30px;
}
.image-modal-content {
    position: relative;
    max-width: 95vw;
    max-height: 90vh;
}
.image-modal-content img {
    display: block;
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
}
.image-modal-close {
    position: absolute;
    top: -35px;
    right: 0;
    background: transparent;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
}
.component {
    border-top: 1px solid #374151;
}
.component-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 2px;
    cursor: pointer;
    list-style: none;
}
.component-header::-webkit-details-marker {
    display: none;
}
.component-header::before {
    content: '+';
    color: #9ca3af;
    font-size: 16px;
    width: 12px;
    flex-shrink: 0;
}
.component[open] > .component-header::before {
    content: '−';
}
.component-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    min-width: 0;
    flex: 1;
}
.component-label {
    color: #e5e7eb;
    font-size: 12px;
    overflow-wrap: anywhere;
}
.component-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}
.component-counter {
    color: #d1d5db;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    min-width: 30px;
    text-align: right;
}
.validation-list {
    display: flex;
    flex-direction: column;
}
.validation-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    color: #d1d5db;
    font-size: 12px;
    padding-left: 24px;
    padding-block: 5px;
}
.validation-item .error {
    flex-basis: 100%;
    margin: 0 0 4px;
}
.validation-item > .screenshot-label {
    margin-left: auto;
}
.report-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    gap: 20px;
    align-items: start;
}
.report-sidebar {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 9px;
    padding: 12px;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
}
.report-sidebar .header {
    margin-bottom: 12px;
    border-bottom: 1px solid #374151;
}
.report-sidebar .header h1 {
    font-size: 18px;
    margin-top: 0;
}
.report-sidebar .header p {
    font-size: 12px;
}
.navigation {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-bottom: 1px solid #374151;
    margin-bottom: 12px;
    padding-bottom: 12px;
}
.nav-button {
    width: 100%;
    text-align: left;
    border: none;
    border-radius: 6px;
    padding: 11px;
}
.nav-button:hover {
    background: #374151;
}
.nav-button.active {
    background: #263b59;
    color: #60a5fa;
    border: none;
}
.report-content {
    min-width: 0;
}
.component[open] > .component-header .passed,
.component[open] > .component-header .warning,
.component[open] > .component-header .failed,
.component[open] > .component-header .screenshot-label {
    display: none;
}
.list-validation {
    align-items: flex-start;
}
.list-information {
    flex: 1;
    min-width: 0;
}
.report-list-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px 18px;
    margin: 8px 0 0;
    padding-left: 18px;
    list-style-type: disc;
}
.report-list-grid li {
    color: #d1d5db;
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
}
.summary-test {
    margin: 20px 0;
}
.summary-test h3 {
    color: #f3f4f6;
    font-size: 14px;
    margin-bottom: 12px;
}
.summary-table {
    width: 100%;
    border-collapse: collapse;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 8px;
    overflow: hidden;
    font-size: 12px;
}
.summary-table th,
.summary-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #374151;
}
.summary-table th {
    background: #263244;
    color: #9ca3af;
    font-weight: 600;
}
.summary-table td {
    color: #d1d5db;
}
.summary-table tbody tr:last-child td {
    border-bottom: none;
}
.summary-table tbody tr:hover {
    background: #283548;
}
.event-description,
.component-header,
.validation-item {
    border-radius: 4px;
    transition: background-color 0.15s ease;
}
.event-description:hover,
.component-header:hover,
.validation-item:hover {
    background-color: #2b3748;
}
.execution-time {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    flex-shrink: 0;
}
.execution-date {
    color: #9ca3af;
}
.execution-duration {
    color: #d1d5db;
    min-width: 65px;
    text-align: right;
}
.execution-time + .screenshot-label {
    margin-left: 0;
}
@media (max-width: 750px) {
    body {
        padding: 15px;
    }
    .report-layout {
        grid-template-columns: 1fr;
    }
    .report-sidebar {
        position: static;
        max-height: none;
    }
    .navigation {
        flex-direction: row;
        flex-wrap: wrap;
    }
    .nav-button {
        width: auto;
    }
    .summary {
        grid-template-columns: repeat(2, 1fr);
    }
    .test-menu {
        display: flex;
        flex-direction: column;
    }
}
`;
