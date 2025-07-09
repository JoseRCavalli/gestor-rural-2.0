
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Edit2, Trash2, Package2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useStock } from '@/hooks/useStock';

interface StockControlProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    min_stock: number;
    category: string;
  };
}

const StockControl = ({ item }: StockControlProps) => {
  const { updateStockItem } = useStock();
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');

  const handleQuickAdjust = async (type: 'add' | 'remove', amount: number = 1) => {
    const newQuantity = type === 'add' 
      ? item.quantity + amount 
      : Math.max(0, item.quantity - amount);
    
    await updateStockItem(item.id, { quantity: newQuantity });
    
    toast.success(
      type === 'add' 
        ? `Adicionado ${amount} ${item.unit} ao estoque de ${item.name}`
        : `Removido ${amount} ${item.unit} do estoque de ${item.name}`
    );
  };

  const handleCustomAdjust = async () => {
    if (adjustQuantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    await handleQuickAdjust(adjustType, adjustQuantity);
    setIsAdjusting(false);
    setAdjustQuantity(1);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Botões de ajuste rápido */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleQuickAdjust('remove', 1)}
        className="h-8 w-8 text-red-500 hover:bg-red-50"
        disabled={item.quantity <= 0}
      >
        <Minus className="w-3 h-3" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handleQuickAdjust('add', 1)}
        className="h-8 w-8 text-green-500 hover:bg-green-50"
      >
        <Plus className="w-3 h-3" />
      </Button>

      {/* Botão para ajuste personalizado */}
      <Dialog open={isAdjusting} onOpenChange={setIsAdjusting}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            Ajustar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              Ajuste o estoque de {item.name} (atual: {item.quantity} {item.unit})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Ajuste</Label>
              <div className="flex space-x-2">
                <Button
                  variant={adjustType === 'add' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdjustType('add')}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Adicionar</span>
                </Button>
                <Button
                  variant={adjustType === 'remove' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdjustType('remove')}
                  className="flex items-center space-x-2"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Remover</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              <p>
                <strong>Quantidade atual:</strong> {item.quantity} {item.unit}
              </p>
              <p>
                <strong>Após ajuste:</strong> {
                  adjustType === 'add' 
                    ? item.quantity + adjustQuantity 
                    : Math.max(0, item.quantity - adjustQuantity)
                } {item.unit}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAdjusting(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCustomAdjust}>
              Confirmar Ajuste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockControl;
