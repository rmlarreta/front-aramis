import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { default as React, useEffect, useRef, useState } from 'react';
import Moment from 'react-moment';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DeleteDocument, InsertDocument } from '../redux/documentsducks';
import { messageService } from '../redux/messagesducks';
import { EditDocument } from '../redux/operationsdusck';
import { onReset } from '../redux/pagosducks';
import { DocumentService } from '../service/DocumentService';
const Documents = () => {
    const options = [
        { id: 1, tipo: "PRESUPUESTOS" },
        { id: 3, tipo: "ORDENES" },
        { id: 2, tipo: "REMITOS" },
    ]

    const dispatch = useDispatch();
    const history = useHistory();

    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const load = useSelector(store => store.documentos.loading);
    const recibido = useSelector(store => store.pagos.recibido);

    const documentService = new DocumentService();

    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true);
    const [documentos, setdocumentos] = useState([]);
    const [detalles, setdetalles] = useState([]);
    const [selected, setSelected] = useState([]);
    const [expandedRows, setExpandedRows] = useState(null);
    const dt = useRef(null);

    const [model, setmodel] = useState([]);
    const [tipo, setipo] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const fetchDocuments = async () => {
        setloading(true);
        await documentService.GetDocumentsByTipo(tipo)
            .then(data => {
                setdocumentos(data.documentsDto);
                setdetalles(data.documentsDetallDto);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const onChangeTipo = (e) => {
        const val = (e.target && e.target.value) || '';
        setipo(val);
    }

    const insertDocument = () => {
        dispatch(InsertDocument());
    }

    const onEditDocument = (data) => {
        dispatch(EditDocument(data));
        history.push("/operation");
    }

    const confirmDelete = (rowData) => {
        setmodel(rowData);
        setDeleteDialog(true);
    }

    const onDeleteDocument = () => {
        dispatch(DeleteDocument(model.id));
        setDeleteDialog(false);
    }

    useEffect(() => {
        if (activo) {
            fetchDocuments();
        }
    }, [activo, load, tipo]);

    useEffect(() => {
        if (recibido > 0) {
            dispatch(onReset());
        }
    }, []);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
            </span>
            <div className="field col-6">
                <Dropdown name="tipo" onChange={(e) => onChangeTipo(e)} value={tipo} options={options} optionValue="id" optionLabel="tipo" placeholder="Tipo de Documento" />
            </div>
            <Button icon="pi pi-plus" className="p-button-rounded p-button-success" aria-label="Add" onClick={() => insertDocument()} />
        </div>
    );

    const deleteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialog(false)} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => onDeleteDocument()} />
        </React.Fragment>
    );

    const detallesTemplate = (data) => {
        return (
            <DataTable value={detalles.filter(d => d.documento === data.id)} dataKey="id" responsiveLayout="scroll"
                rowExpansionTemplate={detallesTemplate}>
                <Column field="cantidad" header="Cant." sortable />
                <Column field="detalle" header="Detalle" sortable />
                <Column field="unitario" header="Unitario" sortable />
                <Column field="subTotal" header="Sub Total" sortable />
            </DataTable>
        )
    }

    const fechaTemplate = (rowData) => {
        return <Moment format='D/MM/yyyy'>{rowData.fecha}</Moment>
    }

    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-check" className="p-button-rounded p-button-text mr-2 mb-2" onClick={() => { onEditDocument(rowData.id) }} />
                <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text mr-2 mb-2" onClick={() => { confirmDelete(rowData) }} />
            </>
        )
    }

    return (
        activo ? (
            <div className="col-12">
                <Toast ref={toast} />
                <div className="card">
                    <h5>Operaciones Pendientes</h5>
                    <DataTable value={documentos} dataKey="id" loading={loading}
                        rowExpansionTemplate={detallesTemplate} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} documentos"
                        globalFilter={filter} emptyMessage="Sin Datos." header={header} responsiveLayout="scroll"
                        ref={dt}
                        selection={selected} onSelectionChange={(e) => setSelected(e.value)}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column expander style={{ width: '3em' }} />
                        <Column field="tipo" header="Tipo" sortable />
                        <Column field="numero" header="Numero" sortable />
                        <Column field="nombre" header="Cliente" sortable />
                        <Column field="cuit" header="Cuit" sortable />
                        <Column field="fecha" header="Fecha" sortable body={fechaTemplate} />
                        <Column field="total" header="Total" sortable />
                        <Column headerStyle={{ width: '4rem' }} body={actionTemplate} />
                    </DataTable >
                    <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDialogFooter} onHide={() => setDeleteDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {model && <span>Estas seguro de eliminar <b>{model.tipo} {model.numero}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        ) : (<div className="card">
            <h4>Requiere Autenticación</h4>
            <div className="border-round border-1 surface-border p-4">
                <div className="flex mb-3">
                    <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
                    <div>
                        <Skeleton width="10rem" className="mb-2"></Skeleton>
                        <Skeleton width="5rem" className="mb-2"></Skeleton>
                        <Skeleton height=".5rem"></Skeleton>
                    </div>
                </div>
                <Skeleton width="100%" height="150px"></Skeleton>
                <div className="flex justify-content-between mt-3">
                    <Skeleton width="4rem" height="2rem"></Skeleton>
                    <Skeleton width="4rem" height="2rem"></Skeleton>
                </div>
            </div>
        </div>)
    )
}

const comparisonFn = function (prevProps, nextProps) {
    return prevProps.location.pathname === nextProps.location.pathname;
};

export default React.memo(Documents, comparisonFn);  