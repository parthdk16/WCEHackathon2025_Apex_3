"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../Database/FirebaseConfig"; // Adjust the path as needed
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth"; // Import signOut method
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Shadcn table components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem , DropdownMenuSeparator , DropdownMenuLabel} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CircleUser, Home, Menu, Package2, Search, Command } from "lucide-react";
import { Sidebar } from "./Sidebar";
import ModeToggle from "./mode-toggle";
import { ArrowUpDown } from "lucide-react";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface Candidate {
  id: string;
  name: string;
  emailId: string;
  jobTitle: string;
}

export function CandidateData() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sorting, setSorting] = useState<{ key: keyof Candidate; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });
  const [user, setUser] = useState<User | null>(null); // State to store logged-in user details
  const navigate = useNavigate();

  // Fetch candidates using db's onSnapshot for real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "CandidateInfo"), (snapshot) => {
      const candidatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];
      setCandidates(candidatesData);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  // Handle user authentication and redirect if not logged in
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

  // Search and filter candidates across multiple fields
  const filteredCandidates = candidates
    .filter((candidate) =>
      [candidate.name, candidate.emailId, candidate.jobTitle]
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const direction = sorting.direction === "asc" ? 1 : -1;
      if (a[sorting.key] < b[sorting.key]) return -1 * direction;
      if (a[sorting.key] > b[sorting.key]) return 1 * direction;
      return 0;
    });

  const toggleSorting = (key: keyof Candidate) => {
    setSorting((prev) => ({
      key,
      direction: prev.direction === "asc" && prev.key === key ? "desc" : "asc",
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="candidates" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link to="/" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
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
                  className="h-10 px-3 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 py-2 ps-10 pe-16 block w-1/2 bg-white border border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-600"
                />
                <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-3 text-gray-400">
                  <Command className="absolute flex-shrink-0 size-3 text-gray-400 dark:text-white/60" />
                </div>
              </div>
            </form>
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User Avatar" className="h-9 w-9 rounded-full" />
                ) : (
                  <CircleUser className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.displayName || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={()=>{navigate('/profile')}}>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
            <h1 className="text-2xl text-primary font-bold">Candidates</h1>
          </div>
          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder="Search by any field..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSorting("name")}>
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSorting("emailId")}>
                        Email ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Job Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length ? (
                    filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell>{candidate.name}</TableCell>
                        <TableCell>{candidate.emailId}</TableCell>
                        <TableCell>{candidate.jobTitle}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3}>No candidates found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
