import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUser, Command, Home, Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "../Database/FirebaseConfig";
import { signOut } from "firebase/auth";
import { Sidebar } from "./Sidebar";
import ModeToggle from "./mode-toggle";
import FileUpload from "./FileUpload";
import { Label } from "./ui/label";
import DataTable from "./DataTable";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const UploadDataset: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [apiUrl, setApiUrl] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/login");
  };

  const fetchData = async (apiUrl: string, apiKey: string) => {

    try {
      const response = await fetch("http://localhost:5000/fetch-api-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_url: apiUrl, api_key: apiKey }),
      });
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="create-post" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
                  className="h-10 px-3 mr-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm 
                  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
                  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed py-2 ps-10 pe-16 
                  block w-1/2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-200 
                  focus:ring-0 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 
                  dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-600"
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
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl text-primary font-bold">Upload Dataset</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <FileUpload />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-center select-none">------------------------------------------------ OR ------------------------------------------------</p>
            <div className="w-full max-w-lg flex flex-col gap-2">
              <div className="gap-2 w-full">
                <Label>API for real-time data</Label>
                <Input type="text" placeholder="Enter API" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
              </div>
              <div className="gap-2 w-full">
                <Label>API Access Key</Label>
                <Input type="text" placeholder="Enter API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>
              <div className="gap-2 w-full">
                <Button variant='default' onClick={() => fetchData(apiUrl, apiKey)}>Submit</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};