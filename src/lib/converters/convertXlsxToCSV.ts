import * as XLSX from 'xlsx';
import fs from 'fs';

export const convertXlsxToCSV = () => {
    XLSX.utils.sheet_to_csv()
}