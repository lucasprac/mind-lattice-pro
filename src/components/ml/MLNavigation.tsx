import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, TrendingUp, Target, Database, Settings, BarChart3 } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const MLNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: '/ml/dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Visão geral do sistema ML'
    },
    {
      path: '/ml/models',
      label: 'Modelos',
      icon: <Brain className="w-5 h-5" />,
      description: 'Gerenciar modelos de ML'
    },
    {
      path: '/ml/training',
      label: 'Treinamento',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Treinar e otimizar modelos'
    },
    {
      path: '/ml/predictions',
      label: 'Predições',
      icon: <Target className="w-5 h-5" />,
      description: 'Realizar e visualizar predições'
    },
    {
      path: '/ml/datasets',
      label: 'Datasets',
      icon: <Database className="w-5 h-5" />,
      description: 'Gerenciar conjuntos de dados'
    },
    {
      path: '/ml/settings',
      label: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      description: 'Configurar parâmetros do ML'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="ml-navigation bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Machine Learning
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sistema inteligente de análise
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-all duration-200
                  hover:bg-purple-50 dark:hover:bg-gray-700
                  ${active 
                    ? 'bg-purple-100 dark:bg-gray-700 border-l-4 border-purple-600' 
                    : 'hover:border-l-4 hover:border-purple-300'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 mt-0.5
                  ${active 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`
                    font-medium text-sm
                    ${active 
                      ? 'text-purple-900 dark:text-purple-300' 
                      : 'text-gray-900 dark:text-white'
                    }
                  `}>
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
                {active && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-300">Modelos Ativos</div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-300">3</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-300">Precisão Média</div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-300">94%</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MLNavigation;
