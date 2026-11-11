import { DatasetColumn, SemanticType } from '@/types/database';
import { DataQualityReport } from '@/types/analytics';

export function profileDataset(data: Record<string, any>[]): {
  rowCount: number;
  columnCount: number;
  columns: DatasetColumn[];
  qualityReport: DataQualityReport;
} {
  const rowCount = data.length;
  if (rowCount === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      qualityReport: {
        totalRows: 0,
        totalColumns: 0,
        duplicateRows: 0,
        missingValuesTotal: 0,
        missingValuesPercentage: 0,
        inconsistentCategories: [],
        outlierCount: [],
      },
    };
  }

  const columnNames = Object.keys(data[0]);
  const columnCount = columnNames.length;

  // 1. Detect duplicates
  const seenRows = new Set<string>();
  let duplicateCount = 0;
  for (const row of data) {
    const rowString = JSON.stringify(row);
    if (seenRows.has(rowString)) {
      duplicateCount++;
    } else {
      seenRows.add(rowString);
    }
  }

  let totalMissing = 0;
  const inconsistentCategories: DataQualityReport['inconsistentCategories'] = [];
  const outlierCounts: DataQualityReport['outlierCount'] = [];

  const columns: DatasetColumn[] = columnNames.map((colName) => {
    const values = data.map((r) => r[colName]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');
    const missingCount = values.length - nonNullValues.length;
    totalMissing += missingCount;

    const uniqueSet = new Set(nonNullValues);
    const uniqueCount = uniqueSet.size;

    // Determine data type & semantic type
    let dataType: 'integer' | 'float' | 'string' | 'boolean' | 'datetime' = 'string';
    let semanticType: SemanticType = 'unknown';

    const isNumeric = nonNullValues.length > 0 && nonNullValues.every((v) => typeof v === 'number' || (!isNaN(Number(v)) && typeof v !== 'boolean'));
    const isDate = !isNumeric && nonNullValues.length > 0 && nonNullValues.every((v) => !isNaN(Date.parse(String(v))));
    const isBool = nonNullValues.length > 0 && nonNullValues.every((v) => typeof v === 'boolean' || v === 'true' || v === 'false');

    if (isNumeric) {
      const allInt = nonNullValues.every((v) => Number.isInteger(Number(v)));
      dataType = allInt ? 'integer' : 'float';

      // Check if identifier (e.g. ID, OrderID)
      if (colName.toLowerCase().includes('id') && uniqueCount === nonNullValues.length) {
        semanticType = 'identifier';
      } else {
        semanticType = 'numerical';
      }
    } else if (isDate || colName.toLowerCase().includes('date') || colName.toLowerCase().includes('tanggal')) {
      dataType = 'datetime';
      semanticType = 'date';
    } else if (isBool) {
      dataType = 'boolean';
      semanticType = 'categorical';
    } else {
      dataType = 'string';
      if (colName.toLowerCase().includes('id') && uniqueCount > values.length * 0.9) {
        semanticType = 'identifier';
      } else if (uniqueCount < 30) {
        semanticType = 'categorical';
      } else {
        semanticType = 'text';
      }
    }

    // Check category inconsistency (e.g., 'Jakarta', 'jakarta', 'JAKARTA')
    if (semanticType === 'categorical' || dataType === 'string') {
      const lowerMap = new Map<string, Set<string>>();
      for (const val of nonNullValues) {
        const str = String(val).trim();
        const lower = str.toLowerCase();
        if (!lowerMap.has(lower)) {
          lowerMap.set(lower, new Set());
        }
        lowerMap.get(lower)!.add(str);
      }

      for (const [, variants] of Array.from(lowerMap.entries())) {
        if (variants.size > 1) {
          const varArray: string[] = Array.from(variants);
          const suggested = varArray.reduce((prev: string, curr: string) => (curr.length >= prev.length ? curr : prev));
          inconsistentCategories.push({
            column: colName,
            variants: varArray,
            suggestedStandard: suggested.charAt(0).toUpperCase() + suggested.slice(1).toLowerCase(),
          });
          break;
        }
      }
    }

    // Statistics for numerical columns
    let mean: number | null = null;
    let median: number | null = null;
    let stdDev: number | null = null;
    let minValue: string | null = null;
    let maxValue: string | null = null;

    if (isNumeric && nonNullValues.length > 0) {
      const nums = nonNullValues.map((v) => Number(v)).sort((a, b) => a - b);
      const sum = nums.reduce((acc, curr) => acc + curr, 0);
      mean = sum / nums.length;

      const mid = Math.floor(nums.length / 2);
      median = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

      const variance = nums.reduce((acc, curr) => acc + Math.pow(curr - mean!, 2), 0) / nums.length;
      stdDev = Math.sqrt(variance);

      minValue = String(nums[0]);
      maxValue = String(nums[nums.length - 1]);

      // Detect Outliers using IQR
      const q1Index = Math.floor(nums.length * 0.25);
      const q3Index = Math.floor(nums.length * 0.75);
      const q1 = nums[q1Index];
      const q3 = nums[q3Index];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const outliers = nums.filter((n) => n < lowerBound || n > upperBound);

      if (outliers.length > 0) {
        outlierCounts.push({
          column: colName,
          count: outliers.length,
          method: 'IQR',
        });
      }
    } else if (nonNullValues.length > 0) {
      minValue = String(nonNullValues[0]);
      maxValue = String(nonNullValues[nonNullValues.length - 1]);
    }

    // Frequency distribution for top 6 items
    const freqMap: Record<string, number> = {};
    for (const v of nonNullValues.slice(0, 500)) {
      const key = String(v);
      freqMap[key] = (freqMap[key] || 0) + 1;
    }

    return {
      id: `col-${colName}`,
      dataset_id: 'active-dataset',
      column_name: colName,
      data_type: dataType,
      semantic_type: semanticType,
      missing_count: missingCount,
      unique_count: uniqueCount,
      min_value: minValue,
      max_value: maxValue,
      mean: mean !== null ? Math.round(mean * 100) / 100 : null,
      median: median !== null ? Math.round(median * 100) / 100 : null,
      std_dev: stdDev !== null ? Math.round(stdDev * 100) / 100 : null,
      sample_values: nonNullValues.slice(0, 4),
      frequency_distribution: freqMap,
      created_at: new Date().toISOString(),
    };
  });

  const totalCells = rowCount * columnCount;
  const missingPercentage = totalCells > 0 ? (totalMissing / totalCells) * 100 : 0;

  return {
    rowCount,
    columnCount,
    columns,
    qualityReport: {
      totalRows: rowCount,
      totalColumns: columnCount,
      duplicateRows: duplicateCount,
      missingValuesTotal: totalMissing,
      missingValuesPercentage: parseFloat(missingPercentage.toFixed(1)),
      inconsistentCategories,
      outlierCount: outlierCounts,
    },
  };
}
