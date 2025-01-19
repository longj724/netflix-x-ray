import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CastMemberProps {
  name: string;
  role: string;
  imageUrl: string;
}

export function CastMember({ name, role, imageUrl }: CastMemberProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800">
      <img
        src={imageUrl}
        alt={name}
        className="w-16 h-16 rounded-md object-cover"
      />
      <div className="flex-1">
        <h3 className="text-white text-lg font-semibold">{name}</h3>
        <p className="text-gray-400">Portrays: {role}</p>
      </div>
      <ChevronDown className="text-gray-400" />
    </div>
  );
}
