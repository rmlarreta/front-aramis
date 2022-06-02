import request from '../context/interceptor';
import { messageService } from './messagesducks'
// data inicial
const dataInicial = {
    loading: false,
    loadimput: false,
    status: null,
    message: null
}

const OK = 'OK'
const OKIMP = 'OKIMP'
const FAIL = 'FAIL'
const LOADING = 'LOADING'
const LOADINGIMP = 'LOADINGIMP'
export default function clientesReducer(state = dataInicial, action) {
    switch (action.type) {
        case OK:
            return { ...state, status: action.payload.status, message: action.payload.message, loading: false }
        case OKIMP:
            return { ...state, status: action.payload.status, message: action.payload.message, loadimput: false }
        case FAIL:
            return { ...state, status: action.payload.status, message: action.payload.message }
        case LOADING:
            return { ...state, loading: true }
        case LOADINGIMP:
            return { ...state, loadimput: true }
        default:
            return { ...state }
    }
}

export const UpdateCliente = (data) => async (dispatch) => {
    var form = new FormData();
    form.append('Id', data.id)
    form.append('Cuit', data.cuit)
    form.append('Responsabilidad', data.responsabilidad)
    form.append('Genero', data.genero)
    form.append('Imputacion', data.imputacion)
    form.append('Nombre', data.nombre)
    form.append('Domicilio', data.domicilio)
    form.append('Telefono', data.telefono)
    form.append('Mail', data.mail)
    form.append('Observaciones', data.observaciones)
    form.append('NombreFantasia', data.nombreFantasia)
    form.append('LimiteSaldo', data.limiteSaldo)
    dispatch({
        type: LOADING
    })
    await request.patch('Clientes/UpdateCliente', form)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
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

export const InsertCliente = (data) => async (dispatch) => {
    var form = new FormData();
    form.append('Cuit', data.cuit)
    form.append('Responsabilidad', data.responsabilidad)
    form.append('Genero', data.genero)
    form.append('Imputacion', data.imputacion)
    form.append('Nombre', data.nombre)
    form.append('Domicilio', data.domicilio)
    form.append('Telefono', data.telefono)
    form.append('Mail', data.Mail)
    form.append('Observaciones', data.observaciones)
    dispatch({
        type: LOADING
    })
    await request.post('Clientes/InsertCliente', form)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
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

export const DeleteCliente = (data) => async (dispatch) => {
    dispatch({
        type: LOADING
    })
    await request.delete('Clientes/DeleteCliente/?id=' + data)
        .then(function (response) {
            dispatch({
                type: OK,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
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

export const UpdateImputacion = (data) => async (dispatch) => {
    var form = new FormData();
    form.append('Id', data.id)
    form.append('Detalle', data.detalle)
    dispatch({
        type: LOADINGIMP
    })
    await request.patch('Clientes/UpdateImputaciones', form)
        .then(function (response) {
            dispatch({
                type: OKIMP,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
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

export const DeleteImputacion = (data) => async (dispatch) => {
    dispatch({
        type: LOADINGIMP
    })
    await request.delete('Clientes/DeleteImputaciones/?id=' + data)
        .then(function (response) {
            dispatch({
                type: OKIMP,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
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

export const InsertImputacion = (data) => async (dispatch) => {
    var form = new FormData();
    form.append('Id', 0)
    form.append('Detalle', data.detalle)
    dispatch({
        type: LOADINGIMP
    })
    await request.post('Clientes/InsertImputaciones', form)
        .then(function (response) {
            dispatch({
                type: OKIMP,
                payload: {
                    status: response.status,
                    message: response.message
                }
            });
            dispatch(messageService(true, response.data));
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