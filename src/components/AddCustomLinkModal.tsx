import React, { useState } from 'react';
import { X, Plus, Link, Layers, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { SystemItem } from '../types';

interface AddCustomLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSystem: (newSystem: SystemItem) => void;
}

export const AddCustomLinkModal: React.FC<AddCustomLinkModalProps> = ({
  isOpen,
  onClose,
  onAddSystem,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'r9_core' | 'communication_sales' | 'productivity' | 'support_hr'>('productivity');
  const [icon, setIcon] = useState('Bookmark');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o título da ferramenta ou link.');
      return;
    }
    if (!url.trim() || !url.startsWith('http')) {
      setError('Por favor, insira uma URL válida iniciando com http:// ou https://');
      return;
    }

    const tags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const newSystem: SystemItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      description: description.trim() || 'Atalho personalizado adicionado pelo colaborador.',
      category,
      icon,
      badge: 'Atalho Meu',
      isPrimary: false,
      status: 'online',
      tags: [name.toLowerCase(), ...tags],
      isCustom: true,
    };

    onAddSystem(newSystem);
    // Reset form
    setName('');
    setUrl('');
    setDescription('');
    setTagInput('');
    setError('');
    onClose();
  };

  const iconOptions = [
    { name: 'Bookmark', label: 'Marcador' },
    { name: 'Globe', label: 'Web / Site' },
    { name: 'FileSpreadsheet', label: 'Planilha' },
    { name: 'FolderGit2', label: 'Arquivos' },
    { name: 'Database', label: 'Banco' },
    { name: 'Workflow', label: 'Fluxo' },
    { name: 'Code', label: 'Código' },
    { name: 'Zap', label: 'Rápido' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Adicionar Atalho Interno</h3>
              <p className="text-xs text-blue-200/80">Personalize seu portal com links frequentes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Sistema ou Ferramenta *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Ex: Planilha de Metas Mensais"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Endereço URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://sua-ferramenta.corp/"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Breve Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para que serve essa ferramenta ou documento..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="productivity">Produtividade & Gestão</option>
                <option value="communication_sales">Comunicação & Vendas</option>
                <option value="r9_core">Sistemas R9</option>
                <option value="support_hr">Suporte & RH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ícone
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {iconOptions.map(opt => (
                  <option key={opt.name} value={opt.name}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Palavras-chave (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="planilha, metas, financeiro"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              Salvar Atalho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
