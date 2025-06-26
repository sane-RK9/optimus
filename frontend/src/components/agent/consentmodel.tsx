import { Modal } from '../ui/modal'; 
import { Button } from '../ui/button';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

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

export const ConsentModal: React.FC<ConsentModalProps> = ({ 
  isOpen, 
  onApprove, 
  onDeny, 
  actionDetails 
}) => {
  const getRiskColor = (level: number) => {
    if (level >= 8) return 'text-red-800 bg-red-100 border-red-500';
    if (level >= 5) return 'text-yellow-800 bg-yellow-100 border-yellow-500';
    return 'text-blue-800 bg-blue-100 border-blue-500';
  };

  const getRiskIcon = (level: number) => {
    if (level >= 8) return <ShieldExclamationIcon className="h-5 w-5" />;
    return <ExclamationTriangleIcon className="h-5 w-5" />;
  };

  const getRiskText = (level: number) => {
    if (level >= 8) return 'High Risk Action';
    if (level >= 5) return 'Medium Risk Action';
    return 'Low Risk Action';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onDeny} 
      title="Agent Action Approval Required"
      panelClassName="max-w-lg"
    >
      <div className="space-y-4">
        {/* Risk Level Indicator */}
        <div className={`flex items-center gap-2 p-3 rounded-lg border-l-4 ${getRiskColor(actionDetails.riskLevel)}`}>
          {getRiskIcon(actionDetails.riskLevel)}
          <div>
            <h3 className="font-semibold">{getRiskText(actionDetails.riskLevel)}</h3>
            <p className="text-sm">{actionDetails.description}</p>
          </div>
        </div>
        
        {/* Action Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Requested Action:</h4>
          <div className="p-3 bg-gray-50 rounded-md border">
            <code className="text-sm text-gray-800 font-mono break-all">
              {actionDetails.prompt}
            </code>
          </div>
        </div>

        {/* Risk Level Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Risk Level</span>
            <span className="font-medium">{actionDetails.riskLevel}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                actionDetails.riskLevel >= 8 ? 'bg-red-600' :
                actionDetails.riskLevel >= 5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${actionDetails.riskLevel * 10}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            onClick={onDeny} 
            variant="secondary"
            size="md"
          >
            Deny
          </Button>
          <Button 
            onClick={onApprove} 
            variant="danger"
            size="md"
          >
            Approve & Execute
          </Button>
        </div>
      </div>
    </Modal>
  );
};