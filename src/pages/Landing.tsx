
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, BarChart3, Calendar, Package } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: 'Dashboard Inteligente',
      description: 'Monitore todos os aspectos da sua propriedade rural em tempo real'
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-600" />,
      title: 'Agenda Rural',
      description: 'Organize suas atividades e nunca perca prazos importantes'
    },
    {
      icon: <Package className="w-8 h-8 text-green-600" />,
      title: 'Controle de Estoque',
      description: 'Gerencie insumos, ração e equipamentos com alertas automáticos'
    },
    {
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      title: 'Commodities',
      description: 'Acompanhe preços de soja, milho e outros produtos rurais'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">🐄 Granja Cavalli</h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestão Rural
              <span className="text-green-600"> Inteligente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transforme sua propriedade rural com tecnologia. Monitore, organize e otimize 
              suas atividades agropecuárias de forma simples e eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro">
                <Button size="lg" className="w-full sm:w-auto">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-gray-600">
              Recursos desenvolvidos especialmente para produtores rurais
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para modernizar sua propriedade?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Junte-se a centenas de produtores que já transformaram sua gestão rural
            </p>
            <Link to="/cadastro">
              <Button size="lg" variant="secondary">
                Criar Conta Grátis
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Granja Cavalli. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
