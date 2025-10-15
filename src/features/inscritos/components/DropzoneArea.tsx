import type { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';
import { UploadCloud, FileText, LoaderCircle } from 'lucide-react';

// Props del componente
type DropzoneAreaProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  isParsing: boolean;
  nombreArchivo: string | null;
  open: () => void;
};

export function DropzoneArea({
  getRootProps,
  getInputProps,
  isDragActive,
  isParsing,
  nombreArchivo,
  open,
}: DropzoneAreaProps) {
  const baseClasses =
    'flex-grow border-2 border-dashed rounded-lg flex items-center justify-center p-4 text-neutro-500 transition-colors duration-300 cursor-pointer';
  const activeClasses = 'border-principal-500 bg-principal-50';
  const idleClasses = 'border-neutro-300 hover:border-principal-400';

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-6">
      <button
        type="button"
        onClick={open}
        disabled={isParsing}
        className="flex items-center justify-center gap-2 font-semibold py-2.5 px-6 rounded-lg bg-principal-500/10 text-principal-600 hover:bg-principal-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UploadCloud size={20} />
        <span>Cargar CSV</span>
      </button>
      <div
        {...getRootProps({
          className: `${baseClasses} ${isDragActive ? activeClasses : idleClasses}`,
        })}
      >
        <input {...getInputProps()} />
        {isParsing ? (
          <div className="flex items-center gap-2 text-principal-600">
            <LoaderCircle size={20} className="animate-spin" />
            <span className="font-semibold">Procesando archivo...</span>
          </div>
        ) : nombreArchivo ? (
          <div className="flex items-center gap-2 text-exito-600">
            <FileText size={20} />
            <span className="font-semibold">{nombreArchivo}</span>
          </div>
        ) : (
          <p>{isDragActive ? 'Suelta el archivo aquí...' : 'o arrastra un archivo aquí'}</p>
        )}
      </div>
    </div>
  );
}
