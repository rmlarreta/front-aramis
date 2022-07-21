import request from '../context/interceptor';
import { messageService } from './messagesducks';

// data inicial
const dataInicial = {
    loading: false,
    status: null,
    message: null,
    paying: false,
    payment: null,
    recibido: null
}

const OK = 'OK'
const FAIL = 'FAIL'
const LOADING = 'LOADING'
const PAYMENTINSERT = 'PAYMENTINSERT'
const PAYMENTSUCCES = 'PAYMENTSUCCES'
const PAYMENTFAIL = 'PAYMENTFAIL'

export default function pagosReducer(state = dataInicial, action) {
    switch (action.type) {
        case OK:
            return { ...state, status: action.payload.status, message: action.payload.message, loading: false }
        case FAIL:
            return { ...state, status: action.payload.status, message: action.payload.message }
        case LOADING:
            return { ...state, loading: true }
        case PAYMENTINSERT:
            return { ...state, payment: action.payload.data, paying: true }
        case PAYMENTSUCCES:
            return { ...state, paying: false, recibido: action.payload.data }
        case PAYMENTFAIL:
            return { ...state, payment: null, paying: false }
        default:
            return { ...state }
    }
}

export const CreatePaymentIntent = (paymentIntent, id) => async (dispatch) => {

    var json = JSON.stringify(paymentIntent);
    const options = {
        headers: { "content-type": "application/json" }
    }
    await request.post('Recibos/CreatePaymentIntent/' + id, json, options)
        .then(function (response) {
            dispatch({
                type: PAYMENTINSERT,
                payload: {
                    data: response.data
                }
            });
        })
        .catch(function (error) {
            dispatch({
                type: PAYMENTFAIL
            })
            dispatch(messageService(false, 'NO SE PUDO PROCESAR EL PAGO', error.response.status));
        });
}

export const CancelPaymentIntent = (paymentIntent, id) => async (dispatch) => {
    console.log(dataInicial)
    await request.delete('Recibos/CancelPaymentIntent/' + paymentIntent + '/' + id)
        .then(function () {
            dispatch({
                type: PAYMENTFAIL
            })
        })
        .catch((error) => {
            dispatch({
                type: PAYMENTFAIL
            })
            dispatch(messageService(false, 'NO SE PUDO CANCELAR EL PAGO', error.response.status));
        });
}

export const InsertRecibo = (recibo, cliente, document) => async (dispatch) => {
    
    let _documents = []
    _documents.push(document)

    let _recibo = {
        Cliente: cliente,
        Fecha: Date.now,
        Operador: "",
        ReciboDetalles: recibo,
        Documents: _documents
    } 
    var json = JSON.stringify(_recibo);
    const options = {
        headers: { "content-type": "application/json" }
    }
    await request.post('Recibos/InsertRecibo', json, options)
        .then(function (response) {
            dispatch({
                type: PAYMENTSUCCES,
                payload: {
                    data: response.data
                }
            })
        })
        .catch((error) => {
            dispatch({
                type: PAYMENTFAIL
            })
            dispatch(messageService(false, 'NO SE PUDO INGRESAR EL RECIBO', error.response.status));
        });
}

