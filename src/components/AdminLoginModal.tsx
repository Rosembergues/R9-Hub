import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, X, AlertCircle, Loader2, UserPlus, LogIn } from 'lucide-react';
import { useHub } from '../context/HubContext';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, signUp, isSyncing } = useHub();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [successMessage, setSuccessMessage] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoginModalOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setSuccessMessage('');
      setShowPassword(false);
      setMode('signin');
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isLoginModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        closeLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (mode === 'signin') {
      const res = await login(cleanEmail, cleanPassword);
      if (!res.success) {
        if (res.error?.includes('Invalid login credentials')) {
          setError('Credenciais incorretas no Supabase Auth. Verifique o e-mail e senha informados.');
        } else {
          setError(res.error || 'Falha ao autenticar com o Supabase Auth.');
        }
      }
    } else {
      if (cleanPassword.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres para o Supabase.');
        return;
      }
      const res = await signUp(cleanEmail, cleanPassword);
      if (!res.success) {
        setError(res.error || 'Falha ao cadastrar no Supabase.');
      } else {
        setSuccessMessage('Conta de administrador registrada com sucesso!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative badge */}
        <div className="relative bg-gradient-to-br from-[#0A2540] to-blue-950 px-6 py-6 border-b border-slate-800">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3" />
                Supabase Auth
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Área Administrativa R9' : 'Cadastrar Administrador'}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'signin'
                ? 'border-blue-500 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar com Supabase</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'signup'
                ? 'border-blue-500 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Registro Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {mode === 'signin' && error.includes('Credenciais') && (
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); }}
                    className="mt-1.5 text-cyan-400 hover:underline font-medium block"
                  >
                    Não possui conta ainda? Clique aqui para criar sua credencial admin.
                  </button>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail de Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@r9hub.corp"
                className="w-full bg-slate-950/70 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/70 border border-slate-700 text-white rounded-xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Preset Helper Card */}
          <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-[11px] text-blue-200/80 leading-relaxed">
            <span className="font-semibold text-cyan-300 block mb-0.5">Autenticação Supabase Nuvem:</span>
            Validação de credenciais e permissões RLS diretas com a instância remota Supabase.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeLoginModal}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar & Acessar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
