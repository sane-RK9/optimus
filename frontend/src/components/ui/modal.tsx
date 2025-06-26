import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Define the props for our Modal component ---
interface ModalProps {
  /** Whether the modal is currently open and visible. */
  isOpen: boolean;
  /** A function to call when the modal is requested to close (e.g., by pressing Escape or clicking the overlay). */
  onClose: () => void;
  /** The title to be displayed at the top of the modal. */
  title: string;
  /** The main content of the modal. */
  children: ReactNode;
  /** Optional: Additional CSS classes for the modal panel for custom sizing etc. (e.g., 'max-w-2xl') */
  panelClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  panelClassName = 'max-w-lg', // Default size
}) => {
  return (
    // AnimatePresence is used by Framer Motion to animate components when they are mounted or unmounted.
    <AnimatePresence>
      {isOpen && (
        // Transition.Root from Headless UI manages the top-level state of the modal.
        <Transition.Root show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={onClose}>
            
            {/* Modal Overlay/Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            {/* Main Modal Content */}
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                
                {/* Modal Panel Animation */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel 
                    className={`w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${panelClassName}`}
                  >
                    {/* Modal Title */}
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    
                    {/* Modal Body (your content goes here) */}
                    <div className="mt-4">
                      {children}
                    </div>

                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </AnimatePresence>
  );
};