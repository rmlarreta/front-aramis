import {createStore, combineReducers, compose, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'   
import messagesReducer from './messagesducks'; 
import usersReducer, {userisactive} from './usersducks';   
import stockReducer from './stockducks';
import clienteReducer from './clientesducks';   
import documentsReducer from './documentsducks';  
import operationsReducer from './operationsdusck';
import pagosReducer from './pagosducks';

const rootReducer = combineReducers({ 
    users: usersReducer ,
    messages: messagesReducer, 
    stock: stockReducer,
    clientes: clienteReducer,
    documentos: documentsReducer,
    operations:operationsReducer,
    pagos:pagosReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function generateStore(){
    const store = createStore( rootReducer,  composeEnhancers( applyMiddleware(thunk) ))
    userisactive()(store.dispatch)
    return store;
}