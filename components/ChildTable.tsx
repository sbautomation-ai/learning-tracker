'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Child {
  id: string
  name: string
  createdAt: string
}

export function ChildTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [name, setName] = useState('')
  const queryClient = useQueryClient()

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await fetch('/api/children')
      if (!res.ok) throw new Error('Failed to fetch children')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create child')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      toast({ title: 'Child added successfully' })
      handleCloseDialog()
    },
    onError: () => {
      toast({ title: 'Failed to add child', variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/children?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to update child')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      toast({ title: 'Child updated successfully' })
      handleCloseDialog()
    },
    onError: () => {
      toast({ title: 'Failed to update child', variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/children?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete child')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      toast({ title: 'Child deleted successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to delete child', variant: 'destructive' })
    },
  })

  const handleOpenDialog = (child?: Child) => {
    if (child) {
      setEditingChild(child)
      setName(child.name)
    } else {
      setEditingChild(null)
      setName('')
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingChild(null)
    setName('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingChild) {
      updateMutation.mutate({ id: editingChild.id, name })
    } else {
      createMutation.mutate({ name })
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Children</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Child
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">No children added yet</p>
          <Button onClick={() => handleOpenDialog()}>Add your first child</Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{new Date(child.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(child)}
                    aria-label={`Edit ${child.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(child.id)}
                    aria-label={`Delete ${child.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingChild ? 'Edit Child' : 'Add Child'}</DialogTitle>
              <DialogDescription>
                {editingChild ? 'Update child information' : 'Add a new child to track'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter child's name"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingChild ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}