import GenAPI from '../screens/GenApi';
import { genAPI } from '../screens/Elements.js';

export default class T02GenerarProyecto extends GenAPI {
    constructor(page, testInfo) {
        super(page, testInfo);
    }

    createComponents = async (data, target) => {
        for (const component of data) {
            if (component.type === 'route') {
                const { name, path, subRoutes = [], endpoints = [] } = component;

                await this.dragAndDrop(
                    'Crear Ruta',
                    genAPI.cardRuta,
                    target,
                    genAPI.componentRuta()
                );

                await this.fillRouteCard('Ruta', genAPI.componentRuta(), { name, path });

                if (subRoutes.length > 0)
                    await this.createComponents(
                        subRoutes,
                        genAPI.componentEndpoint(`@value='${name}'`)
                    );

                if (endpoints.length > 0)
                    await this.createComponents(
                        endpoints,
                        genAPI.componentEndpoint(`@value='${name}'`)
                    );
            } else if (component.type === 'endpoint') {
                await this.dragAndDrop(
                    'Crear Endpoint',
                    genAPI.cardEndpoint,
                    target,
                    genAPI.componentEndpoint()
                );

                await this.fillEndpointCard('Endpoint', genAPI.componentEndpoint(), component);
            }
        }
    };

    basicSetting = async (name, port, description, data) => {
        await this.inputText('Nombre', genAPI.inputNombre, name);
        await this.inputText('Puerto', genAPI.inputPuerto, port);
        await this.textArea('Descripción', genAPI.inputDescripcion, description);
        await this.reportPassSS('Formulario', 'Formulario Llenado');
        await this.createComponents(data, genAPI.areaArrastre);
        // await this.button('Generar Codigo', genAPI.buttonGenerarCodigo, true);
    };
}
