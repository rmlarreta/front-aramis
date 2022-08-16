import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import Moment from 'react-moment';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import AddDetall from '../components/AddDetall';
import ChangeClienteOperation from '../components/ChangeClienteOperation';
import { messageService } from '../redux/messagesducks';
import { DeleteDocumentDetalles, FinalizarOperation, InsertOrden, UpdateDocument, UpdateDocumentDetalles } from '../redux/operationsdusck';
import { CancelPaymentIntent, CreatePaymentIntent, InsertRecibo } from '../redux/pagosducks';
import { DocumentService } from '../service/DocumentService';
import { PagosService } from '../service/PagosService'; 

const Operation = () => {

    const dispatch = useDispatch();

    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const idDocument = useSelector(store => store.operations.data);

    const paying = useSelector(store => store.pagos.paying);
    const payment = useSelector(store => store.pagos.payment);
    const recibido = useSelector(store => store.pagos.recibido);

    const documentService = new DocumentService();
    const pagoService = new PagosService();

    const [loading, setloading] = useState(true);
    const [documento, setdocumento] = useState([]);
    const [detalles, setdetalles] = useState([]);
    const [selected, setSelected] = useState([]);
    const dt = useRef(null);

    const [model, setmodel] = useState([]);
    const [display, setdisplay] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [observaDialog, setObservaDialog] = useState(false);
    const [operationDialog, setOperationDialog] = useState(false);
    const [pagoDialog, setpagoDialog] = useState(false);

    const [count, setCount] = useState(0);
    const [intervalId, setIntervalId] = useState(0);

    // tabla pagos
    const [eft, seteft] = useState(0);
    const [mp, setmp] = useState(0);
    const [cc, setcc] = useState(0);
    const [points, setpoints] = useState([]);
    const [cuentaCorrienteOculta, setcuentaCorrienteOculta] = useState(true);

    const [pagodisabled, setpagodisabled] = useState(true);
    const [orderdisable, setorderdisabled] = useState(true);

    const [codTipo, setCodTipo] = useState(null);

    const history = useHistory();

    const fetchDocuments = async () => {
        setloading(true);
        await documentService.GetDocumentsById(idDocument)
            .then(data => {
                setdocumento(data.documentsDto[0]);
                setdetalles(data.documentsDetallDto);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const fetchPoints = async () => {
        await pagoService.GetPoints()
            .then(data => {
                setpoints(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
    }

    const onEditDocument = () => {
        setObservaDialog(true);
    }

    const onDocumentChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _model = { ...documento };
        _model[`${name}`] = val;
        setdocumento(_model);
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
        calcularPrecio(_model);
    }

    const onSeleccionChange = () => {
        documento.cuit === 0 || documento.total > 0 || documento.codTipo === 3 ? setorderdisabled(true) : setorderdisabled(false);
        documento.total > 0 ? setpagodisabled(false) : setpagodisabled(true);
        setOperationDialog(true);
    }

    const calcularPrecio = (_model) => {
        let subTotal = _model.unitario * _model.cantidad;
        _model.subTotal = subTotal;
        setmodel(_model);
    }

    const onSubmit = () => {
        setSubmitted(true);
        if (model.codigo.trim() &&
            model.detalle.trim() &&
            model.rubro
        ) {
            let lm = [];
            lm.push(model)
            dispatch(UpdateDocumentDetalles(lm));
            setSubmitted(false);
            setdisplay(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const onSubmitDocument = () => {
        let lm = [];
        lm.push(documento)
        dispatch(UpdateDocument(lm));
        setObservaDialog(false);
    }

    const onInsertOrden = () => {
        dispatch(InsertOrden(documento.id));
        setOperationDialog(false);
    }

    const onEditModel = (rowData) => {
        setmodel(rowData);
        setdisplay(true);
    }

    const confirmDelete = (rowData) => {
        setmodel(rowData);
        setDeleteDialog(true);
    }

    const deleteDetall = () => {
        dispatch(DeleteDocumentDetalles(model.id, idDocument));
        setDeleteDialog(false);
    }

    const onGestionarPago = (tipo) => {
        if (documento.total < documento.limite) {
            setcuentaCorrienteOculta(true);
        }
        setCodTipo(tipo === "Remito" ? 3 :
            tipo === "Factura" ? 4 : null)
        setpagoDialog(true);
    }

    const onInputPagoChange = (e, name) => {
        let total = documento.total;
        let val = e.value || 0;
        if (val > total) {
            val = total;
        }
        let eft = 0;
        let mp = 0;
        let cc = 0;
        switch (name) {
            case 'eft':
                mp = total - val
                eft = val;
                break;
            case 'mp':
                eft = total - val
                mp = val;
                break;
            default: break
        }
        seteft(eft);
        setmp(mp);
        setcc(cc);
    }

    const aplicaTotal = (name) => {
        let total = documento.total;
        let eft = 0;
        let mp = 0;
        let cc = 0;
        switch (name) {
            case 'eft':
                mp = 0;
                cc = 0;
                eft = total;
                break;
            case 'mp':
                mp = total;
                eft = 0;
                cc = 0;
                break;
            case 'cc':
                mp = 0;
                eft = 0;
                cc = total;
                break;
            default:
                mp = 0;
                eft = 0;
                cc = 0;
        }
        seteft(eft);
        setmp(mp);
        setcc(cc);
    }

    const onProcesarPago = () => {
        if (mp > 0) {
            let pagomp = {
                amount: mp.toString().replace('.', ''),
                additional_info: {
                    external_reference: "Aramis Sistemas",
                    print_on_terminal: true,
                    ticket_number: documento.id.toString()
                }
            };
            dispatch(CreatePaymentIntent(pagomp, points[0].id))
        } else {
            onFinishPay();
        }
    }

    const onCancelarMp = () => {
        dispatch(CancelPaymentIntent(payment.id, points[0].id))
            .then(
                dispatch(messageService(false, 'CANCELANDO PAGO...', 200))
            )
    }

    const StatePaymentIntent = () => {
        pagoService.StatePaymentIntent(payment.id, points[0].id)
            .then(result => {
                switch (result.status) {
                    case "OPEN": return;
                    case "CANCELED":
                        setCount(0);
                        onCancelarMp();
                        return;
                    case "ERROR":
                        setCount(0);
                        onCancelarMp();
                        return;
                    case "FINISHED":
                        setCount(0);
                        onFinishPay();
                        return;
                    default: return;
                }
            })
    }

    const onFinishPay = () => {
        clearInterval(intervalId)
        let _recibo = [];
        if (eft !== 0) {
            _recibo.push({
                Tipo: "EFECTIVO",
                Detalle: documento.id.toString(),
                Codigo: points[0].id.toString(),
                Sucursal: points[0].id.toString(),
                Monto: eft
            });
        }
        if (mp !== 0) {
            _recibo.push({
                Tipo: "MERCADO PAGO",
                Detalle: payment.additional_info.ticket_number,
                Codigo: payment.id,
                Sucursal: points[0].id.toString(),
                Monto: mp
            });
        }
        dispatch(InsertRecibo(_recibo, documento.cliente, documento.id, codTipo));
    }

    useEffect(() => {
        if (activo && idDocument) {
            fetchDocuments();
            fetchPoints();
        }
    }, [activo, idDocument]);

    useEffect(() => {
        if (paying && payment) {
            const newIntervalId = setInterval(() => {
                setCount(prevCount => prevCount + 1);
                setIntervalId(newIntervalId);
            }, 3000);
        }
    }, [paying, payment]);

    useEffect(() => {
        if (count > 0 && count <= 40 && payment) {
            StatePaymentIntent();
        }
        if (count > 40) {
            setCount(0);
            clearInterval(intervalId)
            onCancelarMp();
        }
    }, [count]);

    useEffect(() => {
       if (recibido.id >0 && documento.id>0) { 
            documentService.Report(recibido.documents[0])
            .then(
                setdocumento(null),
                dispatch(FinalizarOperation()),
                history.push('/documents')
            );             
        }
    }, [recibido]);


    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text mr-2 mb-2" onClick={() => onEditModel(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text mr-2 mb-2" onClick={() => confirmDelete(rowData)} />
            </>
        )
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <AddDetall></AddDetall>
        </div>
    );

    const dialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplay(false)} />
            <Button label="Confirma" icon="pi pi-check" className="p-button-text" onClick={() => onSubmit()} />
        </React.Fragment>
    );

    const deleteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteDialog(false)} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => deleteDetall()} />
        </React.Fragment>
    );

    const dialogObservaFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setObservaDialog(false)} />
            <Button label="Confirma" icon="pi pi-check" className="p-button-text" onClick={() => onSubmitDocument()} />
        </React.Fragment>
    );

    const pagoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={() => setpagoDialog(false)} />
            <Button label="Pagar" icon="pi pi-dollar" onClick={() => onProcesarPago()} />
        </React.Fragment>
    );

    const mpDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-danger" onClick={() => onCancelarMp()} />
        </React.Fragment>
    );

    return (
        activo && idDocument ? (
            <div className="col-12">
                <Toast ref={toast} />
                <div className="card">
                    <Dialog visible={observaDialog} className="p-fluid" style={{ width: '50vw' }} header="Observaciones" modal onHide={() => setObservaDialog(false)} footer={dialogObservaFooter}>
                        <div className="col-12 lg:col-6 xl:col-12">
                            <InputTextarea id="observaciones" value={documento.observaciones} onChange={(e) => onDocumentChange(e, 'observaciones')} />
                        </div>
                    </Dialog>
                    <Dialog visible={operationDialog} className="card p-fluid" style={{ width: '30vw' }} header="Operación" modal onHide={() => setOperationDialog(false)}>
                        <div className="field-radiobutton">
                            <Button type="button" label="Orden de Servicio" icon="pi pi-cog" className="p-button-warning" disabled={orderdisable} onClick={() => onInsertOrden()} />
                        </div>
                        <div className="field-radiobutton">
                            <Button type="button" label="Remito" icon="pi pi-dollar" className="p-button-success" disabled={pagodisabled} onClick={() => onGestionarPago("Remito")} />
                        </div>
                        <div className="field-radiobutton">
                            <Button type="button" label="Factura" icon="pi pi-dollar" className="p-button-primary" disabled={pagodisabled} onClick={() => onGestionarPago("Factura")} />
                        </div>
                    </Dialog>
                    <div className="grid">
                        <div className="col-6 lg:col-6 xl:col-6">
                            <div className="card mb-0">
                                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                    <div>
                                        <span className="block text-500 font-medium mb-3">{documento.cuit}</span>
                                        <div className="text-900 font-medium text-xl">{documento.nombre}</div>
                                        <br></br>
                                        <div className="text-green-500 text-xl">{documento.tipo}
                                            <span className="text-500 text-xl">{" Nro " + documento.numero}</span></div>
                                    </div>
                                    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                        <ChangeClienteOperation></ChangeClienteOperation>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-3 lg:col-3 xl:col-3">
                            <div className="card">
                                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                    <Button icon="pi pi-pencil" className="p-button-rounded p-button-secondary" aria-label="Observaciones" onClick={() => onEditDocument()} />
                                    <Button icon="pi pi-print" className="p-button-rounded p-button-success" aria-label="Imprimir" disabled={documento.total > 0 ? false : true} />
                                    <Button icon="pi pi-cog" className="p-button-rounded p-button-help" aria-label="Operación" onClick={() => onSeleccionChange()} />
                                </div>
                            </div>
                        </div>
                        <div className="col-3 lg:col-3 xl:col-3">
                            <div className="card mb-0">
                                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                    <div>
                                        <div className="text-500">{<Moment format='D/MM/yyyy'>{documento.fecha}</Moment>}</div>
                                        <br></br>
                                        <div className="text-blue-500 text-xl">{"$ " + documento.total}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DataTable value={detalles} dataKey="id" loading={loading}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
                        emptyMessage="Sin Datos." header={header} responsiveLayout="scroll"
                        ref={dt} selection={selected} onSelectionChange={(e) => setSelected(e.value)}
                    >
                        <Column field="cantidad" header="Cant." sortable />
                        <Column field="detalle" header="Detalle" sortable />
                        <Column field="unitario" header="Unitario" sortable />
                        <Column field="subTotal" header="Sub Total" sortable />
                        <Column headerStyle={{ width: '4rem' }} body={actionTemplate}></Column>
                    </DataTable >
                    <Dialog header="Editar Item" className="p-fluid" visible={display} style={{ width: '40vw' }} modal onHide={() => setdisplay(false)} footer={dialogFooter} >
                        <div className="field grid">
                            <div className="field col-4">
                                <br></br>
                                <label htmlFor="cantidad">Cantidad</label>
                                <InputNumber id="cantidad" value={model.cantidad} onChange={(e) => onInputNumberChange(e, 'cantidad')} showButtons buttonLayout="horizontal" step={0.1} min={1}
                                    decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" mode="decimal" />
                            </div>
                            <div className="field col-4">
                                <br></br>
                                <label htmlFor="unitario">Unitario</label>
                                <InputNumber id="unitario" value={model.unitario} onChange={(e) => onInputNumberChange(e, 'unitario')} mode="currency" currency="USD" locale="en-US" required autoFocus className={classNames({ 'p-invalid': submitted && !model.unitario })} />
                                {submitted && !model.unitario && <small className="p-error">Unitario es requerido.</small>}
                            </div>
                            <div className="field col-4">
                                <br></br>
                                <label htmlFor="subTotal">Sub Total</label>
                                <InputNumber id="subTotal" value={model.subTotal} readOnly mode="currency" currency="USD" locale="en-US" />
                            </div>
                            <div className="field col-12">
                                <br></br>
                                <label htmlFor="detalle">Detalle</label>
                                <InputText id="detalle" value={model.detalle} onChange={(e) => onInputChange(e, 'detalle')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.detalle })} />
                                {submitted && !model.detalle && <small className="p-error">Detalle es requerido.</small>}
                            </div>

                        </div>
                    </Dialog>
                    <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteDialogFooter} onHide={() => setDeleteDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {model && <span>Estas seguro de eliminar <b>{model.detalle}</b>?</span>}
                        </div>
                    </Dialog>
                    <Dialog visible={pagoDialog} style={{ width: '25vw' }} header="Pagos" modal onHide={() => setpagoDialog(false)} footer={pagoDialogFooter}>
                        <div className="grid p-fluid">
                            <div className="field col-12">
                                <br></br>
                                <label htmlFor="locale-us">Efectivo</label>
                                <div className="p-inputgroup">
                                    <InputNumber inputId="locale-us" value={eft} onChange={(e) => onInputPagoChange(e, 'eft')} mode="decimal" locale="en-US" maxFractionDigits={2} minFractionDigits={2} />
                                    <Button icon="pi pi-dollar" className="p-button-success" onClick={() => aplicaTotal('eft')} />
                                </div>
                            </div>
                            <div className="field col-12">
                                <label htmlFor="locale-us">Mercado Pago</label>
                                <div className="p-inputgroup">
                                    <InputNumber inputId="locale-us" value={mp} readOnly mode="decimal" locale="en-US" maxFractionDigits={2} minFractionDigits={2} />
                                    <Button icon="pi pi-dollar" className="p-button-primary" onClick={() => aplicaTotal('mp')} />
                                </div>
                            </div>
                            <div className="field col-12" hidden={cuentaCorrienteOculta}>
                                <label htmlFor="locale-us">Cuenta Corriente</label>
                                <div className="p-inputgroup">
                                    <InputNumber inputId="locale-us" value={cc} readOnly mode="decimal" locale="en-US" maxFractionDigits={2} minFractionDigits={2} />
                                    <Button icon="pi pi-briefcase" className="p-button-danger" onClick={() => aplicaTotal('cc')} />
                                </div>
                            </div>
                        </div>
                    </Dialog>
                    <Dialog visible={paying} style={{ width: '25vw' }} header="Procese el pago en la terminal POINT" modal footer={mpDialogFooter}>
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
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

export default React.memo(Operation, comparisonFn);  