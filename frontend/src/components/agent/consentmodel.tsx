import { Modal } from '../ui/modal'; 
import { Button } from '../ui/button';

interface ConsentModalProps {
  isOpen: boolean;
  onApprove: () => void;
  onDeny: () => void;
  actionDetails: {
    riskLevel: number;
    description: string;
    prompt: string;
  };
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onApprove, onDeny, actionDetails }) => {
  return (
    <Modal isOpen={isOpen} onClose={onDeny} title="Agent Action Required">
        <div className="p-4">
            <div className="p-3 mb-4 text-yellow-800 bg-yellow-100 border-l-4 border-yellow-500">
                <h3 className="font-bold">Security Alert</h3>
                <p>{actionDetails.description}</p>
            </div>
            
            <p className="mb-6 text-lg text-gray-700">
                The agent wants to perform the following action:
                <strong className="block p-2 mt-2 font-mono bg-gray-100 rounded">
                    {actionDetails.prompt}
                </strong>
            </p>

            <div className="flex justify-end space-x-4">
                <Button onClick={onDeny} className="bg-gray-600 hover:bg-gray-700">
                    Deny
                </Button>
                <Button onClick={onApprove} className="bg-red-600 hover:bg-red-700">
                    Approve
                </Button>
            </div>
        </div>
    </Modal>
  );
};