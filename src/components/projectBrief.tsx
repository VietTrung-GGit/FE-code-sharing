import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ProjectDataBrief, joinProject, leaveProject } from '../services/projectService';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
interface ProjectBriefProps {
  projectData: ProjectDataBrief;
  detail: boolean;
}

const ProjectBrief: React.FC<ProjectBriefProps> = ({ projectData, detail }) => {
  const [project, setProject] = useState<ProjectDataBrief>(projectData);
  const [joined, setJoined] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (projectData) {
      setProject(projectData);
      setJoined(projectData.joined);
    }
  }, [projectData]);

  const handleJoin = async () => {
    try {
      setJoined(true);
      await joinProject(project._id);
      toast.success(`Joined project: ${project.name}`);
    } catch (error) {
      setJoined(false);
      toast.error('Failed to join project');
    }
  };

  const handleLeave = async () => {
    try {
      setJoined(false);
      await leaveProject(project._id);
      toast.info(`Left project: ${project.name}`);
    } catch (error) {
      setJoined(true);
      toast.error('Failed to leave project');
    }
  };

  const textProjectRef = useRef<HTMLParagraphElement>(null);
  const textGroupDataRef = useRef<HTMLDivElement>(null);
  const [isProjectnameOverflowing, setIsProjectnameOverflowing] = useState(false);
  const [isGroupDataOverflowing, setIsGroupDataOverflowing] = useState(false);
  const checkOverflow = () => {
    if (textProjectRef.current) {
      setIsProjectnameOverflowing(
        textProjectRef.current.scrollWidth > textProjectRef.current.clientWidth,
      );
    }
    if (textGroupDataRef.current) {
      setIsGroupDataOverflowing(
        textGroupDataRef.current.scrollWidth > textGroupDataRef.current.clientWidth,
      );
    }
  };
  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [project.name]);
  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [project.groupData[0].name]);
  return (
    <div className='flex justify-center items-center relative'>
      <div className='relative bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] my-3 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='absolute right-3 top-2'>
          <button
            className='hover:text-gray-300 text-white text-3xl'
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <IoIosMore />
          </button>
          {isDropdownOpen && (
            <div className='absolute -right-40 top-14 w-56 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-50'>
              <ul className='py-1 my-3 ml-2'>
                <li>
                  <button className='block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                    Delete project
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className='flex items-center w-full space-x-4'>
          {/* Project Avatar */}
          <Link to={`/project/${projectData?._id ?? '#'}`} className='flex-shrink-0'>
            <img
              src={project.avatar}
              alt='Project Icon'
              className='w-28 h-28 rounded-full object-cover'
            />
          </Link>

          {/* Project Info */}
          <Link
            to={`/project/${projectData?._id ?? '#'}`}
            className='flex flex-col justify-center flex-grow'
          >
            <p
              className='w-[20vw] sm:w-[35vw] lg:w-[15vw] xl:w-full text-white font-semibold text-2xl truncate'
              ref={textProjectRef}
              data-tooltip-id='projectname'
              data-tooltip-content={project.name}
              data-tooltip-place='bottom-start'
            >
              {isProjectnameOverflowing ? `${project.name.slice(0, 10)}...` : project.name}&nbsp;
            </p>
            <Tooltip id='projectname' classNameArrow='noArrow' />

            {detail && (
              <div
                className='text-gray-500 font-semibold text-xl w-[20vw] sm:w-[35vw] lg:w-[15vw] xl:w-full truncate'
                ref={textGroupDataRef}
                data-tooltip-id='groupdata'
                data-tooltip-content={project.groupData[0].name}
                data-tooltip-place='bottom-start'
              >
                from{' '}
                {isGroupDataOverflowing
                  ? `${project.groupData[0].name.slice(0, 10)}...`
                  : project.groupData[0].name}
                <Tooltip id='groupdata' classNameArrow='noArrow' />
              </div>
            )}

            {/* Avatar Members */}
            <div className='flex space-x-1 mt-2'>
              {project.visibleMembers.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Member ${index + 1}`}
                  className='w-8 h-8 rounded-full object-cover'
                />
              ))}
            </div>
          </Link>

          {/* Join/Leave Button */}
          <button
            onClick={joined ? handleLeave : handleJoin}
            className={`transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl text-md text-Accent/Target m-4 
              ${joined ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
          >
            {joined ? 'Leave' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectBrief;

