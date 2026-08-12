import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ResultadoCardProps {
  categoria: string;
  data_jogo: string;
  time_adversario: string;
  placar_nosso: number;
  placar_adversario: number;
  competicao: string;
  local?: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  'sub-13': { bg: 'bg-green-100', text: 'text-green-800' },
  'sub-15': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'masculino': { bg: 'bg-red-100', text: 'text-red-800' },
  'feminino': { bg: 'bg-pink-100', text: 'text-pink-800' },
};

const categoryLabels: Record<string, string> = {
  'sub-13': 'Sub-13',
  'sub-15': 'Sub-15',
  'masculino': 'Masculino',
  'feminino': 'Feminino',
};

export default function ResultadoCard({
  categoria,
  data_jogo,
  time_adversario,
  placar_nosso,
  placar_adversario,
  competicao,
  local,
}: ResultadoCardProps) {
  const resultado =
    placar_nosso > placar_adversario
      ? 'vitoria'
      : placar_nosso < placar_adversario
      ? 'derrota'
      : 'empate';

  const resultadoClasses = {
    vitoria: 'bg-green-50 border-l-4 border-green-500',
    derrota: 'bg-red-50 border-l-4 border-red-500',
    empate: 'bg-yellow-50 border-l-4 border-yellow-500',
  };

  const scoreClasses = {
    vitoria: 'text-green-600',
    derrota: 'text-red-600',
    empate: 'text-yellow-600',
  };

  const colors = categoryColors[categoria] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <div className={`p-4 rounded-lg ${resultadoClasses[resultado]} animate-slide-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
          {categoryLabels[categoria] || categoria}
        </span>
        <span className="text-xs text-gray-600">
          {format(new Date(data_jogo), "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">SAF Talismã</p>
          <p className="text-xs text-gray-600">{local}</p>
        </div>
        <div className={`text-3xl font-bold ${scoreClasses[resultado]} mx-4 min-w-20 text-center`}>
          {placar_nosso} x {placar_adversario}
        </div>
        <div className="flex-1 text-right">
          <p className="font-semibold text-gray-900">{time_adversario}</p>
          <p className="text-xs text-gray-600">{competicao}</p>
        </div>
      </div>

      {/* Result Badge */}
      <div className="flex justify-center">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            resultado === 'vitoria'
              ? 'bg-green-200 text-green-800'
              : resultado === 'derrota'
              ? 'bg-red-200 text-red-800'
              : 'bg-yellow-200 text-yellow-800'
          }`}
        >
          {resultado === 'vitoria' ? '✓ Vitória' : resultado === 'derrota' ? '✗ Derrota' : '= Empate'}
        </span>
      </div>
    </div>
  );
}
