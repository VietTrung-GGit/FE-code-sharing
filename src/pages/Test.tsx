import React, { useState } from 'react';

interface NodeProps {
  id: string;
  title: string;
  children?: React.ReactNode;
  isEditMode: boolean;
  onAddChild?: () => void; // Function to add Child
  onDelete?: () => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
}

const Node: React.FC<NodeProps> = ({
  id,
  title,
  children,
  isEditMode,
  onAddChild,
  onDelete,
  onUpdateTitle,
}) => {
  const [newTitle, setNewTitle] = useState(title);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
    if (onUpdateTitle) {
      onUpdateTitle(id, e.target.value);
    }
  };

  return (
    <div className='border border-gray-300 bg-white shadow-md rounded-lg p-4 text-center relative'>
      {isEditMode ? (
        <input
          type='text'
          value={newTitle}
          onChange={handleTitleChange}
          className='border rounded px-2 py-1 w-max text-center'
        />
      ) : (
        <h3 className='font-semibold text-lg w-full text-center'>{title}</h3> // Ensure text-center is here
      )}

      {/* Delete button in the top-right corner */}
      {isEditMode && onDelete && (
        <button
          className='absolute top-2 right-2 text-red-500 hover:text-red-600 font-bold'
          onClick={onDelete}
          title='Delete'
        >
          x
        </button>
      )}

      {/* Button to add Child below the node title but above the children */}

      {/* Render children */}
      {children && (
        <div className='mt-4 flex space-x-4'>
          {children}
          {isEditMode && onAddChild && (
            <div className='mt-2 flex flex-start'>
              <button
                className='text-blue-500 hover:text-blue-600 font-bold'
                onClick={onAddChild}
                title='Add Child'
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface NodeStructure {
  id: string;
  title: string;
  children: NodeStructure[];
}

const Diagram: React.FC = () => {
  const [nodes, setNodes] = useState<NodeStructure>({
    id: 'root',
    title: 'Project',
    children: [
      {
        id: 'frontend',
        title: 'FE',
        children: [
          {
            id: 'landing',
            title: 'Landing Page',
            children: [
              { id: 'header', title: 'Header', children: [] },
              { id: 'hero', title: 'Hero', children: [] },
              { id: 'footer', title: 'Footer', children: [] },
            ],
          },
          {
            id: 'home',
            title: 'Home Page',
            children: [
              { id: 'posts', title: 'Posts', children: [] },
              { id: 'avatar', title: 'Avatar', children: [] },
              { id: 'filter', title: 'Filter', children: [] },
            ],
          },
          { id: 'sign', title: 'Sign Page', children: [] },
        ],
      },
      {
        id: 'backend',
        title: 'BE',
        children: [
          { id: 'auth', title: 'Auth', children: [] },
          { id: 'post', title: 'Post', children: [] },
          { id: 'user', title: 'User', children: [] },
        ],
      },
    ],
  });

  const [editMode, setEditMode] = useState(false);
  const [originalNodes, setOriginalNodes] = useState<NodeStructure>(nodes); // Store original nodes

  // Function to add Child node at the same level
  const addNodeAsChild = (ChildId: string) => {
    const addChildToNode = (node: NodeStructure): NodeStructure => {
      if (node.id === ChildId) {
        return {
          ...node,
          children: [
            ...node.children,
            {
              id: `${node.id}-${node.children.length + 1}`,
              title: `New Child ${node.children.length + 1}`,
              children: [],
            },
          ],
        };
      }
      return {
        ...node,
        children: node.children.map(addChildToNode),
      };
    };

    setNodes((prevNodes) => addChildToNode(prevNodes));
  };

  const deleteNode = (nodeId: string) => {
    const removeNode = (node: NodeStructure): NodeStructure | null => {
      if (node.id === nodeId) return null;
      return {
        ...node,
        children: node.children
          .map(removeNode)
          .filter((child): child is NodeStructure => child !== null),
      };
    };

    setNodes((prevNodes) => removeNode(prevNodes) as NodeStructure);
  };

  const updateNodeTitle = (nodeId: string, newTitle: string) => {
    const updateTitle = (node: NodeStructure): NodeStructure => {
      if (node.id === nodeId) {
        return { ...node, title: newTitle };
      }
      return {
        ...node,
        children: node.children.map(updateTitle),
      };
    };

    setNodes((prevNodes) => updateTitle(prevNodes));
  };

  const renderNode = (node: NodeStructure) => (
    <Node
      key={node.id}
      id={node.id}
      title={node.title}
      isEditMode={editMode}
      onAddChild={editMode ? () => addNodeAsChild(node.id) : undefined} // Add Child functionality
      onDelete={editMode && node.id !== 'root' ? () => deleteNode(node.id) : undefined} // Root node can't be deleted
      onUpdateTitle={editMode ? updateNodeTitle : undefined}
    >
      <div className='flex space-x-4'>{node.children.map(renderNode)}</div>
    </Node>
  );

  const handleQuit = () => {
    setNodes(originalNodes); // Reset to original state on Quit
    setEditMode(false);
  };

  return (
    <div className=' h-1/2 w-1/2'>
      <div className='p-8 flex flex-col space-y-8'>
        <div className='flex justify-between mb-4'>
          <button
            className={`px-4 py-2 text-sm ${editMode ? 'bg-green-500' : 'bg-blue-500'} text-white rounded hover:${editMode ? 'bg-green-600' : 'bg-blue-600'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Save' : 'Edit'}
          </button>
          {editMode && (
            <button
              className='px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600'
              onClick={handleQuit}
            >
              Quit
            </button>
          )}
        </div>
        <div className='flex overflow-x-auto'>{renderNode(nodes)}</div>
      </div>
    </div>
  );
};

export default Diagram;

