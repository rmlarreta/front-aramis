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

export default function documentsReducer(state = dataInicial, action) {
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

export const InsertDocument = () => async (dispatch) => {
    dispatch({
        type: LOADING
    })
    await request.post('Documents/InsertDocument')
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

export const DeleteDocument = (id) => async (dispatch) => {
    dispatch({
        type: LOADING
    })
    await request.delete('Documents/DeleteDocument/'+id)
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








