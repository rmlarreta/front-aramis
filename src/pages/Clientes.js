import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { default as React, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddProducto from '../components/AddProducto';
import { messageService } from '../redux/messagesducks';
import { DeleteProducto, InsertProducto, UpdateProducto } from '../redux/stockducks';
import { StockService } from '../service/StockService';

const Clientes = () => {

    const dispatch = useDispatch();
    const toast = useRef(null);
    const activo = useSelector(store => store.users.activo);
    const load = useSelector(store => store.stock.loading);
    const stockService = new StockService();

    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true);
    const [productos, setproductos] = useState([]);
    const [product, setproduct] = useState([]);
    const [ivas, setivas] = useState([]);
    const [rubros, setrubros] = useState([]);
    const [display, setdisplay] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);

    const fetchStock = async () => {
        setloading(true);
        await stockService.GetProductos()
            .then(data => {
                setproductos(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

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

    const onEditModel = (rowData) => {
        setproduct(rowData);
        setdisplay(true);
    }

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...product };
        _product[`${name}`] = val;
        setproduct(_product);
        if (name === 'iva' && val > 0) {
            calcularPrecio(_product);
        }
    }

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;
        setproduct(_product);
        calcularPrecio(_product);
    }

    const calcularPrecio = (_product) => {
        let iva = ivas.find(id => id.id === _product.iva);
        if (iva) {
            let precio = _product.costo * (1 + (iva.tasa / 100)) * (1 + (_product.tasa / 100)) + _product.internos;
            _product.precio = precio;
            setproduct(_product);
        }
    }

    const onSubmit = () => {
        setSubmitted(true);
        if (product.codigo.trim() &&
            product.detalle.trim() &&
            product.rubro &&
            product.iva
        ) {
            dispatch(UpdateProducto(product));
            setSubmitted(false);
            setdisplay(false);
        } else {
            toast.current.show({ severity: 'error', summary: 'Verificar', detail: 'Complete los datos Faltantes', life: 3000 });
        }
    }

    const confirmDeleteProduct = (rowData) => {
        setproduct(rowData);
        setDeleteProductDialog(true);
    }

    const deleteProduct = () => {
        dispatch(DeleteProducto(product.id));
        setDeleteProductDialog(false);
    }

    useEffect(() => {
        if (activo) {
            fetchStock();
            fetchAuxiliares();
        }
    }, [activo, load]);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <AddProducto></AddProducto>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setdisplay(false)} />
            <Button label="Alta" icon="pi pi-check" className="p-button-text" onClick={() => onSubmit()} />
        </React.Fragment>
    );

    const deleteProductDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={() => setDeleteProductDialog(false)} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={() => deleteProduct()} />
        </React.Fragment>
    );

    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text mr-2 mb-2" onClick={() => onEditModel(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text mr-2 mb-2" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        )
    }

    const stockTemplate = (rowData) => {
        return (
            <>
                <Rating value={rowData.stock} readOnly stars={rowData.stock <= 0 ? 0 : rowData.stock <= 5 ? 1 : rowData.stock > 5 && rowData.stock <= 10 ? 2 : 3} />
            </>
        )
    }

    return (
        activo ? (
            <div className="col-12">
                <Toast ref={toast} />
                <div className="card">
                    <h5>Stock</h5>
                    <DataTable value={productos} dataKey="id" loading={loading}
                        paginator rows={10} rowsPerPageOptions={[5, 10, 25]} className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                        globalFilter={filter} emptyMessage="Sin Datos." header={header} responsiveLayout="scroll">
                        <Column field="codigo" header="Código" sortable />
                        <Column field="detalle" header="Detalle" sortable />
                        <Column field="stock" header="Stock" sortable body={stockTemplate} />
                        <Column field="rubroStr" header="Rubro" sortable />
                        <Column field="precio" header="Precio" sortable />
                        <Column headerStyle={{ width: '4rem' }} body={actionTemplate}></Column>
                    </DataTable>
                    <Dialog header="Editar Producto" className="p-fluid" visible={display} style={{ width: '50vw' }} modal onHide={() => setdisplay(false)} footer={productDialogFooter} >
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
                            <div className="field col-6">
                                <label htmlFor="iva">Iva</label>
                                <Dropdown name="iva" onChange={(e) => onInputChange(e, 'iva')} value={product.iva} options={ivas} optionValue="id" optionLabel="tasa" placeholder="Iva"
                                    filter showClear filterBy="tasa" required autoFocus className={classNames({ 'p-invalid': submitted && !product.iva })} />
                                {submitted && !product.iva && <small className="p-error">Iva es requerido.</small>}
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
                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={()=>setDeleteProductDialog(false)}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && <span>Estas seguro de eliminar <b>{product.detalle}</b>?</span>}
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