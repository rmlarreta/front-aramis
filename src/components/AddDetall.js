import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Rating } from 'primereact/rating';
import { Sidebar } from 'primereact/sidebar';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { messageService } from '../redux/messagesducks';
import { InsertDocumentDetalles } from '../redux/operationsdusck';
import { StockService } from '../service/StockService';

const AddDetall = () => {

    const dispatch = useDispatch();
    const activo = useSelector(store => store.users.activo);
    const load = useSelector(store => store.stock.loading);
    const documento = useSelector(store => store.operations.data);
    const stockService = new StockService();

    const [filter, setfilter] = useState(null);
    const [loading, setloading] = useState(true);
    const [productos, setproductos] = useState([]);
    const [selected, setSelected] = useState([]);
    const [display, setdisplay] = useState(false);
    const dt = useRef(null);

    const columns = [
        { field: 'cantidad', header: 'Cantidad' },
        { field: 'stock', header: 'Stock' },
        { field: 'detalle', header: 'Detalle' },
        { field: 'precio', header: 'Unitario' },
        { field: 'total', header: 'Sub Total' }
    ];

    const fetchStock = async () => {
        setloading(true);
        await stockService.GetProductos()
            .then(data => {
                setproductos(data);
            }).catch((error) => dispatch(messageService(false, error.response.data.message, error.response.status)));
        setloading(false);
    }

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    }

    const priceEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} mode="currency" currency="USD" locale="en-US" />
    }

    const cantidadEditor = (options) => {
        return <InputNumber value={options.value} onValueChange={(e) => options.editorCallback(e.value)} showButtons buttonLayout="horizontal" step={1} min={1}
            decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" mode="decimal" />
    }

    const cellEditor = (options) => {
        switch (options.field) {
            case 'cantidad':
                return cantidadEditor(options);
            case 'precio':
                return priceEditor(options);
            case 'total':
                return priceEditor(options);
            case 'detalle':
                return textEditor(options);
            default: return options.value;
        }
    }

    const onCellEditComplete = (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        switch (field) {
            case 'cantidad': if (isPositive(newValue)) {
                rowData[field] = newValue;
                rowData['total'] = rowData['cantidad'] * rowData['precio'];
            }
            else
                event.preventDefault();
                break;
            case 'precio':
                if (isPositive(newValue))
                    rowData[field] = newValue;
                else
                    event.preventDefault();
                break;
            case 'detalle': 
                if (newValue.trim().length > 0)
                    rowData[field] = newValue;
                else
                    event.preventDefault();
                break;
        }
    }

    const isPositive = (val) => {
        let str = String(val);
        str = str.trim();
        if (!str) {
            return false;
        }
        str = str.replace(/^0+/, "") || "0";
        let n = str;
        return n !== Infinity && String(n) === str && n >= 0;
    }

    const submit = () => {
        dispatch(InsertDocumentDetalles(selected, documento));
        setSelected([]);
        setdisplay(false);
    }

    const submitOnly = (dataRow) => {
        let lm = [];
        lm.push(dataRow)
        dispatch(InsertDocumentDetalles(lm, documento));
    }

    useEffect(() => {
        if (activo && display) {
            fetchStock();
        }
    }, [activo, load, display]);

    const header = (
        <div className="field grid">
            <div className="field col-3">
                <Button onClick={() => submit()} icon="pi pi-arrow-circle-right" label="Insertar Conceptos" className="p-button-success"></Button>
            </div>
            <div className="field col-6">
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setfilter(e.target.value)} placeholder="Buscar..." />
                </span>
            </div>
        </div>
    );

    const priceTemplate = (rowData) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.precio);
    }

    const totalTemplate = (rowData) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.total >= 0 ? rowData.total : rowData.precio);
    }

    const actionTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-arrow-circle-right" className="p-button-rounded p-button-info p-button-text mr-2 mb-2" onClick={() => submitOnly(rowData)} />
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
        <>
            <Button icon="pi pi-plus" label="Item" onClick={() => setdisplay(true)} className="p-button-help"></Button>
            <Sidebar header="Stock" className="p-fluid" visible={display} style={{ width: '60vw' }} modal onHide={() => setdisplay(false)} baseZIndex={1000} >
                <DataTable value={productos} editMode="cell" className="editable-cells-table" responsiveLayout="scroll"
                    paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
                    globalFilter={filter} emptyMessage="Sin Datos." header={header} loading={loading}
                    ref={dt} selection={selected} onSelectionChange={(e) => setSelected(e.value)}
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    {
                        columns.map(({ field, header }) => {
                            return <Column key={field} field={field} header={header} style={{ width: '25%' }} body={field === 'precio' ? priceTemplate : field === 'total' ? totalTemplate : field === 'stock' ? stockTemplate : ''}
                                editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} />
                        })
                    }
                    <Column headerStyle={{ width: '4rem' }} body={actionTemplate} />
                </DataTable>
            </Sidebar>
        </>)
}

export default AddDetall