import { SunatStatusBadge } from './SunatStatusBadge';
import { useEffect, useState } from 'react';
import { SunatDocument, sunatService } from '../services/sunat.service';

export function SunatDocumentTable() {
  const [docs, setDocs] = useState<SunatDocument[]>([]);

  useEffect(() => {
    void sunatService.documents().then(setDocs).catch(() => setDocs([]));
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <tbody>
          {docs.length ? docs.map((doc) => (
            <tr key={doc.id} className="border-b">
              <td className="px-4 py-3 font-bold">{doc.documentType}</td>
              <td className="px-4 py-3">{doc.series}-{String(doc.number).padStart(6, '0')}</td>
              <td className="px-4 py-3">{doc.customerName}</td>
              <td className="px-4 py-3">S/ {Number(doc.total).toFixed(2)}</td>
              <td className="px-4 py-3"><SunatStatusBadge status={doc.status} /></td>
            </tr>
          )) : <tr><td className="px-4 py-6 text-slate-500">No hay documentos SUNAT registrados.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
