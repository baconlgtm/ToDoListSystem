import React, { useState } from 'react';
import { Todo } from '../types/todo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Pencil, Trash2, Sparkles } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, title: string, urgency: number) => void;
  onGenerateSuggestions: (title: string, urgency: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
  onGenerateSuggestions,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editUrgency, setEditUrgency] = useState(todo.urgency);

  const handleUpdate = () => {
    onUpdate(todo.id, editTitle, editUrgency);
    setIsEditing(false);
  };

  const getUrgencyColor = (urgency: number) => {
    switch (urgency) {
      case 3:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 1:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggleComplete(todo.id)}
        />
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-64"
            />
            <Select
              value={editUrgency?.toString() || "0"}
              onValueChange={(value: string) => {
                setEditUrgency(parseInt(value));
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpdate}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.title}
            </span>
            <div className={`w-3 h-3 rounded-full ${getUrgencyColor(todo.urgency)}`} />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onGenerateSuggestions(todo.title, todo.urgency)}
          disabled={todo.completed}
          title="Generate AI suggestions"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          disabled={todo.completed}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TodoItem; 