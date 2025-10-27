import {
  LayoutGrid,
  Network,
  Link2,
  Users,
  UserPlus,
  ListChecks,
  SlidersHorizontal,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  linkTo: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <div className="bg-gradient-to-br from-principal-50 to-principal-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-principal-200 flex flex-col items-center text-center">
    <div className="bg-principal-500 text-blanco rounded-full p-3 mb-4 inline-flex">
      <Icon size={28} strokeWidth={2} />
    </div>
    <h3 className="text-lg font-semibold text-principal-800 mb-2">{title}</h3>
    <p className="text-sm text-principal-700 leading-relaxed">{description}</p>
  </div>
);

export function Dashboard() {
  const features: FeatureCardProps[] = [
    {
      icon: LayoutGrid,
      title: 'Áreas',
      description: 'Gestiona las áreas de competencia de la olimpiada (ej. Matemáticas, Física).',
      linkTo: '/areas',
    },
    {
      icon: Network,
      title: 'Niveles',
      description: 'Define los niveles educativos o grados participantes (ej. 1ro Secundaria).',
      linkTo: '/niveles',
    },
    {
      icon: Link2,
      title: 'Asignar Niveles a Áreas',
      description: 'Establece qué niveles compiten en cada área específica.',
      linkTo: '/asignarNiveles',
    },
    {
      icon: Users,
      title: 'Responsables de Área',
      description: 'Registra y administra a los usuarios responsables de gestionar áreas.',
      linkTo: '/responsables',
    },
    {
      icon: Users,
      title: 'Evaluadores',
      description: 'Registra y asigna evaluadores a áreas y niveles específicos.',
      linkTo: '/evaluadores',
    },
    {
      icon: UserPlus,
      title: 'Registrar Competidores',
      description: 'Importa masivamente la información de los estudiantes participantes desde un archivo CSV.',
      linkTo: '/competidores',
    },
    {
      icon: ListChecks,
      title: 'Lista de Competidores',
      description: 'Visualiza y filtra la lista completa de competidores inscritos por área y nivel.',
      linkTo: '/listaCompetidores',
    },
    {
      icon: SlidersHorizontal,
      title: 'Parámetros de Calificación',
      description: 'Define los criterios de clasificación (notas mínimas, máximas, cupos) por área y nivel.',
      linkTo: '/parametrosCalificaciones',
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-neutro-100 min-h-screen">
      <div className="bg-blanco rounded-xl shadow-md p-6 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-negro tracking-tight text-center mb-4">
          Bienvenido a Oh! SanSi
        </h1>
        <p className="text-neutro-600 text-center mb-10 md:mb-12">
          Panel de administración de las Olimpiadas de Ciencia y Tecnología.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.linkTo}
              className="no-underline text-inherit block h-full" 
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                linkTo={feature.linkTo}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}