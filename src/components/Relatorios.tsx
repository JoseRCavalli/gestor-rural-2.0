import { Card, CardContent } from '@/components/ui/card';

const Relatorios = () => {
  return (
    <div className="flex items-center justify-center py-24">
      <Card>
        <CardContent className="p-10 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Relatórios</h2>
          <p className="text-gray-600">Em breve</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
