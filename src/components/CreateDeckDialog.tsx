"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDeckAction } from "@/actions/deck-actions";

interface CreateDeckDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateDeckDialog({ trigger, onSuccess }: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await createDeckAction({ title: title.trim(), description: description.trim() });
      
      // Reset form
      setTitle("");
      setDescription("");
      setOpen(false);
      
      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      // Handle validation errors
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes("Title")) {
          setErrors({ title: message });
        } else if (message.includes("Description")) {
          setErrors({ description: message });
        } else {
          setErrors({ title: "Failed to create deck. Please try again." });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-blue-600 text-white hover:bg-blue-700">
      Create New Deck
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Create New Deck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-200">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter deck title..."
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500"
              required
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">
              Description *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter deck description..."
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 min-h-[100px]"
              required
            />
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-100 hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Deck"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 