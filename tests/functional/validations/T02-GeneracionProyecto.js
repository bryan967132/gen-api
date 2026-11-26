import GenAPI from '../screens/GenApi.js';
import { genAPI } from '../screens/Elements.js';

export default class T02GeneracionProyecto extends GenAPI {
    constructor(page, testInfo) {
        super(page, testInfo);
    }

    #createComponents = async (data, target) => {
        for (const component of data) {
            if (component.type === 'route') {
                const { name, path, subRoutes = [], endpoints = [] } = component;

                const expected = genAPI.componentRuta();
                await this.dragAndDrop('Crear Ruta', genAPI.cardRuta, target, expected);
                await this.fillRouteCard('Ruta', expected, { name, path });

                if (subRoutes.length > 0)
                    await this.#createComponents(
                        subRoutes,
                        genAPI.componentRuta(`@value='${name}'`)
                    );

                if (endpoints.length > 0)
                    await this.#createComponents(
                        endpoints,
                        genAPI.componentRuta(`@value='${name}'`)
                    );
            } else if (component.type === 'endpoint') {
                await this.dragAndDrop(
                    'Crear Endpoint',
                    genAPI.cardEndpoint,
                    target,
                    genAPI.componentEndpoint()
                );

                await this.fillEndpointCard(
                    'Endpoint',
                    genAPI.componentEndpoint(),
                    genAPI.attribsEndpoint(component.parameterType),
                    component
                );
            }
        }
    };

    /**
     * Genera un proyecto.
     *
     * @param {string} name - Nombre de la acción en el reporte.
     * @param {string} port - Nombre de la acción en el reporte.
     * @param {string} description - Nombre de la acción en el reporte.
     * @param {Object} data - Nombre de la acción en el reporte.
     * @param {Object} settings - Opciones de configuración del proyecto.
     * @param {boolean} [settings.includeEnv] - Indica si se incluyen variables de entorno.
     * @param {boolean} [settings.includeBD] - Indica si se incluye un conector de base de datos.
     * @param {'mysql'|'oracle'|'postgresql'|'mssql'|'mongodb'|'redis'} [settings.bdType='mysql'] - Tipo de base de datos que se desea configurar.
     */
    createProject = async (name, port, description, data, settings) => {
        await this.inputText('Nombre', genAPI.inputNombre, name);
        await this.inputText('Puerto', genAPI.inputPuerto, port);
        await this.textArea('Descripción', genAPI.inputDescripcion, description);
        await this.reportPassSS('Formulario', 'Formulario Llenado');
        await this.#createComponents(data, genAPI.areaArrastre);
        await this.button('Generar Codigo', genAPI.buttonGenerarCodigo, true);
        if (await this.isVisibleLocator(genAPI.modalConfiguracion.buttonContinuar, 5000))
            await this.setSettings('Configuracion Basica', genAPI.modalConfiguracion, settings);
        else if (await this.isVisibleLocator(genAPI.modalErrorValidacion.buttonEntendido, 5000)) {
            const errorText = await this.getText(genAPI.modalErrorValidacion.labelErrores);
            await this.reportFail('Error de Validacion', errorText);
        }
    };
}
