export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string | null;
  urgency: number;
}

export interface TodoFormData {
  title: string;
  urgency: number;
} 