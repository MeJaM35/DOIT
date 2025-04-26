'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewBoard({
      ...newBoard,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Boards</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Board</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateBoard}>
              <DialogHeader>
                <DialogTitle>Create a new board</DialogTitle>
                <DialogDescription>
                  Add a new board to organize your tasks
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Board title"
                    required
                    value={newBoard.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Board description"
                    value={newBoard.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Board</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading boards...</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h2 className="text-xl">You don't have any boards yet</h2>
          <Button onClick={() => setIsDialogOpen(true)}>Create your first board</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card key={board.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{board.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {board.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/boards/${board.id}`}>
                    View Board
                  </Link>
                </Button>
                {board.githubRepoUrl && (
                  <Button variant="ghost" size="sm">
                    <a href={board.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AuthenticatedLayout>
  );
}