import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AvailabilityAPI } from "./availability.api";
import { setDate, setSlot } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";

export default function TimeSlots() {
  const { serviceId, variantName, beauticianId, any, date } = useSelector((s)=>s.booking);
  const [slots,setSlots] = useState([]); const [loading,setLoading] = useState(false);
  const dispatch = useDispatch(); const navigate = useNavigate();
  useEffect(()=>{
    if(!serviceId || !variantName || !date) return;
    setLoading(true);
    const params = { serviceId, variantName, date, ...(any ? { any:true } : { beauticianId }) };
    AvailabilityAPI.slots(params).then(setSlots).finally(()=>setLoading(false));
  },[serviceId, variantName, beauticianId, any, date]);
  if(!serviceId) return <div className="p-6">Choose a service first.</div>;
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm text-gray-600">Date</label>
        <input type="date" className="border rounded px-3 py-2" value={date||""} onChange={(e)=>dispatch(setDate(e.target.value))} />
      </div>
      {loading ? <div>loading slots…</div> : (
        <div className="flex flex-wrap gap-2">
          {slots.length===0 ? <div>No times available</div> : slots.map((s)=>(
            <button key={s.startISO} className="border rounded px-3 py-2"
              onClick={()=>{ dispatch(setSlot(s.startISO)); navigate("/checkout"); }}>
              {new Date(s.startISO).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
