import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ProjectDataBrief, joinProject, leaveProject } from '../services/projectService';

interface ProjectBriefProps {
  projectData?: ProjectDataBrief;
}

const mockProject: ProjectDataBrief = {
  _id: 'mock-id',
  name: 'Mock Project',
  group: 'dad',
  avatar:
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  avatarmembers: [
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  ],
};

const ProjectBrief: React.FC<ProjectBriefProps> = ({ projectData }) => {
  const [project, setProject] = useState<ProjectDataBrief>(mockProject);
  const [joined, setJoined] = useState<boolean>(false);

  useEffect(() => {
    if (projectData) {
      setProject(projectData);
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

  return (
    <div className='flex justify-center items-center relative'>
      <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[730px] mb-10 mt-5 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
        <div className='flex items-center w-full space-x-4'>
          {/* Project Avatar */}
          <div className='flex-shrink-0'>
            <img
              src={project.avatar}
              alt='Project Icon'
              className='w-28 h-28 rounded-full object-cover'
            />
          </div>

          {/* Project Info */}
          <div className='flex flex-col justify-center flex-grow'>
            <p className='text-white font-semibold text-2xl'>
              {project.name}&nbsp;
              <span className='text-gray-500 font-semibold text-xl'>from {project.group}</span>
            </p>
            {/* Avatar Members */}
            <div className='flex space-x-1 mt-2'>
              {project.avatarmembers.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt={`Member ${index + 1}`}
                  className='w-8 h-8 rounded-full object-cover'
                />
              ))}
            </div>
          </div>

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

