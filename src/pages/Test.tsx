// import React, { useState, useRef, useEffect } from 'react';

// interface NodeProps {
//   id: string;
//   title: string;
//   children?: React.ReactNode;
//   isEditMode: boolean;
//   onAddChild?: () => void; // Function to add Child
//   onDelete?: () => void;
//   onUpdateTitle?: (id: string, newTitle: string) => void;
// }

// const Node: React.FC<NodeProps> = ({
//   id,
//   title,
//   children,
//   isEditMode,
//   onAddChild,
//   onDelete,
//   onUpdateTitle,
// }) => {
//   const [newTitle, setNewTitle] = useState(title);

//   const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewTitle(e.target.value);
//     if (onUpdateTitle) {
//       onUpdateTitle(id, e.target.value);
//     }
//   };

//   return (
//     <div className='border border-gray-300 bg-white shadow-md rounded-lg p-4 text-center relative'>
//       {isEditMode ? (
//         <input
//           type='text'
//           value={newTitle}
//           onChange={handleTitleChange}
//           className='border rounded px-2 py-1 w-min text-center text-lg'
//         />
//       ) : (
//         <h3 className='font-semibold text-lg w-full text-center'>{title}</h3> // Ensure text-center is here
//       )}

//       {/* Delete button in the top-right corner */}
//       {isEditMode && onDelete && (
//         <button
//           className='absolute top-2 right-2 text-red-500 hover:text-red-600 font-bold'
//           onClick={onDelete}
//           title='Delete'
//         >
//           x
//         </button>
//       )}

//       {/* Button to add Child below the node title but above the children */}

//       {/* Render children */}
//       {children && (
//         <div className='mt-4 flex space-x-4'>
//           {children}
//           {isEditMode && onAddChild && (
//             <div className='mt-2 flex flex-start'>
//               <button
//                 className='text-blue-500 hover:text-blue-600 font-bold'
//                 onClick={onAddChild}
//                 title='Add Child'
//               >
//                 New
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// interface NodeStructure {
//   id: string;
//   title: string;
//   children: NodeStructure[];
// }

// const Diagram: React.FC = () => {
//   const [nodes, setNodes] = useState<NodeStructure>({
//     id: 'root',
//     title: 'Project',
//     children: [
//       {
//         id: 'frontend',
//         title: 'FE',
//         children: [
//           {
//             id: 'landing',
//             title: 'Landing Page',
//             children: [
//               { id: 'header', title: 'Header', children: [] },
//               { id: 'hero', title: 'Hero', children: [] },
//               { id: 'footer', title: 'Footer', children: [] },
//             ],
//           },
//           {
//             id: 'home',
//             title: 'Home Page',
//             children: [
//               { id: 'posts', title: 'Posts', children: [] },
//               { id: 'avatar', title: 'Avatar', children: [] },
//               { id: 'filter', title: 'Filter', children: [] },
//             ],
//           },
//           { id: 'sign', title: 'Sign Page', children: [] },
//         ],
//       },
//       {
//         id: 'backend',
//         title: 'BE',
//         children: [
//           { id: 'auth', title: 'Auth', children: [] },
//           { id: 'post', title: 'Post', children: [] },
//           { id: 'user', title: 'User', children: [] },
//         ],
//       },
//     ],
//   });

//   const [editMode, setEditMode] = useState(false);
//   const [originalNodes, setOriginalNodes] = useState<NodeStructure>(nodes); // Store original nodes

//   // Function to add Child node at the same level
//   const addNodeAsChild = (ChildId: string) => {
//     const addChildToNode = (node: NodeStructure): NodeStructure => {
//       if (node.id === ChildId) {
//         return {
//           ...node,
//           children: [
//             ...node.children,
//             {
//               id: `${node.id}-${node.children.length + 1}`,
//               title: `New Child ${node.children.length + 1}`,
//               children: [],
//             },
//           ],
//         };
//       }
//       return {
//         ...node,
//         children: node.children.map(addChildToNode),
//       };
//     };

