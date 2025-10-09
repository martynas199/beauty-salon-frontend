import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StaffAPI } from "./staff.api";
import { setBeautician } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";

export default function StaffPicker() {
  const { serviceId } = useSelector((s)=>s.booking);
  const [list,setList] = useState([]); const dispatch = useDispatch(); const navigate = useNavigate();
  useEffect(()=>{ if(serviceId) StaffAPI.byService(serviceId).then(setList); },[serviceId]);
  if(!serviceId) return <div className="p-6">Choose a service first.</div>;
  return (
    <div className="p-6 flex flex-wrap gap-3">
      <button className="border rounded px-3 py-2" onClick={()=>{ dispatch(setBeautician({ any:true })); navigate("/times"); }}>Any staff</button>
      {list.map((b)=>(
        <button key={b._id} className="border rounded px-3 py-2"
          onClick={()=>{ dispatch(setBeautician({ beauticianId:b._id, any:false })); navigate("/times"); }}>
          {b.name}
        </button>
      ))}
    </div>
  );
}
