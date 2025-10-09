import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ServicesAPI } from "./services.api";
import { setService } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";

export default function ServicesPage() {
  const [services, setServices] = useState([]); const [loading, setLoading] = useState(true);
  const dispatch = useDispatch(); const navigate = useNavigate();
  useEffect(() => { ServicesAPI.list().then(setServices).finally(()=>setLoading(false)); }, []);
  if (loading) return <div className="p-6">loading…</div>;
  return (
    <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((s)=>(
        <div key={s._id} className="rounded-xl border p-4">
          <h3 className="text-lg font-semibold">{s.name}</h3>
          <div className="mt-2 space-y-2">
            {(s.variants||[]).map((v)=>(
              <button key={v.name} className="w-full rounded border px-3 py-2 hover:bg-gray-50"
                onClick={()=>{ dispatch(setService({ serviceId:s._id, variantName:v.name, price:v.price })); navigate("/staff"); }}>
                {v.name} · {v.durationMin} min · £{v.price}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
