import React from 'react';
import { ChevronDown } from 'lucide-react';

interface TriviaItemProps {
  text: string;
  category: string;
}

export function TriviaItem({ text, category }: TriviaItemProps) {
  return (
    <div className="p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800">
      <p className="text-white mb-2 line-clamp-2">{text}</p>
      <p className="text-gray-400 text-sm">{category}</p>
      <ChevronDown className="text-gray-400 mt-2" />
    </div>
  );
}
