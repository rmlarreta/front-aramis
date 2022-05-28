import request from '../context/interceptor';

export class StockService {

    async GetProductos() {
        const res = await request.get('Stock/GetProductos');  
        return res.data;
    } 

    async GetIvas() {
        const res = await request.get('Stock/GetIvas');  
        return res.data;
    } 

    async GetRubros() {
        const res = await request.get('Stock/GetRubros');  
        return res.data;
    } 
}