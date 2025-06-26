import React from 'react';
import { ChatBubbleLeftRightIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../ui/tooltip';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Agent Chat', icon: ChatBubbleLeftRightIcon, href: '#', current: true },
    { name: 'Task History', icon: ClockIcon, href: '#', current: false },
    { name: 'Settings', icon: Cog6ToothIcon, href: '#', current: false },
  ];

  return (
    <div className="flex h-screen w-16 flex-col items-center bg-gray-900 p-2 text-white">
      <div className="mb-8 flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold">A</div>
      </div>
      <nav className="flex flex-col items-center space-y-4">
        {navItems.map((item) => (
          <Tooltip key={item.name} content={item.name}>
            <a href={item.href} className={`rounded-lg p-2 transition-colors duration-200 ${item.current ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              <item.icon className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">{item.name}</span>
            </a>
          </Tooltip>
        ))}
      </nav>
    </div>
  );
};