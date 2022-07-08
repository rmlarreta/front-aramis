import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messageService } from '../redux/messagesducks';
import { UpdateClienteDocument } from '../redux/operationsdusck';
import { ClienteService } from '../service/ClienteService';

const ChangeClienteOperation = () => {

    const dispatch = useDispatch(); 
    const activo = useSelector(store => store.users.activo);
    const documento = useSelector(store => store.operations.data);
    const clienteService = new ClienteService();
    const [clientes, setclientes] = useState([]);
    const [display, setdisplay] = useState(false);
    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true);

    const fetchClientes = async () => {
        await clienteService.GetClientes()
            .then(data => {
                setclientes(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const onSubmit = (cliente) => {
        dispatch(UpdateClienteDocument(documento,cliente));
        setdisplay(false);
    }

    useEffect(() => {
        if (activo && display) {
            fetchClientes();
        }
    }, [activo, display]);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-check" className="p-button-rounded p-button-info p-button-text mr-2 mb-2" onClick={() => onSubmit(rowData.id)} />
            </>
        )
    }
    return <>
        <Button type="button" className="pi pi-users" onClick={() => setdisplay(true)} />
        <Sidebar header="Clientes" className="p-fluid" visible={display} style={{ width: '60vw' }} modal onHide={() => setdisplay(false)} baseZIndex={1000} >
            <DataTable value={clientes} dataKey="id" loading={loading}
                paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
                globalFilter={filter} emptyMessage="Sin Datos." header={header} responsiveLayout="scroll">
                <Column field="cuit" header="Cuit" sortable />
                <Column field="nombre" header="Nombre" sortable />
                <Column field="responsabilidad" header="Iva" sortable />
                <Column field="telefono" header="Telefono" sortable />
                <Column field="mail" header="Mail" sortable />
                <Column headerStyle={{ width: '4rem' }} body={actionTemplate}></Column>
            </DataTable>
        </Sidebar>
    </>
}


export default ChangeClienteOperation;  