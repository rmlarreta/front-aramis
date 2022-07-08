import request from '../context/interceptor';

export class DocumentService {

    async GetDocuments() {
        const res = await request.get('Documents/GetDocuments');  
        return res.data;
    }  

    async GetDocumentsById(data) {
        const res = await request.get('Documents/GetDocuments/'+data);  
        return res.data;
    }  

    async GetDocumentsByTipo(data) {
        const res = await request.get('Documents/GetDocumentsByTipo/'+data);  
        return res.data;
    }  

}