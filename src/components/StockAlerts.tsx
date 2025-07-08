
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, X, Package, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStock } from '@/hooks/useStock';
import { toast } from 'sonner';

const StockAlerts = () => {
  const { stockItems } = useStock();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const lowStockItems = stockItems.filter(item => 
      item.quantity <= item.min_stock && !dismissed.includes(item.id)
    );
    
    const criticalItems = lowStockItems.filter(item => item.quantity === 0);
    const warningItems = lowStockItems.filter(item => item.quantity > 0 && item.quantity <= item.min_stock);
    
    setAlerts([
      ...criticalItems.map(item => ({ ...item, level: 'critical' })),
      ...warningItems.map(item => ({ ...item, level: 'warning' }))
    ]);
  }, [stockItems, dismissed]);

  const dismissAlert = (itemId: string) => {
    setDismissed(prev => [...prev, itemId]);
    toast.success('Alerta dispensado');
  };

  const getAlertColor = (level: string) => {
    return level === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  };

  const getAlertIcon = (level: string) => {
    return level === 'critical' ? 
      <AlertTriangle className="w-5 h-5 text-red-600" /> : 
      <TrendingDown className="w-5 h-5 text-yellow-600" />;
  };

  const getAlertBadge = (level: string) => {
    return level === 'critical' ? 
      <Badge variant="destructive">Crítico</Badge> : 
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
  };

  if (alerts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-800">
            <Package className="w-5 h-5" />
            <span className="font-medium">Estoque em dia!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Todos os itens estão com estoque adequado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <span>Alertas de Estoque</span>
            <Badge variant="outline">{alerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border ${getAlertColor(item.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(item.level)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {getAlertBadge(item.level)}
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Estoque atual:</strong> {item.quantity} {item.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Estoque mínimo:</strong> {item.min_stock} {item.unit}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Categoria:</strong> {item.category}
                    </p>
                    {item.level === 'critical' && (
                      <p className="text-sm text-red-700 font-medium mt-2">
                        ⚠️ Estoque zerado! Reposição urgente necessária.
                      </p>
                    )}
                    {item.level === 'warning' && (
                      <p className="text-sm text-yellow-700 font-medium mt-2">
                        📉 Estoque baixo. Programe a reposição.
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissAlert(item.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAlerts;
