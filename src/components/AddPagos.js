import React from 'react'

const AddPagos = () => {
    return (
        <>
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
    )
}

export default AddPagos