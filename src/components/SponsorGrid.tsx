import Image from 'next/image';

interface SponsorGridProps {
  sponsors: any[];
  title?: string;
}

export default function SponsorGrid({ sponsors, title }: SponsorGridProps) {
  if (!sponsors.length) {
    return null;
  }

  // Group by category
  const grouped = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.categoria]) {
      acc[sponsor.categoria] = [];
    }
    acc[sponsor.categoria].push(sponsor);
    return acc;
  }, {} as Record<string, any[]>);

  const categoryOrder = ['ouro', 'prata', 'bronze', 'parceiro'];
  const categoryLabels: Record<string, string> = {
    'ouro': 'Patrocinadores Ouro',
    'prata': 'Patrocinadores Prata',
    'bronze': 'Patrocinadores Bronze',
    'parceiro': 'Parceiros',
  };

  return (
    <section className="py-12">
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {title}
        </h2>
      )}

      <div className="space-y-12">
        {categoryOrder.map((category) => {
          const items = grouped[category];
          if (!items) return null;

          return (
            <div key={category}>
              <h3 className="text-xl font-semibold text-gray-700 mb-6 pb-4 border-b">
                {categoryLabels[category]}
              </h3>
              <div
                className={`grid gap-8 ${
                  category === 'ouro'
                    ? 'grid-cols-1 md:grid-cols-3'
                    : category === 'prata'
                    ? 'grid-cols-2 md:grid-cols-4'
                    : 'grid-cols-3 md:grid-cols-6'
                }`}
              >
                {items.map((sponsor) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all hover:shadow-md"
                    title={sponsor.nome}
                  >
                    <div className="relative w-full h-24 flex items-center justify-center">
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.nome}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
