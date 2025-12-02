import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { HistorialCambio } from '../types';

const PDF_FORMAT = 'letter'; 
const formatDate = (fechaIso: string) => {
  if (!fechaIso) return '-';
  const date = new Date(fechaIso);
  return date.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatNota = (nota: number | undefined): string => {
    return (nota === undefined || nota === null) ? '-' : nota.toFixed(2);
}

export function useExportarReporte() {
  const downloadBlob = useCallback((blob: Blob, fileName: string, contentType: string) => {
      const finalBlob = new Blob([blob], { type: contentType });
      saveAs(finalBlob, fileName);
  }, []);


  const exportarExcel = useCallback((data: HistorialCambio[], filtrosTexto: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    try {
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
        ['REPORTE DE AUDITORÍA DE CALIFICACIONES - OH! SANSI'],
        [`Generado: ${new Date().toLocaleString('es-BO')}`],
        [`Filtros Aplicados: ${filtrosTexto}`],
        ['']
      ], { origin: 'A1' });

      XLSX.utils.sheet_add_json(worksheet, datosParaExcel, { origin: 'A5', skipHeader: false });
    
      worksheet['!cols'] = [
        { wch: 5 },  // Nº
        { wch: 22 }, // Fecha y Hora
        { wch: 28 }, // Evaluador
        { wch: 28 }, // Estudiante
        { wch: 18 }, // Área
        { wch: 25 }, // Nivel
        { wch: 15 }, // Acción
        { wch: 15 }, // Nota Anterior
        { wch: 15 }, // Nota Nueva
        { wch: 45 }, // Detalle de Acción
        { wch: 35 }, // Observación/Justificación
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Auditoria');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(dataBlob, `Reporte_Auditoria_Cambios_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Ocurrió un error al generar el archivo Excel.');
    }
  }, []);

  const exportarPDF = useCallback((data: HistorialCambio[], filtrosTexto: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: PDF_FORMAT });
      doc.setFontSize(18);
      doc.setTextColor(34, 34, 34);
      doc.text('Reporte de Auditoría de Calificaciones', 14, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Generado el: ${new Date().toLocaleString('es-BO')}`, 14, 22);
      doc.text(`Filtros: ${filtrosTexto}`, 14, 27);
      
      const tableColumns = [
          'Fecha/Hora', 
          'Evaluador', 
          'Olimpista', 
          'Área/Nivel', 
          'Acción', 
          'Nota Ant.', 
          'Nota Nueva', 
          'Detalle'
      ];
      
      const tableRows = data.map(item => [
          formatDate(item.fecha_hora),
          item.nombre_evaluador,
          item.nombre_olimpista,
          `${item.area}\n(${item.nivel})`,
          item.accion,
          formatNota(item.nota_anterior),
          formatNota(item.nota_nueva),
          item.descripcion
      ]);
      autoTable(doc, {
          head: [tableColumns],
          body: tableRows,
          startY: 35,
          theme: 'striped',
          styles: { 
              fontSize: 8, 
              cellPadding: 2, 
              valign: 'middle',
              overflow: 'linebreak'
          },
          headStyles: { 
              fillColor: [0, 118, 255],
              textColor: 255, 
              fontStyle: 'bold', 
              halign: 'center'
          },
          alternateRowStyles: {
              fillColor: [240, 245, 255]
          },
          columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 35 },
              2: { cellWidth: 35 },
              3: { cellWidth: 30 },
              4: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
              5: { cellWidth: 15, halign: 'center' },
              6: { cellWidth: 15, halign: 'center' },
              7: { cellWidth: 'auto' },
          },
          didDrawPage: (data) => {
              doc.setFontSize(8);
              doc.setTextColor(150);
              const pageStr = `Página ${data.pageNumber}`;
              doc.text(pageStr, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
          },
      });

      doc.save(`Reporte_Auditoria_Cambios_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Ocurrió un error al generar el archivo PDF.');
    }
  }, [downloadBlob]);

  return { exportarExcel, exportarPDF };
}