//     setNodes((prevNodes) => addChildToNode(prevNodes));
//   };

//   const deleteNode = (nodeId: string) => {
//     const removeNode = (node: NodeStructure): NodeStructure | null => {
//       if (node.id === nodeId) return null;
//       return {
//         ...node,
//         children: node.children
//           .map(removeNode)
//           .filter((child): child is NodeStructure => child !== null),
//       };
//     };

//     setNodes((prevNodes) => removeNode(prevNodes) as NodeStructure);
//   };

//   const updateNodeTitle = (nodeId: string, newTitle: string) => {
//     const updateTitle = (node: NodeStructure): NodeStructure => {
//       if (node.id === nodeId) {
//         return { ...node, title: newTitle };
//       }
//       return {
//         ...node,
//         children: node.children.map(updateTitle),
//       };
//     };

//     setNodes((prevNodes) => updateTitle(prevNodes));
//   };

//   const renderNode = (node: NodeStructure) => (
//     <Node
//       key={node.id}
//       id={node.id}
//       title={node.title}
//       isEditMode={editMode}
//       onAddChild={editMode ? () => addNodeAsChild(node.id) : undefined} // Add Child functionality
//       onDelete={editMode && node.id !== 'root' ? () => deleteNode(node.id) : undefined} // Root node can't be deleted
//       onUpdateTitle={editMode ? updateNodeTitle : undefined}
//     >
//       <div className='flex space-x-4'>{node.children.map(renderNode)}</div>
//     </Node>
//   );

//   const handleQuit = () => {
//     setNodes(originalNodes); // Reset to original state on Quit
//     setEditMode(false);
//   };

//   const canvasRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [scale, setScale] = useState(1);
//   const [dragging, setDragging] = useState(false);
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 });
//   const [touchDist, setTouchDist] = useState(0);

//   // Handle Mouse Down (Start Dragging)
//   const handleMouseDown = (e: React.MouseEvent) => {
//     setDragging(true);
//     setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
//   };

//   // Handle Mouse Move (Dragging)
//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!dragging) return;
//     setPosition({
//       x: e.clientX - startPos.x,
//       y: e.clientY - startPos.y,
//     });
//   };

//   // Handle Mouse Up (Stop Dragging)
//   const handleMouseUp = () => setDragging(false);

//   // Handle Zooming with Mouse Wheel
//   const handleWheel = (e: React.WheelEvent) => {
//     e.preventDefault();

//     const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1;
//     const rect = canvasRef.current?.getBoundingClientRect();
//     if (!rect) return;

//     const offsetX = e.clientX - rect.left; // X position relative to the canvas
//     const offsetY = e.clientY - rect.top; // Y position relative to the canvas

//     // Adjust position based on zoom center (mouse pointer)
//     setScale((prevScale) => {
//       const newScale = Math.max(0.1, Math.min(5, prevScale * scaleAmount));
//       const scaleRatio = newScale / prevScale;

//       setPosition((prevPosition) => {
//         const newPosX = offsetX - (offsetX - prevPosition.x) * scaleRatio;
//         const newPosY = offsetY - (offsetY - prevPosition.y) * scaleRatio;

//         return { x: newPosX, y: newPosY };
//       });

//       return newScale;
//     });
//   };

//   // Get distance between two touch points
//   const getTouchDistance = (touches: TouchList) => {
//     const [touch1, touch2] = [touches[0], touches[1]];
//     return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
//   };

//   // Handle Touch Start (Detect Pinch)
//   const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
//     if (e.touches.length === 2) {
//       setTouchDist(getTouchDistance(e.touches as unknown as TouchList));
//     }
//   };

//   // Handle Touch Move (Pinch Zoom)
//   const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
//     if (e.touches.length === 2) {
//       e.preventDefault();
//       const newDist = getTouchDistance(e.touches as unknown as TouchList);
//       const scaleAmount = newDist / touchDist;
//       setScale((prevScale) => Math.max(0.1, Math.min(5, prevScale * scaleAmount)));
//       setTouchDist(newDist);
//     }
//   };

