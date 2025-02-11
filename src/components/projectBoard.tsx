import React, { useState, useRef, useEffect } from 'react';
import { MdCenterFocusWeak, MdOutlineZoomOutMap, MdOutlineZoomInMap } from 'react-icons/md';
import { BiSolidEdit } from 'react-icons/bi';

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
  const [showConfirm, setShowConfirm] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
    onUpdateTitle?.(id, e.target.value);
  };

  return (
    <div className='hover:border-Primary/Light border-2 border-Primary/Dark bg-Background/Middle shadow-md rounded-lg p-4 text-center relative'>
      {isEditMode ? (
        <input
          type='text'
          value={newTitle}
          onChange={handleTitleChange}
          className='border rounded px-2 py-1 w-min text-center text-lg bg-Background/Middle'
        />
      ) : (
        <h3 className='font-semibold text-lg w-full text-center'>{title}</h3>
      )}

      {isEditMode && onDelete && (
        <button
          className='absolute top-2 right-2 text-red-500 hover:text-red-600 font-bold'
          onClick={() => setShowConfirm(true)}
          title='Delete'
        >
          x
        </button>
      )}

      {showConfirm && (
        <div className='z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white border shadow-md p-6 rounded-lg'>
            <p className='text-center'>Are you sure you want to delete?</p>
            <div className='flex justify-center gap-4 mt-4'>
              <button className='bg-red-500 text-white px-4 py-1 rounded' onClick={onDelete}>
                Yes
              </button>
              <button
                className='bg-gray-300 px-4 py-1 rounded'
                onClick={() => setShowConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

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
                New
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

const ProjectBoard: React.FC = () => {
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

  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [touchDist, setTouchDist] = useState(0);
  const [isInside, setIsInside] = useState(false);
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (isInside) {
        event.preventDefault(); // Prevent page scroll
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isInside]);
  // Handle Mouse Down (Start Dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle Mouse Move (Dragging)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  // Handle Mouse Up (Stop Dragging)
  const handleMouseUp = () => setDragging(false);

  // Handle Zooming with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left; // X position relative to the canvas
    const offsetY = e.clientY - rect.top; // Y position relative to the canvas

    // Adjust position based on zoom center (mouse pointer)
    setScale((prevScale) => {
      const newScale = Math.max(0.1, Math.min(5, prevScale * scaleAmount));
      const scaleRatio = newScale / prevScale;

      setPosition((prevPosition) => {
        const newPosX = offsetX - (offsetX - prevPosition.x) * scaleRatio;
        const newPosY = offsetY - (offsetY - prevPosition.y) * scaleRatio;

        return { x: newPosX, y: newPosY };
      });

      return newScale;
    });
  };

  // Get distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  };

  // Handle Touch Start (Detect Pinch)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setTouchDist(getTouchDistance(e.touches as unknown as TouchList));
    }
  };

  // Handle Touch Move (Pinch Zoom)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDist = getTouchDistance(e.touches as unknown as TouchList);
      const scaleAmount = newDist / touchDist;
      setScale((prevScale) => Math.max(0.1, Math.min(5, prevScale * scaleAmount)));
      setTouchDist(newDist);
    }
  };

  useEffect(() => {
    focusCanvas();
  }, [editMode]);

  // Zoom In
  const zoomIn = () => setScale((prev) => Math.min(5, prev * 1.1));

  // Zoom Out
  const zoomOut = () => setScale((prev) => Math.max(0.1, prev * 0.9)); // Zoom out even further

  // Focus (Center and Fit)
  const focusCanvas = () => {
    if (canvasRef.current && contentRef.current) {
      const parent = canvasRef.current.getBoundingClientRect();
      const contentWidth = contentRef.current.offsetWidth; // Get content width dynamically
      const contentHeight = contentRef.current.offsetHeight; // Get content height dynamically
      const scaleX = parent.width / contentWidth;
      const scaleY = parent.height / contentHeight;
      const newScale = Math.min(scaleX, scaleY); // Fit inside parent

      setScale(newScale);
      setPosition({
        x: (parent.width - contentWidth * newScale) / 2,
        y: (parent.height - contentHeight * newScale) / 2,
      });
    }
  };

  useEffect(() => {
    // Focus the canvas initially on mount
    focusCanvas();
  }, []);
  return (
    <div
      onMouseEnter={() => setIsInside(true)}
      onMouseLeave={() => setIsInside(false)}
      className='relative bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-5 border-Primary/Dark border-2 rounded-3xl'
    >
      <div className='flex flex-col'>
        {/* Edit Button (Top-Right) */}
        <button
          className={`z-40 absolute top-4 right-4 p-2 text-sm ${
            editMode ? 'bg-gray-500' : 'bg-Accent/Target'
          } text-white rounded hover:${editMode ? 'bg-gray-600' : ''} shadow-md`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Quit' : <BiSolidEdit className='text-lg' />}
        </button>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`relative w-full h-[350px] overflow-hidden bg-Background/Bottom  rounded-3xl ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div
            className='absolute flex top-0 left-0 bg-blue-500 origin-top-left'
            ref={contentRef}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            {renderNode(nodes)}
          </div>
        </div>
      </div>

      {/* Buttons (Bottom-Left) */}
      <div className='absolute bottom-4 left-4 flex flex-col space-y-2'>
        <button
          className='bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700'
          onClick={zoomIn}
        >
          <MdOutlineZoomInMap />
        </button>
        <button
          className='bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700'
          onClick={zoomOut}
        >
          <MdOutlineZoomOutMap />
        </button>
        <button
          className='bg-Accent/Target text-white px-4 py-2 rounded-lg shadow-md'
          onClick={focusCanvas}
        >
          <MdCenterFocusWeak />
        </button>
      </div>
    </div>
  );
};

export default ProjectBoard;

