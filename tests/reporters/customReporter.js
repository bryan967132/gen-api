import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import { getHTML } from '../utils/contentReport.js';
import { getScript } from '../utils/scriptReport.js';
import { getStyle } from '../utils/styleReport.js';

class CustomReporter {
    onBegin() {
        this.tests = [];
    }

    onTestEnd(test, result) {
        const fileName = path.basename(test.location.file);

        if (fileName === 'smoke.spec.js') {
            return;
        }

        const testName = test.parent.title;
        let testGroup = this.tests.find(item => item.name === testName);

        if (!testGroup) {
            testGroup = {
                name: testName,
                scenarios: [],
            };
            this.tests.push(testGroup);
        }

        const expectedResult =
            test.annotations.find(annotation => annotation.type === 'expectedResult')
                ?.description ?? 'passed';

        const actualResult = result.status;

        const scenario = {
            title: test.title,
            status: actualResult,
            expectedResult,
            actualResult,
            conclusion: expectedResult === actualResult ? 'passed' : 'failed',
            items: [],
        };

        // Procesar los adjuntos
        for (const attachment of result.attachments) {
            if (!attachment.body) {
                continue;
            }
            try {
                const data = JSON.parse(attachment.body.toString());
                if (attachment.name === 'report-event') {
                    scenario.items.push({
                        type: 'event',
                        ...data,
                    });
                }
                if (attachment.name === 'component-validation') {
                    scenario.items.push({
                        type: 'component',
                        ...data,
                    });
                }
            } catch (error) {
                console.error('No se pudo procesar un adjunto del reporte:', error.message);
            }
        }

        testGroup.scenarios.push(scenario);
    }

    async onEnd() {
        const scenarios = this.tests.flatMap(test => test.scenarios);
        const passed = scenarios.filter(scenario => scenario.status === 'passed').length;
        const failed = scenarios.filter(scenario => scenario.status === 'failed').length;
        const stats = {
            total: scenarios.length,
            passed,
            failed,
        };

        const html = getHTML(this.tests, stats);
        const script = getScript();
        const style = getStyle();
        const output = path.resolve('playwright-report');
        fs.mkdirSync(output, { recursive: true });
        fs.writeFileSync(path.join(output, 'index.html'), html, 'utf8');
        fs.writeFileSync(path.join(output, 'script.js'), script, 'utf8');
        fs.writeFileSync(path.join(output, 'styles.css'), style, 'utf8');
    }
}

export default CustomReporter;
