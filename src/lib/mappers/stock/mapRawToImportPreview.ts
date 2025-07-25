import {ImportPreview, RawPreview} from "@/components/StockImporter.tsx";

export const mapRawToImportPreview = (raw: RawPreview): ImportPreview => {
    const reserved: number = Number(raw.reserved_stock ?? 0);
    const quantity: number = Number(raw.quantity ?? 0);
    const available: number = Number(raw.available_stock ?? 0);

    return {
        name: String(raw.name),
        code: raw.code ? String(raw.code) : undefined,
        quantity,
        unit: String(raw.unit),
        category: String(raw.category),
        min_stock: Number(raw.min_stock ?? 0),
        average_cost: raw.average_cost !== undefined ? Number(raw.average_cost) : undefined,
        selling_price: raw.selling_price !== undefined ? Number(raw.selling_price) : undefined,
        reserved_stock: reserved,
        available_stock: available,
        valid: true,
        errors: [],
    };
}