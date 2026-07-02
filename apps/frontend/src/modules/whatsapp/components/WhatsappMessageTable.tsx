import { useEffect, useState } from 'react';
import { WhatsappMessageLog, whatsappService } from '../services/whatsapp.service';

export function WhatsappMessageTable() {
  const [items, setItems] = useState<WhatsappMessageLog[]>([]);

  useEffect(() => {
    void whatsappService.messages().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="px-4 py-3 font-bold">{item.phone}</td>
              <td className="px-4 py-3">{item.messageType}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="max-w-md truncate px-4 py-3 text-slate-500">{item.content}</td>
            </tr>
          )) : <tr><td className="px-4 py-6 text-slate-500">No hay mensajes registrados.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
