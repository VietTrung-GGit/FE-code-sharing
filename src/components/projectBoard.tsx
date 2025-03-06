import React, { useState, useRef, useEffect } from 'react';
import { MdCenterFocusWeak, MdOutlineZoomOutMap, MdOutlineZoomInMap } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';
import { BiSolidEdit } from 'react-icons/bi';
import {
  NodeStructure,
  activateNodes,
  createSection,
  deleteSection,
  updateSection,
} from '../services/projectService';
import { FaDeleteLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface NodeProps {
  id: string;
  projectId: string;
  name: string;
  children?: React.ReactNode;
  isEditMode: boolean;
  isActive: boolean;
  isJoined: boolean;
  onAddChild?: () => void;
  onDelete?: () => void;
  onUpdateName?: (id: string, newTitle: string) => void;
  onSectionOpend?: (status: boolean) => void;
}

const Node: React.FC<NodeProps> = ({
  id,
  projectId,
  name,
  children,
  isEditMode,
  isActive,
  isJoined,
  onAddChild,
  onDelete,
  onUpdateName,
  onSectionOpend,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [newTitle, setNewTitle] = useState(name);
  const [showConfirm, setShowConfirm] = useState(false);

  const borderColor = isActive && !isEditMode ? 'border-Accent/Target' : 'border-[var(--border)] ';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    if (newTitle.trim() !== name) {
      onUpdateName?.(id, newTitle.trim()); // Use optional chaining
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(); // Ensure it exists before calling
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild?.(); // Use optional chaining
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    }
  };

  const handleClick = () => {
    if (!isEditMode) {
      navigate(`/project/${projectId}/sections/${id}/posts`);
      if (onSectionOpend) {
        onSectionOpend(isJoined);
      }
    }
  };

  return (
    <div
      className={`border-2 ${borderColor} bg-[var(--background-side)] text-[var(--text)]  shadow-md rounded-lg p-6 text-center relative cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        handleClick();
      }}
    >
      {isEditMode && id != 'root' ? (
        <input
          type='text'
          value={newTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleSubmit}
          onKeyDown={handleKeyDown}
          className='border rounded px-2 py-1 w-min text-center text-lg bg-[var(--background-side)] text-[var(--text)] border-[var(--border)] '
        />
      ) : (
        <h3 className='font-semibold text-lg w-full text-center'>{name}</h3>
      )}

      {isEditMode && onDelete && (
        <button
          className='absolute top-1 right-1 text-red-300 hover:text-red-400'
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation on delete click
            setShowConfirm(true);
          }}
          title='Delete'
        >
          <FaDeleteLeft />
        </button>
      )}

      {children && (
        <div className='mt-4 flex space-x-4'>
          {children}

          {isEditMode && onAddChild && (
            <div className='mt-2 flex flex-start'>
              <button
                className='text-blue-500 hover:text-blue-600 font-bold'
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when adding a child
                  onAddChild();
                }}
                title='Add Child'
              >
                New
              </button>
            </div>
          )}
        </div>
      )}

      {showConfirm && isEditMode && (
        <div className='absolute inset-0 bg-[var(--background-side)] text-[var(--text)] border-[var(--border)]  bg-opacity-90 flex flex-col justify-center items-center p-6 rounded-lg'>
          <p className='text-center'>
            Are you sure you want to delete this section and all of its subsections?
          </p>
          <div className='flex justify-center gap-4 mt-4'>
            <button className='bg-red-500 text-white px-4 py-1 rounded' onClick={handleDelete}>
              Yes
            </button>
            <button
              className='bg-gray-600 px-4 py-1 rounded'
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(false);
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface sectionsProps {
  sections: NodeStructure[];
  projectId: string;
  activeSectionId: string;
  isAdmin: boolean;
  showSubsections: boolean;
  onSectionOpend: (belonged: boolean) => void;
}
const ProjectBoard: React.FC<sectionsProps> = ({
  sections,
  projectId,
  activeSectionId,
  isAdmin,
  showSubsections,
  onSectionOpend,
}) => {
  const [nodes, setNodes] = useState<NodeStructure>({
    _id: 'root',
    name: 'Project',
    children: sections,
    isJoined: false,
    description: '',
  });

  const [editMode, setEditMode] = useState(false);

  // Function to add a child node (section)
  const addNodeAsChild = async (parentId: string, projectId: string) => {
    try {
      const sectionName = `New Child`;

      const addChildToNode = (node: NodeStructure): NodeStructure => {
        if (node._id === parentId) {
          return {
            ...node,
            children: [
              ...node.children,
              {
                _id: newSectionId,
                isActive: false,
                name: sectionName,
                children: [],
                isJoined: true,
                description: '',
              },
            ],
          };
        }
        return {
          ...node,
          children: node.children.map(addChildToNode),
        };
      };

      const newSectionId =
        parentId === 'root'
          ? await createSection(sectionName, projectId) // No parentId if "0"
          : await createSection(sectionName, projectId, parentId);

      setNodes((prevNodes) => addChildToNode(prevNodes));
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  // Function to delete a node (section)
  const deleteNode = async (nodeId: string) => {
    try {
      await deleteSection(nodeId);

      const removeNode = (node: NodeStructure): NodeStructure | null => {
        if (node._id === nodeId) return null;
        return {
          ...node,
          children: node.children
            .map(removeNode)
            .filter((child): child is NodeStructure => child !== null),
        };
      };

      setNodes((prevNodes) => removeNode(prevNodes) as NodeStructure);
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  // Function to update a node's name (section name)
  const updateNodeName = async (nodeId: string, newTitle: string) => {
    try {
      await updateSection(nodeId, newTitle);

      const updateName = (node: NodeStructure): NodeStructure => {
        if (node._id === nodeId) {
          return { ...node, name: newTitle };
        }
        return {
          ...node,
          children: node.children.map(updateName),
        };
      };

      setNodes((prevNodes) => updateName(prevNodes));
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const renderNode = (node: NodeStructure) => (
    <Node
      key={node._id}
      id={node._id}
      projectId={projectId}
      name={node.name}
      isEditMode={editMode}
      isActive={node.isActive || false}
      isJoined={node.isJoined || false}
      onAddChild={editMode ? () => addNodeAsChild(node._id, projectId) : undefined} // Add Child functionality
      onDelete={editMode && node._id !== 'root' ? () => deleteNode(node._id) : undefined} // Root node can't be deleted
      onUpdateName={editMode ? updateNodeName : undefined}
      onSectionOpend={onSectionOpend}
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
  const { theme } = useTheme();
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
    console.log('before');
    console.log(nodes);
    activateNodes([nodes], activeSectionId, showSubsections);
    console.log('after');
    console.log(nodes);
    focusCanvas();
  }, [editMode, activeSectionId, showSubsections]);
  return (
    <div
      onMouseEnter={() => setIsInside(true)}
      onMouseLeave={() => setIsInside(false)}
      className={`${
        theme === 'original'
          ? 'bg-Background/Bottom text-white border-2'
          : 'bg-[var(--surface)] text-[var(--text)]'
      } relative p-1 bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-5 border-Primary/Dark rounded-3xl`}
    >
      <div className='flex flex-col'>
        {/* Edit Button (Top-Right) */}
        {isAdmin && (
          <button
            className={`z-10 absolute top-4 right-4 p-2 text-sm ${
              editMode ? 'bg-gray-500' : 'bg-Accent/Target'
            } text-white rounded hover:${editMode ? 'bg-gray-600' : ''} shadow-md`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Quit' : <BiSolidEdit className='text-lg' />}
          </button>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={`relative w-full h-[350px] overflow-hidden rounded-3xl ${
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
            className='absolute flex top-0 left-0 origin-top-left'
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
          className={`${
            theme === 'original' ? 'text-Primary/Dark' : ''
          }  bg-[var(--button)]  px-4 py-2 rounded-lg shadow-lg hover:[var(--button-hovered)]`}
          onClick={zoomIn}
          data-tooltip-id='zoomin'
          data-tooltip-content={'Zoom in'}
          data-tooltip-place='right'
        >
          <MdOutlineZoomInMap />
          <Tooltip id='zoomin' classNameArrow='noArrow' />
        </button>
        <button
          className={`${
            theme === 'original' ? 'text-Primary/Dark' : ''
          }  bg-[var(--button)]  px-4 py-2 rounded-lg shadow-lg hover:[var(--button-hovered)]`}
          onClick={zoomOut}
          data-tooltip-id='zoomout'
          data-tooltip-content={'Zoom out'}
          data-tooltip-place='right'
        >
          <MdOutlineZoomOutMap />
          <Tooltip id='zoomout' classNameArrow='noArrow' />
        </button>
        <button
          className='bg-Accent/Target text-white  px-4 py-2 rounded-lg shadow-lg'
          onClick={focusCanvas}
          data-tooltip-id='focusproject'
          data-tooltip-content={'Focus on project'}
          data-tooltip-place='right'
        >
          <MdCenterFocusWeak />
          <Tooltip id='focusproject' classNameArrow='noArrow' />
        </button>
      </div>
    </div>
  );
};

export default ProjectBoard;

