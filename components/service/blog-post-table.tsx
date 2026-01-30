import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

// ... existing imports

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  readTime?: number;
  content?: string;
  status: "draft" | "unlisted" | "published";
  author: Author;
  updatedAt: string;
  createdAt?: string; // Add optional createdAt
  likes: number;
}

interface BlogPostTableProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
  onRowClick?: (post: BlogPost) => void;
}

export function BlogPostTable({
  posts,
  onEdit,
  onDelete,
  onRowClick,
}: BlogPostTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="min-w-[240px]">제목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead className="w-[100px]">생성일</TableHead>
              <TableHead className="hidden xl:table-cell w-[80px]">
                좋아요
              </TableHead>
              <TableHead className="hidden xl:table-cell">태그</TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPosts.map((post) => (
              <TableRow
                key={post.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => (onRowClick ? onRowClick(post) : onEdit(post))}
              >
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {post.id.slice(-6)}
                </TableCell>
                <TableCell className="min-w-[240px] max-w-[320px] font-medium truncate">
                  {post.title}
                  {post.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {post.subtitle}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "published"
                        ? "default"
                        : post.status === "unlisted"
                          ? "secondary"
                          : "outline"
                    }
                    className="whitespace-nowrap"
                  >
                    {post.status === "published"
                      ? "게시됨"
                      : post.status === "unlisted"
                        ? "미게시"
                        : "초안"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                        {post.author.name[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {post.author.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                  {post.createdAt || "-"}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-sm text-muted-foreground tabular-nums whitespace-nowrap pl-4">
                  {post.likes}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1 items-center">
                    {post.tags?.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" size="xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags && post.tags.length > 3 && (
                      <Badge variant="outline" size="xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground h-8 w-8">
                      <HugeiconsIcon
                        icon={MoreHorizontalCircle01Icon}
                        className="h-4 w-4"
                      />
                      <span className="sr-only">메뉴 열기</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>작업</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <HugeiconsIcon
                            icon={PencilEdit02Icon}
                            className="mr-2 h-4 w-4"
                          />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(post.id)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            className="mr-2 h-4 w-4"
                          />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {currentPosts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
