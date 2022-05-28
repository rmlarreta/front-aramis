import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messageService } from '../redux/messagesducks';
import { InsertProducto } from '../redux/stockducks';
import { StockService } from '../service/StockService';

const AddProducto = () => {
    let modelVacio = {
        codigo: '',
        detalle: '',
        rubro: null,
        costo: 0,
        iva: 1,
        internos: 0,
        tasa: 0,
        stock: 0,
        servicio: false
    };

    const dispatch = useDispatch();
    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const stockService = new StockService();
    const [display, setdisplay] = useState(false);
    const [ivas, setivas] = useState([]);
    const [rubros, setrubros] = useState([]);
    const [product, setProduct] = useState(modelVacio);
    const [submitted, setSubmitted] = useState(false);

    const fetchAuxiliares = async () => {
        await stockService.GetIvas()
            .then(data => {
                setivas(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        await stockService.GetRubros()
            .then(data => {
                setrubros(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
    }

    useEffect(() => {
        if (activo && display) {
            fetchAuxiliares();
            setProduct(modelVacio);
            setSubmitted(false);
        }
    }, [activo, display]);

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;
        setProduct(_product);
        if (name === 'iva' && val > 0) {
            calcularPrecio(_product);
        }
    }

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;
        setProduct(_product);
        calcularPrecio(_product);
    }

    const calcularPrecio = (_product) => {
        let iva = ivas.find(id => id.id === _product.iva);
        if (iva) {
            let precio = _product.costo * (1 + (iva.tasa / 100)) * (1 + (_product.tasa / 100)) + _product.internos;
            _product.precio = precio;
            setProduct(_product);
        }
    }

    const onSubmit = () => {
        setSubmitted(true);
        if (product.codigo.trim() &&
            product.detalle.trim() &&
            product.rubro &&
            product.iva
        ) {
            dispatch(InsertProducto(product));
            setSubmitted(false);
            setdisplay(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplay(false)} />
            <Button label="Alta" icon="pi pi-check" className="p-button-text" onClick={() => onSubmit()} />
        </React.Fragment>
    );

    return <>
        <Toast ref={toast} />
        <Button icon="pi pi-plus" label="Nuevo Producto" onClick={() => setdisplay(true)} className="p-button-help"></Button>
        <Dialog header="Nuevo Producto" className="p-fluid" visible={display} style={{ width: '50vw' }} modal onHide={() => setdisplay(false)} footer={productDialogFooter} >
            <div className="field grid">
                <div className="field col-3">
                    <br></br>
                    <label htmlFor="codigo">Codigo</label>
                    <InputText id="codigo" value={product.codigo} onChange={(e) => onInputChange(e, 'codigo')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.codigo })} />
                    {submitted && !product.codigo && <small className="p-error">Codigo es requerido.</small>}
                </div>
                <div className="field col-9">
                    <br></br>
                    <label htmlFor="detalle">Detalle</label>
                    <InputText id="detalle" value={product.detalle} onChange={(e) => onInputChange(e, 'detalle')} required autoFocus className={classNames({ 'p-invalid': submitted && !product.detalle })} />
                    {submitted && !product.detalle && <small className="p-error">Detalle es requerido.</small>}
                </div>
                <div className="field col-6">
                    <label htmlFor="rubro">Rubro</label>
                    <Dropdown name="rubro" onChange={(e) => onInputChange(e, 'rubro')} value={product.rubro} options={rubros} optionValue="id" optionLabel="detalle" placeholder="Rubro"
                        filter showClear filterBy="detalle" required autoFocus className={classNames({ 'p-invalid': submitted && !product.rubro })} />
                    {submitted && !product.rubro && <small className="p-error">Rubro es requerido.</small>}
                </div>

                <div className="field col-6">
                    <label htmlFor="costo">Costo</label>
                    <InputNumber id="costo" value={product.costo} onChange={(e) => onInputNumberChange(e, 'costo')} mode="currency" currency="USD" locale="en-US" />
                </div>
                <div className="field col-6">
                    <label htmlFor="internos">Internos</label>
                    <InputNumber id="internos" value={product.internos} onChange={(e) => onInputNumberChange(e, 'internos')} mode="currency" currency="USD" locale="en-US" />
                </div>
                <div className="field col-4">
                    <label htmlFor="iva">Iva</label>
                    <Dropdown name="iva" onChange={(e) => onInputChange(e, 'iva')} value={product.iva} options={ivas} optionValue="id" optionLabel="tasa" placeholder="Iva"
                        filter showClear filterBy="tasa" required autoFocus className={classNames({ 'p-invalid': submitted && !product.iva })} />
                    {submitted && !product.iva && <small className="p-error">Iva es requerido.</small>}
                </div>
                <div className="field col-2">
                    <h5>Servicio</h5>
                    <InputSwitch checked={product.servicio} onChange={(e) => onInputChange(e, 'servicio')} />
                </div>
                <div className="field col-6">
                    <label htmlFor="tasa">Tasa %</label>
                    <InputNumber id="tasa" value={product.tasa} onChange={(e) => onInputNumberChange(e, 'tasa')} integeronly />
                </div>
                <div className="field col-6">
                    <label htmlFor="precio">Precio Final</label>
                    <InputNumber id="precio" value={product.precio} readOnly mode="currency" currency="USD" locale="en-US" />
                </div>
            </div>
        </Dialog>
    </>
}


export default AddProducto;  