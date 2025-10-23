
import React, { useState } from 'react';
import { BrainIcon, PlusIcon, TrashIcon, RefineIcon } from './icons';

interface KnowledgeBaseManagerProps {
  knowledgeBase: string[];
  onAddKnowledge: (item: string) => void;
  onRemoveKnowledge: (index: number) => void;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ knowledgeBase, onAddKnowledge, onRemoveKnowledge }) => {
  const [newItem, setNewItem] = useState('');

  const MULTIPLE_MYELOMA_KNOWLEDGE = `Radiological Signs of Multiple Myeloma: Look for multiple, small, well-defined 'punched-out' lytic lesions, particularly in the axial skeleton (skull, spine, ribs, pelvis). Check for raindrop skull appearance. Be aware of diffuse osteopenia and potential for pathological vertebral fractures/collapse. Periosteal reaction is typically absent. A solitary, expansile 'soap bubble' lesion may represent a plasmacytoma.`;

  const handleAddClick = () => {
    onAddKnowledge(newItem);
    setNewItem('');
  };
  
  const handleAddPredefined = () => {
    onAddKnowledge(MULTIPLE_MYELOMA_KNOWLEDGE);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex items-center mb-4">
        <BrainIcon />
        <h2 className="text-xl font-semibold text-gray-700 ml-2">Expert Knowledge Base</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Add key information or previous corrections here. The AI will review this knowledge before every new analysis.
      </p>

      <div className="flex flex-col gap-3">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          rows={3}
          placeholder="Add a new piece of knowledge..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          aria-label="New Knowledge Base Item"
        />
        <button
          onClick={handleAddClick}
          disabled={!newItem.trim()}
          className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
        >
          <PlusIcon />
          Add Knowledge
        </button>
        <button
            onClick={handleAddPredefined}
            className="w-full flex items-center justify-center bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
            <RefineIcon />
            Add Radiopaedia Quick-Note: Multiple Myeloma
        </button>
      </div>

      <div className="mt-6 flex-grow">
        <h3 className="font-semibold text-gray-600 mb-3">Current Knowledge:</h3>
        {knowledgeBase.length > 0 ? (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {knowledgeBase.map((item, index) => (
              <li key={index} className="flex items-start justify-between bg-gray-50 p-3 rounded-md shadow-sm text-sm">
                <p className="text-gray-800 break-words flex-1 pr-2">{item}</p>
                <button 
                    onClick={() => onRemoveKnowledge(index)} 
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label={`Remove knowledge item ${index + 1}`}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 text-sm py-4">
            The knowledge base is empty.
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;
