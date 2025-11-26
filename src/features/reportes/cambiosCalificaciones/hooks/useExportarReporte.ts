import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { HistorialCambio } from '../types';

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

export function useExportarReporte() {
  /**
   * Genera y descarga un archivo Excel (.xlsx) con los datos proporcionados.
   * Incluye encabezados con metadatos del reporte.
   *
   * @param data - Lista de registros a exportar.
   * @param filtrosTexto - Texto descriptivo de los filtros aplicados (para el encabezado).
   */
  const exportarExcel = useCallback((data: HistorialCambio[], filtrosTexto: string) => {
    if (!data || data.length === 0) {
      console.warn('[useExportarReporte] No hay datos para exportar a Excel.');
      return;
    }

    try {
      const datosParaExcel = data.map((item, index) => ({
        'Nº': index + 1,
        'Fecha y Hora': formatDate(item.fecha_hora),
        'Evaluador': item.nombre_evaluador,
        'Olimpista': item.nombre_olimpista,
        'Área': item.area,
        'Nivel': item.nivel,
        'Acción': item.accion.toUpperCase(),
        'Detalle del Cambio': item.descripcion,
        'Observación': item.observacion || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet([]);

      XLSX.utils.sheet_add_aoa(
        worksheet,
        [
          ['REPORTE DE AUDITORÍA DE CALIFICACIONES - OH! SANSI'],
          [`Filtros: ${filtrosTexto}`],
          [`Generado el: ${new Date().toLocaleString('es-BO')}`],
          [''],
        ],
        { origin: 'A1' }
      );

      XLSX.utils.sheet_add_json(worksheet, datosParaExcel, {
        origin: 'A5',
        skipHeader: false,
      });

      const columnWidths = [
        { wch: 5 },  // Nº
        { wch: 20 }, // Fecha
        { wch: 25 }, // Evaluador
        { wch: 25 }, // Olimpista
        { wch: 15 }, // Área
        { wch: 25 }, // Nivel
        { wch: 15 }, // Acción
        { wch: 50 }, // Detalle
        { wch: 35 }, // Observación
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Cambios');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `Reporte_Calificaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(dataBlob, fileName);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Ocurrió un error al generar el archivo Excel. Por favor, intente nuevamente.');
    }
  }, []);

  /**
   * Genera y descarga un archivo PDF con tabla paginada.
   * Utiliza los estilos del Design System (Azul corporativo).
   *
   * @param data - Lista de registros a exportar.
   * @param filtrosTexto - Texto descriptivo de los filtros aplicados.
   */
  const exportarPDF = useCallback((data: HistorialCambio[], filtrosTexto: string) => {
    if (!data || data.length === 0) {
      console.warn('[useExportarReporte] No hay datos para exportar a PDF.');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text('Reporte de Auditoría de Calificaciones', 14, 15);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Contexto: ${filtrosTexto}`, 14, 22);
      doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-BO')}`, 14, 27);

      // --- Definición de Columnas y Datos ---
      const tableColumns = [
        'Nº',
        'Fecha',
        'Evaluador',
        'Olimpista',
        'Área / Nivel',
        'Acción',
        'Detalle',
        'Observación',
      ];

      const tableRows = data.map((item, index) => [
        index + 1,
        formatDate(item.fecha_hora),
        item.nombre_evaluador,
        item.nombre_olimpista,
        `${item.area}\n${item.nivel}`,
        item.accion.toUpperCase(),
        item.descripcion,
        item.observacion || '-',
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 118, 255],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' }, // Nº
          1: { cellWidth: 22 }, // Fecha
          4: { cellWidth: 35 }, // Área/Nivel
          5: { cellWidth: 20, fontStyle: 'bold', halign: 'center' }, // Acción
          6: { cellWidth: 'auto' }, // Detalle
          7: { cellWidth: 40 }, // Observación
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(150);
          const pageStr = `Página ${data.pageNumber}`;
          doc.text(
            pageStr,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        },
      });

      const fileName = `Reporte_Calificaciones_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Ocurrió un error al generar el archivo PDF. Por favor, intente nuevamente.');
    }
  }, []);

  return {
    exportarExcel,
    exportarPDF,
  };
}