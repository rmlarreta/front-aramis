import request from '../context/interceptor';
import { messageService } from './messagesducks'
// data inicial
const dataInicial = {
    loading: false,
    status: null,
    message: null,
    data: null
}

const OK = 'OK'
const FAIL = 'FAIL'
const LOADING = 'LOADING'
const SETDATA = 'SETDATA'

export default function operationsReducer(state = dataInicial, action) {
    switch (action.type) {
        case OK:
            return { ...state, status: action.payload.status, message: action.payload.message, data: action.payload.data, loading: false }
        case FAIL:
            return { ...state, status: action.payload.status, message: action.payload.message }
        case LOADING:
            return { ...state, loading: true }
        case SETDATA:
            return { ...state, loading: false, data: action.payload.data }
        default:
            return { ...state }
    }
}

export const EditDocument = (data) => async (dispatch) => {
    dispatch({
        type: SETDATA,
        payload: {
            data: data
        }
    })
}

export const InsertDocumentDetalles = (detalles, documento) => async (dispatch) => {
    let lm = []
    detalles.forEach(e =>
        lm.push({
            Documento: documento,
            Cantidad: e.cantidad,
            Producto: e.id,
            Codigo: e.codigo,
            Detalle: e.detalle,
            Rubro: e.rubroStr,
            Unitario: e.precio,
            Iva: e.ivaDec,
            Internos: e.internos
        }));
    var json = JSON.stringify(lm);
    dispatch({
        type: LOADING
    });
    const options = {
        headers: { "content-type": "application/json" }
    }
    await request.post('Documents/InsertDetall', json, options)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            })
            dispatch(messageService(true, response.data));
            dispatch({
                type: SETDATA,
                payload: {
                    data: documento
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: FAIL,
                payload: {
                    status: error.response.status,
                    message: error.response.data.message
                }
            })
            dispatch(messageService(false, error.response.data.message, error.response.status));
        });
}

export const UpdateDocumentDetalles = (detalles) => async (dispatch) => {
    let lm = []
    detalles.forEach(e =>
        lm.push({
            Id: e.id,
            Documento: e.documento,
            Cantidad: e.cantidad,
            Producto: e.id,
            Codigo: e.codigo,
            Detalle: e.detalle,
            Rubro: e.rubro,
            Unitario: e.unitario,
            Iva: e.iva,
            Internos: e.internos
        }));
    var json = JSON.stringify(lm);
    dispatch({
        type: LOADING
    });
    const options = {
        headers: { "content-type": "application/json" }
    }
    await request.patch('Documents/UpdateDetall', json, options)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            })
            dispatch(messageService(true, response.data));
            dispatch({
                type: SETDATA,
                payload: {
                    data: detalles[0].documento
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: FAIL,
                payload: {
                    status: error.response.status,
                    message: error.response.data.message
                }
            })
            dispatch(messageService(false, error.response.data.message, error.response.status));
        });
}

export const UpdateDocument = (documento) => async (dispatch) => {
    let lm = []
    documento.forEach(e =>
        lm.push({
            Id: e.id,
            Tipo: e.codTipo,
            Pos: e.pos,
            Numero: e.numero,
            Cliente: e.cliente,
            Fecha: e.fecha,
            Cai: e.cai,
            Vence: e.vence,
            Razon: e.nombre,
            Observaciones: e.observaciones,
            Operador: e.operador,
            Creado: e.creado
        }));
    var json = JSON.stringify(lm);
    dispatch({
        type: LOADING
    });
    const options = {
        headers: { "content-type": "application/json" }
    }
    await request.patch('Documents/UpdateDocument', json, options)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            })
            dispatch(messageService(true, response.data)); 
            dispatch({
                type: SETDATA,
                payload: {
                    data: documento[0].id
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: FAIL,
                payload: {
                    status: error.response.status,
                    message: error.response.data.message
                }
            })
            dispatch(messageService(false, error.response.data.message, error.response.status));
        });
}

export const DeleteDocumentDetalles = (data, documento) => async (dispatch) => {
    dispatch({
        type: LOADING
    })
    await request.delete('Documents/DeleteDetall/' + data)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
            dispatch({
                type: SETDATA,
                payload: {
                    data: documento
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: FAIL,
                payload: {
                    status: error.response.status,
                    message: error.response.data.message
                }
            })
            dispatch(messageService(false, error.response.data.message, error.response.status));
        });
}

export const InsertOrden = (id) => async (dispatch) => {
    dispatch({
        type: LOADING
    })
    await request.patch('Documents/InsertOrden/'+id)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            }); 
            dispatch(messageService(true, response.data));
            dispatch({
                type: SETDATA,
                payload: {
                    data: id
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: FAIL,
                payload: {
                    status: error.response.status,
                    message: error.response.data.message
                }
            })
            dispatch(messageService(false, error.response.data.message, error.response.status));
        });
}
 
export const UpdateClienteDocument = (id,cliente) => async (dispatch) => {
    dispatch({
        type: LOADING
    })
    await request.patch('Documents/UpdateClienteDocument/'+id+'/'+cliente)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            }); 
            dispatch(messageService(true, response.data));
            dispatch({
                type: SETDATA,
                payload: {
                    data: id
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: FAIL,
                payload: {
                    status: error.response.status,
                    message: error.response.data.message
                }
            })
            dispatch(messageService(false, error.response.data.message, error.response.status));
        });
}