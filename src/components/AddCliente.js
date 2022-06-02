import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InsertCliente } from '../redux/clientesducks';
import { messageService } from '../redux/messagesducks';
import { ClienteService } from '../service/ClienteService';
import AddImputacion from './AddImputacion';

const AddCliente = () => {
    let modelVacio = {
        cuit: '',
        nombre: '',
        responsabilidad: null,
        genero: null,
        imputacion: null,
        domicilio: '',
        telefono: '',
        mail: '',
        observaciones: ''
    };

    const dispatch = useDispatch();
    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const loadimp = useSelector(store => store.clientes.loadimput);
    const clienteService = new ClienteService();
    const [display, setdisplay] = useState(false);
    const [respos, setrespos] = useState([]);
    const [generos, setgeneros] = useState([]);
    const [imputaciones, setimputaciones] = useState([]);
    const [model, setmodel] = useState(modelVacio);
    const [submitted, setSubmitted] = useState(false);

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

    useEffect(() => {
        if (activo && display) {
            fetchAuxiliares();
            setmodel(modelVacio);
            setSubmitted(false);
        }
    }, [activo, display]);

    useEffect(() => {
        if (activo && !loadimp) {
            fetchAuxiliares();
        }
    }, [activo, loadimp]);

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
            dispatch(InsertCliente(model));
            setSubmitted(false);
            setdisplay(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const clienteDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplay(false)} />
            <Button label="Alta" icon="pi pi-check" className="p-button-text" onClick={() => onSubmit()} />
        </React.Fragment>
    );

    return <>
        <Toast ref={toast} />
        <Button icon="pi pi-plus" label="Nuevo Cliente" onClick={() => setdisplay(true)} className="p-button-help"></Button>
        <Dialog header="Nuevo Cliente" className="p-fluid" visible={display} style={{ width: '50vw' }} modal onHide={() => setdisplay(false)} footer={clienteDialogFooter} >
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
            </div>
        </Dialog>
    </>
}


export default AddCliente;  