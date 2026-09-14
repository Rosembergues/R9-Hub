import React from 'react';
import { 
  Headphones, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  ArrowUp,
  Lock,
  Heart,
  SlidersHorizontal
} from 'lucide-react';
import { useHub } from '../context/HubContext';

export const Footer: React.FC = () => {
  const { openAdminPanel, isAuthenticated } = useHub();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="suporte" className="bg-[#0A2540] text-slate-300 border-t border-blue-900/80 mt-16">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Intranet Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-extrabold text-white text-base shadow-md">
                R9
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                R9 <span className="text-cyan-400 font-bold">HUB</span>
              </span>
            </div>
            
            <p className="text-xs text-blue-200/70 leading-relaxed">
              Portal corporativo unificado e agregador de ferramentas internas. Desenvolvido para otimizar o fluxo de trabalho, a comunicação e a produtividade da equipe R9.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-800 text-xs text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Conexão Criptografada SSL/TLS</span>
            </div>
          </div>

          {/* Column 2: Sistemas Principais */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Sistemas Principais R9
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="https://r9-mailer.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200/80 hover:text-cyan-300 flex items-center justify-between py-1 border-b border-blue-900/40 transition"
                >
                  <span>R9Bot Mailer</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://r9-planner.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200/80 hover:text-cyan-300 flex items-center justify-between py-1 border-b border-blue-900/40 transition"
                >
                  <span>R9 Planner</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://r9-sales.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200/80 hover:text-cyan-300 flex items-center justify-between py-1 border-b border-blue-900/40 transition"
                >
                  <span>R9 Sales</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://r9bot-v2.ai.studio/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-200/80 hover:text-cyan-300 flex items-center justify-between py-1 border-b border-blue-900/40 transition"
                >
                  <span>IA Studio / R9Bot V2</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Suporte & Atendimento Interno */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Suporte Técnico Interno
            </h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Central de Atendimento TI</div>
                  <div className="text-blue-200/70">Ramal 4004 (Opção 2 - Suporte a Sistemas)</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">E-mail de Suporte</div>
                  <div className="text-blue-200/70">suporte.sistemas@r9hub.corp</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Horário de Plantão</div>
                  <div className="text-blue-200/70">Seg a Sex: 08h às 19h (Brasília)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Governança & Segurança */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Segurança & Governança
            </h4>
            
            <p className="text-xs text-blue-200/70 leading-relaxed">
              O acesso aos sistemas da R9 é restrito e individual. Jamais compartilhe seus dados de login. Qualquer anomalia deve ser reportada imediatamente ao time de segurança.
            </p>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-white text-xs font-semibold border border-blue-700 transition"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Voltar ao topo</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-300/70">
          <p>
            © 2026 <strong className="text-white">R9 HUB</strong> • Portal Corporativo Integrado da Equipe R9. Todos os direitos reservados.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="hover:text-white cursor-pointer">Política de Privacidade</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Código de Conduta</span>
            <span>•</span>
            <button
              onClick={openAdminPanel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-cyan-300 hover:text-white transition cursor-pointer font-medium"
              title="Acessar o Painel Administrativo"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{isAuthenticated ? 'Painel Admin (Ativo)' : 'Área Admin'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
