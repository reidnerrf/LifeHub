import React from 'react';
import { X, Star } from 'lucide-react';

type PremiumModalProps = {
  open: boolean;
  onClose: () => void;
};

const PremiumModal: React.FC<PremiumModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full sm:w-[480px] m-4 p-6 rounded-2xl bg-[var(--app-card)] border border-[var(--app-light-gray)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--app-yellow)' }}>
              <Star size={18} className="text-white" />
            </div>
            <h3 className="text-[var(--app-text)] font-semibold">LifeHub Premium</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--app-light-gray)]">
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-[var(--app-text-light)] text-sm">
          Desbloqueie recursos avançados: insights de IA, relatórios completos, sincronização ilimitada e muito mais.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-[var(--app-text)]">
          <div>• Relatórios detalhados e históricos</div>
          <div>• Recomendações personalizadas de hábitos e tarefas</div>
          <div>• Exportação de dados e integrações</div>
        </div>
        <div className="mt-6 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--app-light-gray)]">Agora não</button>
          <button className="px-4 py-2 rounded-xl text-white" style={{ backgroundColor: 'var(--app-blue)' }}>Assinar</button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

