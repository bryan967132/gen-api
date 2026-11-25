import { escapeHTML } from './format.js';

export function getHTML(tests, { total, passed, failed }) {
    const labels = {
        passed: 'Correcto',
        failed: 'Fallido',
        info: 'Información',
        completed: 'Completado',
        warning: 'Alerta',
        component: 'Componente',
        action: 'Acción',
    };

    const renderSummaryTables = tests =>
        tests
            .map(
                test => `
                <div class="summary-test">
                    <h3>${escapeHTML(test.name)}</h3>
                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th>Escenario</th>
                                <th>Resultado esperado</th>
                                <th>Resultado obtenido</th>
                                <th>Conclusión</th>
                            </tr>
                        </thead>
                        <tbody>${test.scenarios
                            .map(
                                scenario => `
                            <tr>
                                <td>${escapeHTML(scenario.title)}</td>
                                <td><span>${scenario.expectedResult === 'passed' ? 'Correcto' : 'Fallido'}</span></td>
                                <td><span>${scenario.actualResult === 'passed' ? 'Correcto' : 'Fallido'}</span></td>
                                <td><span class="${scenario.conclusion === 'passed' ? 'passed' : 'failed'}-text">${
                                    scenario.conclusion === 'passed' ? 'Correcto' : 'Fallido'
                                }</span></td>
                            </tr>`
                            )
                            .join('')}
                        </tbody>
                    </table>
                </div>`
            )
            .join('');

    const renderScreenshot = screenshot =>
        screenshot
            ? `
        <button
            type="button"
            class="screenshot-label"
            title="Ver captura"
            aria-label="Ver captura"
            onclick="event.preventDefault(); event.stopPropagation(); openImageModal('data:image/png;base64,${screenshot}')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-5-5L5 21"/>
            </svg>
        </button>`
            : '';

    const renderResults = results =>
        results
            .map(
                item => `
        <div class="validation-item${item.typeInfo === 'list' ? ' list-validation' : ''}">
            <span class="${item.status}">${labels[item.status]}</span>
            ${
                item.typeInfo !== 'list'
                    ? `<span>${escapeHTML(item.description)}</span>`
                    : item.description
            }${renderScreenshot(item.screenshot)}
        </div>`
            )
            .join('');

    const renderItems = items =>
        items
            .map(item => {
                if (item.type === 'event') {
                    const status = Object.hasOwn(labels, item.status) ? item.status : 'info';

                    return `
    <div class="event">
        <div class="event-description">
            <span class="${status}">${labels[status]}</span>
            <span class="event-text">${escapeHTML(item.description)}</span>${renderScreenshot(item.screenshot)}
        </div>
    </div>`;
                }

                if (item.type === 'component' || item.type === 'action') {
                    const results = item.results ?? [];
                    const correct = results.filter(result => result.status === 'passed').length;
                    const warnings = results.filter(result => result.status === 'warning').length;
                    const failures = results.filter(result => result.status === 'failed').length;

                    const hasWarnings = warnings > 0;
                    const hasFailures = failures > 0;
                    const totalValidations = results.filter(
                        result => result.status !== 'info'
                    ).length;

                    const status = hasFailures ? 'failed' : hasWarnings ? 'warning' : 'passed';

                    return `
                <details class="component" ${hasFailures ? 'open' : ''}>
                    <summary class="component-header">
                        <span class="component-title">
                            <span class="${item.type === 'action' ? 'action' : 'component-name'}">${labels[item.type]}</span>
                            <span class="component-label">${escapeHTML(item.componentName)}</span>
                        </span>
                        <span class="component-summary">
                            ${renderScreenshot(item.screenshot)}
                            <span class="${status}">${labels[status]}</span>
                            <span class="component-counter">${correct}/${totalValidations}</span>
                        </span>
                    </summary>
                    <div class="validation-list">
                        ${renderResults(results)}
                    </div>
                </details>`;
                }

                return '';
            })
            .join('');

    const renderTests = tests
        .map(
            (test, index) => `
        <section
            class="test-panel"
            id="test-${index}"
            ${index === 0 ? '' : 'hidden'}
        >
            <h2>${escapeHTML(test.name)}</h2>
            <p class="test-description">${test.scenarios.length} escenario(s)</p>${test.scenarios
                .map(
                    scenario => `
                <details class="scenario">
                    <summary>
                        <span>${escapeHTML(scenario.title)}</span>
                        <span class="scenario-status ${scenario.status === 'passed' ? 'passed' : 'failed'}">${
                            scenario.status === 'passed' ? 'Correcto' : 'Fallido'
                        }</span>
                    </summary>
                    <div class="scenario-content">
                        ${renderItems(scenario.items)}
                    </div>
                </details>`
                )
                .join('')}
        </section>`
        )
        .join('');

    const testMenu = tests
        .map(
            (test, index) => `
        <button
            class="test-button ${index === 0 ? 'selected' : ''}"
            data-test="${index}"
            type="button"
        >
            ${escapeHTML(test.name)}
            <span>${test.scenarios.length}</span>
        </button>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reporte de pruebas - GenAPI</title>
        <link rel="stylesheet" href="./styles.css">
    </head>
    <body>
        <main>
            <div class="report-layout">
                <!-- Menú lateral izquierdo -->
                <aside class="report-sidebar">
                    <header class="header">
                        <h1>GenAPI</h1>
                        <p>Reporte de pruebas automatizadas</p>
                    </header>
                    <nav class="navigation">
                        <button
                            class="nav-button"
                            data-view="statistics"
                            type="button"
                        >
                            Estadísticas generales
                        </button>
                        <button
                            class="nav-button active"
                            data-view="tests"
                            type="button"
                        >
                            Tests individuales
                        </button>
                    </nav>
                    <div
                        class="test-menu"
                        id="sidebar-tests"
                        ${tests.length ? '' : 'hidden'}
                    >
                        <h3>Tests disponibles</h3>
                        ${testMenu}
                    </div>
                </aside>
                <!-- Contenido principal -->
                <div class="report-content">
                    <section class="view" id="statistics" hidden>
                        <h2>Estadísticas generales</h2>
                        <div class="summary">
                            <div class="card">
                                <h3>Total de escenarios</h3>
                                <strong>${total}</strong>
                            </div>
                            <div class="card">
                                <h3>Exitosos</h3>
                                <strong class="passed-text">${passed}</strong>
                            </div>
                            <div class="card">
                                <h3>Fallidos</h3>
                                <strong class="failed-text">${failed}</strong>
                            </div>
                        </div>
                        <h2>Resumen de resultados por escenario</h2>
                        ${renderSummaryTables(tests)}
                    </section>
                    <section class="view" id="tests">${
                        tests.length
                            ? `
                        <div class="tests-layout">
                            <div class="test-content">
                                ${renderTests}
                            </div>
                        </div>`
                            : `
                        <p class="empty">
                            No se encontraron tests para mostrar.
                        </p>`
                    }
                    </section>
                </div>
            </div>
        </main>
        <script src="./script.js"></script>
    </body>
</html>`;
}
