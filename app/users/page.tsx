"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { HugeiconsIcon } from "@hugeicons/react";
import { 
  UserCheck01Icon,
  FilterIcon as FilterIconHuge,
  UserAdd01Icon,
  UserGroupIcon,
  Calendar03Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription as EmptyDesc } from "@/components/ui/empty";

const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", joined: "2023-10-01" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Inactive", joined: "2023-11-12" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Viewer", status: "Active", joined: "2023-12-05" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", role: "Editor", status: "Active", joined: "2024-01-20" },
  { id: 5, name: "Ethan Hunt", email: "ethan@example.com", role: "Admin", status: "Pending", joined: "2024-02-15" },
];

export default function UsersPage() {
  const [mounted, setMounted] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar />
      <SidebarInset suppressHydrationWarning>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur-sm sticky top-0 z-10 bg-white/50">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Users Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8 border border-emerald-100">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
             </Avatar>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-8 p-8 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">Users</h1>
              <p className="text-muted-foreground">Manage your team members and their account permissions.</p>
            </div>
            <div className="flex items-center gap-3">
               <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="outline" className="border-emerald-200 text-emerald-700">
                       <HugeiconsIcon icon={FilterIconHuge} className="mr-2 h-4 w-4" />
                       Filter
                    </Button>
                  } />
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                      <DropdownMenuItem>All Roles</DropdownMenuItem>
                      <DropdownMenuItem>Admin</DropdownMenuItem>
                      <DropdownMenuItem>Editor</DropdownMenuItem>
                      <DropdownMenuItem>Viewer</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
               </DropdownMenu>
               
               <Dialog>
                 <DialogTrigger render={
                   <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                      <HugeiconsIcon icon={UserAdd01Icon} className="mr-2 h-4 w-4 text-white" />
                      Add New User
                   </Button>
                 } />
                 <DialogContent className="sm:max-w-[425px]">
                   <DialogHeader>
                     <DialogTitle>Add New User</DialogTitle>
                     <DialogDescription>
                       Enter the details of the new team member here. Click save when you're done.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                       <Label htmlFor="name" className="text-right">Name</Label>
                       <Input id="name" placeholder="Alice Johnson" className="col-span-3" />
                     </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                       <Label htmlFor="email" className="text-right">Email</Label>
                       <Input id="email" placeholder="alice@example.com" className="col-span-3" />
                     </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                       <Label htmlFor="role" className="text-right">Role</Label>
                       <Input id="role" placeholder="Admin" className="col-span-3" />
                     </div>
                   </div>
                   <DialogFooter>
                     <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save changes</Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="grid gap-6 md:grid-cols-3">
             <Card className="shadow-sm border-emerald-100/50">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                 <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 text-emerald-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">1,284</div>
                 <p className="text-xs text-muted-foreground">+12% from last month</p>
               </CardContent>
             </Card>
             <Card className="shadow-sm border-emerald-100/50">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                 <HugeiconsIcon icon={UserCheck01Icon} className="h-4 w-4 text-emerald-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">+573</div>
                 <p className="text-xs text-muted-foreground">+201 since yesterday</p>
               </CardContent>
             </Card>
             <Card className="shadow-sm border-emerald-100/50">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium">New Joiners</CardTitle>
                 <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4 text-emerald-500" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">48</div>
                 <p className="text-xs text-muted-foreground">Registration pending: 12</p>
               </CardContent>
             </Card>
          </div>

          {/* User Table Section */}
          <Card className="shadow-sm border-emerald-100/30 overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-muted/20">
              <div className="relative w-full md:w-96">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9 border-emerald-100 bg-white" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger render={
                    <Button variant="outline" className="h-10 border-emerald-100 bg-white">
                      <HugeiconsIcon icon={Calendar03Icon} className="mr-2 h-4 w-4 text-emerald-600" />
                      {date ? format(date, "PPP") : "Date Range"}
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar mode="single" selected={date} onSelect={setDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-emerald-50/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-emerald-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md font-medium px-2 py-0 border-muted">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] h-5",
                            user.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            user.status === "Inactive" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.joined}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon-sm">
                              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit permissions</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive">Suspend user</DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <Empty className="border-none">
                        <EmptyHeader>
                          <EmptyTitle>No users found</EmptyTitle>
                          <EmptyDesc>Try adjusting your search or filters to find what you're looking for.</EmptyDesc>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Showing {filteredUsers.length} of {users.length} users</span>
              <Pagination className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </Card>
        </main>
        
        <footer className="h-16 border-t flex items-center justify-center text-xs text-muted-foreground bg-muted/10">
           © 2026 Dinn Admin Dashboard. Built with Shadcn/ui & Next.js.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
