import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteImputacion, InsertImputacion, UpdateImputacion } from '../redux/clientesducks';
import { messageService } from '../redux/messagesducks';
import { DeleteRubro, InsertRubro, UpdateRubro } from '../redux/stockducks';
import { ClienteService } from '../service/ClienteService';
import AddImputacion from './AddImputacion';

const Imputaciones = () => {
    let modelVacio = {
        detalle: ''
    };

    const dispatch = useDispatch();
    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const loadimp = useSelector(store => store.clientes.loadimput);
    const clienteService = new ClienteService();

    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true);
    const [model, setmodel] = useState(modelVacio);
    const [models, setmodels] = useState([]);
    const [display, setdisplay] = useState(false);
    const [displayEdit, setdisplayEdit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const fetchAuxiliares = async () => {
        await clienteService.GetImputaciones()
            .then(data => {
                setmodels(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const onEditModel = (rowData) => {
        setmodel(rowData);
        setdisplayEdit(true);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _model = { ...model };
        _model[`${name}`] = val;
        setmodel(_model);
    }

    const onSubmitUpdate = () => {
        setSubmitted(true);
        if (model.detalle.trim()
        ) { 
             let lm = [];
            lm.push(model)
            dispatch(UpdateImputacion(lm));
            setSubmitted(false);
            setdisplayEdit(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const confirmDelete = (rowData) => {
        setmodel(rowData);
        setDeleteDialog(true);
    }

    const deleteModel = () => {
        dispatch(DeleteImputacion(model.id));
        setDeleteDialog(false);
    }

    useEffect(() => {
        if (activo && display) {
            fetchAuxiliares();
            setmodel(modelVacio);
        }
    }, [activo, loadimp, display]);

    const header = (
        <React.Fragment>
            <div className="field grid">
                <div className='p-button-help'>
                    <AddImputacion></AddImputacion>
                </div>
                <div className="field col-7">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
                    </span>
                </div>
            </div>
        </React.Fragment>
    );

    const modelDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplayEdit(false)} />
            <Button label="Confirma" icon="pi pi-check" className="p-button-text" onClick={() => onSubmitUpdate()} />
        </React.Fragment>
    );

    const deleteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialog(false)} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => deleteModel()} />
        </React.Fragment>
    );

    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text mr-2 mb-2" onClick={() => onEditModel(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text mr-2 mb-2" onClick={() => confirmDelete(rowData)} />
            </>
        )
    }

    return (
        <>
            <Toast ref={toast} />
            <Button icon="pi pi-at" label="Imputaciones" onClick={() => setdisplay(true)} className="p-button-info"></Button>
            <Dialog className="p-fluid" header={'Imputaciones'} visible={display} style={{ width: '50vw' }} modal onHide={() => setdisplay(false)}  >
                <div className="col-12">
                    <DataTable value={models} dataKey="id" loading={loading}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} imputaciones"
                        globalFilter={filter} emptyMessage="Sin Datos." header={header} responsiveLayout="scroll">
                        <Column field="id" header="id" sortable />
                        <Column field="detalle" header="Imputación" sortable />
                        <Column headerStyle={{ width: '4rem' }} body={actionTemplate}></Column>
                    </DataTable>
                    <Dialog header="Editar Imputacion" className="p-fluid" visible={displayEdit} style={{ width: '30vw' }} modal onHide={() => setdisplayEdit(false)} footer={modelDialogFooter} >
                        <div className="field grid">
                            <div className="field col-12">
                                <br></br>
                                <label htmlFor="detalle">Detalle</label>
                                <InputText id="detalle" value={model.detalle} onChange={(e) => onInputChange(e, 'detalle')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.detalle })} />
                                {submitted && !model.detalle && <small className="p-error">Detalle es requerido.</small>}
                            </div>
                        </div>
                    </Dialog>
                    <Dialog visible={deleteDialog} style={{ width: '350px' }} header="Confirm" modal footer={deleteDialogFooter} onHide={() => setDeleteDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {model && <span>Estas seguro de eliminar <b>{model.detalle}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </Dialog>
        </>
    )
}

export default Imputaciones;