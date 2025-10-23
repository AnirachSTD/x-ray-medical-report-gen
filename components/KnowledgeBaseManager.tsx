
import React, { useState } from 'react';
import { BrainIcon, PlusIcon, TrashIcon, RefineIcon, ChevronDownIcon, EditIcon } from './icons';
import { KnowledgeItem } from '../types';

interface KnowledgeBaseManagerProps {
  knowledgeBase: KnowledgeItem[];
  onAddKnowledge: (name: string, content: string) => void;
  onRemoveKnowledge: (id: string) => void;
  onUpdateKnowledge: (id: string, name: string, content: string) => void;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ knowledgeBase, onAddKnowledge, onRemoveKnowledge, onUpdateKnowledge }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemContent, setEditedItemContent] = useState('');

  const MULTIPLE_MYELOMA_KNOWLEDGE = `Radiological Signs of Multiple Myeloma: Look for multiple, small, well-defined 'punched-out' lytic lesions, particularly in the axial skeleton (skull, spine, ribs, pelvis). Check for raindrop skull appearance. Be aware of diffuse osteopenia and potential for pathological vertebral fractures/collapse. Periosteal reaction is typically absent. A solitary, expansile 'soap bubble' lesion may represent a plasmacytoma.`;

  const handleAddClick = () => {
    onAddKnowledge(newItemName, newItemContent);
    setNewItemName('');
    setNewItemContent('');
  };
  
  const handleAddPredefined = () => {
    onAddKnowledge('Radiological Signs of Multiple Myeloma', MULTIPLE_MYELOMA_KNOWLEDGE);
  };

  const handleToggleExpand = (index: number) => {
    if (editingItemId) return; // Don't toggle when editing
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleStartEdit = (item: KnowledgeItem, index: number) => {
    setEditingItemId(item.id);
    setEditedItemName(item.name);
    setEditedItemContent(item.content);
    setExpandedIndex(null); // Close any expanded item
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedItemName('');
    setEditedItemContent('');
  };

  const handleSaveEdit = () => {
    if (editingItemId) {
      onUpdateKnowledge(editingItemId, editedItemName, editedItemContent);
      handleCancelEdit(); // Reset state after saving
    }
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
        <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Name (Optional)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            aria-label="New Knowledge Item Name"
        />
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          rows={3}
          placeholder="Add a new piece of knowledge..."
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          aria-label="New Knowledge Item Content"
        />
        <button
          onClick={handleAddClick}
          disabled={!newItemContent.trim()}
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
        <h3 className="font-semibold text-gray-600 mb-3">Current Knowledge (Sorted by Name):</h3>
        {knowledgeBase.length > 0 ? (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {knowledgeBase.map((item, index) => (
              <li key={item.id} className="bg-gray-50 rounded-md shadow-sm text-sm overflow-hidden transition-all duration-300">
                {editingItemId === item.id ? (
                  <div className="p-3">
                    <input
                      type="text"
                      className="w-full p-2 mb-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={editedItemName}
                      onChange={(e) => setEditedItemName(e.target.value)}
                      aria-label="Edit Knowledge Item Name"
                    />
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
                      rows={4}
                      value={editedItemContent}
                      onChange={(e) => setEditedItemContent(e.target.value)}
                      aria-label="Edit Knowledge Item Content"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={handleCancelEdit} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs font-semibold">Cancel</button>
                      <button 
                        onClick={handleSaveEdit} 
                        disabled={!editedItemContent.trim()}
                        className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleToggleExpand(index)}
                      role="button"
                      aria-expanded={expandedIndex === index}
                    >
                      <p className="font-semibold text-gray-800 truncate pr-2" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center flex-shrink-0">
                        <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(item, index);
                            }} 
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                            aria-label={`Edit knowledge item ${item.name}`}
                        >
                          <EditIcon />
                        </button>
                        <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              onRemoveKnowledge(item.id);
                            }} 
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label={`Remove knowledge item ${item.name}`}
                        >
                          <TrashIcon />
                        </button>
                        <ChevronDownIcon isExpanded={expandedIndex === index} />
                      </div>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out ${expandedIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-3 pb-3 pt-1 border-t border-gray-200">
                        <p className="text-gray-700 break-words">{item.content}</p>
                      </div>
                    </div>
                  </>
                )}
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
