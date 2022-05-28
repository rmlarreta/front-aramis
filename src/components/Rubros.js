import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messageService } from '../redux/messagesducks';
import { DeleteRubro, InsertRubro, UpdateRubro } from '../redux/stockducks';
import { StockService } from '../service/StockService';

const Rubros = () => {
    let modelVacio = {
        id: 0,
        detalle: '' 
    };

    const dispatch = useDispatch();
    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const load = useSelector(store => store.stock.loading);
    const stockService = new StockService();

    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true); 
    const [rubro, setrubro] = useState(modelVacio); 
    const [rubros, setrubros] = useState([]);
    const [display, setdisplay] = useState(false);
    const [displayEdit, setdisplayEdit] = useState(false);
    const [displayAdd, setdisplayAdd] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [deleteRubroDialog, setDeleteRubroDialog] = useState(false);

    const fetchAuxiliares = async () => {
        await stockService.GetRubros()
            .then(data => {
                setrubros(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const onEditModel = (rowData) => {
        setrubro(rowData);
        setdisplayEdit(true);
    }

    const onInsertModel = () => {
        setrubro(modelVacio);
        setdisplayAdd(true);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _rubro = { ...rubro };
        _rubro[`${name}`] = val;
        setrubro(_rubro);
    }

    const onSubmitAdd = () => {
        setSubmitted(true);
        if (rubro.detalle.trim()
        ) {
            dispatch(InsertRubro(rubro));
            setSubmitted(false);
            setdisplayAdd(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const onSubmitUpdate = () => {
        setSubmitted(true);
        if (rubro.detalle.trim()
        ) {
            dispatch(UpdateRubro(rubro));
            setSubmitted(false);
            setdisplayEdit(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const confirmDeleteRubro = (rowData) => {
        setrubro(rowData);
        setDeleteRubroDialog(true);
    }

    const deleteRubro = () => {
        dispatch(DeleteRubro(rubro.id));
        setDeleteRubroDialog(false);
    }

    useEffect(() => {
        if (activo) {
            fetchAuxiliares();
            setrubro(modelVacio);
        }
    }, [activo, load]);

    const header = (
        <React.Fragment>
            <div className="field grid">
                <Button icon="pi pi-plus" className="p-button-rounded p-button-info" aria-label="Plus" onClick={()=>onInsertModel()} />
                <div className="field col-10">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
                    </span>
                </div>
            </div>
        </React.Fragment>
    );

    const rubroDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplayEdit(false)} />
            <Button label="Confirma" icon="pi pi-check" className="p-button-text" onClick={() => onSubmitUpdate()} />
        </React.Fragment>
    );

    const deleteRubroDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteRubroDialog(false)} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => deleteRubro()} />
        </React.Fragment>
    );

    const addRubroDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplayAdd(false)} />
            <Button label="Alta" icon="pi pi-check" className="p-button-text" onClick={() => onSubmitAdd()} />
        </React.Fragment>
    );

    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text mr-2 mb-2" onClick={() => onEditModel(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text mr-2 mb-2" onClick={() => confirmDeleteRubro(rowData)} />
            </>
        )
    }

    return (
        <>
            <Toast ref={toast} />
            <Button icon="pi pi-at" label="Rubros" onClick={() => setdisplay(true)} className="p-button-info"></Button>
            <Dialog className="p-fluid" header={'Rubros'} visible={display} style={{ width: '30vw' }} modal onHide={() => setdisplay(false)}  >
                <div className="col-12">
                    <DataTable value={rubros} dataKey="id" loading={loading}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} rubros"
                        globalFilter={filter} emptyMessage="Sin Datos." header={header} responsiveLayout="scroll">
                        <Column field="id" header="Código" sortable />
                        <Column field="detalle" header="Detalle" sortable />
                        <Column headerStyle={{ width: '4rem' }} body={actionTemplate}></Column>
                    </DataTable>
                    <Dialog header="Editar Rubro" className="p-fluid" visible={displayEdit} style={{ width: '30vw' }} modal onHide={() => setdisplayEdit(false)} footer={rubroDialogFooter} >
                        <div className="field grid">
                            <div className="field col-12">
                                <br></br>
                                <label htmlFor="detalle">Detalle</label>
                                <InputText id="detalle" value={rubro.detalle} onChange={(e) => onInputChange(e, 'detalle')} required autoFocus className={classNames({ 'p-invalid': submitted && !rubro.detalle })} />
                                {submitted && !rubro.detalle && <small className="p-error">Detalle es requerido.</small>}
                            </div>
                        </div>
                    </Dialog>
                    <Dialog header="Agregar Rubro" className="p-fluid" visible={displayAdd} style={{ width: '30vw' }} modal onHide={() => setdisplayAdd(false)} footer={addRubroDialogFooter} >
                        <div className="field grid">
                            <div className="field col-12">
                                <br></br>
                                <label htmlFor="detalle">Detalle</label>
                                <InputText id="detalle" value={rubro.detalle} onChange={(e) => onInputChange(e, 'detalle')} required autoFocus className={classNames({ 'p-invalid': submitted && !rubro.detalle })} />
                                {submitted && !rubro.detalle && <small className="p-error">Detalle es requerido.</small>}
                            </div>
                        </div>
                    </Dialog>
                    <Dialog visible={deleteRubroDialog} style={{ width: '350px' }} header="Confirm" modal footer={deleteRubroDialogFooter} onHide={() => setDeleteRubroDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {rubro && <span>Estas seguro de eliminar <b>{rubro.detalle}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </Dialog>
        </>
    )
}

export default Rubros;