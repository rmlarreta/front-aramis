import request from '../context/interceptor';

export class ClienteService {

    async GetClientes() {
        const res = await request.get('Clientes/GetClientes');  
        return res.data;
    } 

    async GetRespo() {
        const res = await request.get('Clientes/GetRespo');  
        return res.data;
    } 

    async GetGenero() {
        const res = await request.get('Clientes/GetGenero');  
        return res.data;
    } 

    async GetImputaciones() {
        const res = await request.get('Clientes/GetImputaciones');  
        return res.data;
    } 
}