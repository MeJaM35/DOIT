'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AuthenticatedLayout from '@/components/layout/authenticated-layout';
import boardService, { BoardDto } from '@/services/board-service';
import listService, { BoardListDto } from '@/services/list-service';
import taskService, { TaskItemDto, TaskPriority, TaskStatus } from '@/services/task-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Layers, GitBranch, Plus } from 'lucide-react';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  
  const [board, setBoard] = useState<BoardDto | null>(null);
  const [lists, setLists] = useState<BoardListDto[]>([]);
  const [tasks, setTasks] = useState<{ [listId: string]: TaskItemDto[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [newList, setNewList] = useState<BoardListDto>({
    title: '',
    boardId: boardId,
    order: 0,
  });
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  
  const [newTask, setNewTask] = useState<TaskItemDto>({
    title: '',
    listId: '',
    priority: TaskPriority.Medium,
    status: TaskStatus.ToDo,
  });
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  // For GitHub integration
  const [repoUrl, setRepoUrl] = useState('');
  const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  useEffect(() => {
    if (board) {
      loadLists();
    }
  }, [board]);

  useEffect(() => {
    if (lists.length > 0) {
      loadTasks();
    } else {
      // If there are no lists, we should still set isLoading to false
      // otherwise the loading state will persist indefinitely
      setIsLoading(false);
    }
  }, [lists]);

  const loadBoard = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching board with ID:', boardId);
      const data = await boardService.getBoard(boardId);
      console.log('Board data received:', data);
      setBoard(data);
    } catch (error) {
      console.error('Failed to load board:', error);
      toast.error('Failed to load board. Please try again.');
      // Add a short delay before redirecting to avoid immediate navigation
      setTimeout(() => {
        router.push('/boards');
      }, 2000);
    }
  };

  const loadLists = async () => {
    try {
      console.log('Fetching lists for board ID:', boardId);
      const data = await listService.getLists(boardId);
      // Sort lists by order
      const sortedLists = data.sort((a, b) => a.order - b.order);
      console.log('Lists data received:', sortedLists);
      setLists(sortedLists);
    } catch (error) {
      console.error('Failed to load lists:', error);
      toast.error('Failed to load lists. Please refresh the page.');
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      console.log('Fetching tasks for lists:', lists);
      const tasksByList: { [listId: string]: TaskItemDto[] } = {};
      
      // Load tasks for each list
      for (const list of lists) {
        if (list.id) {
          console.log(`Fetching tasks for list ID: ${list.id}`);
          const listTasks = await taskService.getTasks(list.id);
          console.log(`Tasks received for list ${list.id}:`, listTasks);
          tasksByList[list.id] = listTasks;
        }
      }
      
      setTasks(tasksByList);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks. Some data may be incomplete.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Set the order to be the next number in the list
      const newListWithOrder = {
        ...newList,
        order: lists.length,
      };
      
      const createdList = await listService.createList(boardId, newListWithOrder);
      setLists([...lists, createdList]);
      setNewList({ title: '', boardId: boardId, order: 0 });
      setIsListDialogOpen(false);
      toast.success('List created successfully!');
    } catch (error) {
      console.error('Failed to create list:', error);
      toast.error('Failed to create list');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const taskToCreate = {
        ...newTask,
        listId: selectedListId,
      };
      
      const createdTask = await taskService.createTask(selectedListId, taskToCreate);
      
      // Update the tasks state with the new task
      setTasks({
        ...tasks,
        [selectedListId]: [...(tasks[selectedListId] || []), createdTask],
      });
      
      setNewTask({
        title: '',
        listId: '',
        priority: TaskPriority.Medium,
        status: TaskStatus.ToDo,
      });
      setIsTaskDialogOpen(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleConnectGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await boardService.connectGitHub(boardId, repoUrl);
      const updatedBoard = await boardService.getBoard(boardId);
      setBoard(updatedBoard);
      setRepoUrl('');
      setIsGitHubDialogOpen(false);
      toast.success('GitHub repository connected successfully!');
    } catch (error) {
      console.error('Failed to connect GitHub repository:', error);
      toast.error('Failed to connect GitHub repository');
    }
  };

  const openTaskDialog = (listId: string) => {
    setSelectedListId(listId);
    setIsTaskDialogOpen(true);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case TaskPriority.Medium:
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case TaskPriority.High:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case TaskPriority.Urgent:
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.ToDo:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
      case TaskStatus.InProgress:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case TaskStatus.Blocked:
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      case TaskStatus.Done:
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300';
    }
  };

  const handleDeleteList = async (id: number | undefined) => {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this list? All tasks in it will be deleted too. This action cannot be undone.')) {
      try {
        await listService.deleteList(boardId, id);
        setLists(lists.filter(list => list.id !== id));
        // Also remove tasks for this list from the tasks state
        const newTasks = { ...tasks };
        delete newTasks[id as any];
        setTasks(newTasks);
        toast.success('List deleted successfully');
      } catch (error) {
        console.error('Failed to delete list:', error);
        toast.error('Failed to delete list');
      }
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-muted rounded mb-4"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {board?.title}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">{board?.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isGitHubDialogOpen} onOpenChange={setIsGitHubDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                <span>{board?.githubRepositoryUrl ? 'Change GitHub Repo' : 'Connect GitHub'}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleConnectGitHub}>
                <DialogHeader>
                  <DialogTitle>Connect GitHub Repository</DialogTitle>
                  <DialogDescription>
                    Link this board to a GitHub repository for better integration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="repoUrl" className="text-sm font-medium">
                      GitHub Repository URL
                    </label>
                    <Input
                      id="repoUrl"
                      placeholder="https://github.com/username/repo"
                      required
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      defaultValue={board?.githubRepositoryUrl}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="gradient" type="submit">Connect</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add List</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateList}>
                <DialogHeader>
                  <DialogTitle>Create a new list</DialogTitle>
                  <DialogDescription>
                    Add a new list to organize your tasks
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="List title"
                      required
                      value={newList.title}
                      onChange={(e) => setNewList({ ...newList, title: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="gradient" type="submit">Create List</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-6 snap-x">
        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-64 space-y-4">
            <div className="text-center space-y-3">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground/60" />
              <h2 className="text-xl font-medium">You don't have any lists yet</h2>
              <p className="text-muted-foreground">Create your first list to start organizing your tasks</p>
            </div>
            <Button variant="gradient" onClick={() => setIsListDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create your first list
            </Button>
          </div>
        ) : (
          lists.map((list) => (
            <div key={list.id} className="flex-shrink-0 w-80 snap-start">
              <Card className="h-full">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">{list.title}</CardTitle>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => list.id && openTaskDialog(list.id)}
                        className="h-8 px-2 text-xs rounded-full hover:bg-primary/10 hover:text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm" 
                        onClick={() => list.id && handleDeleteList(list.id)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete list"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-3 pt-3">
                  {list.id && tasks[list.id] && tasks[list.id].length > 0 ? (
                    tasks[list.id].map((task) => (
                      <div key={task.id} className="relative group">
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Card className="p-3 shadow-sm cursor-pointer hover:shadow-md transition-all border-border/50 group-hover:border-primary/30">
                          <h3 className="font-medium">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-medium",
                              getPriorityColor(task.priority)
                            )}>
                              {task.priority}
                            </span>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-medium",
                              getStatusColor(task.status)
                            )}>
                              {task.status}
                            </span>
                          </div>
                        </Card>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground text-sm">No tasks yet</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => list.id && openTaskDialog(list.id)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add a task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
      
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle>Add a new task</DialogTitle>
              <DialogDescription>
                Fill out the details for your new task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="taskTitle" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="taskTitle"
                  placeholder="Task title"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="taskDescription" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="taskDescription"
                  placeholder="Task description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="taskPriority" className="text-sm font-medium">
                  Priority
                </label>
                <select
                  id="taskPriority"
                  className="w-full p-2 border rounded-md bg-background"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                >
                  <option value={TaskPriority.Low}>Low</option>
                  <option value={TaskPriority.Medium}>Medium</option>
                  <option value={TaskPriority.High}>High</option>
                  <option value={TaskPriority.Urgent}>Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="taskStatus" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="taskStatus"
                  className="w-full p-2 border rounded-md bg-background"
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                >
                  <option value={TaskStatus.ToDo}>To Do</option>
                  <option value={TaskStatus.InProgress}>In Progress</option>
                  <option value={TaskStatus.Blocked}>Blocked</option>
                  <option value={TaskStatus.Done}>Done</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="gradient" type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AuthenticatedLayout>
  );
}