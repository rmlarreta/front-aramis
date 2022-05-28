import request from '../context/interceptor';
import { messageService } from './messagesducks'
// data inicial
const dataInicial = {
    loading: false,
    status: null,
    message: null
}

const OK = 'OK'
const FAIL = 'FAIL'
const LOADING = 'LOADING'

export default function stockReducer(state = dataInicial, action) {
    switch (action.type) {
        case OK:
            return { ...state, status: action.payload.status, message: action.payload.message, loading: false }
        case FAIL:
            return { ...state, status: action.payload.status, message: action.payload.message }
        case LOADING:
            return { ...state, loading: true }
        default:
            return { ...state }
    }
}

export const UpdateProducto = (data) => async (dispatch) => {
    var form = new FormData();
    form.append('Id', data.id)
    form.append('Codigo', data.codigo)
    form.append('Detalle', data.detalle)
    form.append('Rubro', data.rubro)
    form.append('Costo', data.costo)
    form.append('Iva', data.iva)
    form.append('Internos', data.internos)
    form.append('Tasa', data.tasa)
    form.append('Stock', data.stock)
    form.append('Servicio', data.servicio)
    dispatch({
        type: LOADING
    })
    await request.patch('Stock/UpdateProducto', form)
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

export const InsertProducto = (data) => async (dispatch) => {
    var form = new FormData(); 
    form.append('Codigo', data.codigo)
    form.append('Detalle', data.detalle)
    form.append('Rubro', data.rubro)
    form.append('Costo', data.costo)
    form.append('Iva', data.iva)
    form.append('Internos', data.internos)
    form.append('Tasa', data.tasa) 
    form.append('Servicio', data.servicio)
    dispatch({
        type: LOADING
    })
    await request.post('Stock/InsertProducto', form)
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

export const DeleteProducto = (data) => async (dispatch) => {    
    dispatch({
        type: LOADING
    })
    await request.delete('Stock/DeleteProducto/?id=' + data)
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

export const UpdateRubro = (data) => async (dispatch) => {
    var form = new FormData();
    form.append('Id', data.id) 
    form.append('Detalle', data.detalle) 
    dispatch({
        type: LOADING
    })
    await request.patch('Stock/UpdateRubro', form)
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

export const DeleteRubro = (data) => async (dispatch) => {    
    dispatch({
        type: LOADING
    })
    await request.delete('Stock/DeleteRubro/?id=' + data)
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

export const InsertRubro = (data) => async (dispatch) => {
    var form = new FormData(); 
    form.append('Id', 0)
    form.append('Detalle', data.detalle) 
    dispatch({
        type: LOADING
    })
    await request.post('Stock/InsertRubro', form)
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