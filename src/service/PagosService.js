import request from '../context/interceptor';

export class PagosService {

    async GetPoints() {
        const res = await request.get('Recibos/GetPoints');
        return res.data;
    }

    async StatePaymentIntent(paymentIntent, id) {
        const res = await request.get('Recibos/StatePaymentIntent/' + paymentIntent + '/' + id);
        return res.data;
    }
}