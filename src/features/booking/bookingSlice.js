import { createSlice } from "@reduxjs/toolkit";
const initial = { serviceId:undefined, variantName:undefined, beauticianId:undefined, any:false, date:undefined, startISO:undefined, client:undefined, price:undefined, mode:undefined };
const slice = createSlice({
  name:"booking", initialState:initial, reducers:{
    setService(s,{payload}){ Object.assign(s,{serviceId:payload.serviceId,variantName:payload.variantName,price:payload.price}); },
    setBeautician(s,{payload}){ Object.assign(s,{beauticianId:payload.beauticianId, any:!!payload.any}); },
    setDate(s,{payload}){ s.date = payload; },
    setSlot(s,{payload}){ s.startISO = payload; },
    setClient(s,{payload}){ s.client = payload; },
    setMode(s,{payload}){ s.mode = payload; },
    reset(){ return initial; }
}});
export const { setService, setBeautician, setDate, setSlot, setClient, setMode, reset } = slice.actions;
export default slice.reducer;
