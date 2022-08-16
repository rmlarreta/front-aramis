import request from '../context/interceptor';

export class DocumentService {

    async GetDocuments() {
        const res = await request.get('Documents/GetDocuments');
        return res.data;
    }

    async GetDocumentsById(data) {
        const res = await request.get('Documents/GetDocuments/' + data);
        return res.data;
    }

    async GetDocumentsByTipo(data) {
        const res = await request.get('Documents/GetDocumentsByTipo/' + data);
        return res.data;
    }

    async Report(data) {
        var params = {
            access_token: 'An access_token'
        };
        const token = localStorage.getItem('token')
        if (token) {
            params.access_token = 'Bearer ' + token
        }
        var url = [process.env.REACT_APP_BASE_URL + '/Documents/Report/' + data.id];
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': params.access_token
            },
        })
            .then((response) => response.blob())
            .then((blob) => {
                // 2. Create blob link to download
                const urlfile = window.URL.createObjectURL(new Blob([blob]), { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = urlfile;
                link.setAttribute('download', data.tipo + ' ' + data.letra + ' ' + data.pos + '-' + data.numero + '.pdf');
                //    // 3. Append to html page
                document.body.appendChild(link);
                //    // 4. Force download
                link.click();
                //    // 5. Clean up and remove the link 
                document.body.removeChild(link);
            })
    }
} 