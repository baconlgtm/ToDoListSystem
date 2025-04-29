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
import { Loader2 } from "lucide-react";

interface SuggestionPanelProps {
  suggestions: string[];
  baseTodo?: string;
  isOpen?: boolean;
  onClose: () => void;
  onApply: (selectedSuggestions: { title: string; urgency: number }[]) => void;
  isLoading?: boolean;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  suggestions,
  baseTodo,
  isOpen = false,
  onClose,
  onApply,
  isLoading = false,
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const handleSuggestionToggle = (suggestion: string) => {
    setSelectedSuggestions((prev) =>
      prev.includes(suggestion)
        ? prev.filter((s) => s !== suggestion)
        : [...prev, suggestion]
    );
  };

  const handleApply = () => {
    // Convert selected suggestions to the expected format with default urgency of 1
    const formattedSuggestions = selectedSuggestions.map(title => ({
      title,
      urgency: 1
    }));
    onApply(formattedSuggestions);
    setSelectedSuggestions([]);
  };

  const handleClose = () => {
    setSelectedSuggestions([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generated Suggestions</DialogTitle>
          <DialogDescription>
            Select the suggestions you would like to add to your todo list.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : suggestions.length > 0 ? (
          <div className="py-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
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
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No suggestions available
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedSuggestions.length === 0 || isLoading}
          >
            Apply Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 