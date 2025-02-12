import React from 'react';
import logo from '@assets/img/logo.svg';
import { Button } from '@src/components/ui/button';

export default function Popup() {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <Button>Click me</Button>
    </div>
  );
}
