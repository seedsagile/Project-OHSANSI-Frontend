import * as XLSX from 'xlsx';
type ExportType = 'excel' | 'pdf-prep';

interface WorkerMessage {
  type: ExportType;
  data: any[];
  filtrosTexto: string;
}

const formatDate = (fechaIso: string) => {
  if (!fechaIso) return '-';
  return new Date(fechaIso).toLocaleString('es-BO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatNota = (nota: number | undefined | null) => 
  (nota === undefined || nota === null) ? '-' : nota.toFixed(2);

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data, filtrosTexto } = e.data;

  try {
    if (type === 'excel') {
      const datosParaExcel = data.map((item, index) => ({
        'Nº': index + 1,
        'Fecha y Hora': formatDate(item.fecha_hora),
        'Evaluador': item.nombre_evaluador,
        'Estudiante': item.nombre_olimpista,
        'Área': item.area,
        'Nivel': item.nivel,
        'Acción': item.accion,
        'Nota Anterior': formatNota(item.nota_anterior),
        'Nota Nueva': formatNota(item.nota_nueva),
        'Detalle de Acción': item.descripcion,
        'Observación/Justificación': item.observacion || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet([]);
      
      XLSX.utils.sheet_add_aoa(worksheet, [
        ['REPORTE DE AUDITORÍA DE CALIFICACIONES'],
        [`Generado: ${new Date().toLocaleString('es-BO')}`],
        [`Filtros: ${filtrosTexto}`],
      ], { origin: 'A1' });

      XLSX.utils.sheet_add_json(worksheet, datosParaExcel, { origin: 'A5', skipHeader: false });

      worksheet['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 30 }, { wch: 30 },
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
        { wch: 10 }, { wch: 40 }, { wch: 30 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      self.postMessage({ status: 'success', result: blob });

    } else if (type === 'pdf-prep') {
      const rows = data.map(item => [
        formatDate(item.fecha_hora),
        item.nombre_evaluador,
        item.nombre_olimpista,
        `${item.area}\n(${item.nivel})`,
        item.accion,
        formatNota(item.nota_anterior),
        formatNota(item.nota_nueva),
        item.descripcion
      ]);

      self.postMessage({ status: 'success', result: rows });
    }
  } catch (error) {
    self.postMessage({ status: 'error', error: String(error) });
  }
};