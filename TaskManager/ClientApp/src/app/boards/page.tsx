'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { GitHubLogoIcon, PlusIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import AuthenticatedLayout from '@/components/layout/authenticated-layout';
import boardService, { BoardDto } from '@/services/board-service';
import { toast } from 'sonner';

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoard, setNewBoard] = useState<BoardDto>({
    title: '',
    description: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setIsLoading(true);
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (error) {
      console.error('Failed to load boards:', error);
      toast.error('Failed to load boards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const createdBoard = await boardService.createBoard(newBoard);
      setBoards([...boards, createdBoard]);
      setNewBoard({ title: '', description: '' });
      setIsDialogOpen(false);
      toast.success('Board created successfully!');
    } catch (error) {
      console.error('Failed to create board:', error);
      toast.error('Failed to create board');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewBoard({
      ...newBoard,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteBoard = async (id: number | undefined) => {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      try {
        await boardService.deleteBoard(id);
        setBoards(boards.filter(board => board.id !== id));
        toast.success('Board deleted successfully');
      } catch (error) {
        console.error('Failed to delete board:', error);
        toast.error('Failed to delete board');
      }
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Boards</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your projects
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateBoard}>
                <DialogHeader>
                  <DialogTitle>Create a new board</DialogTitle>
                  <DialogDescription>
                    Add a new board to organize your tasks and lists
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="My awesome project"
                      required
                      value={newBoard.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="What's this board about?"
                      className="resize-none"
                      rows={3}
                      value={newBoard.description || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button type="submit">Create Board</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Skeleton className="h-9 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <Card className="border-dashed bg-background">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <PlusIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Create your first board to start organizing your tasks and projects
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Create your first board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Card key={board.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <span className="truncate">{board.title}</span>
                    {board.githubRepositoryUrl && (
                      <Link 
                        href={board.githubRepositoryUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <GitHubLogoIcon className="h-5 w-5" />
                        <span className="sr-only">GitHub Repository</span>
                      </Link>
                    )}
                  </CardTitle>
                  {board.description && (
                    <CardDescription className="line-clamp-2">
                      {board.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-4"></div> {/* spacing */}
                </CardContent>
                <CardFooter className="pt-3 border-t flex gap-2">
                  <Button variant="default" asChild className="flex-1 gap-2">
                    <Link href={`/boards/${board.id}`}>
                      View Board
                      <ExternalLinkIcon className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => handleDeleteBoard(board.id)}
                    title="Delete board"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}