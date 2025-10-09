import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";
export default function Services(){
  const [list,setList] = useState([]); const [name,setName] = useState("");
  useEffect(()=>{ api.get("/services").then(r=>setList(r.data)); },[]);
  async function add(){ const res = await api.post("/services", { name, variants: [] }); setList([...list, res.data]); setName(""); }
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Services</h1>
      <div className="mb-4 flex gap-2">
        <input className="border rounded px-3 py-2" placeholder="New service name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="border rounded px-3 py-2" onClick={add}>Add</button>
      </div>
      <ul className="space-y-2">{list.map(s=> (<li key={s._id} className="border rounded p-3">{s.name}</li>))}</ul>
    </div>
  );
}
