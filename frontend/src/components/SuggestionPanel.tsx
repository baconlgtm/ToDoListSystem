import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SuggestionPanelProps {
  suggestions: string[];
  baseTodo?: string;
  isOpen?: boolean;
  onClose: () => void;
  onApply: (selectedSuggestions: { title: string; urgency: number }[]) => void;
  isLoading?: boolean;
  error?: string;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  suggestions,
  baseTodo,
  isOpen = false,
  onClose,
  onApply,
  isLoading = false,
  error,
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState<Record<string, number>>({});

  const handleSuggestionToggle = (suggestion: string) => {
    setSelectedSuggestions((prev) =>
      prev.includes(suggestion)
        ? prev.filter((s) => s !== suggestion)
        : [...prev, suggestion]
    );
    
    // Initialize urgency when suggestion is selected
    if (!selectedUrgencies[suggestion]) {
      setSelectedUrgencies(prev => ({
        ...prev,
        [suggestion]: baseTodo ? 1 : 1 // Default urgency
      }));
    }
  };

  const handleUrgencyChange = (suggestion: string, urgency: number) => {
    setSelectedUrgencies(prev => ({
      ...prev,
      [suggestion]: urgency
    }));
  };

  const handleApply = () => {
    const formattedSuggestions = selectedSuggestions.map(title => ({
      title,
      urgency: selectedUrgencies[title] || 1
    }));
    onApply(formattedSuggestions);
    setSelectedSuggestions([]);
    setSelectedUrgencies({});
  };

  const handleClose = () => {
    setSelectedSuggestions([]);
    setSelectedUrgencies({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generated Suggestions</DialogTitle>
          <DialogDescription>
            {baseTodo 
              ? `Select related suggestions for: "${baseTodo}"`
              : "Select the suggestions you would like to add to your todo list."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating suggestions...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex flex-col space-y-2 mb-4 p-2 rounded-lg hover:bg-accent/50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`suggestion-${index}`}
                    checked={selectedSuggestions.includes(suggestion)}
                    onCheckedChange={() => handleSuggestionToggle(suggestion)}
                  />
                  <label
                    htmlFor={`suggestion-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {suggestion}
                  </label>
                </div>
                {selectedSuggestions.includes(suggestion) && (
                  <div className="ml-6">
                    <select
                      value={selectedUrgencies[suggestion] || 1}
                      onChange={(e) => handleUrgencyChange(suggestion, Number(e.target.value))}
                      className="text-sm rounded-md border border-input bg-background px-3 py-1"
                    >
                      <option value={0}>No urgency</option>
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {error ? "Failed to generate suggestions" : "No suggestions available"}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedSuggestions.length === 0 || isLoading}
          >
            Apply {selectedSuggestions.length} Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 