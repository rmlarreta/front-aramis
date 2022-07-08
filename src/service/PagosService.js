 import request from '../context/interceptor';

export class PagosService {

    async GetPoints() {
        const res = await request.get('Recibos/GetPoints');  
        return res.data;
    }    
}