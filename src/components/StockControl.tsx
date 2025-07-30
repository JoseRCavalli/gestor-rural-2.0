
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";

interface StockControlProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    min_stock: number;
    category: string;
    available_stock?: number;
    average_cost?: number;
  };
}

const StockControl = ({ item }: StockControlProps) => {
  const { updateStockItem } = useStock();
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [isEditingMinStock, setIsEditingMinStock] = useState(false);
  const [minStockValue, setMinStockValue] = useState(item.min_stock);

  const handleQuickAdjust = async (type: 'add' | 'remove', amount: number = 1) => {
    const newQuantity = type === 'add' 
      ? item.quantity + amount 
      : Math.max(0, item.quantity - amount);
    
    // available_stock representa a quantidade disponível, não o valor
    const currentAvailableStock = item.available_stock || 0;
    const newAvailableStock = type === 'add'
      ? currentAvailableStock + amount
      : Math.max(0, currentAvailableStock - amount);
    
    await updateStockItem(item.id, { 
      quantity: newQuantity,
      available_stock: newAvailableStock
    });
    
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

  const handleMinStockUpdate = async () => {
    if (minStockValue < 0) {
      toast.error('Estoque mínimo deve ser maior ou igual a zero');
      return;
    }

    await updateStockItem(item.id, { min_stock: minStockValue });
    setIsEditingMinStock(false);
    toast.success(`Estoque mínimo de ${item.name} atualizado para ${minStockValue} ${item.unit}`);
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

      {/* Botão para editar estoque mínimo */}
      <Dialog open={isEditingMinStock} onOpenChange={setIsEditingMinStock}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            Min: {item.min_stock}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Estoque Mínimo</DialogTitle>
            <DialogDescription>
              Defina o estoque mínimo para {item.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="minStock">Estoque Mínimo ({item.unit})</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={minStockValue}
                onChange={(e) => setMinStockValue(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              <p>
                <strong>Estoque atual:</strong> {item.quantity} {item.unit}
              </p>
              <p>
                <strong>Estoque mínimo atual:</strong> {item.min_stock} {item.unit}
              </p>
              <p>
                <strong>Novo estoque mínimo:</strong> {minStockValue} {item.unit}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditingMinStock(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMinStockUpdate}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
