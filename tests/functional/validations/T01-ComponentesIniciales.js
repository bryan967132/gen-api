import GenAPI from '../screens/GenApi';
import { genAPI } from '../screens/Elements.js';

export default class T01ComponentesIniciales extends GenAPI {
    constructor(page, testInfo) {
        super(page, testInfo);
    }

    basicValidation = async () => {
        await this.label('GenAPI', genAPI.textGenApi);
        await this.label('Genera Tu API', genAPI.textGeneraApi);
        await this.label('Configuración de la API', genAPI.textConfiguracion);
        await this.label('Nombre', genAPI.textNombre);
        await this.inputText('Nombre', genAPI.inputNombre);
        await this.label('Puerto', genAPI.textPuerto);
        await this.inputText('Puerto', genAPI.inputPuerto);
        await this.label('Descripción', genAPI.textDescripcion);
        await this.textArea('Descripción', genAPI.inputDescripcion);
        await this.card('Ruta', genAPI.cardRuta);
        await this.card('Endpoint', genAPI.cardEndpoint);
        await this.label('Estadísticas', genAPI.textEstadisticas);
        await this.label('Rutas', genAPI.textRutas);
        await this.label('Valor Rutas', genAPI.textValorRutas);
        await this.label('Endpoints Independientes', genAPI.textEndpointsIndependientes);
        await this.label('Valor Endpoints Independientes', genAPI.textValorEndpointsIndependientes);
        await this.label('Endpoints Anidados', genAPI.textEndpointsAnidados);
        await this.label('Valor Endpoints Anidados', genAPI.textValorEndpointsAnidados);
        await this.label('Total Endpoints', genAPI.textTotalEndpoints);
        await this.label('Valor Total Endpoints', genAPI.textValorTotalEndpoints);
        await this.label('Como Usar', genAPI.textComoUsar);
        await this.list('Como Usar', genAPI.listComoUsar);
        await this.button('Generar Codigo', genAPI.buttonGenerarCodigo, false);
        await this.button('Limpiar Todo', genAPI.buttonLimpiarTodo, false);
        await this.label('Nombre API', genAPI.textNombreAPI);
        await this.label('Informacion API', genAPI.textInformacionAPI);
        await this.label('Descripcion API', genAPI.textDescripcionAPI);
        await this.button('Ayuda', genAPI.buttonAyuda, false);
        await this.label('Puerto API', genAPI.textPuertoAPI);
        await this.label('Comienza A Construir', genAPI.textComienza);
        await this.label('Arrastra Componentes', genAPI.textArrastra);
        await this.list('Area Arrastre', genAPI.listAreaArrastre);
    };
}
