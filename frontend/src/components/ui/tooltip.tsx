import { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';

interface TooltipProps {
  children: React.ReactElement;
  content: string | React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover>
      <>
        <Popover.Button
          as="div"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        >
          {children}
        </Popover.Button>
        <Transition
          as={Fragment}
          show={isOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel static className="absolute z-10 mt-2 ml-2">
            <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm">
              {content}
            </div>
          </Popover.Panel>
        </Transition>
      </>
    </Popover>
  );
};