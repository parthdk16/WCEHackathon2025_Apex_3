"use client";

import { auth } from "../Database/FirebaseConfig"; 
import { signOut } from "firebase/auth"; 
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox"
import { fetchCandidates } from "../functions/fetchCandidates"; 
import { searchCandidates } from '../functions/filterCandidates';
import { Textarea } from "@/components/ui/textarea";
// import { fetchCandidateEmails } from "../functions/fetchCandidateEmails";
// import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CircleUser,
  Home,
  Menu,
  Package2,
  Search,
  Command,
  User,
  Mail,
  Send,
  ArrowUpDown,
  SquareChartGantt,
  Pencil,
} from "lucide-react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDownIcon,
} from "@radix-ui/react-icons"
import { Sidebar } from "./Sidebar";
import ModeToggle from "./mode-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// Define User interface
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Define Item interface
export type Item = {
  itemname: string;
  quantity: number;
  expiry: string;
  batchno: string;
  manufacturer: string;
  category: string;
  createdAt: string;
  createdBy: string;
};

// Main component
export function ShortlistedCandidates() {

  const [sorting, setSorting] = useState<SortingState>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [user, setUser] = useState<User | null>(null); 
  // const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [columnVisibility, setColumnVisibility] =useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const navigate = useNavigate();

  // Show template selection buttons
  const handleShowTemplates = () => setIsFormVisible((prev) => !prev);

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // eslint-disable-next-line react-refresh/only-export-components
 const columns: ColumnDef<Item>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "itemname",
    header: ({ column }) => (
      <Button variant="ghost" className="pl-0" onClick={column.getToggleSortingHandler()}>
        Item Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("itemname")}</div>,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <Button variant="ghost" className="pl-0" onClick={column.getToggleSortingHandler()}>
      Quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "ExpDate",
    header: ({ column }) => (
      <Button variant="ghost" className="pl-0" onClick={column.getToggleSortingHandler()}>
        Expiry Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("expiry")}</div>,
  },
  {
    accessorKey: "batchno",
    header: ({ column }) => (
      <Button variant="ghost" className="pl-0" onClick={column.getToggleSortingHandler()}>
        Batch No.
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("batchno")}</div>,
  },
  {
    accessorKey: "manufacturer",
    header: ({ column }) => (
      <Button variant="ghost" className="pl-0" onClick={column.getToggleSortingHandler()}>
        Manufacturer
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("manufacturer")}</div>,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button variant="ghost" className="pl-0" onClick={column.getToggleSortingHandler()}>
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    id: "actions",
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected();
  
      return isAllSelected ? (
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <DialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="border-2 px-1" onClick={handleOpenDialog}>
                      <Mail />
                    </Button>
                  </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>
                  <p>Send email to all</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Email</DialogTitle>
              </DialogHeader> 
              <hr />
              <Button
          variant="outline"
          className="absolute mt-[65px] right-5 border-2 p-1"
          onClick={handleShowTemplates}
          >
          <Pencil /> 
        </Button>
        {/* Show template buttons if pencil icon is clicked, otherwise show selected template */}
        <DialogFooter>

              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <TooltipProvider>
            <Tooltip>
            <DialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="border-2 px-1">
                      <SquareChartGantt />
                    </Button>
                   </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent>
                    <p>Assign work to all</p>
            </TooltipContent>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  {/* Input fields for task creation */}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit"><Send/></Button>
              </DialogFooter>
            </DialogContent>
            </Tooltip>
            </TooltipProvider> 
          </Dialog>
        </div>
      ) : (
        "Actions"
      );
    },
  
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Dialog>
          <TooltipProvider>
            <Tooltip>
          <DialogTrigger asChild>
                <TooltipTrigger asChild> 
                  <Button variant="outline" className="border-2 px-1">
                    <Mail />
                  </Button>
                 </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>
            <p>Send email</p>
          </TooltipContent>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Email</DialogTitle>
            </DialogHeader>
            <hr />
              <div className="grid gap-4 py-4">
                {/* Subject Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="col-span-1">Subject:</label>
                  <br />
                  <Input placeholder="Write the subject..." className="col-span-9 w-auto" />
                </div>
                
                {/* Content Field */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="col-span-1">Content:</label>
                  <br />
                  <Textarea placeholder="Write your message..." className="col-span-9 w-auto" />
                </div>
              </div>

            <DialogFooter>
              <Button type="submit">
                <Send />
              </Button>
            </DialogFooter>
          </DialogContent>
          </Tooltip>
          </TooltipProvider> 
        </Dialog>
  
        <Dialog>
          <TooltipProvider>
          <Tooltip>
          <DialogTrigger asChild>
                <TooltipTrigger asChild> 
                  <Button variant="outline" className="border-2 px-1">
                    <SquareChartGantt />
                  </Button>
                 </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent>
            <p>Assign work</p>
          </TooltipContent>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                {/* Input fields for task assignment */}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit"><Send/></Button>
            </DialogFooter>
          </DialogContent>       
          </Tooltip>
          </TooltipProvider> 
        </Dialog>
      </div>
    ),
  
    enableSorting: false,
    enableHiding: false,
  },
];  



  const fetchAllCandidates = async () => {
    try {
      const data = await fetchCandidates(); 
      setItems(data);
    } catch (error) {
      console.error("Error fetching candidates data: ", error);
    }
  };

    // Fetch all candidates on initial render
    useEffect(() => {
      fetchAllCandidates();
    }, []);

  // useEffect(() => {
  //   const fetchFilteredCandidates = async () => {
  //     const results = await searchCandidates(searchTerm);
  //     setCandidates(results);
  //   };

  //   // If searchTerm is empty, fetch all candidates
  //   if (searchTerm) {
  //     fetchFilteredCandidates();
  //   } else {
  //     fetchAllCandidates();
  //   }
  // }, [searchTerm])

  // Firebase authentication listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const userDetails: User = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };
        setUser(userDetails);
      } else {
        setUser(null);
        navigate("/login"); // Redirect to login if no user is logged in
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [navigate]);

  // Handle user logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/login");
  };

  // Configure React Table
  const table = useReactTable({
    data: items, 
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { 
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

    // Handled search button click
    const handleSearch = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (searchTerm) {
        const results = await searchCandidates(searchTerm);
        setItems(results);
      } else {
        await fetchAllCandidates();
      }
      setIsLoading(false); 
    };

  // Trigger's fetch all candidates when searchterm becomes empty instantly
    useEffect(() => {
      if (searchTerm === "") {
        fetchAllCandidates();
      }
    }, [searchTerm]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="shortlisted-candidates" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  to="/"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search or Type a Job"
                  className="h-10 px-3 ring-offset-background file:border-0 file:bg-transparent file:text-sm 
                  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed py-2 ps-10 pe-16 
                  block w-1/2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-200 
                  focus:ring-0 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 
                  dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-600"
                />
                <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3 text-gray-400">
                  <Command className="absolute flex-shrink-0 text-gray-400 dark:text-white/60" />
                </div>
              </div>
            </form>
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <CircleUser className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.displayName || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <h1 className="text-2xl font-bold ">Check Stock</h1>
          <br/>
          <div>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-0.5">
            <Input
              placeholder="Search a medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button
              type="button"
              className="flex items-center justify-center " // Set height to match Input
              onClick={handleSearch}
              variant="outline"
            >
             {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" /> // Circular loader
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            <div className="m-auto">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
          </form>
          </div>
          <div className="mt-6">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between space-x-1 py-4">
            {/* Pagination Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer "
            >
              Next
            </Button>

            {/* Page Size Selector */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className=" border-2 text-sm">
                  Show {pageSize} <span className="ml-1">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Page Size</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[1, 10, 20, 50].map((size) => (
                  <DropdownMenuItem key={size} onClick={() => setPageSize(size)} >
                    Show {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </main>
      </div>
    </div>
  );
}