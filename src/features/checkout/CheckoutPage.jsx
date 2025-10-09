import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { CheckoutAPI } from "./checkout.api";
import { BookingAPI } from "../booking/booking.api";
import { setClient, setMode } from "../booking/bookingSlice";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const booking = useSelector((s)=>s.booking);
  const dispatch = useDispatch(); const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", notes:"" });
  const update = (k)=> (e)=> setForm({ ...form, [k]: e.target.value });

  async function submit(mode){
    dispatch(setMode(mode)); dispatch(setClient(form)); setLoading(true);
    try{
      if(mode === "pay_in_salon"){
        await BookingAPI.reserveWithoutPayment({
          beauticianId: booking.any ? undefined : booking.beauticianId,
          any: booking.any, serviceId: booking.serviceId, variantName: booking.variantName,
          startISO: booking.startISO, client: form
        });
        navigate("/confirmation");
      } else {
        const res = await CheckoutAPI.createSession({
          beauticianId: booking.any ? undefined : booking.beauticianId,
          any: booking.any, serviceId: booking.serviceId, variantName: booking.variantName,
          startISO: booking.startISO, client: form, mode
        });
        if(res?.url) window.location.href = res.url;
      }
    }catch(e){ alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-3">
      <div className="text-lg font-semibold">Your details</div>
      <input className="border w-full rounded px-3 py-2" placeholder="Name" value={form.name} onChange={update("name")} />
      <input className="border w-full rounded px-3 py-2" placeholder="Email" value={form.email} onChange={update("email")} />
      <input className="border w-full rounded px-3 py-2" placeholder="Phone" value={form.phone} onChange={update("phone")} />
      <textarea className="border w-full rounded px-3 py-2" placeholder="Notes" value={form.notes} onChange={update("notes")} />
      <div className="flex gap-2">
        <button disabled={loading} className="border rounded px-3 py-2" onClick={()=>submit("pay_now")}>Pay now</button>
        <button disabled={loading} className="border rounded px-3 py-2" onClick={()=>submit("deposit")}>Pay deposit</button>
        <button disabled={loading} className="border rounded px-3 py-2" onClick={()=>submit("pay_in_salon")}>Pay at salon</button>
      </div>
    </div>
  );
}
