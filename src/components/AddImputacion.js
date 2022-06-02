import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { InsertImputacion } from '../redux/clientesducks';

const AddImputacion = () => {
    let modelVacio = { 
        detalle:''
    };

    const dispatch = useDispatch();
    const toast = useRef(null);
    const [display, setdisplay] = useState(false);
    const [model, setmodel] = useState(modelVacio);
    const [submitted, setSubmitted] = useState(false);

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _model = { ...model };
        _model[`${name}`] = val;
        setmodel(_model);
    }

    const onSubmit = () => {
        setSubmitted(true);
        if (model.detalle.trim()
        ) {
            dispatch(InsertImputacion(model));
            setSubmitted(false);
            setdisplay(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const imputDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplay(false)} />
            <Button label="Alta" icon="pi pi-check" className="p-button-text" onClick={() => onSubmit()} />
        </React.Fragment>
    );

    return <>
        <Toast ref={toast} />
        <Button icon="pi pi-plus" label="Imputaciones" onClick={() => setdisplay(true)} className="p-button-info"></Button>
        <Dialog header="Nueva Imputacion" className="p-fluid" visible={display} style={{ width: '50vw' }} modal onHide={() => setdisplay(false)} footer={imputDialogFooter} >
            <div className="field grid">
                <div className="field col-12">
                    <br></br>
                    <label htmlFor="detalle">Imputacion</label>
                    <InputText id="detalle" value={model.detalle} onChange={(e) => onInputChange(e, 'detalle')} required autoFocus className={classNames({ 'p-invalid': submitted && !model.detalle })} />
                    {submitted && !model.detalle && <small className="p-error">Imputacion es requerido.</small>}
                </div>
            </div>
        </Dialog>
    </>
}


export default AddImputacion;  