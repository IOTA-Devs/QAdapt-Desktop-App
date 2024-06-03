import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  noResultsMsg: string
  onSelectRows?: (rows: TData[]) => void
  fetchData?: (countPerPage: number) => Promise<void>
  loading?: boolean
  onRowClick?: (row: TData) => void
  maxSelectable?: number
}

export function DataTable<TData, TValue>({ columns, data, noResultsMsg, onSelectRows, fetchData, onRowClick, maxSelectable, loading = false }: DataTableProps<TData, TValue>) {
  const initialRender = useRef<boolean>(true);
  
  const [countPerPage, setCountPerPage] = useState<number>(10);
  const [pageCount, setPageCount] = useState<number>();
  const canFetch = useRef<boolean>(true);
  const page = useRef<number>(0);
  
  const [rowSelection, setRowSelection] = useState({});
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: maxSelectable ? Object.keys(rowSelection).length < maxSelectable : true,
    state: {
      rowSelection,
    },
  });

  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

    if (onSelectRows) {
      onSelectRows(selectedRows);
    }
  }, [rowSelection]);

  useEffect(() => {
    setTimeout(() => {
      setPageCount(table.getPageCount());
      if (pageCount && table.getPageCount() < pageCount) return;
      table.setPageIndex(page.current);
      
    }, 0);

    table.resetRowSelection();
  }, [data]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    };

    const currentPage = table.getState().pagination.pageIndex;
    const totalPages = table.getPageCount();
    
    page.current = currentPage;
    if (currentPage + 4 >= totalPages && totalPages > 0 && fetchData && canFetch.current) {
      canFetch.current = false;
      fetchData(countPerPage).finally(() => {
        canFetch.current = true;
      });
    }
  }, [table.getState().pagination.pageIndex, countPerPage]);

  const changeCountPerPage = (value: number) => {
    setCountPerPage(value);
    table.setPageIndex(0);
    page.current = 0;

    table.setPageSize(value);
  }

  const renderPaginationPageSelect = () => {
    const currentPage = table.getState().pagination.pageIndex;
    const totalPages = table.getPageCount();

    if (currentPage + 1 >= totalPages - 5 && totalPages <= 5) {
      return (
        <>
          {Array.from(Array(totalPages).keys()).map((pageN: number) => (
            <PaginationItem key={pageN}>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={currentPage === pageN}
                onClick={() => table.setPageIndex(pageN)}>{pageN + 1}</PaginationLink>
            </PaginationItem>
          ))}
        </>
      );
    }

    if (currentPage + 1 < 5 && totalPages > 5) {
      return (
        <>
          {Array.from(Array(5).keys()).map((pageN: number) => (
            <PaginationItem key={pageN}>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={currentPage === pageN}
                onClick={() => canFetch.current && table.setPageIndex(pageN)}>{pageN + 1}</PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        </>
      );
    }

    if (currentPage + 1 >= 5 && totalPages > 6) {
      return (
        <>
          {currentPage + 3 < totalPages ?
          <>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                onClick={() => canFetch.current && table.setPageIndex(0)}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                onClick={() => canFetch.current && table.setPageIndex(currentPage - 1)}>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={true} 
                onClick={() => canFetch.current && table.setPageIndex(currentPage)}>{currentPage + 1}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                onClick={() => canFetch.current && table.setPageIndex(currentPage + 1)}>{currentPage + 2}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
          :
          <>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                onClick={() => canFetch.current && table.setPageIndex(0)}>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={currentPage + 1 === totalPages - 3} 
                onClick={() => canFetch.current && table.setPageIndex(currentPage - 3)}>{totalPages - 3}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={currentPage + 1 === totalPages - 2} 
                onClick={() => canFetch.current && table.setPageIndex(currentPage - 2)}>{totalPages - 2}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={currentPage + 1 === totalPages - 1} 
                onClick={() => canFetch.current && table.setPageIndex(currentPage - 1)}>{totalPages - 1}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                className="cursor-pointer select-none"
                isActive={currentPage + 1 === totalPages} 
                onClick={() => canFetch.current && table.setPageIndex(currentPage)}>{totalPages}</PaginationLink>
            </PaginationItem>
          </>
          }
        </>
      );
    }
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                        ? null 
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow className={onRowClick ? "cursor-pointer" : ""} onClick={() => {
                  if (onRowClick) {
                    onRowClick(row.original);
                  }
                }} 
                key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} onClick={(e) => {
                        if (cell.id.includes("select")) {
                          e.stopPropagation();
                        }
                      }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loading ?
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                    :
                    <>
                      {noResultsMsg}
                    </>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getRowCount() > 10 &&
        <div className="flex justify-between pt-3">
          <div className="flex gap-2 items-center w-full">
              <span>Showing</span>
              <Select defaultValue={countPerPage.toString()} onValueChange={(value: string) => changeCountPerPage(parseInt(value))}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
            </Select>
            <span>items per page</span>
          </div>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer select-none"
                  onClick={() => table.getCanPreviousPage() && canFetch.current && table.previousPage()}
                  isActive={table.getCanPreviousPage()}
                  />
              </PaginationItem>
              {renderPaginationPageSelect()}
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer select-none"
                  onClick={() => table.getCanNextPage() && canFetch.current && table.nextPage()} 
                  isActive={table.getCanNextPage()}
                  />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      }
    </div>
  );
}