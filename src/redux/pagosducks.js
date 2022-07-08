import axios from 'axios';
import { messageService } from './messagesducks';

 
// data inicial
const dataInicial = {
    loading: false,
    status: null,
    message: null
}

const OK = 'OK'
const FAIL = 'FAIL'
const LOADING = 'LOADING'

export default function pagosReducer(state = dataInicial, action) {
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

export const CreatePaymentIntent = (paymentIntent) => async (dispatch) => {
    console.log(paymentIntent)
    let lm = []
    paymentIntent.forEach(e =>
        lm.push({
            amount: e.monto,
            additional_info: {
                external_reference: e.external_reference,
                print_on_terminal: true,
                ticket_number: e.ticket_number
            }
        }));
    var json = JSON.stringify(lm);
    dispatch({
        type: LOADING
    })
    const options = {
        headers: {
            'Authorization': "Bearer " + paymentIntent[0].token,
            'Content-Type': 'application/json',
            "x-test-scope": "sandbox" 
        }
    };

    const uri = "https://api.mercadopago.com/point/integration-api/devices/" + paymentIntent[0].deviceId + "/payment-intents"

    await axios.post(uri, json, options)
        .then(function (response) {
            console.log(response)
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
            console.log(error)
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