//   useEffect(() => {
//     focusCanvas();
//   }, [editMode]);

//   // Zoom In
//   const zoomIn = () => setScale((prev) => Math.min(5, prev * 1.1));

//   // Zoom Out
//   const zoomOut = () => setScale((prev) => Math.max(0.1, prev * 0.9)); // Zoom out even further

//   // Focus (Center and Fit)
//   const focusCanvas = () => {
//     if (canvasRef.current && contentRef.current) {
//       const parent = canvasRef.current.getBoundingClientRect();
//       const contentWidth = contentRef.current.offsetWidth; // Get content width dynamically
//       const contentHeight = contentRef.current.offsetHeight; // Get content height dynamically
//       const scaleX = parent.width / contentWidth;
//       const scaleY = parent.height / contentHeight;
//       const newScale = Math.min(scaleX, scaleY); // Fit inside parent

//       setScale(newScale);
//       setPosition({
//         x: (parent.width - contentWidth * newScale) / 2,
//         y: (parent.height - contentHeight * newScale) / 2,
//       });
//     }
//   };

//   useEffect(() => {
//     // Focus the canvas initially on mount
//     focusCanvas();
//   }, []);
//   return (
//     <div className=' h-1/2 w-1/2 overflow-hidden'>
//       <div className='p-8 flex flex-col space-y-8'>
//         <div className='flex justify-between mb-4'>
//           <button
//             className={`px-4 py-2 text-sm ${editMode ? 'bg-green-500' : 'bg-blue-500'} text-white rounded hover:${editMode ? 'bg-green-600' : 'bg-blue-600'}`}
//             onClick={() => {
//               setEditMode(!editMode);
//             }}
//           >
//             {editMode ? 'Save' : 'Edit'}
//           </button>
//           {editMode && (
//             <button
//               className='px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600'
//               onClick={handleQuit}
//             >
//               Quit
//             </button>
//           )}
//         </div>
//         <div
//           ref={canvasRef}
//           className='relative w-full h-[300px] overflow-hidden bg-gray-100'
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseUp}
//           onWheel={handleWheel}
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//         >
//           <div
//             className='absolute flex top-0 left-0 bg-blue-500 rounded-lg origin-top-left'
//             ref={contentRef}
//             style={{
//               transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
//             }}
//           >
//             {renderNode(nodes)}
//           </div>
//         </div>
//         {/* Buttons (Bottom-Left) */}
//         <div className='absolute bottom-4 left-4 flex flex-col space-y-2'>
//           <button
//             className='bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700'
//             onClick={zoomIn}
//           >
//             Zoom In
//           </button>
//           <button
//             className='bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-700'
//             onClick={zoomOut}
//           >
//             Zoom Out
//           </button>
//           <button
//             className='bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-500'
//             onClick={focusCanvas}
//           >
//             Focus
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Diagram;

import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FaLock, FaGlobe } from 'react-icons/fa'; // Optional icons

const PrivacyDropdown = () => {
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  // Toggle the privacy setting
  const handlePrivacyChange = (setting: 'public' | 'private') => {
    setPrivacy(setting);
  };

  return (
    <Menu as='div' className='relative inline-block text-left'>
      <div>
        <Menu.Button className='inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
          {privacy === 'public' ? (
            <span>
              <FaGlobe className='inline mr-2' /> Public
            </span>
          ) : (
            <span>
              <FaLock className='inline mr-2' /> Private
            </span>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='absolute right-0 w-40 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
          <div className='p-1'>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handlePrivacyChange('public')}
                  className={`${
                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                >
                  <FaGlobe className='mr-2' />
                  Public
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handlePrivacyChange('private')}
                  className={`${
                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                >
                  <FaLock className='mr-2' />
                  Private
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default PrivacyDropdown;
