import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";
export default function Staff(){
  const [list,setList] = useState([]); const [name,setName] = useState("");
  useEffect(()=>{ api.get("/beauticians").then(r=>setList(r.data)); },[]);
  async function add(){ const res = await api.post("/beauticians", { name, active: true }); setList([...list, res.data]); setName(""); }
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Staff</h1>
      <div className="mb-4 flex gap-2">
        <input className="border rounded px-3 py-2" placeholder="Beautician name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="border rounded px-3 py-2" onClick={add}>Add</button>
      </div>
      <ul className="space-y-2">{list.map(s=> (<li key={s._id} className="border rounded p-3">{s.name} {s.active? "• active": "• inactive"}</li>))}</ul>
    </div>
  );
}
