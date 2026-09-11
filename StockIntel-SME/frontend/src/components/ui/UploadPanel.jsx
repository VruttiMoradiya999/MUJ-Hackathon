import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Reusable CSV upload panel for catalog / sales imports.
 */
export function UploadPanel({
  title = 'Upload CSV',
  description = 'Upload a CSV file using the template format.',
  accept = '.csv,text/csv',
  templateLabel = 'Download template',
  onDownloadTemplate,
  onFileSelected,
  uploading = false,
  result = null,
  errors = [],
  onClearResult,
  className = '',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFileSelected?.(file);
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
        {onDownloadTemplate && (
          <Button variant="secondary" size="xs" icon={Download} onClick={onDownloadTemplate}>
            {templateLabel}
          </Button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition ${
          dragOver
            ? 'border-slate-900 bg-slate-50'
            : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/60'
        } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
          {uploading ? (
            <Upload className="w-5 h-5 animate-pulse" />
          ) : (
            <FileSpreadsheet className="w-5 h-5" />
          )}
        </div>
        <p className="text-sm font-medium text-slate-800">
          {uploading ? 'Processing upload…' : 'Drop CSV here or click to browse'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {fileName ? `Selected: ${fileName}` : 'CSV only · max recommended 5 MB'}
        </p>
      </div>

      {errors?.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1" role="alert">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            Fix these issues and try again
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{result.message || 'Upload processed successfully.'}</p>
                {result.summary && (
                  <ul className="mt-1.5 space-y-0.5 text-emerald-800">
                    {Object.entries(result.summary).map(([k, v]) => (
                      <li key={k}>
                        <span className="capitalize">{k.replace(/_/g, ' ')}</span>: <strong>{String(v)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {onClearResult && (
              <button
                type="button"
                onClick={onClearResult}
                className="p-0.5 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPanel;
