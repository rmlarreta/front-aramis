import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddCliente from '../components/AddCliente';
import AddImputacion from '../components/AddImputacion';
import Imputaciones from '../components/Imputaciones';
import { DeleteCliente, UpdateCliente } from '../redux/clientesducks';
import { messageService } from '../redux/messagesducks';
import { ClienteService } from '../service/ClienteService';

const Clientes = () => {

    const dispatch = useDispatch();
    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const load = useSelector(store => store.clientes.loading);
    const loadimp = useSelector(store => store.clientes.loadimput);
    const clienteService = new ClienteService();

    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true);
    const [clientes, setclientes] = useState([]);
    const [model, setmodel] = useState([]);
    const [respos, setrespos] = useState([]);
    const [generos, setgeneros] = useState([]);
    const [imputaciones, setimputaciones] = useState([]);
    const [display, setdisplay] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    const fetchClientes = async () => {
        setloading(true);
        await clienteService.GetClientes()
            .then(data => {
                setclientes(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const fetchAuxiliares = async () => {
        await clienteService.GetGenero()
            .then(data => {
                setgeneros(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        await clienteService.GetImputaciones()
            .then(data => {
                setimputaciones(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        await clienteService.GetRespo()
            .then(data => {
                setrespos(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
    }

    const onEditModel = (rowData) => {
        setmodel(rowData);
        setdisplay(true);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _model = { ...model };
        _model[`${name}`] = val;
        setmodel(_model);
    }

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _model = { ...model };
        _model[`${name}`] = val;
        setmodel(_model);
    }

    const onSubmit = () => {
        setSubmitted(true);
        if (model.nombre.trim()&&
        model.responsabilidad&&
        model.genero&&
        model.imputacion&&
        model.cuit
        ) {
            let lm = [];
            lm.push(model)
            dispatch(UpdateCliente(lm));
            setSubmitted(false);
            setdisplay(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const confirmDelete = (rowData) => {
        setmodel(rowData);
        setDeleteDialog(true);
    }

    const deleteCliente = () => {
        dispatch(DeleteCliente(model.id));
        setDeleteDialog(false);
    }

    useEffect(() => {
        if (activo) {
            fetchClientes();
            fetchAuxiliares();
        }
    }, [activo, load]);

    useEffect(() => {
        if (activo && !loadimp) {
            fetchAuxiliares();
        }
    }, [activo, loadimp]);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <AddCliente></AddCliente>
            <Imputaciones></Imputaciones>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const clienteDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplay(false)} />
            <Button label="Enviar" icon="pi pi-check" className="p-button-text" onClick={() => onSubmit()} />
        </React.Fragment>
    );

    const deleteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialog(false)} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => deleteCliente()} />
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
        activo ? (
            <div className="col-12">
                <Toast ref={toast} />
                <div className="card">
                    <h5>Clientes</h5>
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
                    <Dialog header="Editar Cliente" className="p-fluid" visible={display} style={{ width: '50vw' }} modal onHide={() => setdisplay(false)} footer={clienteDialogFooter} >
                        <div className="field grid">
                            <div className="field col-3">
                                <br></br>
                                <label htmlFor="cuit">Cuit</label>
                                <InputNumber id="cuit" value={model.cuit} onChange={(e) => onInputNumberChange(e, 'cuit')} integeronly useGrouping={false} required autoFocus className={classNames({ 'p-invalid': submitted && !model.cuit })} />
                                {submitted && !model.cuit && <small className="p-error">Cuit es requerido.</small>}
                            </div>
                            <div className="field col-9">
                                <br></br>
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={model.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.nombre })} />
                                {submitted && !model.nombre && <small className="p-error">Nombre es requerido.</small>}
                            </div>
                            <div className="field col-6">
                                <label htmlFor="genero">Genero</label>
                                <Dropdown name="genero" onChange={(e) => onInputChange(e, 'genero')} value={model.genero} options={generos} optionValue="id" optionLabel="id" placeholder="Genero"
                                    filter showClear filterBy="id" required autoFocus className={classNames({ 'p-invalid': submitted && !model.genero })} />
                                {submitted && !model.genero && <small className="p-error">Genero es requerido.</small>}
                            </div>
                            <div className="field col-6">
                                <label htmlFor="responsabilidad">Responsabilidad</label>
                                <Dropdown name="responsabilidad" onChange={(e) => onInputChange(e, 'responsabilidad')} value={model.responsabilidad} options={respos} optionValue="id" optionLabel="id" placeholder="Responsabilidad"
                                    filter showClear filterBy="id" required autoFocus className={classNames({ 'p-invalid': submitted && !model.responsabilidad })} />
                                {submitted && !model.responsabilidad && <small className="p-error">Responsabilidad es requerido.</small>}
                            </div>
                            <div className="field col-12">
                                <AddImputacion></AddImputacion>
                                <Dropdown name="imputacion" onChange={(e) => onInputChange(e, 'imputacion')} value={model.imputacion} options={imputaciones} optionValue="id" optionLabel="detalle" placeholder="Imputacion"
                                    filter showClear filterBy="detalle" required autoFocus className={classNames({ 'p-invalid': submitted && !model.imputacion })} />
                                {submitted && !model.imputacion && <small className="p-error">Imputacion es requerido.</small>}
                            </div>
                            <div className="field col-8">
                                <label htmlFor="domicilio">Domicilio</label>
                                <InputText id="domicilio" value={model.domicilio} onChange={(e) => onInputChange(e, 'domicilio')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.domicilio })} />
                                {submitted && !model.domicilio && <small className="p-error">Domicilio es requerido.</small>}
                            </div>
                            <div className="field col-4 md:col-4">
                                <label htmlFor="telefono">Telefono</label>
                                <InputMask id="telefono" mask="(999) 999-9999" value={model.telefono} placeholder="(999) 999-9999" onChange={(e) => onInputChange(e, 'telefono')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.telefono })} />
                                {submitted && !model.telefono && <small className="p-error">Telefono es requerido.</small>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="mail">Mail</label>
                                <InputText type="email" id="mail" value={model.mail} onChange={(e) => onInputChange(e, 'mail')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.mail })} />
                                {submitted && !model.mail && <small className="p-error">Mail es requerido.</small>}
                            </div>
                            <div className="field col-8">
                                <label htmlFor="observaciones">Observaciones</label>
                                <InputTextarea id="observaciones" value={model.observaciones} onChange={(e) => onInputChange(e, 'observaciones')} />
                            </div>
                            <div className="field col-7">
                                <label htmlFor="nombreFantasia">Nombre Fantasia</label>
                                <InputText type="nombreFantasia" id="nombreFantasia" value={model.nombreFantasia} onChange={(e) => onInputChange(e, 'nombreFantasia')}   autoFocus className={classNames({ 'p-invalid': submitted && !model.nombreFantasia })} />
                                {submitted && !model.nombreFantasia && <small className="p-error">Nombre Fantasia es requerido.</small>}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="limiteSaldo">Limite Saldo</label>
                                <InputNumber id="limiteSaldo" value={model.limiteSaldo} onChange={(e) => onInputNumberChange(e, 'limiteSaldo')} integeronly useGrouping={false}   autoFocus className={classNames({ 'p-invalid': submitted && !model.limiteSaldo })} />
                                {submitted && !model.limiteSaldo && <small className="p-error">Limite Saldo es requerido.</small>}
                            </div>
                        </div>
                    </Dialog>
                    <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDialogFooter} onHide={() => setDeleteDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {model && <span>Estas seguro de eliminar <b>{model.nombre}</b>?</span>}
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

export default React.memo(Clientes, comparisonFn);  