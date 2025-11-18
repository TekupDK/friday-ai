import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T = any> {
  id: string;
  label: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  format?: (value: any, row: T) => React.ReactNode;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T = any>
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  showControls?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  compact?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  selectable = false,
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = "Ingen data fundet",
  showControls = true,
  onRefresh,
  onExport,
  compact = false,
  className,
  ...props
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(
    new Set()
  );
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  // Filter data based on search and column filters
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Column filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => {
          const column = columns.find(col => col.id === columnId);
          if (!column) return true;

          const value =
            typeof column.accessor === "function"
              ? column.accessor(row)
              : row[column.accessor];

          return String(value)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;

    const column = columns.find(col => col.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue =
        typeof column.accessor === "function"
          ? column.accessor(a)
          : a[column.accessor];

      const bValue =
        typeof column.accessor === "function"
          ? column.accessor(b)
          : b[column.accessor];

      // Handle different data types
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection, sortable, columns]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!paginated) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!sortable) return;

    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  // Handle selection
  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected).map(i => sortedData[i]));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, i) => i)));
      onSelectionChange?.(paginatedData);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    const value =
      typeof column.accessor === "function"
        ? column.accessor(row)
        : row[column.accessor];

    return value;
  };

  // Render cell content
  const renderCell = (row: T, column: Column<T>, rowIndex: number) => {
    const value = getCellValue(row, column);

    if (column.render) {
      return column.render(value, row);
    }

    if (column.format) {
      return column.format(value, row);
    }

    return String(value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({});
    setSortColumn(null);
    setSortDirection("asc");
    setCurrentPage(1);
    setSelectedRows(new Set());
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Header */}
      {(title || showControls) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", loading && "animate-spin")}
                  />
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {(searchable || filterable || Object.keys(filters).length > 0) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søg..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Reset Filters */}
          {(searchTerm || Object.keys(filters).length > 0) && (
            <Button variant="outline" onClick={resetFilters}>
              Nulstil
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "font-semibold",
                    column.width && `w-[${column.width}]`,
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {sortable && column.sortable !== false ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                        {sortColumn === column.id ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />
                        )}
                      </Button>
                    ) : (
                      column.label
                    )}

                    {/* Column filter */}
                    {filterable && column.filterable !== false && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Filter className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <div className="p-2">
                            <Input
                              placeholder={`Filtrer ${column.label.toLowerCase()}`}
                              value={filters[column.id] || ""}
                              onChange={e =>
                                setFilters(prev => ({
                                  ...prev,
                                  [column.id]: e.target.value,
                                }))
                              }
                              className="text-xs"
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 2 : 1)}
                  className="text-center py-12"
                >
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Indlæser data...
                  </p>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 2 : 1)}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    "hover:bg-muted/50 cursor-pointer",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={e => {
                          e.stopPropagation();
                          handleRowSelect(index, e.target.checked);
                        }}
                        className="rounded"
                      />
                    </TableCell>
                  )}

                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        compact ? "py-2" : "py-3",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {renderCell(row, column, index)}
                    </TableCell>
                  ))}

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRowClick?.(row)}>
                          Vis detaljer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Rediger</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Slet
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Viser{" "}
              {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} -{" "}
              {Math.min(currentPage * pageSize, sortedData.length)} af{" "}
              {sortedData.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={value => {
                // pageSize is controlled via props; for now only reset to first page
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Forrige
              </Button>

              <span className="text-sm px-2">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Næste
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
