import { useState, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface GridData {
  name: string;
  quantity: string;
  supplier: string;
  cost: string;
}

interface GridDataInputProps {
  onChange: (data: GridData[]) => void;
}

export function GridDataInput({ onChange }: GridDataInputProps) {
  const [data, setData] = useState<GridData[]>([createEmptyRow()]);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  function createEmptyRow(): GridData {
    return { name: '', quantity: '', supplier: '', cost: '' };
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('text');
    const rows = clipboardData.split('\n').filter(row => row.trim());

    // Parse the clipboard data
    const newData = rows.map(row => {
      const [name = '', quantity = '', supplier = '', cost = ''] = row.split('\t');
      return { name, quantity, supplier, cost };
    });

    setData(prevData => {
      // If we have an active cell, insert at that position
      if (activeCell) {
        const result = [...prevData];
        newData.forEach((newRow, index) => {
          const targetRow = activeCell.row + index;
          if (targetRow >= result.length) {
            result.push(createEmptyRow());
          }
          const row = result[targetRow];
          // Update each cell in the row
          if (activeCell.col === 0) row.name = newRow.name;
          if (activeCell.col === 1) row.quantity = newRow.quantity;
          if (activeCell.col === 2) row.supplier = newRow.supplier;
          if (activeCell.col === 3) row.cost = newRow.cost;
        });
        return result;
      }
      return newData;
    });

    onChange(data);
  };

  const handleCellChange = (rowIndex: number, field: keyof GridData, value: string) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      
      // Add a new row if we're editing the last row and it's not empty
      if (rowIndex === newData.length - 1 && value !== '') {
        newData.push(createEmptyRow());
      }
      
      return newData;
    });
    onChange(data);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      const nextCol = e.key === 'Tab' && !e.shiftKey ? colIndex + 1 : colIndex;
      const nextRow = (nextCol > 3 || e.key === 'Enter') ? rowIndex + 1 : rowIndex;
      const finalCol = nextCol > 3 ? 0 : nextCol;

      // Add a new row if needed
      if (nextRow >= data.length) {
        setData(prev => [...prev, createEmptyRow()]);
      }

      // Focus the next input
      const inputs = tableRef.current?.getElementsByTagName('input');
      if (inputs) {
        const nextInput = inputs[nextRow * 4 + finalCol];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  return (
    <div 
      className="border rounded-md overflow-hidden w-full" 
      onPaste={handlePaste}
      tabIndex={0}
    >
      <Table ref={tableRef}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Name</TableHead>
            <TableHead className="w-[15%]">Quantity</TableHead>
            <TableHead className="w-1/3">Supplier</TableHead>
            <TableHead className="w-[15%]">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="w-1/3">
                <Input
                  value={row.name}
                  onChange={e => handleCellChange(rowIndex, 'name', e.target.value)}
                  onFocus={() => setActiveCell({ row: rowIndex, col: 0 })}
                  onKeyDown={e => handleKeyDown(e, rowIndex, 0)}
                  className="w-full"
                />
              </TableCell>
              <TableCell className="w-[15%]">
                <Input
                  value={row.quantity}
                  onChange={e => handleCellChange(rowIndex, 'quantity', e.target.value)}
                  onFocus={() => setActiveCell({ row: rowIndex, col: 1 })}
                  onKeyDown={e => handleKeyDown(e, rowIndex, 1)}
                  className="w-full"
                />
              </TableCell>
              <TableCell className="w-1/3">
                <Input
                  value={row.supplier}
                  onChange={e => handleCellChange(rowIndex, 'supplier', e.target.value)}
                  onFocus={() => setActiveCell({ row: rowIndex, col: 2 })}
                  onKeyDown={e => handleKeyDown(e, rowIndex, 2)}
                  className="w-full"
                />
              </TableCell>
              <TableCell className="w-[15%]">
                <Input
                  value={row.cost}
                  onChange={e => handleCellChange(rowIndex, 'cost', e.target.value)}
                  onFocus={() => setActiveCell({ row: rowIndex, col: 3 })}
                  onKeyDown={e => handleKeyDown(e, rowIndex, 3)}
                  className="w-full"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
