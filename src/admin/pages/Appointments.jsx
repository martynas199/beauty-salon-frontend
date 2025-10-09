import { useEffect, useState } from "react";
import { api } from "../../lib/apiClient";
export default function Appointments(){
  const [rows,setRows] = useState([]);
  useEffect(()=>{ api.get("/appointments").then(r=> setRows(r.data||[])).catch(()=>setRows([])); },[]);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Appointments</h1>
      <div className="overflow-auto border rounded">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Client</th>
              <th className="text-left p-2">Staff</th>
              <th className="text-left p-2">Service</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.client?.name}</td>
                <td className="p-2">{r.beautician?.name||r.beauticianId}</td>
                <td className="p-2">{r.service?.name||r.serviceId} – {r.variantName}</td>
                <td className="p-2">{new Date(r.start).toLocaleString()}</td>
                <td className="p-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
