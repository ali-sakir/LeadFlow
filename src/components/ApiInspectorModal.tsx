import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal } from 'lucide-react';

interface ApiInspectorModalProps {
  info: {
    method: string;
    url: string;
    headers: any;
    response: any;
  } | null;
  onClose: () => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({ info, onClose }) => {
  if (!info) return null;

  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(info.response, null, 2);

  const copyResponseJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-slate-950 text-slate-100 h-full shadow-2xl flex flex-col border-l border-slate-800 font-mono text-xs">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between font-sans">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">JSON API Live Inspector</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request details */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded font-bold text-white bg-blue-600 uppercase text-[11px]">
              {info.method}
            </span>
            <span className="text-emerald-400 font-bold break-all">{info.url}</span>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1">
            <p><span className="text-slate-500 font-semibold">Auth Header:</span> {info.headers.Authorization || 'None'}</p>
            <p><span className="text-slate-500 font-semibold">Content-Type:</span> application/json</p>
          </div>
        </div>

        {/* JSON Response Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between font-sans text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" /> Live JSON Response Body:
            </span>
            <button
              onClick={copyResponseJson}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 font-sans text-right">
          <button onClick={onClose} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-colors">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
